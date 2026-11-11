import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import original from './fixtures/mdx-migration/component-navigation.before.json' with { type: 'json' }
import api from '../metadata/api.json' with { type: 'json' }
import { authoredComponentNames, componentMdxMetadata } from '../site/src/libs/component-mdx'
import { componentApi, authoredApiComponentNames } from '../site/src/data/component-api'
import { componentDetail, componentExample, componentTitle, componentIntro, documentedComponents } from '../site/src/data/component-reference'
import { navigationDetails } from '../site/src/data/navigation-disclosure-docs'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertComponentNavigationMdx } from './tooling/lib/component-navigation-mdx.mjs'

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) }
})
const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
const documentOf = (html: string) => new DOMParser().parseFromString(html, 'text/html')
describe('authored navigation-component MDX', () => {
  it('adds exactly three routes, bringing component migration to seventeen of 47', () => {
    const policy = assertComponentNavigationMdx()
    expect(policy.names).toEqual(['button-group', 'close-button', 'nav'])
    expect(policy.remaining).toBe(30)
    const later = ['menu', 'tab', 'scrollspy', 'toast', 'toasts', 'bottom-sheet', 'dialog', 'drawer', 'popover', 'tooltip', 'nav-overflow', 'navbar', 'toggler', 'carousel', 'stepper', 'chips', 'combobox', 'datepicker', 'otp-input', 'range', 'strength', 'chip', 'command-palette', 'data-table', 'divider', 'empty-state', 'forms', 'status', 'table', 'timeline']
    const phaseNames = authoredComponentNames.filter(name => !later.includes(name))
    expect(phaseNames).toHaveLength(17)
    expect(authoredApiComponentNames.filter(name => !later.includes(name))).toEqual(['alert', 'button', 'collapse'])
    expect(readdirSync('site/src/content/docs/components').filter(file => !later.includes(file.slice(0, -4))).sort()).toEqual(phaseNames.map(name => name + '.mdx').sort())
    expect(documentedComponents).toHaveLength(47)
    expect(documentationNavigation().guides).toHaveLength(116)
    expect(documentationNavigation().searchPages.filter(page => page.href.startsWith('/components/'))).toHaveLength(47)
  })
  for (const item of original) it(item.name + ' preserves prose, executable samples and technical data without inventing a plugin', () => {
    const metadata = componentMdxMetadata(item.name)!
    expect(metadata.title).toBe(item.title)
    expect(metadata.description).toBe(item.description)
    expect(componentTitle(item.name)).toBe(item.title)
    expect(componentIntro(item.name)).toBe(item.lead)
    expect(componentExample(item.name)).toBe(item.example)
    expect(JSON.parse(JSON.stringify(componentDetail(item.name)))).toEqual(item.detail)
    const source = read('site/src/content/docs/components/' + item.name + '.mdx')
    for (const heading of ['example', 'variants', 'css-variables', 'sass', 'keyboard', 'guidelines', 'classes', 'javascript']) expect(source).toContain(`id="${heading}"`)
    expect(source).toContain(`componentExample("${item.name}")`)
    expect(source).toContain(`componentDetail("${item.name}")`)
    expect(source).toContain('<p>' + item.javascript + '</p>')
    expect(source).not.toContain('<ComponentGuide')
    expect(source).not.toContain('componentApi(')
    expect(api.components.some(component => component.name === item.name)).toBe(false)
    expect(() => componentApi(item.name)).toThrow('No authored component API adapter: ' + item.name)
    expect(read('site/src/data/component-reference.ts')).not.toContain(item.lead)
    expect(read('site/src/pages/components/[slug].astro')).not.toContain(item.javascript)
    for (const variant of item.detail.variants) expect(read('site/src/data/navigation-disclosure-docs.ts')).not.toContain(variant.description)
  })
  it('preserves native group inputs while disclosing the separate Menu integration', () => {
    const detail = componentDetail('button-group')!
    const doc = documentOf(detail.variants.map(variant => variant.markup).join('\n'))
    expect(doc.querySelectorAll('label.btn-check > input[type="checkbox"]').length).toBeGreaterThan(0)
    expect(doc.querySelectorAll('input[type="radio"][name="group-alignment"]')).toHaveLength(3)
    expect(doc.querySelector('input[type="checkbox"][disabled]')).not.toBeNull()
    expect(doc.querySelectorAll('input[aria-pressed]')).toHaveLength(0)
    expect(doc.querySelector('[data-trm-toggle="menu"][aria-haspopup="menu"]')).not.toBeNull()
    expect(componentMdxMetadata('button-group')!.guidelines!.join(' ')).toContain('Menu JavaScript')
  })
  it('keeps the close mask actionless until an explicit Alert action is connected', () => {
    const standalone = documentOf(componentExample('close-button')!)
    expect(standalone.querySelector('button')!.textContent).toBe('')
    expect(standalone.querySelector('button')!.getAttribute('aria-label')).toBe('Close example')
    expect(standalone.querySelectorAll('[data-trm-dismiss]')).toHaveLength(0)
    const variants = documentOf(componentDetail('close-button')!.variants.map(variant => variant.markup).join('\n'))
    expect(variants.querySelector('button.btn-close[disabled]')).not.toBeNull()
    expect(variants.querySelector('#reference-close-alert [data-trm-dismiss="alert"]')).not.toBeNull()
    expect(read('site/src/content/docs/components/close-button.mdx')).toContain('Alert JavaScript')
  })
  it('keeps ordinary Nav links distinct from tabs and preserves Menu hooks', () => {
    const main = documentOf(componentExample('nav')!)
    expect(main.querySelector('nav[aria-label="Project sections"]')).not.toBeNull()
    expect(main.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
    expect(main.querySelectorAll('[role="tab"], [role="tablist"]')).toHaveLength(0)
    const variants = documentOf(componentDetail('nav')!.variants.map(variant => variant.markup).join('\n'))
    expect(variants.querySelector('[data-trm-toggle="menu"]')).not.toBeNull()
    for (const link of variants.querySelectorAll('[aria-disabled="true"]')) expect(link.hasAttribute('href')).toBe(false)
    expect(read('site/src/content/docs/components/nav.mdx')).toContain('separate Tab plugin')
  })
  it('reads fresh Nav prose through canonical details, intro projections and search', () => {
    const delegate = vi.mocked(readFileSync).getMockImplementation()! as unknown as (file: unknown, ...args: unknown[]) => unknown
    const detail = navigationDetails.nav
    vi.mocked(readFileSync).mockImplementation(((file: unknown, ...args: unknown[]) => {
      const result = delegate(file, ...args)
      if (typeof result !== 'string' || !String(file).replaceAll('\\', '/').endsWith('/components/nav.mdx')) return result
      const header = result.match(/^---\n([\s\S]*?)\n---/)!
      const metadata = JSON.parse(header[1]!)
      metadata.title = 'Updated Nav'
      metadata.lead = 'Updated navigation guidance'
      metadata.variants[0].description = 'Updated Nav variant'
      return result.replace(header[1]!, JSON.stringify(metadata, null, 2))
    }) as typeof readFileSync)
    try {
      expect(componentTitle('nav')).toBe('Updated Nav')
      expect(componentIntro('nav')).toBe('Updated navigation guidance')
      expect(detail.variants[0]!.description).toBe('Updated Nav variant')
      expect(componentDetail('nav')!.variants[0]!.description).toBe('Updated Nav variant')
      expect(documentationNavigation().searchPages.find(page => page.href === '/components/nav/')!.title).toBe('Updated Nav')
    } finally { vi.mocked(readFileSync).mockImplementation(delegate as typeof readFileSync) }
  })
})
