import { Socket } from './lib/socket.js';
import * as crypt from './lib/crypto.js';
import * as streamCommon from './lib/stream/common.js';
import * as xhr from './lib/xhr.js';
import { Command as SshCommand } from './lib/commands/ssh.js';
import { Command as TelnetCommand } from './lib/commands/telnet.js';
import {
  Commands,
  NEXT_PROMPT,
  NEXT_WAIT,
  NEXT_DONE,
} from './lib/commands/commands.js';
import { Controls } from './lib/commands/controls.js';
import { Colors as ControlColors } from './lib/commands/color.js';
import { History } from './lib/commands/history.js';
import { SSH as SshControl } from './lib/control/ssh.js';
import { Telnet as TelnetControl } from './lib/control/telnet.js';

const SOCKET_PATH = '/sshwifty/socket';
const VERIFY_PATH = SOCKET_PATH + '/verify';
const KEY_TIME_TRUNCATER = 100 * 1000;

function getCurrentKeyMixer() {
  return Number(
    Math.trunc(new Date().getTime() / KEY_TIME_TRUNCATER)
  ).toString();
}

async function buildSocketKey(privateKeyStr) {
  return new Uint8Array(
    await crypt.hmac512(
      streamCommon.buildBufferFromString(privateKeyStr),
      streamCommon.buildBufferFromString(getCurrentKeyMixer())
    )
  ).slice(0, 16);
}

async function buildAuthKey(sharedKey) {
  const enc = new TextEncoder();
  const rTime = Number(Math.trunc(new Date().getTime() / 100000));
  const finalKey = sharedKey.length <= 0 ? 'DEFAULT VERIFY KEY' : sharedKey;
  return new Uint8Array(
    await crypt.hmac512(enc.encode(finalKey), enc.encode(String(rTime)))
  ).slice(0, 32);
}

async function requestAuth(backendUrl, sharedKey, hasMixerKey) {
  let authKeyBytes = null;
  if (sharedKey && hasMixerKey) {
    authKeyBytes = await buildAuthKey(sharedKey);
  }

  const xKey = authKeyBytes
    ? btoa(String.fromCharCode.apply(null, authKeyBytes))
    : '';

  const h = await xhr.get(backendUrl + VERIFY_PATH, { 'X-Key': xKey });

  return {
    status: h.status,
    mixerKey: h.getResponseHeader('X-Key') || '',
    timeout: parseFloat(h.getResponseHeader('X-Timeout') || '120'),
    heartbeat: parseFloat(h.getResponseHeader('X-Heartbeat') || '15'),
    data: h.responseText,
  };
}

function buildSocketUrls(backendUrl) {
  const base = backendUrl.replace(/\/$/, '');
  const wsProto = base.startsWith('https') ? 'wss' : 'ws';
  const httpBase = base.replace(/^https?/, wsProto);
  return {
    webSocket: httpBase + SOCKET_PATH,
    keepAlive: base + SOCKET_PATH,
  };
}

function createSocket(backendUrl, sharedKey, timeout, heartbeat) {
  const urls = buildSocketUrls(backendUrl);

  const keyProvider = {
    async fetch() {
      const result = await requestAuth(backendUrl, sharedKey, !!sharedKey);
      if (result.status !== 200) {
        throw new Error('Auth refresh failed: status ' + result.status);
      }
      const mixerKeyStr = atob(result.mixerKey);
      const privateKeyStr = sharedKey
        ? mixerKeyStr + '+' + sharedKey
        : mixerKeyStr + '+';
      return await buildSocketKey(privateKeyStr);
    },
  };

  return new Socket(urls, keyProvider, timeout * 1000, heartbeat * 1000);
}

class SessionManager {
  constructor() {
    this.sessions = new Map();
  }

