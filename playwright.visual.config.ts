import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/visual',
  outputDir: './test-results/visual',
  workers: 1,
  reporter: 'list',
  snapshotPathTemplate: '{testDir}/snapshots/{arg}{ext}',
  expect: { toHaveScreenshot: { animations: 'disabled', maxDiffPixelRatio: 0.03 } },
  use: {
    baseURL: 'http://127.0.0.1:4174',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    ...devices['Desktop Chrome']
  },
  webServer: {
    command: 'node tests/tooling/serve.mjs',
    env: { TREMPLIN_TEST_PORT: '4174' },
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: false
  }
})
