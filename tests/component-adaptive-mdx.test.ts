import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import original from './fixtures/mdx-migration/component-adaptive.before.json' with { type: 'json' }
import api from '../metadata/api.json' with { type: 'json' }
import { authoredComponentNames, componentMdxMetadata } from '../site/src/libs/component-mdx'
import { componentApi, componentApiEvents, authoredApiComponentNames } from '../site/src/data/component-api'
import { componentDetail, componentExample, componentTitle, componentIntro, documentedComponents } from '../site/src/data/component-reference'
import { adaptiveDetails, adaptiveRuntimeEvent, adaptiveEventDescriptions, togglerOptionRows, navbarFocusJavascript } from '../site/src/data/adaptive-navigation-docs'
import { strictControlIntros } from '../site/src/data/strict-control-docs'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertComponentAdaptiveMdx } from './tooling/lib/component-adaptive-mdx.mjs'

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) }
})
const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')

describe('authored Navbar, Nav Overflow and Toggler documentation', () => {
  it('reaches 30 of 47 routes, adding two canonical APIs and no Navbar plugin', () => {
    const policy = assertComponentAdaptiveMdx()
    expect(policy.names).toEqual(['nav-overflow', 'navbar', 'toggler'])
    expect(policy.canonical).toEqual(['nav-overflow', 'toggler'])
    expect(policy.remaining).toBe(17)
    const later = ['carousel', 'stepper', 'chips', 'combobox', 'datepicker', 'otp-input', 'range', 'strength', 'chip', 'command-palette', 'data-table', 'divider', 'empty-state', 'forms', 'status', 'table', 'timeline']
    const phaseNames = authoredComponentNames.filter(name => !later.includes(name))
    expect(phaseNames).toHaveLength(30)
    expect(authoredApiComponentNames.filter(name => !later.includes(name))).toHaveLength(13)
    expect(authoredApiComponentNames.filter(name => !later.includes(name))).toEqual(['alert', 'button', 'collapse', 'dialog', 'drawer', 'menu', 'nav-overflow', 'popover', 'scrollspy', 'tab', 'toast', 'toggler', 'tooltip'])
    expect(readdirSync('site/src/content/docs/components').filter(file => !later.includes(file.slice(0, -4))).sort()).toEqual(phaseNames.map(name => name + '.mdx').sort())
    expect(documentedComponents).toHaveLength(47)
    expect(documentationNavigation().guides).toHaveLength(116)
    expect(documentationNavigation().searchPages.filter(page => page.href.startsWith('/components/'))).toHaveLength(47)
    expect(() => componentApi('navbar')).toThrow('No authored component API adapter: navbar')
    expect(api.components.some(component => component.name === 'navbar')).toBe(false)
  })
  for (const item of original) it(item.name + ' retains its original narrative, executable samples, tokens and API contract', () => {
    expect(componentMdxMetadata(item.name)!.title).toBe(item.title)
    expect(componentMdxMetadata(item.name)!.description).toBe(item.description)
    expect(componentTitle(item.name)).toBe(item.title)
    expect(componentIntro(item.name)).toBe(item.lead)
    expect(componentExample(item.name)).toBe(item.example)
    expect(JSON.parse(JSON.stringify(componentDetail(item.name)))).toEqual(item.detail)
    const source = read('site/src/content/docs/components/' + item.name + '.mdx')
    for (const heading of ['example', 'variants', 'keyboard', 'guidelines', 'javascript']) expect(source).toContain(`id="${heading}"`)
    expect(source).not.toContain('<Contrast')
    expect(read('site/src/data/component-docs.ts')).not.toContain(item.lead)
    for (const variant of item.detail.variants) expect(read('site/src/data/adaptive-navigation-docs.ts')).not.toContain(variant.description)
    if (item.definition) {
      const actual = componentApi(item.name)
      expect(actual.definition).toBe(api.components.find(component => component.name === item.name))
      expect(actual.definition).toEqual(item.definition)
      expect(actual.commonMethods).toEqual(item.commonMethods)
      expect(actual.moduleImport).toBe(item.moduleImport)
      expect(actual.javascript).toBe(item.javascript)
      expect(componentApiEvents(item.name)).toEqual(Object.entries(item.events!).map(([event, description]) => ({ event, description })))
      for (const heading of ['options', 'methods', 'events', 'data-attributes']) expect(source).toContain(`id="${heading}"`)
      for (const description of Object.values(item.events!)) expect(read('site/src/data/adaptive-navigation-docs.ts')).not.toContain(description)
    }
  })
  it('preserves the Navbar application handler, original script position and balanced token columns', () => {
    expect(navbarFocusJavascript).toBe(original.find(item => item.name === 'navbar')!.applicationJavascript)
    expect(() => new Function(navbarFocusJavascript)).not.toThrow()
    const body = read('site/src/content/docs/components/navbar.mdx')
    expect(body).toContain('<Code source={navbarFocusJavascript} standalone={true} plain={true} label="Copy Navbar application focus handler" />')
    expect(body).toContain('not an extra Navbar plugin')
    const before = read('tests/fixtures/mdx-migration/component-page.before-adaptive.astro.txt')
    const script = before.match(/\{localName === 'navbar' && <script is:inline set:html=\{navbarFocusJavascript\}><\/script>\}/)![0]
    const current = read('site/src/pages/components/[slug].astro')
    expect(current).toContain(script)
    expect(current.indexOf(script)).toBeGreaterThan(current.indexOf('<nav class="docs-pagination"'))
    expect(read('site/src/components/component/Tokens.astro')).toContain("['close-button', 'breadcrumb', 'navbar'].includes(name)")
  })
  it('corrects NavOverflow runtime event names only in the presentation and retains notification distinctions', () => {
    const definition = componentApi('nav-overflow').definition
    expect(definition.events).toContain('update.trm.nav-overflow')
    expect(definition.events).not.toContain('update.trm.navoverflow')
    expect(componentApiEvents('nav-overflow').map(row => row.event)).toEqual(definition.events.map(adaptiveRuntimeEvent))
    expect(componentApiEvents('nav-overflow').find(row => row.event === 'update.trm.navoverflow')!.description).toContain('ResizeObserver does not dispatch update')
    expect(componentApiEvents('nav-overflow').find(row => row.event === 'resize.trm.navoverflow')!.description).toContain('not a dispatched component notification')
    for (const row of componentApiEvents('nav-overflow')) expect(adaptiveEventDescriptions[row.event]).toBe(row.description)
    expect(strictControlIntros['nav-overflow']).toBe(componentIntro('nav-overflow'))
  })
  it('keeps source-verified Toggler options and target mutation without inventing scanner data or CSS', () => {
    expect(togglerOptionRows).toEqual(original.find(item => item.name === 'toggler')!.sourceOptions)
    expect(componentApi('toggler').definition.options).toEqual([])
    expect(componentApi('toggler').javascript).toContain('instance.toggle() // Mutates the configured target, not its external launcher.')
    expect(read('site/src/content/docs/components/toggler.mdx')).toContain('<TogglerOptions />')
    expect(read('site/src/components/component/TogglerOptions.astro')).toContain('togglerOptionRows.map(')
    expect(componentDetail('toggler')!.variables).toEqual([])
    const markup = new DOMParser().parseFromString(componentExample('toggler')!, 'text/html')
    expect(markup.querySelector('#generic-panel')!.getAttribute('data-trm-value')).toBe('bg-2')
    expect(markup.querySelector('[aria-expanded]')).toBeNull()
  })
  for (const name of ['nav-overflow', 'toggler']) it(name + ' rejects future events until authored prose exists', () => {
    const definition = componentApi(name).definition
    definition.events.push('new.trm.' + name)
    try { expect(() => componentApiEvents(name)).toThrow('Missing authored lifecycle description: ' + adaptiveRuntimeEvent('new.trm.' + name)) }
    finally { definition.events.pop() }
  })
  for (const name of ['nav-overflow', 'navbar', 'toggler'] as const) it(name + ' reads fresh narrative, navigation and canonical event prose', () => {
    const delegate = vi.mocked(readFileSync).getMockImplementation()! as unknown as (file: unknown, ...args: unknown[]) => unknown
    const detail = adaptiveDetails[name]
    vi.mocked(readFileSync).mockImplementation(((file: unknown, ...args: unknown[]) => {
      const result = delegate(file, ...args)
      if (typeof result !== 'string' || !String(file).replaceAll('\\', '/').endsWith('/components/' + name + '.mdx')) return result
      const header = result.match(/^---\n([\s\S]*?)\n---/)!, metadata = JSON.parse(header[1]!)
      metadata.title = 'Updated ' + name
      metadata.lead = 'Updated navigation guidance'
      metadata.variants[0].description = 'Updated variant explanation'
      if (metadata.events) for (const event of Object.keys(metadata.events)) metadata.events[event] = 'Updated event explanation'
      return result.replace(header[1]!, JSON.stringify(metadata, null, 2))
    }) as typeof readFileSync)
    try {
      expect(componentTitle(name)).toBe('Updated ' + name)
      expect(componentIntro(name)).toBe('Updated navigation guidance')
      expect(detail.variants[0]!.description).toBe('Updated variant explanation')
      expect(documentationNavigation().searchPages.find(page => page.href === '/components/' + name + '/')!.title).toBe('Updated ' + name)
      if (name !== 'navbar') for (const row of componentApiEvents(name)) {
        expect(row.description).toBe('Updated event explanation')
        expect(adaptiveEventDescriptions[row.event]).toBe(row.description)
      }
      if (name === 'nav-overflow') expect(strictControlIntros[name]).toBe('Updated navigation guidance')
    } finally { vi.mocked(readFileSync).mockImplementation(delegate as typeof readFileSync) }
  })
})
