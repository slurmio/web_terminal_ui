import './core/lib/crypto-polyfill.js';
import SshTerminal from './components/SshTerminal.vue';
import './style.css';

export { SshTerminal };

export default {
  install(app) {
    app.component('SshTerminal', SshTerminal);
  },
};
