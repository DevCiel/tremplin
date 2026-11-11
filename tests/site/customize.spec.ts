import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { customizeGuides } from '../helpers/guides-customize-contract'

for (const guide of customizeGuides) {
  test(`Customize: ${guide.title} has working references, navigation, and accessible content`, async ({ page, request }) => {
    await page.goto(`/${guide.slug}/`)
    await expect(page.locator('main h1')).toHaveText(guide.title)
    await expect(page.locator('main h2')).toHaveCount(guide.sections.length)
    await expect(page.locator('#docs-sidebar a[aria-current="page"]')).toHaveAttribute('href', `/${guide.slug}/`)
    await expect(page.locator('#docs-toc-nav a')).toHaveCount(guide.sections.length)
    await expect(page.locator('.docs-page-tools a').first()).toHaveAttribute('href', `https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/${guide.slug}.mdx`)
    await expect(page.locator('.docs-page-tools a').last()).toHaveAttribute('href', guide.reference!.url)
    const links = await page.locator('main a[href^="/"]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('href')!))])
    for (const href of links) expect((await request.get(href)).status(), href).toBe(200)
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([])
    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByRole('button', { name: 'Toggle color theme', exact: true }).click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([])
  })
}
