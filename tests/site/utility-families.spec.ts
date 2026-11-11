import { expect, test } from '@playwright/test'
import { openUtilityFamily } from './utility-family.fixture'

test('shared families use current fonts, native scheme and semantic layer values', async ({ page }) => {
  await openUtilityFamily(page, '<div id="scheme" class="color-scheme-auto">Scheme</div><div id="font" class="font-body">Font</div><div id="layer" class="position-relative z-dialog">Layer</div>')
  await expect(page.locator('#scheme')).toHaveCSS('color-scheme','light dark')
  await expect(page.locator('#layer')).toHaveCSS('z-index','1040')
  const bodyFont=await page.locator('body').evaluate(element=>getComputedStyle(element).fontFamily)
  await expect(page.locator('#font')).toHaveCSS('font-family',bodyFont)
})
test('zero-specificity spacing and dividers affect only the documented direct children in both directions', async ({ page }) => {
  await openUtilityFamily(page, '<div class="d-flex space-x-3"><span id="first">A</span><span id="last">B<span id="nested">Nested</span></span></div><div class="d-flex divide-x"><span id="divider-first">A</span><span id="divider-last">B</span></div>')
  for(const direction of ['ltr','rtl']) {
    await page.locator('html').evaluate((element,value)=>element.setAttribute('dir',value),direction)
    await expect(page.locator('#first')).toHaveCSS('margin-inline-end','8px')
    await expect(page.locator('#last')).toHaveCSS('margin-inline-end','0px')
    await expect(page.locator('#nested')).toHaveCSS('margin-inline-end','0px')
    await expect(page.locator('#divider-first')).toHaveCSS('border-inline-start-width','0px')
    await expect(page.locator('#divider-last')).toHaveCSS('border-inline-start-width','1px')
  }
})
test('default alignment uses viewport prefixes and native motion guards preserve keyframe availability', async({page})=>{
  await openUtilityFamily(page,'<div id="grid" class="d-grid justify-items-start md:justify-items-center"><span>Item</span></div><div id="motion" class="animation-pop">Motion</div>')
  await page.setViewportSize({width:767,height:900})
  await expect(page.locator('#grid')).toHaveCSS('justify-items','start')
  await page.setViewportSize({width:768,height:900})
  await expect(page.locator('#grid')).toHaveCSS('justify-items','center')
  await page.emulateMedia({reducedMotion:'reduce'})
  await expect(page.locator('#motion')).toHaveCSS('animation-name','none')
})
