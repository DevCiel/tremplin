import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  // Full-page calendar/contrast scans contend heavily in parallel on Windows.
  // Serialize this optional regression suite; keep all limits/assertions intact.
  workers: 1,
  testMatch: ['getting-started.spec.ts','component-entry-docs.spec.ts','component-advanced-input-docs.spec.ts','component-sheet-command-docs.spec.ts','documentation-contracts.spec.ts','documentation-repair.spec.ts'],
  outputDir: './test-results/esm-docs'
})
