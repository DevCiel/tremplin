import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import original from './fixtures/mdx-migration/component-actions.before.json' with { type: 'json' }
import api from '../metadata/api.json' with { type: 'json' }
import { authoredComponentNames, componentMdxMetadata } from '../site/src/libs/component-mdx'
import { componentApi, componentApiEvents, authoredApiComponentNames } from '../site/src/data/component-api'
import { componentDetail, componentExample, componentTitle, componentIntro, documentedComponents } from '../site/src/data/component-reference'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertComponentActionsMdx } from './tooling/lib/component-actions-mdx.mjs'

const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
describe('authored action-component MDX with generated API projections', () => {
  it('adds exactly Button and Alert, leaving 38 of 47 component bodies pending', () => {
    const policy = assertComponentActionsMdx()
    expect(policy.names).toEqual(['alert', 'button'])
    expect(policy.remaining).toBe(38)
    expect(authoredApiComponentNames.filter(name => policy.names.includes(name))).toEqual(policy.names)
    const later = ['accordion', 'collapse', 'breadcrumb', 'list-group', 'pagination', 'button-group', 'close-button', 'nav', 'menu', 'tab', 'scrollspy', 'toast', 'toasts', 'bottom-sheet', 'dialog', 'drawer', 'popover', 'tooltip', 'nav-overflow', 'navbar', 'toggler', 'carousel', 'stepper', 'chips', 'combobox', 'datepicker', 'otp-input', 'range', 'strength', 'chip', 'command-palette', 'data-table', 'divider', 'empty-state', 'forms', 'status', 'table', 'timeline']
    const phaseNames = authoredComponentNames.filter(name => !later.includes(name))
    expect(phaseNames).toHaveLength(9)
    expect(readdirSync('site/src/content/docs/components').filter(file => !later.includes(file.slice(0, -4))).sort()).toEqual(phaseNames.map(name => name + '.mdx'))
    expect(documentedComponents).toHaveLength(47)
    expect(documentationNavigation().guides).toHaveLength(116)
    expect(documentationNavigation().searchPages.filter(page => page.href.startsWith('/components/'))).toHaveLength(47)
  })

  for (const item of original) it(item.name + ' retains original narrative, executable examples, API and import samples', () => {
    const metadata = componentMdxMetadata(item.name)!
    expect(metadata.title).toBe(item.title)
    expect(metadata.description).toBe(item.description)
    expect(componentTitle(item.name)).toBe(item.title)
    expect(componentIntro(item.name)).toBe(item.lead)
    expect(componentExample(item.name)).toBe(item.example)
    expect(JSON.parse(JSON.stringify(componentDetail(item.name)))).toEqual(item.detail)
    const generated = componentApi(item.name)
    expect(generated.definition).toEqual(item.definition)
    expect(generated.commonMethods).toEqual(item.commonMethods)
    expect(generated.moduleImport).toBe(item.moduleImport)
    expect(generated.javascript).toBe(item.javascript)
    const source = read('site/src/content/docs/components/' + item.name + '.mdx')
    for (const heading of ['example', 'variants', 'css-variables', 'sass', 'keyboard', 'guidelines', 'classes', 'javascript', 'options', 'methods', 'events', 'data-attributes']) expect(source).toContain(`id="${heading}"`)
    for (const shortcode of ['ApiOptions', 'ApiMethods', 'ApiEvents']) expect(source).toContain(`<${shortcode} name="${item.name}" />`)
    expect(source).toContain(`componentApi("${item.name}").javascript`)
    expect(source).toContain(`componentApi("${item.name}").moduleImport`)
    expect(source).not.toContain('<ComponentGuide')
    // Authored metadata replaces, rather than duplicates, the old TS prose.
    expect(read('site/src/data/component-docs.ts')).not.toContain(item.lead)
    for (const variant of item.detail.variants) expect(read('site/src/data/foundation-component-docs.ts')).not.toContain(variant.description)
  })

  it('keeps lifecycle descriptions authored while projecting only currently generated events', () => {
    expect(componentApiEvents('button')).toEqual([])
    expect(componentApiEvents('alert')).toEqual([
      { event: 'close.trm.alert', description: 'Before removal; cancel this event to keep the alert.' },
      { event: 'closed.trm.alert', description: 'After removal; arrange application focus if needed. This is a notification, not a cancelable state change.' }
    ])
    const definition = componentApi('alert').definition
    definition.events.push('new.trm.alert')
    try { expect(() => componentApiEvents('alert')).toThrow('Missing authored lifecycle description: new.trm.alert') }
    finally { definition.events.pop() }
    expect(read('site/src/pages/components/[slug].astro')).not.toContain('Before removal; cancel this event to keep the alert.')
  })

  it('reads API mutations live rather than freezing options, attributes, methods or common methods in MDX', () => {
    const definition = api.components.find(component => component.name === 'button')!
    const option = { name: 'fixtureOption', type: 'boolean', required: false }
    const method = 'fixtureMethod(): void'
    const attribute = 'data-trm-fixture'
    definition.options.push(option)
    definition.methods.push(method)
    definition.dataAttributes.push(attribute)
    api.commonMethods.push('fixtureCommon()')
    try {
      const current = componentApi('button')
      expect(current.definition).toBe(definition)
      expect(current.definition.options.at(-1)).toEqual(option)
      expect(current.definition.methods.at(-1)).toBe(method)
      expect(current.definition.dataAttributes.at(-1)).toBe(attribute)
      expect(current.commonMethods.at(-1)).toBe('fixtureCommon()')
    } finally {
      definition.options.pop(); definition.methods.pop(); definition.dataAttributes.pop(); api.commonMethods.pop()
    }
  })

  it('fails explicitly for unsupported or missing generated definitions', () => {
    expect(() => componentApi('card')).toThrow('No authored component API adapter: card')
    const index = api.components.findIndex(component => component.name === 'button')
    const [removed] = api.components.splice(index, 1)
    try { expect(() => componentApi('button')).toThrow('Missing generated component API: button') }
    finally { api.components.splice(index, 0, removed!) }
  })

  it('preserves the exact Alert dismiss token and accessible API-table markup', () => {
    const alert = read('site/src/content/docs/components/alert.mdx')
    expect(alert).toContain("{'data-trm-dismiss=\"alert\"'}")
    expect(alert).not.toContain('data-trm-dismiss=\\\\')
    expect(read('site/src/content/docs/components/button.mdx')).toContain('<ApiAttributes name="button" />')
    for (const name of ['ApiOptions', 'ApiEvents']) {
      const source = read('site/src/components/component/' + name + '.astro')
      expect(source).toContain('tabindex="0" role="region"')
      expect(source).toContain('scope="col"')
    }
  })
})
