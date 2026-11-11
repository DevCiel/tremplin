import { defineConfig } from '@playwright/test'
import config from './playwright.strict-docs.config'

export default defineConfig({ ...config, testMatch: ['site-style-migration.spec.ts', 'docs-typography.spec.ts', 'docs-icons.spec.ts', 'strict-control-docs.spec.ts', 'documentation-repair.spec.ts'], outputDir: './test-results/site-style' })
