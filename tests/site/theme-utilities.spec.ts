import {expect,test}from'@playwright/test'
import{openUtilityFamily,resolvedColor}from'./utility-family.fixture'

test('context and surface modifiers paint independently in either theme mode',async({page})=>{
  await openUtilityFamily(page,'<div id="surface" class="theme-inverse theme-contrast theme-border">Surface</div>')
  for(const mode of['light','dark']) {
    await page.locator('html').evaluate((element,value)=>element.setAttribute('data-trm-theme',value),mode)
    await expect(page.locator('#surface')).toHaveCSS('background-color',await resolvedColor(page,'surface','var(--trm-inverse-bg)'))
    await expect(page.locator('#surface')).toHaveCSS('color',await resolvedColor(page,'surface','var(--trm-inverse-contrast)'))
  }
})
test('contextual links remint foreground and theme-reset drops inherited context without repainting',async({page})=>{
  await openUtilityFamily(page,'<div class="theme-inverse theme-contrast"><a id="link" href="#end">Link</a><div id="reset" class="theme-reset"><span>Reset context</span></div></div><div id="end">End</div>')
  await expect(page.locator('#link')).toHaveCSS('color',await resolvedColor(page,'link','var(--trm-inverse-contrast)'))
  const token=await page.locator('#reset').evaluate(element=>getComputedStyle(element).getPropertyValue('--trm-theme-bg').trim())
  expect(token).toBe('')
  await expect(page.locator('#reset')).toHaveCSS('background-color','rgba(0, 0, 0, 0)')
})
test('explicit gradients use the runtime token and are independent of color-role assignment',async({page})=>{
  await openUtilityFamily(page,'<div id="gradient" class="bg-gradient" style="--trm-gradient:linear-gradient(90deg,red,blue)">Gradient</div>')
  await expect(page.locator('#gradient')).toHaveCSS('background-image','linear-gradient(90deg, rgb(255, 0, 0), rgb(0, 0, 255))')
})
