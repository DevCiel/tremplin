import {defineConfig,devices} from '@playwright/test'
export default defineConfig({
  testDir:'./tests/consumer-toolchains',testMatch:'*.spec.ts',outputDir:'./test-results/consumer-matrix',workers:1,timeout:30000,reporter:'list',
  use:{headless:true,reducedMotion:'reduce',trace:'retain-on-failure'},
  projects:[{name:'chromium',use:{...devices['Desktop Chrome']}},{name:'firefox',use:{...devices['Desktop Firefox']}},{name:'webkit',use:{...devices['Desktop Safari']}}],
  webServer:{command:'node tests/tooling/serve-consumer-matrix.mjs',url:'http://127.0.0.1:4180/',reuseExistingServer:false,timeout:10000}
})
