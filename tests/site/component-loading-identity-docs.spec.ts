import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

test.use({ reducedMotion: 'reduce' })
const errors = new WeakMap<Page, string[]>()
test.beforeEach(({ page }) => { const list: string[] = []; errors.set(page,list); page.on('pageerror',error=>list.push(error.message)) })
test.afterEach(({ page }) => { expect(errors.get(page)).toEqual([]) })
const audit = async (page: Page) => expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze()).violations).toEqual([])

for (const topic of ['progress','spinner','skeleton','avatar']) for (const theme of ['light','dark']) for (const dir of ['ltr','rtl']) {
  test(`${topic} ${theme}/${dir}: canonical classes, desktop/mobile accessibility and no overflow`, async ({page})=>{
    await page.goto('/components/'+topic+'/')
    await page.locator('html').evaluate((root,settings)=>{root.setAttribute('dir',settings.dir);root.setAttribute('data-trm-theme',settings.theme)},{dir,theme})
    await expect(page.locator('.docs-example').first()).toBeVisible()
    await expect(page.locator('.docs-example .stack, .docs-example .cluster, .docs-example .skeleton, .docs-example .avatar-group, .docs-example .avatar-square, .docs-example .avatar-wrapper, .docs-example .avatar-link, .docs-example .spinner-border-sm, .docs-example .spinner-grow-sm, .docs-example .btn-primary')).toHaveCount(0)
    expect(await page.locator('.docs-code pre').first().evaluate(root=>getComputedStyle(root).direction)).toBe('ltr')
    await audit(page)
    await page.setViewportSize({width:390,height:844})
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
    await audit(page)
  })
}

test('Progress values, stacked segment geometry, direction and actual motion policy',async({page})=>{
  await page.goto('/components/progress/')
  const first=page.locator('.docs-example').first().getByRole('progressbar',{name:'Upload progress',exact:true})
  await expect(first).toHaveAttribute('aria-valuenow','65')
  expect(await first.evaluate(root=>root.firstElementChild!.getBoundingClientRect().width/root.getBoundingClientRect().width)).toBeCloseTo(.65,2)
  await page.locator('html').evaluate(root=>root.setAttribute('dir','rtl'))
  expect(await first.evaluate(root=>Math.abs(root.getBoundingClientRect().right-root.firstElementChild!.getBoundingClientRect().right))).toBeLessThan(1)
  const segments=page.locator('#allocation-progress > .progress')
  await expect(segments).toHaveCount(2)
  for(let i=0;i<2;i++) {
    const segment=segments.nth(i)
    await expect(segment).toHaveAttribute('role','progressbar')
    expect(await segment.evaluate(root=>root.getBoundingClientRect().width/root.parentElement!.getBoundingClientRect().width)).toBeCloseTo(i===0?.3:.2,2)
    expect(await segment.evaluate(root=>root.firstElementChild!.getBoundingClientRect().width/root.getBoundingClientRect().width)).toBeCloseTo(1,2)
  }
  await expect(page.getByRole('progressbar').filter({has:page.locator('.progress-bar-animated')}).first().locator('.progress-bar')).toHaveCSS('animation-name','none')
  await page.emulateMedia({reducedMotion:'no-preference'})
  await expect(page.locator('.progress-bar-animated').first()).toHaveCSS('animation-name','progress-bar-stripes')
  await expect(page.getByRole('progressbar',{name:'Preparing the export; completion is not yet known.'})).not.toHaveAttribute('aria-valuenow',/.+/)
})

test('Spinner shared size, native disabled state and distinct reduced-motion behavior',async({page})=>{
  await page.goto('/components/spinner/')
  const border=page.locator('.docs-example .spinner-border').first(),grow=page.locator('.docs-example .spinner-grow').first()
  await expect(border).toHaveCSS('animation-duration','1.5s'); await expect(grow).toHaveCSS('animation-duration','1.5s')
  await expect(page.locator('.docs-example .spinner-rotate')).toHaveCSS('animation-duration','1s')
  await page.emulateMedia({reducedMotion:'no-preference'})
  await expect(border).toHaveCSS('animation-duration','1s'); await expect(grow).toHaveCSS('animation-duration','1s')
  const small=page.locator('.docs-example .spinner-border.spinner-sm').first()
  // A rotating square's transformed bounding box is wider than its CSS size.
  expect(await small.evaluate(root=>parseFloat(getComputedStyle(root).width)/parseFloat(getComputedStyle(root).fontSize))).toBeCloseTo(.75,2)
  const button=page.getByRole('button',{name:'Saving project...',exact:true})
  await expect(button).toBeDisabled()
  await button.evaluate(root=>{root.addEventListener('click',()=>root.setAttribute('data-test-clicked','true'));(root as HTMLButtonElement).click();(root as HTMLButtonElement).focus()})
  await expect(button).not.toHaveAttribute('data-test-clicked','true'); await expect(button).not.toBeFocused()
  await expect(page.locator('.docs-example .spinner-grow').first()).toHaveCSS('animation-name','spinner-grow')
})

