import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['component-advanced-mdx.spec.ts', 'component-advanced-input-docs.spec.ts'],
  grep: /authored advanced|advanced script boundaries|Datepicker |OTP |Range |Strength /,
  outputDir: './test-results/component-advanced-mdx'
})
