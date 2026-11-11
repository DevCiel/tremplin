import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['customize.spec.ts', 'documentation-contracts.spec.ts', 'site-architecture.spec.ts'],
  outputDir: './test-results/guides-customize-mdx'
})
