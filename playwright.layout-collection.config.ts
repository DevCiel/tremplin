import { defineConfig } from '@playwright/test'
import browserConfig from './playwright.config'

export default defineConfig({
  ...browserConfig,
  testMatch: ['breakpoint-api.spec.ts', 'cascade-layers.spec.ts', 'layout-generators.spec.ts', 'responsive-layout.spec.ts', 'spacing-defaults.spec.ts'],
  outputDir: './test-results/layout-collection'
})
