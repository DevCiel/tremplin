import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import original from './fixtures/mdx-migration/component-advanced.before.json' with { type: 'json' }
import api from '../metadata/api.json' with { type: 'json' }
import { authoredComponentNames, componentMdxMetadata } from '../site/src/libs/component-mdx'
import { componentApi, componentApiEvents, authoredApiComponentNames } from '../site/src/data/component-api'
import { componentDetail, componentExample, componentTitle, componentIntro, documentedComponents } from '../site/src/data/component-reference'
import { advancedDetails, advancedEvents, advancedRuntimeEvent, advancedOptionRows, advancedApiJavascript, advancedDemoCss, advancedDemoJavascript, type AdvancedTopic } from '../site/src/data/advanced-input-docs'
import { strictControlIntros } from '../site/src/data/strict-control-docs'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertComponentAdvancedMdx } from './tooling/lib/component-advanced-mdx.mjs'

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) }
})
const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')

describe('authored advanced input documentation', () => {
  it('reaches 38 of 47 routes and covers all twenty core plugin API adapters', () => {
    const policy = assertComponentAdvancedMdx()
    expect(policy.names).toEqual(['datepicker', 'otp-input', 'range', 'strength'])
    expect(policy.canonical).toEqual(policy.names)
    expect(policy.remaining).toBe(9)
    const later = ['chip', 'command-palette', 'data-table', 'divider', 'empty-state', 'forms', 'status', 'table', 'timeline']
    const phaseNames = authoredComponentNames.filter(name => !later.includes(name))
    expect(phaseNames).toHaveLength(38)
    expect(authoredApiComponentNames).toHaveLength(20)
    expect([...authoredApiComponentNames].sort()).toEqual(api.components.filter(component => component.name !== 'command-palette').map(component => component.name).sort())
    expect(readdirSync('site/src/content/docs/components').filter(file => !later.includes(file.slice(0, -4))).sort()).toEqual(phaseNames.map(name => name + '.mdx').sort())
    expect(documentedComponents).toHaveLength(47)
    expect(documentationNavigation().guides).toHaveLength(116)
    expect(documentationNavigation().searchPages.filter(page => page.href.startsWith('/components/'))).toHaveLength(47)
  })
  for (const item of original) it(item.name + ' preserves original narrative, samples, evaluated tokens, options and API data', () => {
    expect(componentMdxMetadata(item.name)!.title).toBe(item.title)
    expect(componentMdxMetadata(item.name)!.description).toBe(item.description)
    expect(componentTitle(item.name)).toBe(item.title)
    expect(componentIntro(item.name)).toBe(item.lead)
    expect(componentExample(item.name)).toBe(item.example)
    expect(JSON.parse(JSON.stringify(componentDetail(item.name)))).toEqual(item.detail)
    const actual = componentApi(item.name), name = item.name as AdvancedTopic
    expect(actual.definition).toBe(api.components.find(component => component.name === name))
    expect(actual.definition).toEqual(item.definition)
    expect(actual.commonMethods).toEqual(item.commonMethods)
    expect(actual.moduleImport).toBe(item.moduleImport)
    expect(actual.javascript).toBe(item.javascript)
    expect(componentApiEvents(name)).toEqual(Object.entries(item.events).map(([event, description]) => ({ event, description })))
    expect(advancedApiJavascript[name]).toBe(item.javascript)
    expect(advancedOptionRows[name]).toEqual(item.sourceOptions)
    expect(strictControlIntros[name]).toBe(item.lead)
    for (const row of componentApiEvents(name)) expect(advancedEvents[row.event]).toBe(row.description)
    const source = read('site/src/content/docs/components/' + name + '.mdx')
    for (const heading of ['example', 'variants', 'css-variables', 'sass', 'keyboard', 'guidelines', 'classes', 'javascript', 'options', 'methods', 'events', 'data-attributes']) expect(source).toContain(`id="${heading}"`)
    expect(source).toContain(`<AdvancedOptions name="${name}" />`)
    expect(source.includes('<Contrast />')).toBe(name === 'datepicker')
    expect(source.includes('id="demo-setup"')).toBe(name !== 'otp-input')
    expect(read('site/src/data/component-docs.ts')).not.toContain(item.lead)
    expect(read('site/src/data/strict-control-docs.ts')).not.toContain(item.lead)
    for (const variant of item.detail.variants) expect(read('site/src/data/advanced-input-docs.ts')).not.toContain(variant.description)
    for (const description of Object.values(item.events)) expect(read('site/src/data/advanced-input-docs.ts')).not.toContain(description)
  })
  it('retains copied/executed setup, module remapping and calendar CSS without changing script order', () => {
    const before = read('tests/fixtures/mdx-migration/component-page.before-advanced.astro.txt')
    const script = before.split('\n').find(line => line.includes('type="module" set:html={advancedDemoJavascript.replaceAll('))!
    const current = read('site/src/pages/components/[slug].astro')
    expect(current).toContain(script)
    expect(current.indexOf(script)).toBeGreaterThan(current.indexOf('<nav class="docs-pagination"'))
    for (const item of original.filter(item => item.name !== 'otp-input')) {
      expect(advancedDemoJavascript).toBe(item.applicationJavascript)
      expect(read('site/src/content/docs/components/' + item.name + '.mdx')).toContain('<Code source={advancedDemoJavascript} standalone={true} plain={true} label="Copy advanced input demo setup" />')
    }
    expect(advancedDemoCss).toBe(original.find(item => item.name === 'datepicker')!.demoCss)
    expect(read('site/src/content/docs/components/datepicker.mdx')).toContain('<Code source={advancedDemoCss} standalone={true} plain={true} label="Copy calendar demo layout CSS" />')
    expect(advancedDemoJavascript).toContain('Range.getInstance(wrapper)?.dispose()')
    expect(advancedDemoJavascript).not.toMatch(/fetch\(|XMLHttpRequest|console\.|localStorage|innerHTML|submit\(/)
  })
  it('retains runtime casing, internal listener classifications and sensitive-event boundaries', () => {
    const otp = componentApi('otp-input').definition
    expect(otp.events).toContain('complete.trm.otp-input')
    expect(componentApiEvents('otp-input').map(row => row.event)).toEqual(otp.events.map(advancedRuntimeEvent))
    expect(advancedEvents['complete.trm.otpInput']).toContain('never log it')
    expect(advancedEvents['input.trm.otpInput']).toContain('setValue and clear do not emit')
    expect(advancedEvents['strengthChange.trm.strength']).toContain('redacted password')
    for (const event of ['click', 'focusin', 'pointerdown']) expect(advancedEvents[event + '.trm.datepicker']).toContain('not a dispatched Datepicker lifecycle event')
    expect(read('site/src/content/docs/components/datepicker.mdx')).toContain('Catalog click/focusin/pointerdown entries are internal listeners')
    expect(read('site/src/content/docs/components/otp-input.mdx')).toContain('<code>{".trm.otpInput"}</code>')
  })
  it('keeps native fields, decorative feedback, source-verified options and calendar security requirements', () => {
    expect(read('site/src/components/component/AdvancedOptions.astro')).toContain('advancedOptionRows[Astro.props.name]')
    const otp = new DOMParser().parseFromString(componentExample('otp-input')!, 'text/html')
    expect(otp.querySelectorAll('[data-trm-otp] input')).toHaveLength(1)
    expect(otp.querySelector('input')!.getAttribute('name')).toBe('code')
    const range = new DOMParser().parseFromString(componentExample('range')!, 'text/html')
    expect(range.querySelector('input[type="range"]')!.getAttribute('name')).toBe('volume')
    const strength = new DOMParser().parseFromString(componentExample('strength')!, 'text/html')
    expect(strength.querySelector('[data-trm-strength]')!.getAttribute('aria-hidden')).toBe('true')
    expect(strength.querySelector('[role="meter"], [role="progressbar"]')).toBeNull()
    expect(advancedDetails.datepicker.guidelines.join(' ')).toContain('Never weaken Trusted Types/CSP')
    expect(advancedDetails.datepicker.guidelines.join(' ')).toContain('same-origin dist/icons/datepicker-chevron.svg')
    expect(advancedDetails.strength.guidelines.join(' ')).toContain('NaN')
  })
  for (const name of ['datepicker', 'otp-input', 'range', 'strength']) it(name + ' rejects future events until authored prose exists', () => {
    const definition = componentApi(name).definition
    definition.events.push('new.trm.' + name)
    try { expect(() => componentApiEvents(name)).toThrow('Missing authored lifecycle description: ' + advancedRuntimeEvent('new.trm.' + name)) }
    finally { definition.events.pop() }
  })
  for (const name of ['datepicker', 'otp-input', 'range', 'strength'] as const) it(name + ' reads fresh narrative, navigation and event prose', () => {
    const delegate = vi.mocked(readFileSync).getMockImplementation()! as unknown as (file: unknown, ...args: unknown[]) => unknown
    const detail = advancedDetails[name]
    vi.mocked(readFileSync).mockImplementation(((file: unknown, ...args: unknown[]) => {
      const result = delegate(file, ...args)
      if (typeof result !== 'string' || !String(file).replaceAll('\\', '/').endsWith('/components/' + name + '.mdx')) return result
      const header = result.match(/^---\n([\s\S]*?)\n---/)!, metadata = JSON.parse(header[1]!)
      metadata.title = 'Updated ' + name
      metadata.lead = 'Updated enhanced input guidance'
      metadata.variants[0].description = 'Updated variant explanation'
      for (const event of Object.keys(metadata.events)) metadata.events[event] = 'Updated event explanation'
      return result.replace(header[1]!, JSON.stringify(metadata, null, 2))
    }) as typeof readFileSync)
    try {
      expect(componentTitle(name)).toBe('Updated ' + name)
      expect(componentIntro(name)).toBe('Updated enhanced input guidance')
      expect(strictControlIntros[name]).toBe('Updated enhanced input guidance')
      expect(detail.variants[0]!.description).toBe('Updated variant explanation')
      expect(documentationNavigation().searchPages.find(page => page.href === '/components/' + name + '/')!.title).toBe('Updated ' + name)
      for (const row of componentApiEvents(name)) {
        expect(row.description).toBe('Updated event explanation')
        expect(advancedEvents[row.event]).toBe(row.description)
      }
    } finally { vi.mocked(readFileSync).mockImplementation(delegate as typeof readFileSync) }
  })
})
