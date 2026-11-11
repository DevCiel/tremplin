import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['documentation-contracts.spec.ts'],
  outputDir: './test-results/docs-contracts'
})