test('Placeholder alias, reduced motion and explicitly application-owned loading completion',async({page})=>{
  await page.goto('/components/skeleton/')
  const examples=await page.locator('.docs-example').allInnerTexts()
  await expect(page.locator('.docs-example .placeholder-wave').first()).toHaveCSS('animation-name','none')
  await expect(page.locator('.docs-example .placeholder-pulse .placeholder').first()).toHaveCSS('animation-name','none')
  await page.emulateMedia({reducedMotion:'no-preference'})
  await expect(page.locator('.docs-example .placeholder-wave').first()).toHaveCSS('animation-name','placeholder-wave')
  await expect(page.locator('.docs-example .placeholder-pulse .placeholder').first()).toHaveCSS('animation-name','placeholder-pulse')
  // Emulate application rendering; no loader plugin or hidden framework behavior is claimed.
  await page.locator('#feed-placeholder').evaluate(root=>{const text=document.createElement('p');text.textContent='Two new activities are ready.';root.replaceChildren(text);root.setAttribute('aria-busy','false');document.getElementById('feed-loading-status')!.textContent='Activity feed loaded.'})
  await expect(page.locator('#feed-placeholder')).toHaveAttribute('aria-busy','false')
  await expect(page.locator('#feed-placeholder .placeholder')).toHaveCount(0)
  await expect(page.locator('#feed-loading-status')).toHaveText('Activity feed loaded.')
  await page.goto('/components/placeholder/')
  expect(await page.locator('.docs-example').allInnerTexts()).toEqual(examples)
  await expect(page.locator('main h1')).toHaveText('Placeholder')
  await page.locator('html').evaluate(root=>root.setAttribute('data-trm-theme','dark'))
  await page.setViewportSize({width:390,height:844}); await audit(page)
  await expect(page.locator('.docs-example [aria-hidden="true"] a[href], .docs-example [aria-hidden="true"] button:not([disabled])')).toHaveCount(0)
})

test('Avatar local images, actual sizes, named statuses and physical RTL stack geometry',async({page})=>{
  await page.goto('/components/avatar/')
  await expect.poll(()=>page.locator('.docs-example img').evaluateAll(images=>images.every(img=>(img as HTMLImageElement).complete&&(img as HTMLImageElement).naturalWidth>0))).toBe(true)
  for(const [size,width] of [['xs',24],['sm',32],['lg',48],['xl',64]] as const) {
    expect(await page.locator('.docs-example .avatar-'+size).first().evaluate(root=>root.getBoundingClientRect().width)).toBeCloseTo(width,1)
  }
  for(const state of ['online','offline','busy','away']) {
    const status=page.locator('.docs-example .avatar-status.status-'+state).first()
    await expect(status).toHaveAttribute('role','img'); await expect(status).toHaveAttribute('aria-label',new RegExp(state))
  }
  for(const dir of ['ltr','rtl']) {
    await page.locator('html').evaluate((root,value)=>root.setAttribute('dir',value),dir)
    const group=page.locator('.docs-example .avatar-stack[aria-label="Project team"]')
    await expect(group).toHaveCSS('flex-direction','row-reverse')
    await expect(group.locator('> .avatar').first()).toHaveCSS('margin-left','-12px')
    await expect(group.locator('> .avatar').last()).toHaveCSS('margin-left','0px')
  }
  const link=page.getByRole('link',{name:'Alex Brooks: browse components',exact:true})
  await link.focus(); await expect(link).toBeFocused(); await page.keyboard.press('Enter'); await expect(page).toHaveURL(/\/components\/$/)
})
