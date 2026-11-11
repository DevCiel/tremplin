import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import original from './fixtures/mdx-migration/component-choice.before.json' with { type: 'json' }
import api from '../metadata/api.json' with { type: 'json' }
import { authoredComponentNames, componentMdxMetadata } from '../site/src/libs/component-mdx'
import { componentApi, componentApiEvents, authoredApiComponentNames } from '../site/src/data/component-api'
import { componentDetail, componentExample, componentTitle, componentIntro, documentedComponents } from '../site/src/data/component-reference'
import { choiceDetails, choiceEvents, choiceOptionRows, choiceApiJavascript, choiceDemoCss, chipsSubmissionJavascript, choiceComboboxExample } from '../site/src/data/choice-input-docs'
import { strictControlIntros } from '../site/src/data/strict-control-docs'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertComponentChoiceMdx } from './tooling/lib/component-choice-mdx.mjs'

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) }
})
const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')

describe('authored Chips and Combobox documentation', () => {
  it('reaches 34 of 47 routes with sixteen canonical API adapters', () => {
    const policy = assertComponentChoiceMdx()
    expect(policy.names).toEqual(['chips', 'combobox'])
    expect(policy.canonical).toEqual(policy.names)
    expect(policy.remaining).toBe(13)
    const later = ['datepicker', 'otp-input', 'range', 'strength', 'chip', 'command-palette', 'data-table', 'divider', 'empty-state', 'forms', 'status', 'table', 'timeline']
    const phaseNames = authoredComponentNames.filter(name => !later.includes(name))
    expect(phaseNames).toHaveLength(34)
    expect(authoredApiComponentNames.filter(name => !later.includes(name))).toHaveLength(16)
    expect(authoredApiComponentNames.filter(name => !later.includes(name))).toEqual(['alert', 'button', 'carousel', 'chips', 'collapse', 'combobox', 'dialog', 'drawer', 'menu', 'nav-overflow', 'popover', 'scrollspy', 'tab', 'toast', 'toggler', 'tooltip'])
    expect(readdirSync('site/src/content/docs/components').filter(file => !later.includes(file.slice(0, -4))).sort()).toEqual(phaseNames.map(name => name + '.mdx').sort())
    expect(documentedComponents).toHaveLength(47)
    expect(documentationNavigation().guides).toHaveLength(116)
    expect(documentationNavigation().searchPages.filter(page => page.href.startsWith('/components/'))).toHaveLength(47)
  })
  for (const item of original) it(item.name + ' preserves original prose, markup, Sass, options, examples and generated API', () => {
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
    const name = item.name as 'chips' | 'combobox'
    expect(choiceApiJavascript[name]).toBe(item.javascript)
    expect(choiceOptionRows[name]).toEqual(item.sourceOptions)
    expect(choiceDemoCss).toBe(item.demoCss)
    for (const row of componentApiEvents(name)) expect(choiceEvents[row.event]).toBe(row.description)
    const source = read('site/src/content/docs/components/' + name + '.mdx')
    for (const heading of ['example', 'variants', 'css-variables', 'sass', 'keyboard', 'guidelines', 'classes', 'javascript', 'options', 'methods', 'events', 'data-attributes']) expect(source).toContain(`id="${heading}"`)
    expect(source).toContain(`<ChoiceOptions name="${name}" />`)
    expect(source).toContain('<Code source={choiceDemoCss} standalone={true} plain={true} label="Copy choice input accessibility CSS" />')
    expect(source.includes('<Contrast />')).toBe(name === 'chips')
    expect(read('site/src/data/component-docs.ts')).not.toContain(item.lead)
    for (const variant of item.detail.variants) expect(read('site/src/data/choice-input-docs.ts')).not.toContain(variant.description)
    for (const description of Object.values(item.events)) expect(read('site/src/data/choice-input-docs.ts')).not.toContain(description)
  })
  it('preserves the copied and executed Chips submission handler and literal punctuation', () => {
    expect(chipsSubmissionJavascript).toBe(original.find(item => item.name === 'chips')!.applicationJavascript)
    expect(() => new Function(chipsSubmissionJavascript)).not.toThrow()
    expect(chipsSubmissionJavascript).toContain('JSON.stringify(event.values)')
    expect(chipsSubmissionJavascript).not.toMatch(/fetch\(|innerHTML|localStorage|event.detail/)
    const body = read('site/src/content/docs/components/chips.mdx')
    expect(body).toContain('example{"\'"}s hidden JSON')
    expect(body).toContain('<Code source={chipsSubmissionJavascript} standalone={true} plain={true} label="Copy Chips submission handler" />')
    const before = read('tests/fixtures/mdx-migration/component-page.before-choice.astro.txt')
    const script = before.match(/\{localName === 'chips' && <script is:inline set:html=\{chipsSubmissionJavascript\}><\/script>\}/)![0]
    const current = read('site/src/pages/components/[slug].astro')
    expect(current).toContain(script)
    expect(current.indexOf(script)).toBeGreaterThan(current.indexOf('<nav class="docs-pagination"'))
    expect(strictControlIntros.chips).toBe(componentIntro('chips'))
  })
  it('keeps source-verified options, sanitization and Menu timing rather than inventing widget APIs', () => {
    expect(read('site/src/components/component/ChoiceOptions.astro')).toContain('choiceOptionRows[Astro.props.name]')
    expect(choiceOptionRows.chips.find(row => row.name === 'dismissIcon')!.description).toContain('sanitizer/Trusted Types')
    expect(choiceDetails.chips.guidelines.join(' ')).toContain('bypassing per-chip remove cancellation')
    expect(choiceDetails.combobox.guidelines.join(' ')).toContain('no getValue/setValue API')
    expect(choiceEvents['shown.trm.combobox']).toContain('Not proof a canceled Menu opened')
    expect(choiceEvents['change.trm.combobox']).toContain('preventing this event does not undo selection')
    expect(choiceDetails.combobox.variables).toEqual([])
    const doc = new DOMParser().parseFromString(choiceComboboxExample('safe', '<label>', [{ value: '"><img src=x>', label: '<script>x</script>', description: '<b>details</b>', group: '<svg/onload=x>' }]), 'text/html')
    expect(doc.querySelector('script, img, b')).toBeNull()
    expect(doc.querySelector('[data-trm-value]')!.getAttribute('data-trm-value')).toBe('"><img src=x>')
    expect(doc.querySelector('.menu-item-description')!.textContent).toBe('<b>details</b>')
  })
  for (const name of ['chips', 'combobox']) it(name + ' rejects future events until authored prose exists', () => {
    const definition = componentApi(name).definition
    definition.events.push('new.trm.' + name)
    try { expect(() => componentApiEvents(name)).toThrow('Missing authored lifecycle description: new.trm.' + name) }
    finally { definition.events.pop() }
  })
  for (const name of ['chips', 'combobox'] as const) it(name + ' reads fresh narrative, navigation and API event explanations', () => {
    const delegate = vi.mocked(readFileSync).getMockImplementation()! as unknown as (file: unknown, ...args: unknown[]) => unknown
    const detail = choiceDetails[name]
    vi.mocked(readFileSync).mockImplementation(((file: unknown, ...args: unknown[]) => {
      const result = delegate(file, ...args)
      if (typeof result !== 'string' || !String(file).replaceAll('\\', '/').endsWith('/components/' + name + '.mdx')) return result
      const header = result.match(/^---\n([\s\S]*?)\n---/)!, metadata = JSON.parse(header[1]!)
      metadata.title = 'Updated ' + name
      metadata.lead = 'Updated selection guidance'
      metadata.variants[0].description = 'Updated variant explanation'
      for (const event of Object.keys(metadata.events)) metadata.events[event] = 'Updated event explanation'
      return result.replace(header[1]!, JSON.stringify(metadata, null, 2))
    }) as typeof readFileSync)
    try {
      expect(componentTitle(name)).toBe('Updated ' + name)
      expect(componentIntro(name)).toBe('Updated selection guidance')
      expect(detail.variants[0]!.description).toBe('Updated variant explanation')
      expect(documentationNavigation().searchPages.find(page => page.href === '/components/' + name + '/')!.title).toBe('Updated ' + name)
      for (const row of componentApiEvents(name)) {
        expect(row.description).toBe('Updated event explanation')
        expect(choiceEvents[row.event]).toBe(row.description)
      }
      if (name === 'chips') expect(strictControlIntros[name]).toBe('Updated selection guidance')
    } finally { vi.mocked(readFileSync).mockImplementation(delegate as typeof readFileSync) }
  })
})
