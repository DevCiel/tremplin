import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testDir: './tests',
  testMatch: ['**/browser/js-fixtures.spec.ts', '**/site/customize.spec.ts'],
  outputDir: './test-results/js-fixtures'
})
