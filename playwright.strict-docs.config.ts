import { defineConfig, devices } from '@playwright/test'
import siteConfig from './playwright.site.config'

export default defineConfig({
  ...siteConfig,
  testMatch: ['strict-control-docs.spec.ts', 'documentation-repair.spec.ts'],
  outputDir: './test-results/strict-docs',
  use: { ...siteConfig.use, channel: undefined },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
})
