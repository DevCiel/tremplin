import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import raw from './fixtures/mdx-migration/utilities-raw.before.json' with { type: 'json' }
import published from './fixtures/mdx-migration/utilities-published.before.json' with { type: 'json' }
import topics from './fixtures/mdx-migration/utilities-topics.before.json' with { type: 'json' }
import { utilitiesGuides, utilityTopics, utilityTopicMetadata } from '../site/src/data/utilities-guides'
import { utilitiesRawExamples, utilitiesExamples, utilitiesRuntimeScripts } from '../site/src/data/utilities-examples'
import { allMdxGuideMetadata } from '../site/src/libs/mdx-guides'
import * as metadataReader from '../site/src/libs/mdx-metadata'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertUtilitiesMdx } from './tooling/lib/utilities-mdx.mjs'
const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')

describe('completed authored Utilities documentation', () => {
  it('authors all 48 guides and removes the structured renderer and collection without losing routes', () => {
    expect(assertUtilitiesMdx()).toMatchObject({ guides: 48, remaining: 0 })
    expect(allMdxGuideMetadata()).toHaveLength(116)
    expect(allMdxGuideMetadata().every(guide => guide.source === 'mdx' && guide.sections.length === 0)).toBe(true)
    expect(documentationNavigation().guides).toHaveLength(116)
    expect(utilitiesGuides.map(({ slug, title, description, group, lead }) => ({ slug, title, description, group, lead })))
      .toEqual(raw.map(({ slug, title, description, group, lead }) => ({ slug, title, description, group, lead })))
    expect(readdirSync('site/src/content/docs/utilities').filter(file => file !== 'index.mdx').sort()).toEqual(raw.map(guide => guide.slug.split('/')[1] + '.mdx').sort())
    expect(existsSync('site/src/components/GuideContent.astro')).toBe(false)
    expect(read('site/src/content.config.ts')).toContain('export const collections = { docs }')
    expect(read('site/src/content.config.ts')).not.toContain('guideSchema')
    expect(read('site/src/pages/[...guide].astro')).not.toMatch(/GuideContent|getCollection\('guides'\)/)
    expect(read('site/src/data/guide-docs.ts')).not.toContain('contrastGuideSlugs')
    expect(read('site/src/data/utilities-guides.ts')).not.toMatch(/paragraphs:|heading:/)
  })

  it('retains every executable sample and both explicit contrast scripts byte-for-byte', () => {
    for (const [guides, samples] of [[raw, utilitiesRawExamples], [published, utilitiesExamples]] as const) for (const guide of guides) {
      expect(samples[guide.slug]).toEqual(guide.sections.map(section => {
        const value = section as { code?: unknown; example?: string }
        return { ...(value.code ? { code: value.code } : {}), ...(value.example ? { example: value.example } : {}) }
      }))
    }
    expect(Object.keys(utilitiesRuntimeScripts)).toEqual(['utilities/background', 'utilities/theme'])
    for (const guide of published) expect(utilitiesRuntimeScripts[guide.slug] ?? '').toBe(('clientScript' in guide ? guide.clientScript : '') ?? '')
    expect(read('site/src/components/GuideScripts.astro')).toContain('?? utilitiesRuntimeScripts[Astro.props.slug]')
    const route = read('site/src/pages/[...guide].astro')
    expect(route.indexOf('<GuideScripts')).toBeLessThan(route.indexOf('<GuidePagination slug='))
  })

  it('projects all 47 non-API topic records from authored metadata and live examples', () => {
    expect(utilityTopics).toEqual(topics.map(topic => {
      const { sections: _sections, ...metadata } = topic as typeof topic & { sections?: unknown }
      return metadata
    }))
    expect(read('site/src/content/docs/utilities/index.mdx')).toContain('topics = () => utilityTopicMetadata()')
  })

  for (const [order, guide] of published.entries()) it(guide.slug + ' preserves prose, deep links, tables, steps and copied-code owners', () => {
    const source = read('site/src/content/docs/' + guide.slug + '.mdx')
    expect(JSON.parse(source.match(/^---\n([\s\S]*?)\n---/)![1]!).order).toBe(order)
    const headings = [...source.matchAll(/<(h[23]) id="(section-\d+)">(\{[\s\S]*?\})<\/h[23]>/g)]
    expect(headings.map(heading => JSON.parse(heading[3]!.slice(1, -1)))).toEqual(guide.sections.map(section => section.heading))
    expect(headings.map(heading => heading[2])).toEqual(guide.sections.map((_, index) => 'section-' + index))
    for (const [index, section] of guide.sections.entries()) {
      const s = section as { paragraphs?: string[]; steps?: string[]; table?: { keyboardScroll?: boolean; headings: string[]; rows: string[][] }; code?: unknown[] }
      for (const value of s.paragraphs ?? []) expect(source).toContain('<p><Html source={' + JSON.stringify(value) + '} /></p>')
      for (const value of s.steps ?? []) expect(source).toContain('<li><Html source={' + JSON.stringify(value) + '} /></li>')
      for (const [codeIndex] of (s.code ?? []).entries()) expect(source).toContain(`sample={samples[${JSON.stringify(guide.slug)}][${index}].code[${codeIndex}]}`)
      if (s.table) {
        for (const heading of s.table.headings) expect(source).toContain('<th scope="col">{' + JSON.stringify(heading) + '}</th>')
        for (const cell of s.table.rows.flat()) expect(source).toContain('<td><code><Html source={' + JSON.stringify(cell) + '} /></code></td>')
        if (s.table.keyboardScroll) expect(source).toContain(`tabindex="0" role="region" aria-labelledby="section-${index}"`)
      }
    }
    expect(utilitiesGuides[order]!.reference!.url).toBe(`https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/${guide.slug}.mdx`)
  })

  it('keeps overview snippets canonical and current metadata fresh for navigation and topic cards', () => {
    const overview = read('site/src/content/docs/utilities/index.mdx')
    expect(overview).toContain('md:row-cols-2 lg:row-cols-4')
    expect(overview).toContain('lg:flex-row lg:align-items-center')
    expect(overview).not.toMatch(/row-cols-md-|flex-lg-|hover-opacity-|container-breakpoints|btn-primary/)
    const reader = metadataReader.mdxGuideMetadata
    const changed = reader('utilities').map(guide => guide.slug === 'utilities/colors' ? { ...guide, title: 'Updated color guide' } : guide)
    const spy = vi.spyOn(metadataReader, 'mdxGuideMetadata').mockImplementation(group => group === 'utilities' ? changed : reader(group))
    try {
      expect(documentationNavigation().searchPages.find(page => page.href === '/utilities/colors/')!.title).toBe('Updated color guide')
      expect(utilityTopicMetadata().find(topic => topic.slug === 'colors')!.title).toBe('Updated color guide')
    } finally { spy.mockRestore() }
  })
})
