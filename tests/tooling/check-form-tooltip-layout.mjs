// Regression check for the documentation-only tooltip/inline-feedback spacing.
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
import { chromium, firefox, webkit } from '@playwright/test'

const checks = []
for (const [engine, launcher] of Object.entries({chromium,firefox,webkit})) {
  const browser = await launcher.launch()
  try {
    const page = await browser.newPage({reducedMotion:'reduce'})
    for (const width of [1280,390]) for (const theme of ['light','dark']) for (const dir of ['ltr','rtl']) {
      await page.setViewportSize({width,height:900})
      await page.goto('http://127.0.0.1:4177/forms/validation/')
      await page.locator('html').evaluate((el,state)=>{el.setAttribute('dir',state.dir);el.setAttribute('data-trm-theme',state.theme)},{theme,dir})
      await page.evaluate(()=>document.fonts.ready)
      const field = page.locator('#composition-validation-tooltip').locator('..')
      const inline = await page.locator('#composition-tooltip-inline').boundingBox()
      const tooltip = await field.locator('.tooltip').boundingBox()
      const container = await field.boundingBox()
      assert(inline && tooltip && container, 'All feedback must be rendered')
      assert(tooltip.y >= inline.y + inline.height, 'Tooltip overlaps persistent inline feedback')
      assert(tooltip.y + tooltip.height <= container.y + container.height, 'Tooltip escapes reserved field space')
      checks.push({engine,width,theme,dir,gap:tooltip.y-inline.y-inline.height,contained:true})
    }
  } finally { await browser.close() }
}
await writeFile('artifacts/form-composition-tooltip-layout.json',JSON.stringify({checks},null,2)+'\n')
console.log(`Passed ${checks.length} real-page tooltip layout checks.`)
