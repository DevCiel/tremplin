import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import original from './fixtures/mdx-migration/component-disclosure.before.json' with { type: 'json' }
import api from '../metadata/api.json' with { type: 'json' }
import { authoredComponentNames, componentMdxMetadata } from '../site/src/libs/component-mdx'
import { componentApi, componentApiEvents, authoredApiComponentNames } from '../site/src/data/component-api'
import { componentDetail, componentExample, componentTitle, componentIntro, documentedComponents } from '../site/src/data/component-reference'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertComponentDisclosureMdx } from './tooling/lib/component-disclosure-mdx.mjs'

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) }
})
const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')

describe('authored disclosure-component documentation', () => {
  it('adds exactly Accordion and Collapse, bringing the total to eleven of 47 routes', () => {
    expect(assertComponentDisclosureMdx().names).toEqual(['accordion', 'collapse'])
    expect(assertComponentDisclosureMdx().remaining).toBe(36)
    const later = ['breadcrumb', 'list-group', 'pagination', 'button-group', 'close-button', 'nav', 'menu', 'tab', 'scrollspy', 'toast', 'toasts', 'bottom-sheet', 'dialog', 'drawer', 'popover', 'tooltip', 'nav-overflow', 'navbar', 'toggler', 'carousel', 'stepper', 'chips', 'combobox', 'datepicker', 'otp-input', 'range', 'strength', 'chip', 'command-palette', 'data-table', 'divider', 'empty-state', 'forms', 'status', 'table', 'timeline']
    const phaseNames = authoredComponentNames.filter(name => !later.includes(name))
    expect(phaseNames).toHaveLength(11)
    expect(authoredApiComponentNames.filter(name => !['menu', 'tab', 'scrollspy', 'toast', 'dialog', 'drawer', 'popover', 'tooltip', 'nav-overflow', 'navbar', 'toggler', 'carousel', 'stepper', 'chips', 'combobox', 'datepicker', 'otp-input', 'range', 'strength'].includes(name))).toEqual(['alert', 'button', 'collapse'])
    expect(readdirSync('site/src/content/docs/components').filter(file => !later.includes(file.slice(0, -4))).sort()).toEqual(phaseNames.map(name => name + '.mdx'))
    expect(documentedComponents).toHaveLength(47)
    expect(documentationNavigation().guides).toHaveLength(116)
    expect(documentationNavigation().searchPages.filter(page => page.href.startsWith('/components/'))).toHaveLength(47)
  })

  for (const item of original) it(item.name + ' preserves the captured prose, executable samples and technical data', () => {
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
    expect(source).not.toContain('<ComponentGuide')
    expect(read('site/src/data/component-docs.ts')).not.toContain(item.lead)
    const previousModule = item.name === 'accordion' ? 'navigation' : 'collection'
    for (const variant of item.detail.variants) expect(read(`site/src/data/${previousModule}-disclosure-docs.ts`)).not.toContain(variant.description)
  })

  it('retains native Accordion behavior without advertising a plugin or Collapse hooks', () => {
    const item = original.find(item => item.name === 'accordion')!
    expect(api.components.some(component => component.name === 'accordion')).toBe(false)
    expect(() => componentApi('accordion')).toThrow('No authored component API adapter: accordion')
    expect(read('site/src/content/docs/components/accordion.mdx')).toContain('<p>' + item.javascript + '</p>')
    expect(read('site/src/content/docs/components/accordion.mdx')).not.toContain('componentApi(')
    expect(read('site/src/pages/components/[slug].astro')).not.toContain(item.javascript)
    const samples = new DOMParser().parseFromString([componentExample('accordion'), ...componentDetail('accordion')!.variants.map(variant => variant.markup)].join('\n'), 'text/html')
    expect(samples.querySelectorAll('details > summary').length).toBeGreaterThan(5)
    expect(samples.querySelectorAll('[data-trm-toggle="collapse"], .accordion-collapse, .accordion-button')).toHaveLength(0)
    for (const summary of samples.querySelectorAll('summary')) {
      expect(summary.hasAttribute('role')).toBe(false)
      expect(summary.hasAttribute('aria-expanded')).toBe(false)
    }
  })

  it('projects Collapse options, methods, event names and attributes from generated API data', () => {
    const item = original.find(item => item.name === 'collapse')!
    const actual = componentApi('collapse')
    expect(actual.definition).toBe(api.components.find(component => component.name === 'collapse'))
    expect(actual.definition).toEqual(item.definition)
    expect(actual.commonMethods).toEqual(item.commonMethods)
    expect(actual.javascript).toBe(item.javascript)
    expect(actual.moduleImport).toBe(item.moduleImport)
    expect(componentApiEvents('collapse')).toEqual(item.definition!.events.map(event => ({ event, description: Object.entries(item.events).find(([name]) => name === event)![1] })))
    const source = read('site/src/content/docs/components/collapse.mdx')
    for (const shortcode of ['ApiOptions', 'ApiMethods', 'ApiEvents', 'ApiAttributes']) expect(source).toContain(`<${shortcode} name="collapse" />`)
    expect(read('site/src/pages/components/[slug].astro')).not.toContain('collapseEventDescriptions')
    for (const description of Object.values(item.events)) expect(read('site/src/pages/components/[slug].astro')).not.toContain(description)
  })

  it('rejects a newly generated event until its lifecycle explanation is authored', () => {
    const definition = componentApi('collapse').definition
    definition.events.push('new.trm.collapse')
    try { expect(() => componentApiEvents('collapse')).toThrow('Missing authored lifecycle description: new.trm.collapse') }
    finally { definition.events.pop() }
  })

  it('reflects authored metadata changes through existing detail objects, navigation and API descriptions', () => {
    const delegate = vi.mocked(readFileSync).getMockImplementation()! as unknown as (file: unknown, ...args: unknown[]) => unknown
    const detail = componentDetail('collapse')!
    vi.mocked(readFileSync).mockImplementation(((file: unknown, ...args: unknown[]) => {
      const result = delegate(file, ...args)
      if (typeof result !== 'string' || !String(file).replaceAll('\\', '/').endsWith('/components/collapse.mdx')) return result
      const header = result.match(/^---\n([\s\S]*?)\n---/)!
      const metadata = JSON.parse(header[1]!)
      metadata.title = 'Updated Collapse'
      metadata.lead = 'Updated disclosure lead'
      metadata.variants[0].description = 'Updated usage guidance'
      metadata.events['show.trm.collapse'] = 'Updated cancelable start explanation'
      return result.replace(header[1]!, JSON.stringify(metadata, null, 2))
    }) as typeof readFileSync)
    try {
      expect(componentTitle('collapse')).toBe('Updated Collapse')
      expect(componentIntro('collapse')).toBe('Updated disclosure lead')
      expect(detail.variants[0]!.description).toBe('Updated usage guidance')
      expect(componentApiEvents('collapse').find(item => item.event === 'show.trm.collapse')!.description).toBe('Updated cancelable start explanation')
      expect(documentationNavigation().searchPages.find(page => page.href === '/components/collapse/')!.title).toBe('Updated Collapse')
    } finally { vi.mocked(readFileSync).mockImplementation(delegate as typeof readFileSync) }
  })
})
