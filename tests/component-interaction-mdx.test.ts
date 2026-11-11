import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import original from './fixtures/mdx-migration/component-interaction.before.json' with { type: 'json' }
import api from '../metadata/api.json' with { type: 'json' }
import { authoredComponentNames, componentMdxMetadata } from '../site/src/libs/component-mdx'
import { componentApi, componentApiEvents, authoredApiComponentNames } from '../site/src/data/component-api'
import { componentDetail, componentExample, componentTitle, componentIntro, documentedComponents } from '../site/src/data/component-reference'
import { selectionDetails } from '../site/src/data/selection-feedback-docs'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertComponentInteractionMdx } from './tooling/lib/component-interaction-mdx.mjs'

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) }
})
const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
describe('authored Menu and Tab MDX', () => {
  it('adds exactly two routes, bringing component migration to nineteen of 47', () => {
    const policy = assertComponentInteractionMdx()
    expect(policy.names).toEqual(['menu', 'tab'])
    expect(policy.remaining).toBe(28)
    const later = ['scrollspy', 'toast', 'toasts', 'bottom-sheet', 'dialog', 'drawer', 'popover', 'tooltip', 'nav-overflow', 'navbar', 'toggler', 'carousel', 'stepper', 'chips', 'combobox', 'datepicker', 'otp-input', 'range', 'strength', 'chip', 'command-palette', 'data-table', 'divider', 'empty-state', 'forms', 'status', 'table', 'timeline']
    const phaseNames = authoredComponentNames.filter(name => !later.includes(name))
    expect(phaseNames).toHaveLength(19)
    expect(authoredApiComponentNames.filter(name => !later.includes(name))).toEqual(['alert', 'button', 'collapse', 'menu', 'tab'])
    expect(readdirSync('site/src/content/docs/components').filter(file => !later.includes(file.slice(0, -4))).sort()).toEqual(phaseNames.map(name => name + '.mdx').sort())
    expect(documentedComponents).toHaveLength(47)
    expect(documentationNavigation().guides).toHaveLength(116)
    expect(documentationNavigation().searchPages.filter(page => page.href.startsWith('/components/'))).toHaveLength(47)
  })
  for (const item of original) it(item.name + ' preserves authored prose, examples, API ordering and import samples', () => {
    const metadata = componentMdxMetadata(item.name)!
    expect(metadata.title).toBe(item.title)
    expect(metadata.description).toBe(item.description)
    expect(componentTitle(item.name)).toBe(item.title)
    expect(componentIntro(item.name)).toBe(item.lead)
    expect(componentExample(item.name)).toBe(item.example)
    expect(JSON.parse(JSON.stringify(componentDetail(item.name)))).toEqual(item.detail)
    const actual = componentApi(item.name)
    expect(actual.definition).toBe(api.components.find(component => component.name === item.name))
    expect(actual.definition).toEqual(item.definition)
    expect(actual.commonMethods).toEqual(item.commonMethods)
    expect(actual.moduleImport).toBe(item.moduleImport)
    expect(actual.javascript).toBe(item.javascript)
    expect(componentApiEvents(item.name)).toEqual(Object.entries(item.events).map(([event, description]) => ({ event, description })))
    const source = read('site/src/content/docs/components/' + item.name + '.mdx')
    for (const heading of ['example', 'variants', 'css-variables', 'sass', 'keyboard', 'guidelines', 'classes', 'javascript', 'options', 'methods', 'events', 'data-attributes']) expect(source).toContain(`id="${heading}"`)
    for (const shortcode of ['ApiOptions', 'ApiMethods', 'ApiEvents', 'ApiAttributes']) expect(source).toContain(`<${shortcode} name="${item.name}" />`)
    expect(source).toContain(`componentApi("${item.name}").javascript`)
    expect(source).not.toContain('<ComponentGuide')
    expect(read('site/src/data/component-docs.ts')).not.toContain(item.lead)
    for (const variant of item.detail.variants) expect(read('site/src/data/selection-feedback-docs.ts')).not.toContain(variant.description)
    for (const description of Object.values(item.events).filter(value => !value.startsWith('Internal namespaced'))) expect(read('site/src/pages/components/[slug].astro')).not.toContain(description)
  })
  it('distinguishes Tab internal listeners from dispatched lifecycle events', () => {
    const rows = componentApiEvents('tab')
    expect(rows.filter(row => row.description.startsWith('Internal namespaced')).map(row => row.event)).toEqual(['click.trm.tab', 'keydown.trm.tab', 'load.trm.tab'])
    expect(rows.filter(row => !row.description.startsWith('Internal namespaced')).map(row => row.event)).toEqual(['hidden.trm.tab', 'hide.trm.tab', 'show.trm.tab', 'shown.trm.tab'])
    expect(rows.find(row => row.event === 'show.trm.tab')!.description).toContain('Cancelable start')
    expect(rows.find(row => row.event === 'shown.trm.tab')!.description).toContain('stale activations are ignored')
  })
  it('keeps Menu dependency/keyboard guidance and the Tab native relationships', () => {
    expect(componentMdxMetadata('menu')!.guidelines!.join(' ')).toContain('Floating UI is required')
    expect(componentDetail('menu')!.keyboard.find(row => row.keys === 'ArrowRight / ArrowLeft')!.behavior).toContain('RTL')
    const tab = new DOMParser().parseFromString(componentExample('tab')!, 'text/html')
    for (const trigger of tab.querySelectorAll('[role="tab"]')) {
      const panel = tab.getElementById(trigger.getAttribute('aria-controls')!)!
      expect(panel.getAttribute('aria-labelledby')).toBe(trigger.id)
      expect(panel.getAttribute('tabindex')).toBe('0')
    }
    expect(componentMdxMetadata('tab')!.guidelines!.join(' ')).toContain('DOM order regardless of orientation or RTL')
  })
  it('keeps API arrays live and rejects an undescribed future event', () => {
    const definition = componentApi('menu').definition
    definition.options.push({ name: 'fixtureOption', type: 'boolean', required: false })
    definition.methods.push('fixtureMethod(): void')
    definition.dataAttributes.push('data-trm-fixture')
    definition.events.push('new.trm.menu')
    try {
      const current = componentApi('menu').definition
      expect(current.options.at(-1)!.name).toBe('fixtureOption')
      expect(current.methods.at(-1)).toBe('fixtureMethod(): void')
      expect(current.dataAttributes.at(-1)).toBe('data-trm-fixture')
      expect(() => componentApiEvents('menu')).toThrow('Missing authored lifecycle description: new.trm.menu')
    } finally { definition.options.pop(); definition.methods.pop(); definition.dataAttributes.pop(); definition.events.pop() }
  })
  it('reads fresh Menu narrative and event descriptions through existing consumers', () => {
    const delegate = vi.mocked(readFileSync).getMockImplementation()! as unknown as (file: unknown, ...args: unknown[]) => unknown
    const detail = selectionDetails.menu
    vi.mocked(readFileSync).mockImplementation(((file: unknown, ...args: unknown[]) => {
      const result = delegate(file, ...args)
      if (typeof result !== 'string' || !String(file).replaceAll('\\', '/').endsWith('/components/menu.mdx')) return result
      const header = result.match(/^---\n([\s\S]*?)\n---/)!
      const metadata = JSON.parse(header[1]!)
      metadata.title = 'Updated Menu'
      metadata.lead = 'Updated Menu guidance'
      metadata.variants[0].description = 'Updated Menu variant'
      metadata.events['show.trm.menu'] = 'Updated cancelable start explanation'
      return result.replace(header[1]!, JSON.stringify(metadata, null, 2))
    }) as typeof readFileSync)
    try {
      expect(componentTitle('menu')).toBe('Updated Menu')
      expect(componentIntro('menu')).toBe('Updated Menu guidance')
      expect(detail.variants[0]!.description).toBe('Updated Menu variant')
      expect(componentApiEvents('menu').find(row => row.event === 'show.trm.menu')!.description).toBe('Updated cancelable start explanation')
      expect(documentationNavigation().searchPages.find(page => page.href === '/components/menu/')!.title).toBe('Updated Menu')
    } finally { vi.mocked(readFileSync).mockImplementation(delegate as typeof readFileSync) }
  })
})
