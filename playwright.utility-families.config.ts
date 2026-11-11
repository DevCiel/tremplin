import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['utility-families.spec.ts', 'color-role-utilities.spec.ts', 'theme-utilities.spec.ts', 'surface-utilities.spec.ts', 'underline-utilities.spec.ts', 'sizing-utilities.spec.ts', 'utilities.spec.ts'],
  outputDir: './test-results/utility-families'
})
