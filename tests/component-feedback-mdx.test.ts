import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import original from './fixtures/mdx-migration/component-feedback.before.json' with { type: 'json' }
import api from '../metadata/api.json' with { type: 'json' }
import { authoredComponentNames, componentMdxMetadata, componentNarrative } from '../site/src/libs/component-mdx'
import { componentApi, componentApiEvents, authoredApiComponentNames } from '../site/src/data/component-api'
import { componentDetail, componentExample, componentTitle, componentIntro, documentedComponents } from '../site/src/data/component-reference'
import { selectionDetails, toastDemoJavascript } from '../site/src/data/selection-feedback-docs'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertComponentFeedbackMdx } from './tooling/lib/component-feedback-mdx.mjs'

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) }
})
const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
describe('authored Toast/Scrollspy documentation and Toast alias', () => {
  it('migrates two canonical topics and one existing alias, reaching 22 of 47 routes', () => {
    const policy = assertComponentFeedbackMdx()
    expect(policy.names).toEqual(['scrollspy', 'toast', 'toasts'])
    expect(policy.canonical).toEqual(['scrollspy', 'toast'])
    expect(policy.remaining).toBe(25)
    const later = ['bottom-sheet', 'dialog', 'drawer', 'popover', 'tooltip', 'nav-overflow', 'navbar', 'toggler', 'carousel', 'stepper', 'chips', 'combobox', 'datepicker', 'otp-input', 'range', 'strength', 'chip', 'command-palette', 'data-table', 'divider', 'empty-state', 'forms', 'status', 'table', 'timeline']
    const phaseNames = authoredComponentNames.filter(name => !later.includes(name))
    expect(phaseNames).toHaveLength(22)
    expect(authoredApiComponentNames.filter(name => !later.includes(name))).toEqual(['alert', 'button', 'collapse', 'menu', 'scrollspy', 'tab', 'toast'])
    expect(readdirSync('site/src/content/docs/components').filter(file => !later.includes(file.slice(0, -4))).sort()).toEqual(phaseNames.map(name => name + '.mdx').sort())
    expect(documentedComponents).toHaveLength(47)
    expect(documentationNavigation().guides).toHaveLength(116)
    expect(documentationNavigation().searchPages.filter(page => page.href.startsWith('/components/'))).toHaveLength(47)
  })
  for (const item of original) it(item.name + ' preserves original prose, examples, API data and imports', () => {
    const metadata = componentMdxMetadata(item.name)!
    expect(metadata.title).toBe(item.title)
    expect(metadata.description).toBe(item.description)
    expect(componentTitle(item.name)).toBe(item.title)
    expect(componentIntro(item.name)).toBe(item.lead)
    expect(componentExample(item.name)).toBe(item.example)
    expect(JSON.parse(JSON.stringify(componentDetail(item.name)))).toEqual(item.detail)
    const actual = componentApi(item.implementation)
    expect(actual.definition).toBe(api.components.find(component => component.name === item.implementation))
    expect(actual.definition).toEqual(item.definition)
    expect(actual.commonMethods).toEqual(item.commonMethods)
    expect(actual.moduleImport).toBe(item.moduleImport)
    expect(componentApiEvents(item.implementation)).toEqual(Object.entries(item.events).map(([event, description]) => ({ event, description })))
    if (item.implementation === 'toast') expect(toastDemoJavascript).toBe(item.javascript)
    else expect(actual.javascript).toBe(item.javascript)
  })
  it('shares one authored Toast body and narrative without duplicating an implementation', () => {
    const alias = componentMdxMetadata('toasts')!
    expect(alias.implementation).toBe('toast')
    for (const field of ['lead', 'variants', 'keyboard', 'guidelines', 'events'] as const) expect(alias[field]).toBeUndefined()
    expect(componentDetail('toasts')).toBe(componentDetail('toast'))
    expect(componentNarrative('toasts')).toEqual(componentNarrative('toast'))
    expect(read('site/src/content/docs/components/toasts.mdx')).toContain("import ToastContent from './toast.mdx'")
    expect(read('site/src/content/docs/components/toasts.mdx')).toContain('<ToastContent />')
    expect(api.components.some(component => component.name === 'toasts')).toBe(false)
  })
  it('retains explicit Toast setup and the original application script position', () => {
    const toast = read('site/src/content/docs/components/toast.mdx')
    expect(toast).toContain('Toasts are opt-in')
    expect(toast).toContain('<Code source={toastDemoJavascript} />')
    expect(toast).toContain("{'data-trm-dismiss=\"toast\"'}")
    expect(toast).toContain('There is no automatic show-toggle attribute.')
    expect(toast).not.toContain('<ApiAttributes name="toast" />')
    const before = read('tests/fixtures/mdx-migration/component-page.before-feedback.astro.txt')
    const script = before.match(/\{localName === 'toast' && <script is:inline>[\s\S]*?<\/script>\}/)![0]
    const current = read('site/src/pages/components/[slug].astro')
    expect(current).toContain(script)
    expect(current.indexOf(script)).toBeGreaterThan(current.indexOf('<nav class="docs-pagination"'))
    expect(current).not.toContain('Toasts are opt-in')
  })
  it('preserves Scrollspy token ownership, scanner caveats and listener distinctions', () => {
    const source = read('site/src/content/docs/components/scrollspy.mdx')
    expect(source).toContain('reused Nav presentation, not to a Scrollspy Sass partial or token map')
    expect(source).toContain("{'data-trm-spy=\"scroll\"'}")
    expect(source).toContain('it is not a Scrollspy initialization hook')
    const spyEvents = componentApiEvents('scrollspy')
    expect(spyEvents.filter(row => !row.description.startsWith('Internal namespaced')).map(row => row.event)).toEqual(['activate.trm.scrollspy'])
    expect(spyEvents.filter(row => row.description.startsWith('Internal namespaced'))).toHaveLength(4)
    expect(componentApiEvents('toast').filter(row => row.description.startsWith('Internal namespaced'))).toHaveLength(4)
    expect(read('site/src/pages/components/[slug].astro')).not.toContain('selectionEventDescriptions')
  })
  it('requires authored descriptions for new generated feedback events', () => {
    const definition = componentApi('toast').definition
    definition.events.push('new.trm.toast')
    try { expect(() => componentApiEvents('toast')).toThrow('Missing authored lifecycle description: new.trm.toast') }
    finally { definition.events.pop() }
  })
  it('reads fresh canonical Toast metadata through the alias, existing objects and API tables', () => {
    const delegate = vi.mocked(readFileSync).getMockImplementation()! as unknown as (file: unknown, ...args: unknown[]) => unknown
    const detail = selectionDetails.toast
    vi.mocked(readFileSync).mockImplementation(((file: unknown, ...args: unknown[]) => {
      const result = delegate(file, ...args)
      if (typeof result !== 'string' || !String(file).replaceAll('\\', '/').endsWith('/components/toast.mdx')) return result
      const header = result.match(/^---\n([\s\S]*?)\n---/)!
      const metadata = JSON.parse(header[1]!)
      metadata.lead = 'Updated Toast guidance'
      metadata.variants[0].description = 'Updated Toast variant'
      metadata.events['show.trm.toast'] = 'Updated Toast start explanation'
      return result.replace(header[1]!, JSON.stringify(metadata, null, 2))
    }) as typeof readFileSync)
    try {
      expect(componentIntro('toast')).toBe('Updated Toast guidance')
      expect(componentIntro('toasts')).toBe('Updated Toast guidance')
      expect(detail.variants[0]!.description).toBe('Updated Toast variant')
      expect(componentDetail('toasts')!.variants[0]!.description).toBe('Updated Toast variant')
      expect(componentApiEvents('toast').find(row => row.event === 'show.trm.toast')!.description).toBe('Updated Toast start explanation')
    } finally { vi.mocked(readFileSync).mockImplementation(delegate as typeof readFileSync) }
  })
})
