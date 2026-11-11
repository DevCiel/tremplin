import{expect,test}from'@playwright/test'
import{openUtilityFamily,privateToken}from'./utility-family.fixture'

test('logical borders follow RTL and vertical writing while widths remain independently controlled',async({page})=>{
  await openUtilityFamily(page,'<div id="edge" class="border-start border-3">Edge</div>')
  for(const direction of['ltr','rtl']) {
    await page.locator('html').evaluate((element,value)=>element.setAttribute('dir',value),direction)
    await expect(page.locator('#edge')).toHaveCSS('border-inline-start-width','3px')
  }
  await page.locator('#edge').evaluate(element=>{element.style.writingMode='vertical-rl'})
  await expect(page.locator('#edge')).toHaveCSS('border-inline-start-width','3px')
})
test('numeric radius and local directional composition do not leak into nested elements',async({page})=>{
  await openUtilityFamily(page,'<div id="radius" class="rounded-9"><span id="child">Child</span></div><div id="directional" class="rounded-start rounded-size-9">Directional</div>')
  await expect(page.locator('#radius')).toHaveCSS('border-radius','16px')
  expect(await privateToken(page,'child','--trm-rounded-size')).toBe('')
  await expect(page.locator('#directional')).toHaveCSS('border-start-start-radius','16px')
  await expect(page.locator('#directional')).toHaveCSS('border-start-end-radius','0px')
})
test('shadow color/opacity controls remain local while root dark strength changes',async({page})=>{
  await openUtilityFamily(page,'<div id="shadow" class="shadow shadow-primary shadow-opacity-100"><span id="child" class="shadow-sm">Nested shadow</span></div>')
  expect(await privateToken(page,'shadow','--trm-so')).toBe('2')
  expect(await privateToken(page,'child','--trm-so')).toBe('')
  expect(await privateToken(page,'child','--trm-sc')).toBe('')
  await expect(page.locator('#shadow')).not.toHaveCSS('box-shadow','none')
  const light=await page.locator('#shadow').evaluate(element=>getComputedStyle(element).boxShadow)
  await page.locator('html').evaluate(element=>element.setAttribute('data-trm-theme','dark'))
  expect(await privateToken(page,'shadow','--trm-shadow-strength')).toBe('2.4')
  await expect(page.locator('#shadow')).not.toHaveCSS('box-shadow',light)
})
