import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['component-choice-mdx.spec.ts', 'component-choice-input-docs.spec.ts'],
  grep: /authored choice|choice script boundaries|Chips |Combobox /,
  outputDir: './test-results/component-choice-mdx'
})