  createSession(sessionId, config) {
    this.sessions.set(sessionId, {
      state: 'idle',
      statusMsg: 'Initializing...',
      errorMsg: '',
      config,
      socketInstance: null,
      sshControl: null,
      destroyed: false,
      dataCallbacks: [],
      binaryCallbacks: [],
      resizeCallbacks: [],
      stateChangeCallbacks: [],
    });
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  getSessionState(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? session.state : 'idle';
  }

  getSessionStatus(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? session.statusMsg : '';
  }

  getSessionError(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? session.errorMsg : '';
  }

  registerStateChangeCallback(sessionId, callback) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.stateChangeCallbacks.push(callback);
    }
  }

  updateSessionState(sessionId, state) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.state = state;
      session.stateChangeCallbacks.forEach((cb) => cb());
    }
  }

  updateSessionStatus(sessionId, statusMsg) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.statusMsg = statusMsg;
      session.stateChangeCallbacks.forEach((cb) => cb());
    }
  }

  updateSessionError(sessionId, errorMsg) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.errorMsg = errorMsg;
      session.stateChangeCallbacks.forEach((cb) => cb());
    }
  }

  async connect(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found: ' + sessionId);
    }

    if (session.destroyed) return;

    this.updateSessionState(sessionId, 'connecting');
    this.updateSessionStatus(sessionId, 'Authenticating...');
    this.updateSessionError(sessionId, '');

    try {
      const { config } = session;
      const { backendUrl, sharedKey } = config;

      let authResult = await requestAuth(backendUrl || '', '', false);

      if (authResult.status === 403) {
        if (!sharedKey) {
          throw new Error(
            'Backend requires SharedKey (web access password) but it was not provided'
          );
        }
        authResult = await requestAuth(backendUrl || '', sharedKey, true);
        if (authResult.status !== 200) {
          throw new Error(
            'Authentication failed (status ' + authResult.status + ')'
          );
        }
      } else if (authResult.status !== 200) {
        throw new Error('Backend returned status ' + authResult.status);
      }

      if (session.destroyed) return;
      this.updateSessionStatus(sessionId, 'Connecting to backend...');

      const socketInstance = createSocket(
        backendUrl || '',
        sharedKey || '',
        authResult.timeout,
        authResult.heartbeat
      );

      session.socketInstance = socketInstance;

      const socketCallbacks = {
        connecting: () => {
          this.updateSessionStatus(sessionId, 'Opening WebSocket...');
        },
        connected: () => {
          this.updateSessionStatus(
            sessionId,
            'WebSocket connected, requesting SSH stream...'
          );
        },
        traffic: () => {},
        echo: () => {},
        close: (e) => {
          if (!session.destroyed && session.state === 'connected') {
            this.updateSessionState(sessionId, 'error');
            this.updateSessionError(
              sessionId,
              'Connection closed' + (e ? ': ' + e : '')
            );
          }
        },
        failed: (e) => {
          if (!session.destroyed) {
            this.updateSessionState(sessionId, 'error');
            this.updateSessionError(sessionId, 'Connection failed: ' + e);
          }
        },
      };

      const streams = await socketInstance.get(socketCallbacks);

      if (session.destroyed) return;
      this.updateSessionStatus(sessionId, 'Starting SSH session...');

      const colors = new ControlColors();
      const controls = new Controls([
        new TelnetControl(colors),
        new SshControl(colors),
      ]);
      const commands = new Commands([new TelnetCommand(), new SshCommand()]);
      const history = new History([], () => {}, 0);

      const sshBuilder = commands.select(1);

      const credential =
        config.authMethod === 'Password'
          ? config.password
          : config.authMethod === 'Private Key'
            ? config.privateKey
            : '';

      const wizard = sshBuilder.execute(
        streams,
        controls,
        history,
        {
          user: config.username,
          host: config.host,
          authentication: config.authMethod,
          charset: config.encoding,
          tabColor: '',
          fingerprint: '',
        },
        { credential: credential },
        [],
        () => {}
      );

      let result = null;
      for (;;) {
        if (session.destroyed) {
          wizard.close();
          return;
        }

        const step = await wizard.next();
        const stepType = step.type();
        const stepData = step.data();

        if (stepType === NEXT_WAIT) {
          this.updateSessionStatus(sessionId, stepData.title() + '...');
          continue;
        }

        if (stepType === NEXT_PROMPT) {
          const inputs = stepData.inputs();
          const isFingerprintPrompt = inputs.some(
            (f) => f.name === 'Fingerprint'
          );

          if (isFingerprintPrompt) {
            if (config.acceptFingerprint) {
              this.updateSessionStatus(
                sessionId,
                'Accepting server fingerprint...'
              );
              stepData.submit({});
              continue;
            } else {
              const fpField = inputs.find((f) => f.name === 'Fingerprint');
              const fingerprint = fpField ? fpField.value : '';
              stepData.cancel();
              throw new Error(
                'Server fingerprint not accepted (auto-accept disabled): ' +
                  fingerprint
              );
            }
          }

          const isPasswordPrompt = inputs.some((f) => f.name === 'Password');
          const isKeyPrompt = inputs.some((f) => f.name === 'Private Key');

          if (isPasswordPrompt && config.password) {
            stepData.submit({ Password: config.password });
            continue;
          }
          if (isKeyPrompt && config.privateKey) {
            stepData.submit({ 'Private Key': config.privateKey });
            continue;
          }

          stepData.cancel();
          throw new Error('Unexpected prompt from server: ' + stepData.title());
        }

        if (stepType === NEXT_DONE) {
          if (!stepData.success()) {
            throw new Error(stepData.error() + ': ' + stepData.message());
          }
          result = stepData.data();
          break;
        }
      }

      if (session.destroyed || !result) return;

      const sshControl = result.control;
      session.sshControl = sshControl;
      this.updateSessionState(sessionId, 'connected');

      (async () => {
        try {
          for (;;) {
            if (session.destroyed) break;
            const data = await sshControl.receive();
            session.dataCallbacks.forEach((cb) => cb(data));
          }
        } catch (e) {
          if (!session.destroyed) {
            this.updateSessionState(sessionId, 'error');
            this.updateSessionError(sessionId, 'Connection lost: ' + e);
          }
        }
      })();
    } catch (e) {
      if (!session.destroyed) {
        this.updateSessionState(sessionId, 'error');
        this.updateSessionError(sessionId, String(e));
      }
    }
  }

  async disconnect(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    if (session.sshControl) {
      try {
        await session.sshControl.close();
      } catch (_) {
        // Ignore close errors
      }
    }

    session.sshControl = null;
    this.updateSessionState(sessionId, 'idle');
  }

  sendData(sessionId, data) {
    const session = this.sessions.get(sessionId);
    if (session?.sshControl && !session.destroyed) {
      session.sshControl.send(data);
    }
  }

  sendBinary(sessionId, data) {
    const session = this.sessions.get(sessionId);
    if (session?.sshControl && !session.destroyed) {
      session.sshControl.sendBinary(data);
    }
  }

  resize(sessionId, rows, cols) {
    const session = this.sessions.get(sessionId);
    if (session?.sshControl && !session.destroyed && rows && cols) {
      session.sshControl.resize({ rows, cols });
    }
  }

  registerDataCallback(sessionId, callback) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.dataCallbacks.push(callback);
    }
  }

  registerBinaryCallback(sessionId, callback) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.binaryCallbacks.push(callback);
    }
  }

  registerResizeCallback(sessionId, callback) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.resizeCallbacks.push(callback);
    }
  }

  destroySession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.destroyed = true;
      this.disconnect(sessionId);
      this.sessions.delete(sessionId);
    }
  }
}

export { SessionManager };
