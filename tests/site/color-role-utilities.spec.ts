import { expect,test } from '@playwright/test'
import { openUtilityFamily,privateToken,resolvedColor } from './utility-family.fixture'

test('foreground, background and border roles resolve current root tokens in light and dark',async({page})=>{
  await openUtilityFamily(page,'<div id="fg" class="fg-primary">Foreground</div><div id="bg" class="bg-subtle-primary">Background</div><div id="border" class="border border-subtle-primary">Boundary</div>')
  const observed:string[]=[]
  for(const mode of ['light','dark']) {
    await page.locator('html').evaluate((element,value)=>element.setAttribute('data-trm-theme',value),mode)
    const expected=await resolvedColor(page,'fg','var(--trm-primary-fg)')
    await expect(page.locator('#fg')).toHaveCSS('color',expected)
    await expect(page.locator('#bg')).toHaveCSS('background-color',await resolvedColor(page,'bg','var(--trm-primary-bg-subtle)'))
    await expect(page.locator('#border')).toHaveCSS('border-color',await resolvedColor(page,'border','var(--trm-primary-border)'))
    observed.push(expected)
  }
  expect(observed[0]).not.toBe(observed[1])
})
test('composition stays local while normal color inheritance and explicit alpha work',async({page})=>{
  await openUtilityFamily(page,'<div id="parent" class="fg-primary"><span id="child">Inherited color</span><span id="own" class="fg-inverse">Own role</span></div><div id="alpha" class="fg-primary fg-50">Alpha</div>')
  await expect(page.locator('#child')).toHaveCSS('color',await resolvedColor(page,'parent','var(--trm-primary-fg)'))
  expect(await privateToken(page,'parent','--trm-fg')).not.toBe('')
  expect(await privateToken(page,'child','--trm-fg')).toBe('')
  await expect(page.locator('#own')).toHaveCSS('color',await resolvedColor(page,'own','var(--trm-inverse-fg)'))
  await expect(page.locator('#alpha')).toHaveCSS('color',await resolvedColor(page,'alpha','color-mix(in oklch, var(--trm-primary-fg) 50%, transparent)'))
})
test('role utilities do not revive old flat-color aliases and runtime role overrides remain scoped',async({page})=>{
  await openUtilityFamily(page,'<div style="color:rgb(18,52,86)"><span id="old" class="text-primary">No alias</span></div><div id="role" class="fg-primary" style="--trm-primary-fg:#075985">Local role</div>')
  await expect(page.locator('#old')).toHaveCSS('color','rgb(18, 52, 86)')
  await expect(page.locator('#role')).toHaveCSS('color','rgb(7, 89, 133)')
})
