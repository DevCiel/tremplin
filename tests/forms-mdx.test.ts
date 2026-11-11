import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import original from './fixtures/mdx-migration/forms.before.json' with { type: 'json' }
import { formsGuides } from '../site/src/data/forms-guides'
import { formsRawExamples, formsExamples, formsRawScripts, formsRuntimeScripts } from '../site/src/data/forms-examples'
import { formsTables } from '../site/src/data/forms-tables'
import { allMdxGuideMetadata } from '../site/src/libs/mdx-guides'
import * as metadataReader from '../site/src/libs/mdx-metadata'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertFormsMdx } from './tooling/lib/forms-mdx.mjs'

const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')

describe('authored Forms MDX', () => {
  it('records seventeen authored guides without changing order or dropping navigation routes', () => {
    expect(assertFormsMdx().guides).toBe(17)
    expect(allMdxGuideMetadata().filter(guide => !['Helpers', 'Utilities'].includes(guide.group))).toHaveLength(59)
    expect(documentationNavigation().guides).toHaveLength(116)
    expect(formsGuides.map(({ slug, title, description, group, lead }) => ({ slug, title, description, group, lead })))
      .toEqual(original.formsGuides.map(({ slug, title, description, group, lead }) => ({ slug, title, description, group, lead })))
    expect(formsGuides.every(guide => guide.source === 'mdx' && guide.sections.length === 0)).toBe(true)
    expect(readdirSync('site/src/content/docs/forms').filter(file => file.endsWith('.mdx')).sort())
      .toEqual(original.formsGuides.map(guide => guide.slug.split('/')[1] + '.mdx').sort())
  })

  it('keeps every raw/published sample and client script identical, including explicit contrast opt-ins', () => {
    for (const [guides, samples, scripts] of [
      [original.formsGuides, formsRawExamples, formsRawScripts],
      [original.publishedFormsGuides, formsExamples, formsRuntimeScripts]
    ] as const) for (const guide of guides) {
      expect(samples[guide.slug]).toEqual(guide.sections.map(section => {
        const sample = section as { code?: unknown; example?: string }
        return { ...(sample.code ? { code: sample.code } : {}), ...(sample.example ? { example: sample.example } : {}) }
      }))
      expect(scripts[guide.slug] ?? '').toBe(('clientScript' in guide ? guide.clientScript : '') ?? '')
    }
  })

  it('removes superseded prose exports and the obsolete control-guide shim', () => {
    expect(existsSync('site/src/data/strict-control-guides.ts')).toBe(false)
    for (const [file, name] of [
      ['form-composition-guides', 'compositionGuides'], ['native-form-guides', 'nativeFormGuides'],
      ['forms-overview-docs', 'formsOverviewGuide'], ['choice-input-docs', 'choiceFormsGuides'],
      ['advanced-input-docs', 'advancedFormsGuides']
    ]) expect(read(`site/src/data/${file}.ts`)).not.toContain('export const ' + name)
    expect(read('site/src/data/forms-guides.ts')).not.toMatch(/heading:|paragraphs:|sections:\s*\[/)
    expect(read('site/src/data/forms-examples.ts')).not.toMatch(/"paragraphs"\s*:|"heading"\s*:/)
    expect(read('site/src/components/GuideScripts.astro')).toContain("from '/js/tremplin-docs.min.js'")
  })

  it('keeps all eight generated token tables connected to live data with their original values', () => {
    const expected = Object.fromEntries(original.publishedFormsGuides.flatMap(guide => guide.sections.flatMap((section, index) => {
      const table = (section as { table?: { rows: string[][] } }).table
      return table && ['CSS', 'CSS variables'].includes(section.heading) ? [[`${guide.slug}#${index}`, table.rows]] : []
    })))
    expect(Object.keys(formsTables)).toHaveLength(8)
    expect(formsTables).toEqual(expected)
    for (const key of Object.keys(formsTables)) {
      const [slug] = key.split('#')
      expect(read('site/src/content/docs/' + slug + '.mdx')).toContain('rows: formsTables[' + JSON.stringify(key) + ']')
    }
  })

  for (const [order, guide] of original.publishedFormsGuides.entries()) it(guide.slug + ' preserves authored hierarchy, deep links and source ownership', () => {
    const file = 'site/src/content/docs/' + guide.slug + '.mdx', source = read(file)
    expect(JSON.parse(source.match(/^---\n([\s\S]*?)\n---/)![1]!).order).toBe(order)
    const headings = [...source.matchAll(/<(h[23]) id="(section-\d+)">(\{[\s\S]*?\})<\/h[23]>/g)]
    expect(headings.map(heading => heading[2])).toEqual(guide.sections.map((_, index) => 'section-' + index))
    expect(headings.map(heading => JSON.parse(heading[3]!.slice(1, -1)))).toEqual(guide.sections.map(section => section.heading))
    expect(source).not.toContain('<GuideContent')
    expect(formsGuides[order]!.reference!.url).toBe('https://github.com/DevCiel/tremplin/blob/main/' + file)
  })

  it('reads current Forms metadata for sidebar/search instead of caching module titles', () => {
    const reader = metadataReader.mdxGuideMetadata
    const current = reader('forms').map((guide, index) => index === 0 ? { ...guide, title: 'Updated Forms overview' } : guide)
    const spy = vi.spyOn(metadataReader, 'mdxGuideMetadata').mockImplementation(group => group === 'forms' ? current : reader(group))
    try {
      const navigation = documentationNavigation()
      expect(navigation.guideGroups.find(([group]) => group === 'Forms')![1][0]!.title).toBe('Updated Forms overview')
      expect(navigation.searchPages.find(page => page.href === '/forms/overview/')!.title).toBe('Updated Forms overview')
    } finally { spy.mockRestore() }
  })
})
