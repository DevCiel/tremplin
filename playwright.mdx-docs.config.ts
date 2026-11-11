import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['getting-started.spec.ts', 'component-entry-docs.spec.ts', 'site-architecture.spec.ts'],
  outputDir: './test-results/getting-started-mdx'
})
