import{expect,test}from'@playwright/test'
import{openUtilityFamily}from'./utility-family.fixture'

test('physical percentage and min/max sizing remain physical in vertical writing',async({page})=>{
  await openUtilityFamily(page,'<div style="width:200px;height:120px"><div id="width" class="w-50">Width</div><div id="max" class="max-w-100" style="width:400px">Max</div><div id="min" class="min-w-100" style="width:10px">Min</div></div>')
  for(const writingMode of['horizontal-tb','vertical-rl']) {
    await page.locator('#width').evaluate((element,value)=>{element.style.writingMode=value},writingMode)
    await expect(page.locator('#width')).toHaveCSS('width','100px')
  }
  await expect(page.locator('#max')).toHaveCSS('width','200px')
  await expect(page.locator('#min')).toHaveCSS('width','200px')
})
test('intrinsic sizing is non-responsive by default and minimum constraints permit flex shrinking',async({page})=>{
  await openUtilityFamily(page,'<div style="width:200px"><div id="intrinsic" class="w-max" style="font:16px monospace">Alpha beta gamma</div><div id="prefix" class="w-100 md:w-min">Alpha beta gamma</div></div><div class="d-flex" style="width:160px"><div id="shrink" class="min-w-0" style="flex:1">AnUnbrokenIdentifierThatWouldNotOtherwiseShrink</div><div style="width:40px;flex:none">Fixed</div></div>')
  expect((await page.locator('#intrinsic').boundingBox())!.width).toBeLessThan(200)
  for(const width of[767,768]) {
    await page.setViewportSize({width,height:900})
    await expect(page.locator('#prefix')).toHaveCSS('width','200px')
  }
  expect((await page.locator('#shrink').boundingBox())!.width).toBeLessThanOrEqual(120)
})
test('dynamic viewport sizes track the browser dimensions without logical substitutions',async({page})=>{
  await openUtilityFamily(page,'<div id="width" class="dvw-100"></div><div id="height" class="dvh-100"></div>')
  for(const viewport of[{width:900,height:700},{width:700,height:600}]) {
    await page.setViewportSize(viewport)
    expect(parseFloat(await page.locator('#width').evaluate(element=>getComputedStyle(element).width))).toBeCloseTo(viewport.width,0)
    expect(parseFloat(await page.locator('#height').evaluate(element=>getComputedStyle(element).height))).toBeCloseTo(viewport.height,0)
  }
})
