import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [vue(), nodePolyfills()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'WebtermWidget',
      fileName: (format) =>
        format === 'es' ? 'webterm-widget.js' : 'webterm-widget.umd.js',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
