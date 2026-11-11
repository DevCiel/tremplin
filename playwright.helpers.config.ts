import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['detail-helpers.spec.ts', 'stack-position-helpers.spec.ts', 'hover-lift.spec.ts', 'helpers.spec.ts'],
  outputDir: './test-results/helpers'
})
