import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['component-interaction-mdx.spec.ts', 'component-selection-feedback-docs.spec.ts'],
  grep: /authored interaction|plugin behavior requires scripts|Menu cancellation|Tab authored/,
  outputDir: './test-results/component-interaction-mdx'
})
