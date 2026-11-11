import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import original from './fixtures/mdx-migration/component-completion.before.json' with { type: 'json' }
import api from '../metadata/api.json' with { type: 'json' }
import { authoredComponentNames, componentMdxMetadata } from '../site/src/libs/component-mdx'
import { componentApi, componentApiEvents, authoredApiComponentNames, authoredExtensionApiComponentNames } from '../site/src/data/component-api'
import { componentDetail, componentExample, componentTitle, componentIntro, documentedComponents } from '../site/src/data/component-reference'
import { standaloneChipJavascript, tableDemoIsolationCss } from '../site/src/data/chip-table-docs'
import { localPatternJavascript } from '../site/src/data/local-pattern-docs'
import { formsDemoCss, formsDemoJavascript } from '../site/src/data/forms-overview-docs'
import { paletteDemoCss, paletteDemoJavascript, paletteApiJavascript, paletteOptionRows, paletteEvents } from '../site/src/data/sheet-command-docs'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertComponentCompletionMdx } from './tooling/lib/component-completion-mdx.mjs'

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) }
})
const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')

describe('complete authored component documentation', () => {
  it('authors all 47 routes while retaining twenty core APIs and one optional extension', () => {
    const policy = assertComponentCompletionMdx()
    expect(policy.names).toEqual(['chip','command-palette','data-table','divider','empty-state','forms','status','table','timeline'])
    expect(policy.remaining).toBe(0)
    expect(policy.canonical).toEqual([])
    expect(policy.extensions).toEqual(['command-palette'])
    expect(authoredComponentNames).toHaveLength(47)
    expect([...authoredComponentNames].sort()).toEqual(documentedComponents.map(component => component.name).sort())
    expect(authoredApiComponentNames).toHaveLength(20)
    expect(authoredExtensionApiComponentNames).toEqual(['command-palette'])
    expect(readdirSync('site/src/content/docs/components').sort()).toEqual(authoredComponentNames.map(name => name + '.mdx').sort())
    expect(documentationNavigation().guides).toHaveLength(116)
    expect(documentationNavigation().searchPages.filter(page => page.href.startsWith('/components/'))).toHaveLength(47)
    expect(read('site/src/pages/components/[slug].astro')).toContain('<Content />')
    expect(read('site/src/pages/components/[slug].astro')).toContain("throw new Error('Missing authored component document:")
    expect(read('site/src/pages/components/[slug].astro')).not.toContain('Content ?')
    expect(read('site/src/pages/components/[slug].astro')).not.toContain('detail.variants.map')
  })
  for (const item of original) it(item.name + ' preserves original prose, examples, tokens, Sass and behavior disclosures', () => {
    expect(componentMdxMetadata(item.name)!.title).toBe(item.title)
    expect(componentMdxMetadata(item.name)!.description).toBe(item.description)
    expect(componentTitle(item.name)).toBe(item.title)
    expect(componentIntro(item.name)).toBe(item.lead)
    expect(componentExample(item.name)).toBe(item.example)
    expect(JSON.parse(JSON.stringify(componentDetail(item.name)))).toEqual(item.detail)
    const source = read('site/src/content/docs/components/' + item.name + '.mdx')
    for (const heading of ['example','variants','css-variables','sass','keyboard','guidelines','classes','javascript']) expect(source).toContain(`id="${heading}"`)
    expect(read('site/src/data/component-docs.ts')).not.toContain(item.lead)
    expect(source.includes('<Contrast />')).toBe(['chip','table'].includes(item.name))
    if (item.definition) {
      const actual = componentApi(item.name)
      expect(actual.definition).toBe(api.components.find(component => component.name === item.name))
      expect(actual.definition).toEqual(item.definition)
      expect(actual.commonMethods).toEqual(item.commonMethods)
      expect(actual.moduleImport).toBe(item.moduleImport)
      expect(actual.javascript).toBe(item.javascript)
      expect(paletteApiJavascript).toBe(item.javascript)
      expect(paletteOptionRows).toEqual(item.sourceOptions)
      expect(componentApiEvents(item.name)).toEqual(Object.entries(item.events!).map(([event,description]) => ({ event,description })))
      expect(source).toContain('<PaletteOptions />')
    } else {
      expect(() => componentApi(item.name)).toThrow('No authored component API adapter: ' + item.name)
      expect(source).toContain(item.javascriptBehavior!)
    }
  })
  it('retains application scripts byte-for-byte and after pagination, without adding network or persistence', () => {
    const before = read('tests/fixtures/mdx-migration/component-page.before-completion.astro.txt')
    const current = read('site/src/pages/components/[slug].astro')
    const footer = before.slice(before.indexOf('  <nav class="docs-pagination"'))
    expect(current.slice(current.indexOf('  <nav class="docs-pagination"'))).toBe(footer)
    for (const item of original.filter(item => item.applicationJavascript)) {
      const actual = item.name === 'chip' ? standaloneChipJavascript : item.name === 'forms' ? formsDemoJavascript : item.name === 'command-palette' ? paletteDemoJavascript : localPatternJavascript[item.name as keyof typeof localPatternJavascript]
      expect(actual).toBe(item.applicationJavascript)
      expect(actual).not.toMatch(/fetch\(|XMLHttpRequest|localStorage|innerHTML/)
      const source = read('site/src/content/docs/components/' + item.name + '.mdx')
      expect(source).toContain('plain={true}')
      expect(source).toContain('application')
    }
    expect(formsDemoCss).toBe(original.find(item => item.name === 'forms')!.demoCss)
    expect(paletteDemoCss).toBe(original.find(item => item.name === 'command-palette')!.demoCss)
  })
  it('preserves table isolation through an Astro shortcode and live responsive generators', () => {
    for (const item of original.filter(item => item.isolationCss)) {
      expect(tableDemoIsolationCss).toBe(item.isolationCss)
      expect(read('site/src/content/docs/components/' + item.name + '.mdx')).toContain('<Style source={tableDemoIsolationCss} />')
    }
    expect(read('site/src/components/component/Style.astro')).toContain('<style is:inline set:html={source}></style>')
    expect(read('site/src/data/chip-table-docs.ts')).toContain("...['sm', 'md', 'lg', 'xl', '2xl'].map")
    expect(componentDetail('table')!.variants.filter(variant => /^(sm|md|lg|xl|2xl):table-responsive$/.test(variant.title))).toHaveLength(5)
  })
  it('keeps optional pattern CSS/import disclosures distinct from core styling', () => {
    for (const name of ['status','timeline','divider','empty-state','data-table']) {
      const source = read('site/src/content/docs/components/' + name + '.mdx')
      expect(source).toContain('Optional local extension.')
      expect(source).toContain('Copy optional extension CSS imports')
      expect(source).toContain('tremplin/css/extensions')
    }
    expect(read('site/src/content/docs/components/command-palette.mdx')).toContain('Optional local JS and CSS extension.')
    expect(read('site/src/components/component/PaletteOptions.astro')).toContain('paletteOptionRows.map')
    expect(componentApiEvents('command-palette').find(row => row.event.startsWith('select.'))!.description).toContain('detail = { command, value }')
    for (const row of componentApiEvents('command-palette')) expect(paletteEvents[row.event]).toBe(row.description)
  })
  it('requires authored explanations for new extension events', () => {
    const definition = componentApi('command-palette').definition
    definition.events.push('new.trm.command-palette')
    try { expect(() => componentApiEvents('command-palette')).toThrow('Missing authored lifecycle description: new.trm.command-palette') }
    finally { definition.events.pop() }
  })
  for (const item of original) it(item.name + ' reads fresh authored metadata into details and search', () => {
    const name = item.name, detail = componentDetail(name)!
    const delegate = vi.mocked(readFileSync).getMockImplementation()! as unknown as (file: unknown,...args: unknown[]) => unknown
    vi.mocked(readFileSync).mockImplementation(((file: unknown,...args: unknown[]) => {
      const result = delegate(file,...args)
      if (typeof result !== 'string' || !String(file).replaceAll('\\','/').endsWith('/components/' + name + '.mdx')) return result
      const header = result.match(/^---\n([\s\S]*?)\n---/)!, metadata = JSON.parse(header[1]!)
      metadata.title = 'Updated ' + name
      metadata.lead = 'Updated application boundary guidance'
      metadata.variants[0].description = 'Updated variant explanation'
      if (metadata.events) for (const event of Object.keys(metadata.events)) metadata.events[event] = 'Updated event explanation'
      return result.replace(header[1]!,JSON.stringify(metadata,null,2))
    }) as typeof readFileSync)
    try {
      expect(componentTitle(name)).toBe('Updated ' + name)
      expect(componentIntro(name)).toBe('Updated application boundary guidance')
      // Contrast wrappers project details at each read; unwrapped details are live getters.
      expect(componentDetail(name)!.variants[0]!.description).toBe('Updated variant explanation')
      if (!['chip','table'].includes(name)) expect(detail.variants[0]!.description).toBe('Updated variant explanation')
      expect(documentationNavigation().searchPages.find(page => page.href === '/components/' + name + '/')!.title).toBe('Updated ' + name)
      if (name === 'command-palette') for (const row of componentApiEvents(name)) {
        expect(row.description).toBe('Updated event explanation')
        expect(paletteEvents[row.event]).toBe(row.description)
      }
    } finally { vi.mocked(readFileSync).mockImplementation(delegate as typeof readFileSync) }
  })
})
