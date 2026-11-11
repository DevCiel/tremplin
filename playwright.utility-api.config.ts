import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['utility-generator.spec.ts', 'utility-selectors.spec.ts', 'utility-values.spec.ts', 'utility-variants.spec.ts'],
  outputDir: './test-results/utility-api'
})
