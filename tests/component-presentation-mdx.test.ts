import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import original from './fixtures/mdx-migration/component-presentation.before.json' with { type: 'json' }
import api from '../metadata/api.json' with { type: 'json' }
import { authoredComponentNames, componentMdxMetadata, componentNarrative } from '../site/src/libs/component-mdx'
import { componentDetail, componentExample, componentTitle, componentIntro, documentedComponents, implementationName } from '../site/src/data/component-reference'
import { foundationDetails } from '../site/src/data/foundation-component-docs'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertComponentPresentationMdx } from './tooling/lib/component-presentation-mdx.mjs'

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) }
})
const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')

describe('authored presentation-component MDX', () => {
  it('migrates exactly seven of 47 component routes without changing the guide registry', () => {
    const names = original.map(item => item.name)
    expect(assertComponentPresentationMdx().names).toEqual(names)
    expect(authoredComponentNames.filter(name => names.includes(name))).toEqual(names)
    expect(readdirSync('site/src/content/docs/components').filter(file => names.includes(file.slice(0, -4))).sort()).toEqual(names.map(name => name + '.mdx'))
    expect(documentedComponents).toHaveLength(47)
    expect(documentationNavigation().guides).toHaveLength(116)
    expect(documentationNavigation().searchPages.filter(page => page.href.startsWith('/components/'))).toHaveLength(47)
    expect(componentMdxMetadata('../outside')).toBeUndefined()
    expect(componentMdxMetadata('not-an-authored-component')).toBeUndefined()
    expect(read('site/src/pages/[...guide].astro')).toContain("!document.id.startsWith('components/')")
  })

  for (const item of original) it(item.name + ' preserves prose, examples, live technical data and CSS-only behavior', () => {
    const metadata = componentMdxMetadata(item.name)!
    expect(metadata.title).toBe(item.title)
    expect(metadata.description).toBe(item.description)
    expect(componentTitle(item.name)).toBe(item.title)
    expect(componentIntro(item.name)).toBe(item.lead)
    expect(componentExample(item.name)).toBe(item.example)
    expect(JSON.parse(JSON.stringify(componentDetail(item.name)))).toEqual(item.detail)
    expect(api.components.some(component => component.name === implementationName(item.name))).toBe(false)
    const source = read('site/src/content/docs/components/' + item.name + '.mdx')
    for (const heading of ['example','variants','css-variables','sass','keyboard','guidelines','classes','javascript']) expect(source).toContain(`id="${heading}"`)
    expect(source).toContain('componentDetail(')
    expect(source).toContain('componentExample(')
    expect(source).not.toContain('<ComponentGuide')
    expect(source).not.toContain('data-trm-otp')
  })

  it('keeps the Placeholder route but shares one authored Skeleton narrative and implementation', () => {
    const alias = componentMdxMetadata('placeholder')!
    expect(alias.implementation).toBe('skeleton')
    expect(alias.variants).toBeUndefined()
    expect(alias.keyboard).toBeUndefined()
    expect(alias.guidelines).toBeUndefined()
    expect(componentDetail('placeholder')).toBe(componentDetail('skeleton'))
    expect(componentNarrative('placeholder')).toEqual(componentNarrative('skeleton'))
  })

  it('reads current authored metadata through existing detail objects, titles, sidebar and search', () => {
    const delegate = vi.mocked(readFileSync).getMockImplementation()! as unknown as (file: unknown, ...args: unknown[]) => unknown
    const detail = foundationDetails.card
    vi.mocked(readFileSync).mockImplementation(((file: unknown, ...args: unknown[]) => {
      const result = delegate(file, ...args)
      if (typeof result !== 'string' || !String(file).replaceAll('\\', '/').endsWith('/components/card.mdx')) return result
      const header = result.match(/^---\n([\s\S]*?)\n---/)!
      const metadata = JSON.parse(header[1]!)
      metadata.title = 'Updated Card'
      metadata.lead = 'Updated authored lead'
      metadata.variants[0].description = 'Updated variant guidance'
      metadata.guidelines[0] = 'Updated usage guidance'
      return result.replace(header[1]!, JSON.stringify(metadata, null, 2))
    }) as typeof readFileSync)
    try {
      expect(componentTitle('card')).toBe('Updated Card')
      expect(componentIntro('card')).toBe('Updated authored lead')
      expect(detail.variants[0]!.description).toBe('Updated variant guidance')
      expect(detail.guidelines[0]).toBe('Updated usage guidance')
      expect(documentationNavigation().searchPages.find(page => page.href === '/components/card/')!.title).toBe('Updated Card')
    } finally { vi.mocked(readFileSync).mockImplementation(delegate as typeof readFileSync) }
  })

  it('rejects narrative/sample count mismatches rather than silently losing variants', () => {
    const delegate = vi.mocked(readFileSync).getMockImplementation()! as unknown as (file: unknown, ...args: unknown[]) => unknown
    vi.mocked(readFileSync).mockImplementation(((file: unknown, ...args: unknown[]) => {
      const result = delegate(file, ...args)
      if (typeof result !== 'string' || !String(file).replaceAll('\\', '/').endsWith('/components/card.mdx')) return result
      const header = result.match(/^---\n([\s\S]*?)\n---/)!
      const metadata = JSON.parse(header[1]!)
      metadata.variants.pop()
      return result.replace(header[1]!, JSON.stringify(metadata, null, 2))
    }) as typeof readFileSync)
    try { expect(() => foundationDetails.card.variants).toThrow('Authored variants do not match executable samples') }
    finally { vi.mocked(readFileSync).mockImplementation(delegate as typeof readFileSync) }
  })
})
