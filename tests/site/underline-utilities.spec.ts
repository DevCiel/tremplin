import{expect,test}from'@playwright/test'
import{openUtilityFamily,privateToken,resolvedColor}from'./utility-family.fixture'

test('underline roles affect decoration rather than text and remain locally composed',async({page})=>{
  await openUtilityFamily(page,'<a id="link" class="underline-primary underline-offset-2 underline-thickness-2" href="#end" style="color:#123456">Link<span id="child"> child</span></a><div id="end">End</div>')
  await expect(page.locator('#link')).toHaveCSS('color','rgb(18, 52, 86)')
  await expect(page.locator('#link')).toHaveCSS('text-decoration-color',await resolvedColor(page,'link','var(--trm-primary-fg)'))
  await expect(page.locator('#link')).toHaveCSS('text-underline-offset','4px')
  expect(await privateToken(page,'child','--trm-underline-color')).toBe('')
})
test('hover thickness is opt-in per class and opacity-only decoration falls back to currentcolor',async({page})=>{
  await openUtilityFamily(page,'<a id="link" class="underline-thickness-1 hover:underline-thickness-3 underline-50" href="#end" style="color:#123456">Link</a><div id="end">End</div>')
  await expect(page.locator('#link')).toHaveCSS('text-decoration-thickness','1px')
  await page.locator('#link').hover()
  await expect(page.locator('#link')).toHaveCSS('text-decoration-thickness','3px')
  await expect(page.locator('#link')).toHaveCSS('text-decoration-color',await resolvedColor(page,'link','color-mix(in oklch, #123456 50%, transparent)'))
})
