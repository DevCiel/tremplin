import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  outputDir: './test-results/browser',
  timeout: 30_000,
  fullyParallel: true,
  // Give CI's native rendering/animation pipeline an uncontended worker.
  workers: process.env.CI ? 1 : process.platform === 'win32' ? 2 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ],
  webServer: {
    command: 'node tests/tooling/serve.mjs',
    env: { TREMPLIN_TEST_PORT: '4173' },
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 10_000
  }
})
