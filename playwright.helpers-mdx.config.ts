import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['helpers-mdx.spec.ts'],
  outputDir: './test-results/helpers-mdx'
})
