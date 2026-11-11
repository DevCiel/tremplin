import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

test.use({ reducedMotion: 'reduce' })
const errors = new WeakMap<Page, string[]>()
test.beforeEach(({ page }) => { const list: string[] = []; errors.set(page, list); page.on('pageerror', error => list.push(error.message)) })
test.afterEach(({ page }) => { expect(errors.get(page)).toEqual([]) })
const audit = async (page: Page) => expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])

for (const topic of ['breadcrumb', 'list-group', 'pagination', 'collapse']) for (const theme of ['light', 'dark']) for (const dir of ['ltr', 'rtl']) {
  test(`${topic} ${theme}/${dir}: canonical styling, desktop/mobile and accessibility`, async ({ page }) => {
    await page.goto('/components/' + topic + '/')
    await page.locator('html').evaluate((root, state) => { root.setAttribute('data-trm-theme', state.theme); root.setAttribute('dir', state.dir) }, { theme, dir })
    const example = page.locator('.docs-example').first()
    await expect(example).toBeVisible()
    await expect(page.locator('.docs-example').locator('.cluster, .stack, .btn-primary, .text-muted, .list-group-horizontal-md, .list-group-item-success, .collapsing')).toHaveCount(0)
    expect(await example.evaluate(root => getComputedStyle(root).direction)).toBe(dir)
    expect(await page.locator('.docs-code pre').first().evaluate(root => getComputedStyle(root).direction)).toBe('ltr')
    if (topic === 'breadcrumb') {
      await expect(example.locator('.breadcrumb-divider[aria-hidden="true"]')).toHaveCount(2)
      expect(await example.locator('.breadcrumb-divider').first().evaluate(root => getComputedStyle(root, '::before').maskImage)).not.toBe('none')
      expect(await page.getByRole('region', { name: 'Scrollable CSS variables', exact: true }).locator('table').evaluate(root => getComputedStyle(root).tableLayout)).toBe('fixed')
    } else if (topic === 'list-group') {
      expect(await example.locator('.list-group').evaluate(root => getComputedStyle(root).display)).toBe('flex')
      await expect(example.locator('.active')).toHaveAttribute('aria-current', 'true')
    } else if (topic === 'pagination') {
      expect(await example.locator('.pagination').evaluate(root => getComputedStyle(root).display)).toBe('flex')
      await expect(example.locator('.page-item.active [aria-current="page"]')).toHaveText('1')
    } else {
      await expect(example.locator('#details')).not.toHaveClass(/show/)
      await expect(example.getByRole('button', { name: 'Show details', exact: true })).toHaveAttribute('aria-expanded', 'false')
    }
    await audit(page)
    await page.setViewportSize({ width: 390, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await audit(page)
  })
}

test('Breadcrumb masks load and authored divider semantics do not add navigation items', async ({ page, browserName }) => {
  await page.goto('/components/breadcrumb/')
  const first = page.locator('.docs-example').first()
  await expect(first.getByRole('listitem')).toHaveCount(3)
  await expect(first.getByRole('link')).toHaveCount(2)
  await expect(first.locator('[aria-current="page"]')).toHaveText('Docs')
  const loaded = await first.locator('.breadcrumb-divider').first().evaluate(async root => {
    const source = /^url\(["']?(.*?)["']?\)$/.exec(getComputedStyle(root, '::before').maskImage)?.[1]
    if (!source) throw new Error('Missing divider mask')
    const image = new Image(); image.src = source; await image.decode(); return image.naturalWidth > 0
  })
  expect(loaded).toBe(true)
  for (const title of ['Text dividers', 'SVG dividers']) {
    const section = page.locator('.docs-variant').filter({ has: page.getByRole('heading', { name: title, exact: true }) })
    expect(await section.locator('.breadcrumb-divider').first().evaluate(root => getComputedStyle(root, '::before').content)).toBe('none')
  }
  await first.getByRole('link', { name: 'Home', exact: true }).focus()
  await page.keyboard.press('Tab')
  const components = first.getByRole('link', { name: 'Components', exact: true })
  if (browserName === 'webkit' && process.platform === 'win32') {
    // This Windows WebKit build skips native links for both Tab and Alt-Tab,
    // also reproduced with plain <a><a><button> HTML without framework CSS/JS.
    // Keep a real keyboard assertion: decorative/current items are skipped and
    // the next native button receives focus. Full Safari keyboard-access mode
    // needs platform/manual coverage; do not mutate link tabindex to simulate it.
    await expect(page.locator('.docs-code').first().getByRole('button', { name: 'Copy', exact: true })).toBeFocused()
    await components.focus()
  }
  await expect(components).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/components\/$/)
})

test('List groups respond to their container and retain native input/disabled behavior', async ({ page }) => {
  await page.goto('/components/list-group/')
  const section = page.locator('.docs-variant').filter({ has: page.getByRole('heading', { name: 'Container-responsive horizontal group', exact: true }) })
  const container = section.locator('.contains-inline'), list = container.locator('.list-group')
  await container.evaluate(root => { (root as HTMLElement).style.inlineSize = '280px' })
  expect(await list.evaluate(root => getComputedStyle(root).flexDirection)).toBe('column')
  await container.evaluate(root => { (root as HTMLElement).style.inlineSize = '640px' })
  expect(await list.evaluate(root => getComputedStyle(root).flexDirection)).toBe('row')
  await container.evaluate(root => { (root as HTMLElement).style.removeProperty('inline-size') })
  await page.getByText('Email updates', { exact: true }).click()
  const check = page.getByRole('checkbox', { name: 'Email updates', exact: true })
  await expect(check).toBeChecked()
  await check.focus(); await check.press('Space'); await expect(check).not.toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Locked updates', exact: true })).toBeDisabled()
  await page.getByText('Detailed mode', { exact: true }).click()
  await expect(page.getByRole('radio', { name: 'Detailed mode', exact: true })).toBeChecked()
  await expect(page.getByRole('radio', { name: 'Compact mode', exact: true })).not.toBeChecked()
  await expect(page.getByRole('button', { name: 'Delete project', exact: true })).toBeDisabled()
  await expect(page.getByRole('link', { name: 'Archived project', exact: true })).not.toHaveAttribute('href')
  await audit(page)
})

test('Pagination preserves page wrappers, real destinations, disabled boundaries and actual sizes', async ({ page, request }) => {
  await page.goto('/components/pagination/')
  const pages = page.getByRole('navigation', { name: 'Search results pages', exact: true })
  await expect(pages.locator('[aria-current="page"]')).toHaveText('1')
  await expect(pages.locator('[aria-disabled="true"]')).not.toHaveAttribute('href')
  await expect(pages.locator('[aria-disabled="true"]')).toHaveAttribute('tabindex', '-1')
  await expect(pages.getByRole('link', { name: '2', exact: true })).toHaveAttribute('href', '/components/pagination/?page=2')
  expect((await request.get('/components/pagination/?page=2')).status()).toBe(200)
  const heights = []
  for (const label of ['Compact pages', 'Default pages', 'Large pages']) heights.push(await page.getByRole('navigation', { name: label, exact: true }).locator('.page-link').first().evaluate(root => root.getBoundingClientRect().height))
  expect(heights[0]).toBeLessThan(heights[1]!)
  expect(heights[1]).toBeLessThan(heights[2]!)
  await expect(page.getByRole('link', { name: 'Previous page', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Next page', exact: true })).toBeVisible()
})

const activate = async (page: Page, id: string, label: string, event: 'shown' | 'hidden') => {
  const target = page.locator('#' + id)
  await target.evaluate((root, type) => { root.removeAttribute('data-test-event'); root.addEventListener(type, () => root.setAttribute('data-test-event', type), { once: true }) }, event + '.trm.collapse')
  await page.getByRole('button', { name: label, exact: true }).click()
  await expect(target).toHaveAttribute('data-test-event', event + '.trm.collapse')
}

test('Collapse cancellation, completion, horizontal/multi targets and nested parent state match the pin', async ({ page }) => {
  await page.goto('/components/collapse/')
  const target = page.locator('#details'), trigger = page.getByRole('button', { name: 'Show details', exact: true })
  await target.evaluate(root => root.addEventListener('show.trm.collapse', e => e.preventDefault(), { once: true }))
  await trigger.click(); await expect(target).not.toHaveClass(/show/); await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await activate(page, 'details', 'Show details', 'shown')
  await expect(target).toBeVisible(); await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await target.evaluate(root => root.addEventListener('hide.trm.collapse', e => e.preventDefault(), { once: true }))
  await trigger.click(); await expect(target).toHaveClass(/show/)
  await activate(page, 'details', 'Show details', 'hidden'); await expect(target).toBeHidden()
  await activate(page, 'collapse-horizontal', 'Toggle width', 'shown')
  expect((await page.locator('#collapse-horizontal').boundingBox())!.width).toBeGreaterThan(200)
  expect(await page.locator('#collapse-horizontal').evaluate(root => (root as HTMLElement).style.inlineSize)).toBe('')
  await activate(page, 'collapse-second', 'Toggle both panels', 'shown')
  await expect(page.locator('#collapse-first')).toHaveClass(/show/)
  await expect(page.locator('#collapse-second')).toHaveClass(/show/)
  await activate(page, 'collapse-second', 'Toggle both panels', 'hidden')
  await expect(page.locator('#collapse-first')).not.toHaveClass(/show/)
  await activate(page, 'collapse-two', 'Notifications', 'shown')
  await expect(page.locator('#collapse-one')).not.toHaveClass(/show/)
  await activate(page, 'collapse-nested-child', 'Nested details', 'shown')
  await activate(page, 'collapse-outer-two', 'Outer two', 'shown')
  await expect(page.locator('#collapse-outer-one')).not.toHaveClass(/show/)
  await expect(page.locator('#collapse-nested-child')).toHaveClass(/show/)
  await activate(page, 'collapse-outer-one', 'Outer one', 'shown')
  await expect(page.locator('#collapse-nested-child')).toBeVisible()
  await expect(page.locator('.docs-example .collapsing')).toHaveCount(0)
  await expect(page.getByRole('row').filter({ hasText: 'show.trm.collapse' })).toContainText('Before adding show; cancel')
  await expect(page.getByRole('row').filter({ hasText: 'shown.trm.collapse' })).toContainText('completion notification')
  await audit(page)
})
