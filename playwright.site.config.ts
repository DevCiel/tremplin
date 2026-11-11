import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/site',
  outputDir: './test-results/site',
  fullyParallel: true,
  workers: process.platform === 'win32' ? 2 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4175',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
    channel: 'chrome',
  },
  webServer: {
    command: 'node tests/tooling/serve.mjs site-dist',
    env: { TREMPLIN_TEST_PORT: '4175' },
    url: 'http://127.0.0.1:4175',
    reuseExistingServer: false,
  },
})
