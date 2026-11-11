import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import original from './fixtures/mdx-migration/component-overlay.before.json' with { type: 'json' }
import api from '../metadata/api.json' with { type: 'json' }
import { authoredComponentNames, componentMdxMetadata } from '../site/src/libs/component-mdx'
import { componentApi, componentApiEvents, authoredApiComponentNames } from '../site/src/data/component-api'
import { componentDetail, componentExample, componentTitle, componentIntro, documentedComponents } from '../site/src/data/component-reference'
import { overlayDetails } from '../site/src/data/overlay-component-docs'
import { sheetDemoJavascript } from '../site/src/data/sheet-command-docs'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertComponentOverlayMdx } from './tooling/lib/component-overlay-mdx.mjs'

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) }
})
const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
describe('authored Dialog, Drawer and Bottom Sheet documentation', () => {
  it('migrates two plugins and an existing composition, reaching 25 of 47 routes', () => {
    const policy = assertComponentOverlayMdx()
    expect(policy.names).toEqual(['bottom-sheet', 'dialog', 'drawer'])
    expect(policy.canonical).toEqual(['dialog', 'drawer'])
    expect(policy.remaining).toBe(22)
    const later = ['popover', 'tooltip', 'nav-overflow', 'navbar', 'toggler', 'carousel', 'stepper', 'chips', 'combobox', 'datepicker', 'otp-input', 'range', 'strength', 'chip', 'command-palette', 'data-table', 'divider', 'empty-state', 'forms', 'status', 'table', 'timeline']
    const phaseNames = authoredComponentNames.filter(name => !later.includes(name))
    expect(phaseNames).toHaveLength(25)
    expect(authoredApiComponentNames.filter(name => !later.includes(name))).toEqual(['alert', 'button', 'collapse', 'dialog', 'drawer', 'menu', 'scrollspy', 'tab', 'toast'])
    expect(readdirSync('site/src/content/docs/components').filter(file => !later.includes(file.slice(0, -4))).sort()).toEqual(phaseNames.map(name => name + '.mdx').sort())
    expect(documentedComponents).toHaveLength(47)
    expect(documentationNavigation().guides).toHaveLength(116)
    expect(documentationNavigation().searchPages.filter(page => page.href.startsWith('/components/'))).toHaveLength(47)
  })
  for (const item of original) it(item.name + ' preserves original prose, executable samples, API data and import/selector samples', () => {
    const metadata = componentMdxMetadata(item.name)!
    expect(metadata.title).toBe(item.title)
    expect(metadata.description).toBe(item.description)
    expect(componentTitle(item.name)).toBe(item.title)
    expect(componentIntro(item.name)).toBe(item.lead)
    expect(componentExample(item.name)).toBe(item.example)
    expect(JSON.parse(JSON.stringify(componentDetail(item.name)))).toEqual(item.detail)
    const actual = componentApi(item.name)
    expect(actual.definition).toBe(api.components.find(component => component.name === item.implementation))
    expect(actual.definition).toEqual(item.definition)
    expect(actual.commonMethods).toEqual(item.commonMethods)
    expect(actual.moduleImport).toBe(item.moduleImport)
    expect(actual.javascript).toBe(item.javascript)
    expect(componentApiEvents(item.name)).toEqual(Object.entries(item.events).map(([event, description]) => ({ event, description })))
    const source = read('site/src/content/docs/components/' + item.name + '.mdx')
    for (const heading of ['example', 'variants', 'css-variables', 'sass', 'keyboard', 'guidelines', 'classes', 'javascript', 'options', 'methods', 'events', 'data-attributes']) expect(source).toContain(`id="${heading}"`)
    for (const shortcode of ['ApiOptions', 'ApiMethods', 'ApiEvents', 'ApiAttributes']) expect(source).toContain(`<${shortcode} name="${item.name}" />`)
    const proseModule = item.name === 'bottom-sheet' ? 'sheet-command-docs' : 'overlay-component-docs'
    for (const variant of item.detail.variants) expect(read('site/src/data/' + proseModule + '.ts')).not.toContain(variant.description)
    const introModule = item.name === 'bottom-sheet' ? 'component-reference' : 'component-docs'
    expect(read('site/src/data/' + introModule + '.ts')).not.toContain(item.lead)
    expect(source.includes('<Contrast />')).toBe(item.name === 'drawer')
  })
  it('shares Drawer API data and event prose without inventing a BottomSheet plugin', () => {
    expect(componentApi('bottom-sheet').definition).toBe(componentApi('drawer').definition)
    expect(componentApi('bottom-sheet').javascript).toContain("document.querySelector('#actions')")
    expect(componentApiEvents('bottom-sheet')).toEqual(componentApiEvents('drawer'))
    expect(componentMdxMetadata('bottom-sheet')!.events).toBeUndefined()
    expect(componentDetail('bottom-sheet')).not.toBe(componentDetail('drawer'))
    expect(api.components.some(component => component.name === 'bottom-sheet')).toBe(false)
  })
  it('retains the displayed and executable application focus policy and literal apostrophe', () => {
    const item = original.find(item => item.name === 'bottom-sheet')!
    expect(sheetDemoJavascript).toBe(item.applicationJavascript)
    const body = read('site/src/content/docs/components/bottom-sheet.mdx')
    expect(body).toContain('<Code source={sheetDemoJavascript} standalone={true} plain={true} label="Copy Bottom Sheet initial focus handler" />')
    expect(body).toContain('page{"\'"}s JavaScript')
    const before = read('tests/fixtures/mdx-migration/component-page.before-overlay.astro.txt')
    const script = before.match(/\{component.name === 'bottom-sheet' && <script is:inline set:html=\{sheetDemoJavascript\}><\/script>\}/)![0]
    const current = read('site/src/pages/components/[slug].astro')
    expect(current).toContain(script)
    expect(current.indexOf(script)).toBeGreaterThan(current.indexOf('<nav class="docs-pagination"'))
  })
  it('distinguishes cancel notifications, cancelable hide gates, static rejection and internal resize', () => {
    expect(componentApiEvents('dialog').find(row => row.event === 'cancel.trm.dialog')!.description).toContain('not the cancelable hide gate')
    expect(componentApiEvents('dialog').find(row => row.event === 'hide.trm.dialog')!.description).toContain('Cancelable start')
    expect(componentApiEvents('drawer').find(row => row.event === 'hidePrevented.trm.drawer')!.description).toContain('suppresses the bounce, not a pending hide')
    expect(componentApiEvents('drawer').find(row => row.event === 'resize.trm.drawer')!.description).toContain('not a dispatched Drawer lifecycle event')
    for (const name of ['dialog', 'drawer', 'bottom-sheet']) {
      const doc = new DOMParser().parseFromString(componentExample(name)!, 'text/html')
      expect(doc.querySelector('dialog[aria-labelledby][tabindex="-1"]')).not.toBeNull()
      expect(doc.querySelector('[data-trm-dismiss][autofocus]')).not.toBeNull()
    }
  })
  it('rejects new Drawer events until canonical prose is authored for Drawer and its composition', () => {
    const definition = componentApi('drawer').definition
    definition.events.push('new.trm.drawer')
    try {
      expect(() => componentApiEvents('drawer')).toThrow('Missing authored lifecycle description: new.trm.drawer')
      expect(() => componentApiEvents('bottom-sheet')).toThrow('Missing authored lifecycle description: new.trm.drawer')
    } finally { definition.events.pop() }
  })
  it('reads fresh Drawer metadata through canonical details, shared sheet events and search', () => {
    const delegate = vi.mocked(readFileSync).getMockImplementation()! as unknown as (file: unknown, ...args: unknown[]) => unknown
    const detail = overlayDetails.drawer
    vi.mocked(readFileSync).mockImplementation(((file: unknown, ...args: unknown[]) => {
      const result = delegate(file, ...args)
      if (typeof result !== 'string' || !String(file).replaceAll('\\', '/').endsWith('/components/drawer.mdx')) return result
      const header = result.match(/^---\n([\s\S]*?)\n---/)!
      const metadata = JSON.parse(header[1]!)
      metadata.title = 'Updated Drawer'
      metadata.lead = 'Updated Drawer guidance'
      metadata.variants[0].description = 'Updated Drawer variant'
      metadata.events['show.trm.drawer'] = 'Updated Drawer start explanation'
      return result.replace(header[1]!, JSON.stringify(metadata, null, 2))
    }) as typeof readFileSync)
    try {
      expect(componentTitle('drawer')).toBe('Updated Drawer')
      expect(componentIntro('drawer')).toBe('Updated Drawer guidance')
      expect(detail.variants[0]!.description).toBe('Updated Drawer variant')
      expect(componentApiEvents('bottom-sheet').find(row => row.event === 'show.trm.drawer')!.description).toBe('Updated Drawer start explanation')
      expect(documentationNavigation().searchPages.find(page => page.href === '/components/drawer/')!.title).toBe('Updated Drawer')
    } finally { vi.mocked(readFileSync).mockImplementation(delegate as typeof readFileSync) }
  })
})
