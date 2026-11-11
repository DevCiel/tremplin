import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['component-completion-mdx.spec.ts','component-chip-table-docs.spec.ts','component-local-pattern-docs.spec.ts','component-forms-overview-docs.spec.ts','component-sheet-command-docs.spec.ts'],
  grep: /authored completion|completion script boundaries|standalone Chip application|Table container-only|Table accent|optional pattern CSS stays|Status live|Timeline actual|Divider decorative|Empty State local|Data Table real|native validation, local|custom feedback, summary|disabled fieldsets and readonly|no-JavaScript demos|Forms composition|Palette filters|Palette keyboard|Palette gates|every authored palette|single isolated extension|Palette API/,
  outputDir: './test-results/component-completion-mdx'
})
