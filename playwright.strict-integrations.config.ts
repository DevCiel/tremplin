import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/strict-integrations',
  outputDir: './test-results/strict-integrations',
  fullyParallel: true,
  workers: process.platform === 'win32' ? 2 : undefined,
  timeout: 30_000,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4178', headless: true, trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ],
  webServer: { command: 'node tests/tooling/serve.mjs', env: { TREMPLIN_TEST_PORT: '4178' }, url: 'http://127.0.0.1:4178', reuseExistingServer: false, timeout: 10_000 }
})
