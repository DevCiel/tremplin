import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

test.use({ reducedMotion: 'reduce' })
const errors = new WeakMap<Page, string[]>()
test.beforeEach(({ page }) => { const list: string[] = []; errors.set(page, list); page.on('pageerror', error => list.push(error.message)) })
test.afterEach(({ page }) => { expect(errors.get(page)).toEqual([]) })
const audit = async (page: Page) => expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
type BrowserRuntime = { ScrollSpy: { getOrCreateInstance(element: Element): { refresh(): void; dispose(): void } } }

for (const topic of ['menu', 'tab', 'toast', 'scrollspy']) for (const theme of ['light', 'dark']) for (const dir of ['ltr', 'rtl']) {
  test(`${topic} ${theme}/${dir}: canonical examples, desktop/mobile and accessibility`, async ({ page }) => {
    await page.goto('/components/' + topic + '/')
    await page.locator('html').evaluate((root, state) => { root.setAttribute('data-trm-theme', state.theme); root.setAttribute('dir', state.dir) }, { theme, dir })
    await expect(page.locator('.docs-example').first()).toBeVisible()
    await expect(page.locator('.docs-example .cluster, .docs-example .stack, .docs-example .btn-primary, .docs-example .rounded, .docs-example .toast-region, .docs-example .fade, .docs-example .showing')).toHaveCount(0)
    expect(await page.locator('.docs-code pre').first().evaluate(root => getComputedStyle(root).direction)).toBe('ltr')
    if (topic === 'tab') for (const panel of await page.locator('.docs-example [role="tabpanel"]').all()) {
      await expect(panel).toHaveAttribute('aria-labelledby', /.+/); await expect(panel).toHaveAttribute('tabindex', '0')
    }
    if (topic === 'toast') { await expect(page.locator('#demo-live-toast')).not.toHaveClass(/show/); await expect(page.locator('#example-toast')).toHaveClass(/show/) }
    if (topic === 'scrollspy') {
      await expect(page.locator('.docs-example [aria-current]')).toHaveCount(0)
      await expect(page.locator('#section-content')).toHaveAttribute('role', 'region')
      expect(await page.locator('#section-content').evaluate(root => root.scrollHeight > root.clientHeight)).toBe(true)
    }
    await audit(page)
    await page.setViewportSize({ width: 390, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await audit(page)
  })
}

test('Menu cancellation, native keyboard limits, submenu direction, policies, form and placement', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/components/menu/')
  const trigger = page.getByRole('button', { name: 'Actions', exact: true }), menu = page.locator('#example-actions')
  await trigger.evaluate(root => root.addEventListener('show.trm.menu', e => e.preventDefault(), { once: true }))
  await trigger.click(); await expect(menu).not.toHaveClass(/show/)
  await trigger.press('ArrowDown'); await expect(menu.getByRole('link', { name: 'Edit', exact: true })).toBeFocused()
  await page.keyboard.press('ArrowDown'); await expect(menu.getByRole('button', { name: 'Duplicate', exact: true })).toBeFocused()
  await page.keyboard.press('ArrowDown'); await expect(menu.getByRole('button', { name: 'Duplicate', exact: true })).toBeFocused()
  await page.keyboard.press('Home'); await expect(menu.getByRole('link', { name: 'Edit', exact: true })).toBeFocused()
  await page.keyboard.press('End'); await expect(menu.getByRole('button', { name: 'Duplicate', exact: true })).toBeFocused()
  const rect = (await menu.boundingBox())!; expect(rect.x).toBeGreaterThanOrEqual(0); expect(rect.x + rect.width).toBeLessThanOrEqual(390)
  await trigger.evaluate(root => root.addEventListener('hide.trm.menu', e => e.preventDefault(), { once: true }))
  await page.keyboard.press('Escape'); await expect(menu).toHaveClass(/show/)
  await page.keyboard.press('Escape'); await expect(menu).toBeHidden(); await expect(trigger).toBeFocused()
  for (const dir of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((root, d) => root.setAttribute('dir', d), dir)
    const project = page.getByRole('button', { name: 'Project menu', exact: true }), share = page.locator('#project-menu').getByRole('button', { name: 'Share', exact: true })
    await project.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await expect(share).toBeFocused()
    await page.keyboard.press(dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight')
    await expect(page.locator('#share-menu').getByRole('button', { name: 'Copy project link', exact: true })).toBeFocused()
    await expect(share).toHaveAttribute('aria-haspopup', 'true'); await expect(share).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Escape'); await expect(share).toBeFocused(); await expect(page.locator('#share-menu')).toBeHidden()
    await page.keyboard.press('Escape'); await expect(project).toBeFocused()
  }
  await page.locator('html').evaluate(root => root.setAttribute('dir', 'ltr'))
  for (const [index, label, staysInside] of [[0, 'Default close', false], [1, 'Inside close', false], [2, 'Outside close', true], [3, 'Manual close', true]] as const) {
    const toggle = page.getByRole('button', { name: label, exact: true }), panel = page.locator('#policy-menu-' + index)
    await toggle.click(); await panel.getByRole('button', { name: 'Choose option', exact: true }).click()
    if (staysInside) { await expect(panel).toHaveClass(/show/); await panel.getByRole('button').focus(); await page.keyboard.press('Escape'); await expect(panel).toBeHidden() }
    else await expect(panel).toBeHidden()
  }
  await page.getByRole('button', { name: 'Notification options', exact: true }).click()
  await page.getByRole('checkbox', { name: 'Email notifications', exact: true }).check()
  await expect(page.locator('#form-menu')).toHaveClass(/show/)
  await page.getByRole('checkbox', { name: 'Email notifications', exact: true }).focus()
  await expect(page.getByRole('checkbox', { name: 'Email notifications', exact: true })).toBeFocused()
  await page.keyboard.press('Escape'); await expect(page.locator('#form-menu')).toBeHidden()
  await audit(page)
})

test('Tab authored relationships, cancellation, event order, disabled skip and DOM-order RTL arrows', async ({ page }) => {
  await page.goto('/components/tab/')
  const first = page.getByRole('tablist', { name: 'Profile sections', exact: true }), profile = first.getByRole('tab', { name: 'Profile', exact: true }), settings = first.getByRole('tab', { name: 'Settings', exact: true })
  await settings.evaluate(root => root.addEventListener('show.trm.tab', e => e.preventDefault(), { once: true }))
  await settings.click(); await expect(profile).toHaveAttribute('aria-selected', 'true'); await expect(settings).toHaveAttribute('aria-selected', 'false')
  await first.evaluate(root => { root.setAttribute('data-test-events', ''); for (const type of ['hide.trm.tab','show.trm.tab','hidden.trm.tab','shown.trm.tab']) root.addEventListener(type, () => root.setAttribute('data-test-events', (root.getAttribute('data-test-events') || '') + type + ','), { once: true }) })
  await settings.click(); await expect(settings).toHaveAttribute('aria-selected', 'true'); await expect(page.locator('#settings')).toBeVisible(); await expect(page.locator('#profile')).toBeHidden()
  await expect(first).toHaveAttribute('data-test-events', 'hide.trm.tab,show.trm.tab,hidden.trm.tab,shown.trm.tab,')
  await profile.focus(); await profile.press('End'); await expect(settings).toBeFocused(); await settings.press('ArrowRight'); await expect(profile).toBeFocused()
  const disabled = page.getByRole('tab', { name: 'Archived', exact: true }); await expect(disabled).toBeDisabled()
  const project = page.getByRole('tablist', { name: 'project sections', exact: true })
  await project.getByRole('tab', { name: 'Overview', exact: true }).focus(); await page.keyboard.press('End'); await expect(project.getByRole('tab', { name: 'Activity', exact: true })).toBeFocused()
  await page.locator('html').evaluate(root => root.setAttribute('dir', 'rtl'))
  const rtl = page.getByRole('tablist', { name: 'rtl-tabs sections', exact: true })
  await rtl.getByRole('tab', { name: 'Summary', exact: true }).focus(); await page.keyboard.press('ArrowRight'); await expect(rtl.getByRole('tab', { name: 'Preferences', exact: true })).toBeFocused()
  await expect(rtl.getByRole('tab', { name: 'Preferences', exact: true })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('row').filter({ hasText: 'keydown.trm.tab' })).toContainText('not a dispatched plugin lifecycle event')
  await audit(page)
})

test('Toast is explicitly shown, cancelable, retained on dismiss and paused by hover/focus', async ({ page }) => {
  await page.clock.install()
  await page.goto('/components/toast/')
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100))
  const trigger = page.getByRole('button', { name: 'Show live toast', exact: true }), live = page.locator('#demo-live-toast')
  await expect(live).toBeHidden()
  await live.evaluate(root => root.addEventListener('show.trm.toast', e => e.preventDefault(), { once: true }))
  await trigger.click(); await expect(live).not.toHaveClass(/show/)
  await trigger.click(); await page.clock.runFor(10); await expect(live).toBeVisible()
  await live.hover(); await page.clock.fastForward(6000); await expect(live).toHaveClass(/show/)
  await page.mouse.move(0, 0); await page.clock.fastForward(4990); await expect(live).toHaveClass(/show/)
  await page.clock.fastForward(30); await expect(live).not.toHaveClass(/show/)
  await trigger.click(); await page.clock.runFor(10); await expect(live).toBeVisible()
  const close = live.getByRole('button', { name: 'Dismiss live notification', exact: true })
  await close.focus(); await page.clock.fastForward(6000); await expect(live).toHaveClass(/show/)
  await live.evaluate(root => root.addEventListener('hide.trm.toast', e => e.preventDefault(), { once: true }))
  await close.press('Space'); await expect(live).toHaveClass(/show/)
  await close.press('Space'); await expect(live).not.toHaveClass(/show/); await expect(live).toHaveCount(1)
  await trigger.focus()
  const primary = page.locator('#example-toast'); await primary.getByRole('button', { name: 'Dismiss', exact: true }).click(); await expect(primary).not.toHaveClass(/show/); await expect(primary).toHaveCount(1)
  await trigger.focus()
  await expect(page.getByRole('row').filter({ hasText: 'focusin.trm.toast' })).toContainText('not a dispatched plugin lifecycle event')
  await page.clock.resume()
  await audit(page)
})

