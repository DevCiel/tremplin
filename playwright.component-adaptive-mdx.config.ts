import { defineConfig } from '@playwright/test'
import strictDocs from './playwright.strict-docs.config'

export default defineConfig({
  ...strictDocs,
  testMatch: ['component-adaptive-mdx.spec.ts', 'component-adaptive-navigation-docs.spec.ts'],
  grep: /authored adaptive|adaptive plugin behavior requires scripts|Navbar uses container|NavOverflow resizes|NavOverflow retains|Toggler targets/,
  outputDir: './test-results/component-adaptive-mdx'
})
