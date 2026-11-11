import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['component-collection-mdx.spec.ts', 'component-collection-disclosure-docs.spec.ts'],
  grepInvert: /[a-z]+\/[a-z]+:/,
  outputDir: './test-results/component-collection-mdx'
})
