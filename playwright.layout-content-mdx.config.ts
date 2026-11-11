import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['layout.spec.ts', 'content.spec.ts', 'site-architecture.spec.ts'],
  outputDir: './test-results/layout-content-mdx'
})
