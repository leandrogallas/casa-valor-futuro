import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:2568',
  },
  webServer: {
    command: 'pnpm --filter @bastiao/server run start:e2e',
    port: 2568,
    reuseExistingServer: !process.env.CI,
    env: {
      PORT: '2568',
      SQLITE_PATH: ':memory:',
      JWT_SECRET: 'e2e-test-secret-key-do-not-use-in-prod',
      MONITOR_HOST: '127.0.0.1',
    },
  },
});
