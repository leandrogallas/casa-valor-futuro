import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@bastiao/shared': resolve(__dirname, '../shared/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/auth':         'http://localhost:2567',
      '/agentes':      'http://localhost:2567',
      '/tarefas':      'http://localhost:2567',
      '/artefatos':    'http://localhost:2567',
      '/reunioes':     'http://localhost:2567',
      '/relatorios':   'http://localhost:2567',
      '/health':       'http://localhost:2567',
      '/a2a':          'http://localhost:2567',
      '/.well-known':  'http://localhost:2567',
    },
  },
  css: {
    postcss: { plugins: [] },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      input: {
        main:   resolve(__dirname, 'index.html'),
        portal: resolve(__dirname, 'portal.html'),
        office: resolve(__dirname, 'office.html'),
        admin:  resolve(__dirname, 'admin.html'),
      },
    },
  },
});
