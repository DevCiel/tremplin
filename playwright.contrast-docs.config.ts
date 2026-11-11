import { defineConfig } from '@playwright/test'
import config from './playwright.strict-docs.config'

export default defineConfig({ ...config, testMatch: ['contrast-docs.spec.ts', 'playground-audit.spec.ts'], outputDir: './test-results/contrast-docs' })
