import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['component-*-docs.spec.ts'],
  outputDir: './test-results/component-docs'
})
