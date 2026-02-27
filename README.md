# @slurm/webterm-widget

Vue 3 SSH Terminal component with integrated connection core.

## Installation

```bash
npm install @slurm/webterm-widget
```

## Usage

```vue
<template>
  <SshTerminal
    ref="terminalRef"
    backend-url=""
    host="example.com"
    username="user"
    password="password"
    @connected="onConnected"
    @disconnected="onDisconnected"
    @error="onError"
  />
</template>

<script setup>
import { ref } from 'vue';
import { SshTerminal } from '@slurm/webterm-widget';
import '@slurm/webterm-widget/style.css';

const terminalRef = ref();

function onConnected(payload) {
  console.log('Connected:', payload);
}

function onDisconnected(reason) {
  console.log('Disconnected:', reason);
}

function onError(error) {
  console.error('Error:', error);
}
</script>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `backend-url` | String | Yes | Backend URL (empty string for proxy) |
| `host` | String | Yes | SSH server hostname |
| `username` | String | Yes | SSH username |
| `password` | String | Yes | SSH password |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `connected` | `{ name: string }` | Fired when connection established |
| `disconnected` | `string` | Fired when connection closed (reason) |
| `error` | `string` | Fired on error |

## Methods

Access via template ref:

```js
terminalRef.value.disconnect()  // Close connection
terminalRef.value.fit()          // Resize terminal to fit container
```

## License

AGPL-3.0-only
