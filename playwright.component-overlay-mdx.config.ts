import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['component-overlay-mdx.spec.ts', 'component-overlay-docs.spec.ts', 'component-sheet-command-docs.spec.ts'],
  grep: /authored overlay|overlay plugin behavior requires scripts|Dialog cancellation|Drawer modal|Drawer sheet has|every authored sheet|Drawer show\/hide veto|Tooltip first focus/,
  outputDir: './test-results/component-overlay-mdx'
})
