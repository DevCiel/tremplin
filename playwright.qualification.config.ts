import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

// Keep qualification rechecks separate from the long default-site run.
export default defineConfig({
  ...strictDocs,
  testMatch:['contrast-docs.spec.ts','documentation-contracts.spec.ts','documentation-repair.spec.ts','site-style-migration.spec.ts','customize-overview.spec.ts'],
  outputDir:'./test-results/qualification',
  workers:1,
  use:{...strictDocs.use,baseURL:'http://127.0.0.1:4178'},
  projects:strictDocs.projects!.map(project=>project.name==='chromium'?{...project,use:{...project.use,channel:'chrome'}}:project),
  webServer:{command:'node tests/tooling/serve.mjs site-dist',env:{TREMPLIN_TEST_PORT:'4178'},url:'http://127.0.0.1:4178',reuseExistingServer:false}
})
