import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/site-visual',
  outputDir: './test-results/site-visual',
  workers: 1,
  reporter: 'list',
  snapshotPathTemplate: '{testDir}/snapshots/{arg}{ext}',
  expect: { toHaveScreenshot: { animations: 'disabled', maxDiffPixelRatio: 0.03 } },
  use: {
    baseURL: 'http://127.0.0.1:4176',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 900 },
    ...devices['Desktop Chrome']
  },
  webServer: {
    command: 'node tests/tooling/serve.mjs site-dist',
    env: { TREMPLIN_TEST_PORT: '4176' },
    url: 'http://127.0.0.1:4176',
    reuseExistingServer: false
  }
})
