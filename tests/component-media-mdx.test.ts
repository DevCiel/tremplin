import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import original from './fixtures/mdx-migration/component-media.before.json' with { type: 'json' }
import api from '../metadata/api.json' with { type: 'json' }
import { authoredComponentNames, componentMdxMetadata } from '../site/src/libs/component-mdx'
import { componentApi, componentApiEvents, authoredApiComponentNames } from '../site/src/data/component-api'
import { componentDetail, componentExample, componentTitle, componentIntro, documentedComponents } from '../site/src/data/component-reference'
import { carouselDetails, stepperDetails } from '../site/src/data/progress-media-docs'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertComponentMediaMdx } from './tooling/lib/component-media-mdx.mjs'

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) }
})
const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')

describe('authored Carousel and Stepper documentation', () => {
  it('reaches 32 of 47 routes, adding Carousel API support without a Stepper plugin', () => {
    const policy = assertComponentMediaMdx()
    expect(policy.names).toEqual(['carousel', 'stepper'])
    expect(policy.canonical).toEqual(['carousel'])
    expect(policy.remaining).toBe(15)
    const later = ['chips', 'combobox', 'datepicker', 'otp-input', 'range', 'strength', 'chip', 'command-palette', 'data-table', 'divider', 'empty-state', 'forms', 'status', 'table', 'timeline']
    const phaseNames = authoredComponentNames.filter(name => !later.includes(name))
    expect(phaseNames).toHaveLength(32)
    expect(authoredApiComponentNames.filter(name => !later.includes(name))).toHaveLength(14)
    expect(authoredApiComponentNames).toContain('carousel')
    expect(readdirSync('site/src/content/docs/components').filter(file => !later.includes(file.slice(0, -4))).sort()).toEqual(phaseNames.map(name => name + '.mdx').sort())
    expect(documentedComponents).toHaveLength(47)
    expect(documentationNavigation().guides).toHaveLength(116)
    expect(documentationNavigation().searchPages.filter(page => page.href.startsWith('/components/'))).toHaveLength(47)
    expect(() => componentApi('stepper')).toThrow('No authored component API adapter: stepper')
    expect(api.components.some(component => component.name === 'stepper')).toBe(false)
  })
  for (const item of original) it(item.name + ' preserves original prose, markup, evaluated tokens and Sass examples', () => {
    expect(componentMdxMetadata(item.name)!.title).toBe(item.title)
    expect(componentMdxMetadata(item.name)!.description).toBe(item.description)
    expect(componentTitle(item.name)).toBe(item.title)
    expect(componentIntro(item.name)).toBe(item.lead)
    expect(componentExample(item.name)).toBe(item.example)
    expect(JSON.parse(JSON.stringify(componentDetail(item.name)))).toEqual(item.detail)
    const source = read('site/src/content/docs/components/' + item.name + '.mdx')
    for (const heading of ['example', 'variants', 'css-variables', 'sass', 'keyboard', 'guidelines', 'classes', 'javascript']) expect(source).toContain(`id="${heading}"`)
    expect(source).not.toContain('<Contrast')
    expect(read('site/src/data/component-docs.ts')).not.toContain(item.lead)
    for (const variant of item.detail.variants) expect(read('site/src/data/progress-media-docs.ts')).not.toContain(variant.description)
    if (item.definition) {
      const actual = componentApi(item.name)
      expect(actual.definition).toBe(api.components.find(component => component.name === item.name))
      expect(actual.definition).toEqual(item.definition)
      expect(actual.commonMethods).toEqual(item.commonMethods)
      expect(actual.moduleImport).toBe(item.moduleImport)
      expect(actual.javascript).toBe(item.javascript)
      expect(componentApiEvents(item.name)).toEqual(Object.entries(item.events!).map(([event, description]) => ({ event, description })))
      for (const heading of ['options', 'methods', 'events', 'data-attributes']) expect(source).toContain(`id="${heading}"`)
    }
  })
  it('retains native Stepper semantics, deliberate contrast composition and application-owned transitions', () => {
    const doc = new DOMParser().parseFromString(componentExample('stepper')!, 'text/html')
    expect(doc.querySelectorAll('ol.stepper > li.stepper-item')).toHaveLength(3)
    expect(doc.querySelectorAll('.stepper-item.active')).toHaveLength(2)
    expect(doc.querySelectorAll('[aria-current="step"]')).toHaveLength(1)
    expect(doc.querySelector('a, button, [data-trm-toggle], [role="tablist"]')).toBeNull()
    expect(stepperDetails.guidelines.join(' ')).toContain('not a multi-step form controller')
    expect(stepperDetails.variants.some(variant => variant.markup.includes('contains-inline') && variant.markup.includes('sm:stepper-horizontal'))).toBe(true)
    expect(stepperDetails.variants.some(variant => variant.markup.includes('stepper-overflow'))).toBe(true)
    expect(read('site/src/content/docs/components/stepper.mdx')).toContain('This is a CSS component and does not require Tremplin JavaScript.')
  })
  it('retains paused motion, native named Carousel controls and lazy initialization guidance', () => {
    for (const markup of [componentExample('carousel')!, ...carouselDetails.variants.map(variant => variant.markup)]) {
      const doc = new DOMParser().parseFromString(markup, 'text/html')
      expect(doc.querySelector('[data-trm-autoplay="true"]')).toBeNull()
      for (const button of doc.querySelectorAll('button[data-trm-target]')) {
        expect(button.getAttribute('type')).toBe('button')
        expect(doc.querySelector(button.getAttribute('data-trm-target')!)!.contains(button)).toBe(true)
        expect(button.getAttribute('aria-label') || button.textContent!.trim()).toBeTruthy()
      }
    }
    expect(carouselDetails.guidelines.join(' ')).toContain('control click')
    expect(carouselDetails.guidelines.join(' ')).toContain('Carousel.getOrCreateInstance')
    expect(carouselDetails.guidelines.join(' ')).toContain('visible pause control')
    // Preserve the existing scanner inventory and conservative explanations;
    // this migration does not reclassify listener keys as new dispatched events.
    expect(componentApi('carousel').definition.events).toContain('keydown.trm.carousel')
    expect(componentApiEvents('carousel').map(row => row.description)).toEqual(Object.values(original.find(item => item.name === 'carousel')!.events!))
  })
  it('rejects new Carousel events until explanatory prose is authored', () => {
    const definition = componentApi('carousel').definition
    definition.events.push('new.trm.carousel')
    try { expect(() => componentApiEvents('carousel')).toThrow('Missing authored lifecycle description: new.trm.carousel') }
    finally { definition.events.pop() }
  })
  for (const name of ['carousel', 'stepper']) it(name + ' reads fresh metadata into details and navigation', () => {
    const delegate = vi.mocked(readFileSync).getMockImplementation()! as unknown as (file: unknown, ...args: unknown[]) => unknown
    const detail = name === 'carousel' ? carouselDetails : stepperDetails
    vi.mocked(readFileSync).mockImplementation(((file: unknown, ...args: unknown[]) => {
      const result = delegate(file, ...args)
      if (typeof result !== 'string' || !String(file).replaceAll('\\', '/').endsWith('/components/' + name + '.mdx')) return result
      const header = result.match(/^---\n([\s\S]*?)\n---/)!, metadata = JSON.parse(header[1]!)
      metadata.title = 'Updated ' + name
      metadata.lead = 'Updated media and progress guidance'
      metadata.variants[0].description = 'Updated variant explanation'
      if (metadata.events) for (const event of Object.keys(metadata.events)) metadata.events[event] = 'Updated event explanation'
      return result.replace(header[1]!, JSON.stringify(metadata, null, 2))
    }) as typeof readFileSync)
    try {
      expect(componentTitle(name)).toBe('Updated ' + name)
      expect(componentIntro(name)).toBe('Updated media and progress guidance')
      expect(detail.variants[0]!.description).toBe('Updated variant explanation')
      expect(documentationNavigation().searchPages.find(page => page.href === '/components/' + name + '/')!.title).toBe('Updated ' + name)
      if (name === 'carousel') for (const row of componentApiEvents(name)) expect(row.description).toBe('Updated event explanation')
    } finally { vi.mocked(readFileSync).mockImplementation(delegate as typeof readFileSync) }
  })
})
