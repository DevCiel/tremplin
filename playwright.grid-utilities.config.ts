import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['grid-bundle.spec.ts', 'grid-gap-utilities.spec.ts', 'css-grid.spec.ts', 'css-grid-page.spec.ts'],
  outputDir: './test-results/grid-utilities'
})
