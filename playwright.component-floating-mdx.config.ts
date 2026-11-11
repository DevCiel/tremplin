import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['component-floating-mdx.spec.ts', 'component-overlay-docs.spec.ts'],
  grep: /authored floating|floating plugin behavior requires scripts|Tooltip first focus|Popover click versus focus/,
  outputDir: './test-results/component-floating-mdx'
})
