import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['component-navigation-mdx.spec.ts', 'component-navigation-disclosure-docs.spec.ts'],
  grepInvert: /[a-z]+\/[a-z]+:/,
  outputDir: './test-results/component-navigation-mdx'
})
