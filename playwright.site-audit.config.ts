import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/site', testMatch: 'site-audit.spec.ts',
  outputDir: './test-results/site-audit', fullyParallel: true, workers: 2,
  use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4179', trace: 'retain-on-failure' },
  webServer: { command: 'node tests/tooling/serve.mjs site-dist', env: { TREMPLIN_TEST_PORT: '4179' }, url: 'http://127.0.0.1:4179', reuseExistingServer: false }
})
