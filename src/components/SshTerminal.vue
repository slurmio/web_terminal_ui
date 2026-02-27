<template>
  <div ref="containerRef" class="ssh-terminal">
    <div v-if="state !== 'connected'" class="ssh-terminal-overlay">
      <div v-if="state === 'error'" class="ssh-terminal-error">
        {{ errorMsg }}
        <button @click="reconnect()">Reconnect</button>
      </div>
      <div v-else class="ssh-terminal-connecting">
        {{ statusMsg }}
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from 'vue';
import { SessionManager } from '../core/SessionManager.js';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';

const props = defineProps({
  backendUrl: { type: String, required: true },
  host: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const emit = defineEmits(['connected', 'disconnected', 'error', 'status-change']);

defineExpose({
  connect,
  disconnect,
  fit: () => fitAddon?.fit(),
});


const sessionManager = new SessionManager();
const containerRef = ref(null);
const sessionId = ref(`ssh-${Date.now()}-${Math.random()}`);
const stateUpdateTrigger = ref(0);


let terminal = null;
let fitAddon = null;
let resizeObserver = null;

const state = computed(() => {
  stateUpdateTrigger.value;
  return sessionManager.getSessionState(sessionId.value);
});
const statusMsg = computed(() => {
  stateUpdateTrigger.value;
  return sessionManager.getSessionStatus(sessionId.value);
});
const errorMsg = computed(() => {
  stateUpdateTrigger.value;
  return sessionManager.getSessionError(sessionId.value);
});

function initTerminal() {
  if (terminal) {
    terminal.dispose();
  }

  terminal = new Terminal({
    allowProposedApi: true,
    cursorBlink: true,
    cursorStyle: 'block',
    fontFamily: '"Cascadia Code", "Fira Code", "Hack", monospace',
    fontSize: 14,
    letterSpacing: 1,
    lineHeight: 1.2,
    theme: {
      background: '#1a1a2e',
    },
  });

  fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.loadAddon(new WebLinksAddon());

  terminal.open(containerRef.value);

  nextTick(() => {
    fitAddon.fit();
  });

  terminal.onData((data) => {
    sessionManager.sendData(sessionId.value, data);
  });

  terminal.onBinary((data) => {
    sessionManager.sendBinary(sessionId.value, data);
  });

  let resizeTimer = null;
  terminal.onResize((dim) => {
    if (!dim.cols || !dim.rows) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      sessionManager.resize(sessionId.value, dim.rows, dim.cols);
    }, 300);
  });

  if (resizeObserver) resizeObserver.disconnect();
  resizeObserver = new ResizeObserver(() => {
    if (fitAddon && state.value === 'connected') {
      fitAddon.fit();
    }
  });
  resizeObserver.observe(containerRef.value);
}

async function connect() {
  try {
    sessionManager.createSession(sessionId.value, {
      backendUrl: props.backendUrl,
      host: props.host,
      username: props.username,
      password: props.password,
      privateKey: '',
      authMethod: 'Password',
      sharedKey: '',
      encoding: 'utf-8',
      acceptFingerprint: true,
    });

    sessionManager.registerStateChangeCallback(sessionId.value, () => {
      stateUpdateTrigger.value++;
    });

    sessionManager.registerDataCallback(sessionId.value, (data) => {
      if (terminal) {
        terminal.write(data);
      }
    });

    await sessionManager.connect(sessionId.value);
  } catch (error) {
    emit('error', String(error));
  }
}

async function disconnect() {
  await sessionManager.disconnect(sessionId.value);
  emit('disconnected', 'manual');
}

function reconnect() {
  connect();
}

watch(state, (newState, oldState) => {
  if (newState === 'connected' && oldState !== 'connected') {
    nextTick(() => {
      fitAddon?.fit();
      terminal?.focus();
    });
    emit('connected', { name: sessionId.value });
  } else if (newState === 'error' && oldState !== 'error') {
    emit('error', errorMsg.value);
  }
  emit('status-change', { state: newState, status: statusMsg.value });
});

watch(statusMsg, (newMsg, oldMsg) => {
  emit('status-change', { state: state.value, status: newMsg });
});

onMounted(() => {
  initTerminal();
  connect();
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (terminal) {
    terminal.dispose();
    terminal = null;
  }
  sessionManager.destroySession(sessionId.value);
});
</script>

<style scoped>
.ssh-terminal {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
  background: #1a1a2e;
  overflow: hidden;
}

.ssh-terminal :deep(.xterm) {
  height: 100%;
  padding: 4px;
}

.ssh-terminal-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 26, 46, 0.92);
  color: #e0e0e0;
  font-family: monospace;
  font-size: 14px;
  z-index: 10;
}

.ssh-terminal-error {
  color: #ff6b6b;
  text-align: center;
  max-width: 80%;
  word-break: break-word;
}

.ssh-terminal-error button {
  display: block;
  margin: 12px auto 0;
  padding: 6px 16px;
  background: #334;
  color: #e0e0e0;
  border: 1px solid #556;
  border-radius: 4px;
  cursor: pointer;
  font-family: monospace;
}

.ssh-terminal-error button:hover {
  background: #445;
}

.ssh-terminal-connecting {
  color: #8be9fd;
}
</style>
