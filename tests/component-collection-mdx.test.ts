import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import original from './fixtures/mdx-migration/component-collection.before.json' with { type: 'json' }
import api from '../metadata/api.json' with { type: 'json' }
import { authoredComponentNames, componentMdxMetadata } from '../site/src/libs/component-mdx'
import { componentApi, authoredApiComponentNames } from '../site/src/data/component-api'
import { componentDetail, componentExample, componentTitle, componentIntro, documentedComponents } from '../site/src/data/component-reference'
import { documentationNavigation } from '../site/src/libs/navigation'
import { collectionDetails } from '../site/src/data/collection-disclosure-docs'
import { assertComponentCollectionMdx } from './tooling/lib/component-collection-mdx.mjs'

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) }
})
const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
describe('authored collection-component MDX', () => {
  it('adds exactly three routes, bringing component migration to fourteen of 47', () => {
    const policy = assertComponentCollectionMdx()
    expect(policy.names).toEqual(['breadcrumb', 'list-group', 'pagination'])
    expect(policy.remaining).toBe(33)
    const later = ['button-group', 'close-button', 'nav', 'menu', 'tab', 'scrollspy', 'toast', 'toasts', 'bottom-sheet', 'dialog', 'drawer', 'popover', 'tooltip', 'nav-overflow', 'navbar', 'toggler', 'carousel', 'stepper', 'chips', 'combobox', 'datepicker', 'otp-input', 'range', 'strength', 'chip', 'command-palette', 'data-table', 'divider', 'empty-state', 'forms', 'status', 'table', 'timeline']
    const phaseNames = authoredComponentNames.filter(name => !later.includes(name))
    expect(phaseNames).toHaveLength(14)
    expect(authoredApiComponentNames.filter(name => !['menu', 'tab', 'scrollspy', 'toast', 'dialog', 'drawer', 'popover', 'tooltip', 'nav-overflow', 'navbar', 'toggler', 'carousel', 'stepper', 'chips', 'combobox', 'datepicker', 'otp-input', 'range', 'strength'].includes(name))).toEqual(['alert', 'button', 'collapse'])
    expect(readdirSync('site/src/content/docs/components').filter(file => !later.includes(file.slice(0, -4))).sort()).toEqual(phaseNames.map(name => name + '.mdx'))
    expect(documentedComponents).toHaveLength(47)
    expect(documentationNavigation().guides).toHaveLength(116)
    expect(documentationNavigation().searchPages.filter(page => page.href.startsWith('/components/'))).toHaveLength(47)
  })
  for (const item of original) it(item.name + ' retains original prose, executable samples and technical data without a plugin API', () => {
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
    expect(source.includes('<Contrast />')).toBe(item.name !== 'breadcrumb')
    expect(api.components.some(component => component.name === item.name)).toBe(false)
    expect(() => componentApi(item.name)).toThrow('No authored component API adapter: ' + item.name)
    expect(read('site/src/data/component-docs.ts')).not.toContain(item.lead)
    expect(read('site/src/pages/components/[slug].astro')).not.toContain(item.javascript)
    for (const variant of item.detail.variants) expect(read('site/src/data/collection-disclosure-docs.ts')).not.toContain(variant.description)
  })
  it('keeps decorative breadcrumb dividers separate from the native hierarchy', () => {
    const doc = new DOMParser().parseFromString(componentExample('breadcrumb')!, 'text/html')
    expect(doc.querySelectorAll('li:not([role="presentation"])')).toHaveLength(3)
    expect(doc.querySelectorAll('a')).toHaveLength(2)
    expect(doc.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
    for (const divider of doc.querySelectorAll('.breadcrumb-divider')) expect(divider.getAttribute('aria-hidden')).toBe('true')
  })
  it('preserves native list controls and unavailable pagination destinations', () => {
    const list = new DOMParser().parseFromString(componentDetail('list-group')!.variants.map(variant => variant.markup).join('\n'), 'text/html')
    expect(list.querySelectorAll('input[type="checkbox"], input[type="radio"]').length).toBeGreaterThan(0)
    expect(list.querySelector('input[type="checkbox"][disabled]')).not.toBeNull()
    expect(list.querySelectorAll('[role="listbox"], [role="option"]')).toHaveLength(0)
    const pages = new DOMParser().parseFromString(componentDetail('pagination')!.variants[0]!.markup, 'text/html')
    expect(pages.querySelector('[aria-current="page"]')!.textContent).toBe('1')
    expect(pages.querySelector('[aria-disabled="true"]')!.hasAttribute('href')).toBe(false)
    expect(pages.querySelector('a[href$="?page=2"]')).not.toBeNull()
  })
  it('reads fresh List group metadata through canonical details, rendered projections and navigation', () => {
    const delegate = vi.mocked(readFileSync).getMockImplementation()! as unknown as (file: unknown, ...args: unknown[]) => unknown
    const detail = collectionDetails['list-group']
    vi.mocked(readFileSync).mockImplementation(((file: unknown, ...args: unknown[]) => {
      const result = delegate(file, ...args)
      if (typeof result !== 'string' || !String(file).replaceAll('\\', '/').endsWith('/components/list-group.mdx')) return result
      const header = result.match(/^---\n([\s\S]*?)\n---/)!
      const metadata = JSON.parse(header[1]!)
      metadata.title = 'Updated List group'
      metadata.lead = 'Updated collection guidance'
      metadata.variants[0].description = 'Updated list variant'
      return result.replace(header[1]!, JSON.stringify(metadata, null, 2))
    }) as typeof readFileSync)
    try {
      expect(componentTitle('list-group')).toBe('Updated List group')
      expect(componentIntro('list-group')).toBe('Updated collection guidance')
      expect(detail.variants[0]!.description).toBe('Updated list variant')
      expect(componentDetail('list-group')!.variants[0]!.description).toBe('Updated list variant')
      expect(documentationNavigation().searchPages.find(page => page.href === '/components/list-group/')!.title).toBe('Updated List group')
    } finally { vi.mocked(readFileSync).mockImplementation(delegate as typeof readFileSync) }
  })
})
