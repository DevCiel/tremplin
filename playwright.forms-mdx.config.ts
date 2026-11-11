import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['forms.spec.ts', 'documentation-contracts.spec.ts', 'site-architecture.spec.ts'],
  outputDir: './test-results/forms-mdx'
})
