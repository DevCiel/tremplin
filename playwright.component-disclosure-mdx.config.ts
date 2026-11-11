import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['component-disclosure-mdx.spec.ts', 'component-actions-mdx.spec.ts', 'component-collection-disclosure-docs.spec.ts', 'component-navigation-disclosure-docs.spec.ts'],
  grep: /authored.*responsive states|Collapse cancellation|Native Accordion supplies/,
  outputDir: './test-results/component-disclosure-mdx'
})
