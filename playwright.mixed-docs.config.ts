import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['content.spec.ts', 'customize.spec.ts', 'layout.spec.ts'],
  outputDir: './test-results/mixed-docs'
})
