import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import original from '../fixtures/mdx-migration/component-completion.before.json' with { type: 'json' }

test.use({ reducedMotion: 'reduce' })

test.describe('without JavaScript', () => {
test.use({ javaScriptEnabled: false })
for (const name of ['chip','command-palette','data-table','divider','empty-state','forms','status','table','timeline']) test(name + ': completion script boundaries', async ({ page }) => {
  await page.goto('/components/' + name + '/')
  if (name === 'chip') {
    const button = page.getByRole('button',{name:'Design filter',exact:true})
    await button.click(); await expect(button).toHaveAttribute('aria-pressed','false')
    await page.getByRole('button',{name:'Remove Design filter',exact:true}).click()
    await expect(page.locator('#removable-design-chip')).toBeVisible()
  } else if (name === 'forms') {
    await expect(page.locator('#forms-example [type="submit"]')).toBeDisabled()
    await page.locator('#forms-example [name="project"]').fill('Local preview')
    await expect(page.locator('#forms-example [name="project"]')).toHaveValue('Local preview')
  } else if (name === 'command-palette') {
    await page.locator('[data-trm-target="#commands"]').click()
    await expect(page.locator('#commands')).toBeHidden()
  } else if (name === 'status') {
    const before = await page.locator('#service-demo-status').textContent()
    await page.getByRole('button',{name:'Simulate degraded service',exact:true}).click()
    await expect(page.locator('#service-demo-status')).toHaveText(before!)
  } else if (name === 'empty-state') {
    const root = page.locator('[data-demo-empty-root]').first()
    await root.locator('[data-demo-create-project]').click()
    await expect(root.locator('.empty-state')).toBeVisible()
    await expect(root.locator('[data-demo-created-project]')).toBeHidden()
  } else if (name === 'data-table') {
    const root = page.locator('[data-demo-members]').first()
    await root.locator('input[type="search"]').fill('not a matching member')
    await expect(root.locator('[data-demo-member]:not([hidden])')).toHaveCount(2)
    const checkbox = page.locator('[data-demo-selection] input[type="checkbox"]').last()
    await checkbox.check(); await expect(checkbox).toBeChecked()
    await expect(checkbox.locator('xpath=ancestor::tr')).not.toHaveClass(/table-active/)
  } else {
    await expect(page.locator('.docs-example').first()).toBeVisible()
    await expect(page.locator('.docs-example [data-trm-toggle]')).toHaveCount(0)
    if (name === 'table') await expect(page.locator('.docs-example').first().locator('caption')).not.toBeEmpty()
    if (name === 'divider') await expect(page.locator('[role="separator"][aria-orientation]')).toHaveCount(2)
    if (name === 'timeline') await expect(page.locator('#horizontal-timeline-demo')).toHaveAttribute('tabindex','0')
  }
})
})

for (const item of original) test(item.name + ': authored completion content, API and source links', async ({ page, request }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/components/' + item.name + '/')
  await expect(page.locator('main h1')).toHaveText(item.title)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', item.description)
  await expect(page.locator('.docs-variant > h3')).toHaveText(item.detail.variants.map(variant => variant.title))
  await expect(page.locator('.docs-page-tools a').first()).toHaveAttribute('href', `https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/components/${item.name}.mdx`)
  await expect(page.locator('.docs-page-tools a').last()).toHaveAttribute('href', item.reference)
  await expect(page.locator('#docs-sidebar a[aria-current="page"]')).toHaveAttribute('href', `/components/${item.name}/`)
  const optional = ['command-palette','data-table','divider','empty-state','status','timeline'].includes(item.name)
  await expect(page.locator('head link[href="/dist/css/tremplin-extensions.min.css"]')).toHaveCount(optional ? 1 : 0)
  if (item.definition) {
    await expect(page.locator('#javascript + p + .docs-code pre code')).toHaveText(item.javascript!)
    await expect(page.locator('#methods + ul code')).toHaveText([...item.commonMethods!,...item.definition.methods])
    await expect(page.locator('#events + .table-responsive tbody tr td:first-child code')).toHaveText(item.definition.events)
    await expect(page.locator('#events + .table-responsive tbody tr td:last-child')).toHaveText(Object.values(item.events!))
    const options = page.getByRole('region',{name:'Source-verified option defaults',exact:true})
    await expect(options.locator('tbody tr td:first-child code')).toHaveText(item.sourceOptions!.map(option=>option.name))
    await expect(options.locator('tbody tr td:nth-child(3) code')).toHaveText(item.sourceOptions!.map(option=>option.defaultValue))
  } else {
    await expect(page.locator('#methods,#options,#events')).toHaveCount(0)
    await expect(page.locator('#javascript + p')).toHaveText(item.javascriptBehavior!)
  }
  const copy = page.locator('.docs-example + .docs-code .docs-copy').first()
  await expect(copy).toBeVisible()
  const exampleCode = await page.locator('.docs-example + .docs-code pre code').first().textContent()
  const links = await page.locator('main a[href^="/"]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('href')!))])
  for (const href of links) expect((await request.get(href)).status(), href).toBe(200)
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async (text: string) => { (window as unknown as { copiedOverlayExample: string }).copiedOverlayExample = text }
    } })
  })
  await copy.click()
  expect(await page.evaluate(() => (window as unknown as { copiedOverlayExample: string }).copiedOverlayExample)).toBe(exampleCode)
  expect(errors).toEqual([])
})

for (const item of original) for (const theme of ['light', 'dark']) for (const directions of ['forms','table','data-table'].includes(item.name) ? [['ltr'],['rtl']] : [['ltr','rtl']]) test(item.name + ': authored completion accessibility ' + theme + (directions.length === 1 ? ' ' + directions[0] : ''), async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/components/' + item.name + '/')
  for (const dir of directions) {
    await page.locator('html').evaluate((element, state) => { element.setAttribute('data-trm-theme', state.theme); element.setAttribute('dir', state.dir) }, { theme, dir })
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 })
      await page.evaluate(() => window.scrollTo(0, 0))
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
    }
  }
  expect(errors).toEqual([])
})