test('Scrollspy tracks real scroll roots, smooth hash/focus, nested parents, refresh and passive focus', async ({ page }) => {
  await page.goto('/components/scrollspy/')
  const content = page.locator('#guide-spy-content'), nav = page.locator('#guide-spy-nav')
  await expect(nav.locator('a.active')).toHaveAttribute('href', '#guide-overview')
  await content.focus(); await content.evaluate(root => { root.addEventListener('activate.trm.scrollspy', event => { root.setAttribute('data-test-activation', (event as Event & { relatedTarget: HTMLAnchorElement }).relatedTarget.hash) }); root.scrollTop = root.scrollHeight })
  await expect(nav.locator('a.active')).toHaveAttribute('href', '#guide-launch'); await expect(content).toHaveAttribute('data-test-activation', '#guide-launch'); await expect(content).toBeFocused()
  await page.locator('#smooth-spy-nav').getByRole('link', { name: 'API', exact: true }).click(); await expect(page).toHaveURL(/#smooth-api$/); await expect(page.locator('#smooth-api')).toBeFocused()
  expect(await page.locator('#smooth-spy-content').evaluate(root => root.scrollTop)).toBeGreaterThan(50)
  const rootBox = (await page.locator('#smooth-spy-content').boundingBox())!, sectionBox = (await page.locator('#smooth-api').boundingBox())!
  expect(sectionBox.y).toBeGreaterThanOrEqual(rootBox.y - 2)
  expect(sectionBox.y).toBeLessThan(rootBox.y + rootBox.height)
  await page.locator('#nested-spy-content').evaluate(root => { root.scrollTop = 210 })
  await expect(page.locator('#nested-spy-nav a[href="#nested-install"]')).toHaveClass(/active/)
  await expect(page.locator('#nested-spy-nav a[href="#nested-start"]')).toHaveClass(/active/)
  await expect(page.locator('.docs-example [aria-current]')).toHaveCount(0)
  await content.evaluate(root => {
    const section = document.createElement('section'); section.id = 'dynamic-spy-section'; section.style.minBlockSize = '12rem'; section.textContent = 'Dynamically added visible section'
    root.append(section)
    const link = document.createElement('a'); link.className = 'nav-link'; link.href = '#dynamic-spy-section'; link.textContent = 'Dynamic section'; document.querySelector('#guide-spy-nav .nav')!.append(link)
    const runtime = (window as unknown as { TremplinFramework: BrowserRuntime }).TremplinFramework
    runtime.ScrollSpy.getOrCreateInstance(root).refresh(); root.scrollTop = root.scrollHeight
  })
  await expect(nav.locator('a.active')).toHaveAttribute('href', '#dynamic-spy-section')
  await expect(page.getByRole('row').filter({ hasText: 'scrollend.trm.scrollspy' })).toContainText('not a dispatched plugin lifecycle event')
  await audit(page)
})
