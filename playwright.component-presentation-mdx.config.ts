import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['component-presentation-mdx.spec.ts', 'component-foundation-docs.spec.ts', 'component-loading-identity-docs.spec.ts'],
  outputDir: './test-results/component-presentation-mdx'
})
