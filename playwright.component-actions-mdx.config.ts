import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['component-actions-mdx.spec.ts', 'component-foundation-docs.spec.ts'],
  outputDir: './test-results/component-actions-mdx'
})
