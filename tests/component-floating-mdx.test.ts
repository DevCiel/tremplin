import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import original from './fixtures/mdx-migration/component-floating.before.json' with { type: 'json' }
import api from '../metadata/api.json' with { type: 'json' }
import { authoredComponentNames, componentMdxMetadata } from '../site/src/libs/component-mdx'
import { componentApi, componentApiEvents, authoredApiComponentNames } from '../site/src/data/component-api'
import { componentDetail, componentExample, componentTitle, componentIntro, documentedComponents } from '../site/src/data/component-reference'
import { overlayDetails } from '../site/src/data/overlay-component-docs'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertComponentFloatingMdx } from './tooling/lib/component-floating-mdx.mjs'

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) }
})
const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')

describe('authored Tooltip and Popover documentation', () => {
  it('reaches 27 of 47 routes with eleven canonical API adapters', () => {
    const policy = assertComponentFloatingMdx()
    expect(policy.names).toEqual(['popover', 'tooltip'])
    expect(policy.canonical).toEqual(policy.names)
    expect(policy.remaining).toBe(20)
    const later = ['nav-overflow', 'navbar', 'toggler', 'carousel', 'stepper', 'chips', 'combobox', 'datepicker', 'otp-input', 'range', 'strength', 'chip', 'command-palette', 'data-table', 'divider', 'empty-state', 'forms', 'status', 'table', 'timeline']
    const phaseNames = authoredComponentNames.filter(name => !later.includes(name))
    expect(phaseNames).toHaveLength(27)
    expect(authoredApiComponentNames.filter(name => !later.includes(name))).toEqual(['alert', 'button', 'collapse', 'dialog', 'drawer', 'menu', 'popover', 'scrollspy', 'tab', 'toast', 'tooltip'])
    expect(readdirSync('site/src/content/docs/components').filter(file => !later.includes(file.slice(0, -4))).sort()).toEqual(phaseNames.map(name => name + '.mdx').sort())
    expect(documentedComponents).toHaveLength(47)
    expect(documentationNavigation().guides).toHaveLength(116)
    expect(documentationNavigation().searchPages.filter(page => page.href.startsWith('/components/'))).toHaveLength(47)
  })
  for (const item of original) it(item.name + ' retains original narrative, executable markup, tokens, Sass and generated API', () => {
    expect(componentMdxMetadata(item.name)!.title).toBe(item.title)
    expect(componentMdxMetadata(item.name)!.description).toBe(item.description)
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
    expect(source).toContain(item.primer)
    for (const heading of ['example', 'variants', 'css-variables', 'sass', 'keyboard', 'guidelines', 'classes', 'javascript', 'options', 'methods', 'events', 'data-attributes']) expect(source).toContain(`id="${heading}"`)
    for (const shortcode of ['ApiOptions', 'ApiMethods', 'ApiEvents', 'ApiAttributes']) expect(source).toContain(`<${shortcode} name="${item.name}" />`)
    expect(source).not.toContain('<Contrast')
    expect(read('site/src/data/component-docs.ts')).not.toContain(item.lead)
    for (const variant of item.detail.variants) expect(read('site/src/data/overlay-component-docs.ts')).not.toContain(variant.description)
    for (const description of Object.values(item.events)) expect(read('site/src/pages/components/[slug].astro')).not.toContain(description)
  })
  it('retains distinct hover/focus and click policies, sanitization and top-layer guidance', () => {
    expect(overlayDetails.tooltip.guidelines.join(' ')).toContain('explicitly initialize')
    expect(overlayDetails.tooltip.guidelines.join(' ')).toContain('sanitize/allowList/sanitizeFn cannot come from data attributes')
    expect(overlayDetails.popover.guidelines.join(' ')).toContain('focus-trigger policy')
    expect(overlayDetails.popover.guidelines.join(' ')).toContain('open ancestor dialog')
    expect(overlayDetails.popover.keyboard.map(row => row.behavior).join(' ')).toContain('no focus trap')
    for (const item of original) {
      const doc = new DOMParser().parseFromString([item.example, ...item.detail.variants.map(variant => variant.markup)].join('\n'), 'text/html')
      expect(doc.querySelector('[data-trm-html="true"]')).not.toBeNull()
      expect(doc.querySelector('[role="button"][tabindex="0"][aria-disabled="true"][aria-label]')).not.toBeNull()
      expect(doc.querySelector('[data-trm-sanitize], [data-trm-placement="start"], [data-trm-placement="end"], [aria-expanded]')).toBeNull()
      expect(componentApiEvents(item.name).find(row => row.event.startsWith('inserted.'))!.description).toContain('before positioning')
      expect(componentApiEvents(item.name).find(row => row.event.startsWith('hidden.'))!.description).toContain('unless reactivated')
    }
  })
  for (const name of ['popover', 'tooltip']) it(name + ' rejects undocumented future lifecycle events', () => {
    const definition = componentApi(name).definition
    definition.events.push('new.trm.' + name)
    try { expect(() => componentApiEvents(name)).toThrow('Missing authored lifecycle description: new.trm.' + name) }
    finally { definition.events.pop() }
  })
  for (const name of ['popover', 'tooltip'] as const) it(name + ' reads fresh authored metadata into details, event prose and search', () => {
    const delegate = vi.mocked(readFileSync).getMockImplementation()! as unknown as (file: unknown, ...args: unknown[]) => unknown
    const detail = overlayDetails[name]
    vi.mocked(readFileSync).mockImplementation(((file: unknown, ...args: unknown[]) => {
      const result = delegate(file, ...args)
      if (typeof result !== 'string' || !String(file).replaceAll('\\', '/').endsWith('/components/' + name + '.mdx')) return result
      const header = result.match(/^---\n([\s\S]*?)\n---/)!
      const metadata = JSON.parse(header[1]!)
      metadata.title = 'Updated ' + name
      metadata.lead = 'Updated supporting guidance'
      metadata.variants[0].description = 'Updated variant explanation'
      metadata.events['show.trm.' + name] = 'Updated start explanation'
      return result.replace(header[1]!, JSON.stringify(metadata, null, 2))
    }) as typeof readFileSync)
    try {
      expect(componentTitle(name)).toBe('Updated ' + name)
      expect(componentIntro(name)).toBe('Updated supporting guidance')
      expect(detail.variants[0]!.description).toBe('Updated variant explanation')
      expect(componentApiEvents(name).find(row => row.event === 'show.trm.' + name)!.description).toBe('Updated start explanation')
      expect(documentationNavigation().searchPages.find(page => page.href === '/components/' + name + '/')!.title).toBe('Updated ' + name)
    } finally { vi.mocked(readFileSync).mockImplementation(delegate as typeof readFileSync) }
  })
})
