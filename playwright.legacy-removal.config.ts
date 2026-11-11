import { defineConfig } from '@playwright/test'
import base from './playwright.strict-docs.config'

export default defineConfig(base, {
  testMatch: ['legacy-free.spec.ts'],
  outputDir: './test-results/legacy-removal'
})
