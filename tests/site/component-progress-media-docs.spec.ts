import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.use({ reducedMotion: 'reduce' })
const audit = async (page: import('@playwright/test').Page) => {
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
}
const technicalDirection = async (page: import('@playwright/test').Page) => {
  expect(await page.locator('.docs-code').first().evaluate(root => getComputedStyle(root).direction)).toBe('ltr')
  expect(await page.locator('.docs-code pre').first().evaluate(root => getComputedStyle(root).direction)).toBe('ltr')
  expect(await page.locator('.docs-code pre').first().evaluate(root => getComputedStyle(root).unicodeBidi)).toBe('isolate')
  expect(await page.locator('.docs-main td code').first().evaluate(root => getComputedStyle(root).direction)).toBe('ltr')
  const position = await page.locator('.docs-code').first().evaluate(root => ({ frame: root.getBoundingClientRect().x + root.getBoundingClientRect().width / 2, copy: root.querySelector('.docs-copy')!.getBoundingClientRect().x }))
  expect(position.copy).toBeGreaterThan(position.frame)
}

for (const theme of ['light', 'dark']) for (const dir of ['ltr', 'rtl']) {
  test(`Stepper ${theme}/${dir}: counters, active state, container layout, overflow and accessibility`, async ({ page }) => {
    await page.goto('/components/stepper/')
    await page.locator('html').evaluate((root, state) => { root.setAttribute('data-trm-theme', state.theme); root.setAttribute('dir', state.dir) }, { theme, dir })
    const first = page.locator('.docs-example').first().locator('ol.stepper')
    await technicalDirection(page)
    expect(await first.evaluate(root => getComputedStyle(root).direction)).toBe(dir)
    await expect(first.locator('> .stepper-item')).toHaveCount(3)
    await expect(first.locator('> .active')).toHaveCount(2)
    await expect(first.locator('[aria-current="step"]')).toHaveText('Profile — current')
    expect(await first.evaluate(root => getComputedStyle(root).gridAutoFlow)).toBe('row')
    const generated = await first.locator('.stepper-item').first().evaluate(item => ({
      counter: getComputedStyle(item, '::before').content,
      size: parseFloat(getComputedStyle(item, '::before').width),
      track: parseFloat(getComputedStyle(item, '::after').width),
      grid: getComputedStyle(item).display
    }))
    expect(generated.counter).toContain('counter(stepper)')
    expect(generated.size).toBeGreaterThan(0)
    expect(generated.track).toBeGreaterThan(0)
    expect(generated.grid).toBe('grid')
    expect(await first.locator('.stepper-item').last().evaluate(item => getComputedStyle(item, '::after').display)).toBe('none')
    await expect(first.locator('a, button, [tabindex]')).toHaveCount(0)
    const container = page.locator('.docs-variant').filter({ has: page.getByRole('heading', { name: 'Responsive horizontal layout', exact: true }) }).locator('.contains-inline')
    const responsive = container.locator('ol')
    await container.evaluate(root => { (root as HTMLElement).style.inlineSize = '280px' })
    expect(await responsive.evaluate(root => getComputedStyle(root).gridAutoFlow)).toBe('row')
    await container.evaluate(root => { (root as HTMLElement).style.inlineSize = '680px' })
    expect(await responsive.evaluate(root => getComputedStyle(root).gridAutoFlow)).toBe('column')
    await container.evaluate(root => { (root as HTMLElement).style.removeProperty('inline-size') })
    await audit(page)
    await page.setViewportSize({ width: 390, height: 844 })
    expect(await responsive.evaluate(root => getComputedStyle(root).gridAutoFlow)).toBe('row')
    const overflow = page.getByRole('region', { name: 'Scrollable onboarding progress', exact: true })
    await overflow.focus()
    await expect(overflow).toBeFocused()
    expect(await overflow.evaluate(root => root.scrollWidth > root.clientWidth)).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await audit(page)
  })

  test(`Carousel ${theme}/${dir}: styled icon controls, real scrolling, arrows and accessible mobile layout`, async ({ page }) => {
    await page.goto('/components/carousel/')
    await page.locator('html').evaluate((root, state) => { root.setAttribute('data-trm-theme', state.theme); root.setAttribute('dir', state.dir) }, { theme, dir })
    const carousel = page.locator('#demo-carousel'), viewport = carousel.locator('.carousel-inner')
    await technicalDirection(page)
    expect(await carousel.evaluate(root => getComputedStyle(root).direction)).toBe(dir)
    const next = carousel.getByRole('button', { name: 'Next slide', exact: true })
    const icon = await next.locator('.carousel-icon-next').evaluate(root => ({ mask: getComputedStyle(root).maskImage, width: root.getBoundingClientRect().width, height: root.getBoundingClientRect().height }))
    expect(icon.mask).not.toBe('none')
    expect(icon.width).toBeGreaterThan(0)
    expect(icon.height).toBeGreaterThan(0)
    await expect(next).toHaveClass(/btn-outline/)
    await next.click()
    await expect(carousel.locator('.carousel-item:not(.carousel-item-clone).active')).toContainText('Second slide')
    const second = await viewport.evaluate(root => root.scrollLeft)
    expect(Math.abs(second)).toBeGreaterThan(0)
    await viewport.focus()
    await viewport.press(dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft')
    await expect(carousel.locator('.carousel-item:not(.carousel-item-clone).active')).toContainText('First slide')
    await audit(page)
    await page.setViewportSize({ width: 390, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await expect(next).toBeVisible()
    await audit(page)
  })
}

test('Carousel indicators, fade controls and multi-item geometry use the actual initialized core', async ({ page }) => {
  await page.goto('/components/carousel/')
  const carousel = page.locator('#carousel-controls')
  await carousel.getByRole('button', { name: 'Slide 3', exact: true }).click()
  await expect(carousel.locator('.carousel-item:not(.carousel-item-clone).active')).toContainText('Ship')
  await expect(carousel.getByRole('button', { name: 'Slide 3', exact: true })).toHaveAttribute('aria-current', 'true')
  await carousel.getByRole('button', { name: 'Slide 1', exact: true }).click()
  await expect(carousel.locator('.carousel-item:not(.carousel-item-clone).active')).toContainText('Plan')
  const fade = page.locator('#carousel-fade')
  await fade.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(fade.locator('.carousel-item.active')).toContainText('Beta')
  await expect(fade.locator('.carousel-item').first()).not.toBeVisible()
  const geometry = await page.locator('#carousel-multi .carousel-inner').evaluate(root => {
    const item = root.querySelector('.carousel-item')!, css = getComputedStyle(root)
    return { width: root.clientWidth, item: item.getBoundingClientRect().width, gap: parseFloat(css.columnGap), peek: parseFloat(css.paddingInlineStart), scrollable: root.scrollWidth > root.clientWidth }
  })
  expect(geometry.scrollable).toBe(true)
  expect(geometry.item * 2 + geometry.gap + geometry.peek * 2).toBeCloseTo(geometry.width, 0)
  await audit(page)
})

test('Carousel starts paused, visibly cycles on Play and stops when the user presses Pause', async ({ page }) => {
  await page.goto('/components/carousel/')
  const carousel = page.locator('#carousel-autoplay')
  await expect(carousel).not.toHaveClass(/carousel-playing/)
  const control = carousel.locator('.carousel-control-play-pause')
  await expect(control).toHaveAttribute('aria-label', 'Play announcements')
  const geometry = await control.evaluate(root => ({ width: root.getBoundingClientRect().width, height: root.getBoundingClientRect().height, minimum: parseFloat(getComputedStyle(root).minHeight) }))
  expect(geometry.width).toBeGreaterThan(0)
  expect(geometry.width).toBeLessThanOrEqual(geometry.minimum * 1.5)
  expect(geometry.height).toBeLessThanOrEqual(geometry.minimum * 1.5)
  await Promise.all([
    carousel.evaluate(root => new Promise<void>(resolve => root.addEventListener('slid.trm.carousel', () => resolve(), { once: true }))),
    control.click()
  ])
  await expect(control).toHaveAttribute('aria-label', 'Pause announcements')
  await expect(carousel).toHaveClass(/carousel-playing/)
  await expect(carousel.locator('.carousel-item:not(.carousel-item-clone).active')).toContainText('New starter templates')
  await control.click()
  await expect(control).toHaveAttribute('aria-label', 'Play announcements')
  await expect(control).toHaveClass(/paused/)
  await expect(carousel).not.toHaveClass(/carousel-playing/)
})
