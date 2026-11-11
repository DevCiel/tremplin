import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['component-feedback-mdx.spec.ts', 'component-selection-feedback-docs.spec.ts'],
  grep: /authored feedback|feedback plugin behavior requires scripts|Toast alias|Toast is explicitly|Scrollspy tracks/,
  outputDir: './test-results/component-feedback-mdx'
})
