import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['component-media-mdx.spec.ts', 'component-progress-media-docs.spec.ts'],
  grep: /authored media|media script boundaries|Stepper |Carousel /,
  outputDir: './test-results/component-media-mdx'
})
