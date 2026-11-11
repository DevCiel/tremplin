import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import original from './fixtures/mdx-migration/helpers.before.json' with { type: 'json' }
import { helpersGuides } from '../site/src/data/helpers-guides'
import { helpersRawExamples, helpersExamples, helpersRuntimeScripts } from '../site/src/data/helpers-examples'
import { allMdxGuideMetadata } from '../site/src/libs/mdx-guides'
import * as metadataReader from '../site/src/libs/mdx-metadata'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertHelpersMdx } from './tooling/lib/helpers-mdx.mjs'

const read = (file: string) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
describe('authored Helpers MDX', () => {
  it('records the nine-guide checkpoint and preserves order in the completed authored collection', () => {
    expect(assertHelpersMdx()).toMatchObject({ guides: 9, remaining: 48 })
    expect(allMdxGuideMetadata().filter(guide => guide.group !== 'Utilities')).toHaveLength(68)
    const navigation = documentationNavigation()
    expect(navigation.guides).toHaveLength(116)
    expect(navigation.guides.every(guide => guide.source === 'mdx')).toBe(true)
    expect(helpersGuides.map(({ slug, title, description, group, lead }) => ({ slug, title, description, group, lead })))
      .toEqual(original.raw.map(({ slug, title, description, group, lead }) => ({ slug, title, description, group, lead })))
    expect(helpersGuides.every(guide => guide.source === 'mdx' && guide.sections.length === 0)).toBe(true)
    expect(readdirSync('site/src/content/docs/helpers').sort()).toEqual(original.raw.map(guide => guide.slug.split('/')[1] + '.mdx').sort())
    expect(read('site/src/data/helpers-guides.ts')).not.toMatch(/heading:|paragraphs:|sections:\s*\[/)
    expect(read('site/src/data/helpers-examples.ts')).not.toMatch(/"paragraphs"\s*:|"heading"\s*:/)
  })

  it('retains all raw and published executable samples without silently dropping Sass test discovery', () => {
    for (const [guides, samples] of [[original.raw, helpersRawExamples], [original.published, helpersExamples]] as const) {
      expect(Object.keys(samples)).toEqual(guides.map(guide => guide.slug))
      for (const guide of guides) expect(samples[guide.slug]).toEqual(guide.sections.map(section => {
        const sample = section as { code?: unknown; example?: string }
        return { ...(sample.code ? { code: sample.code } : {}), ...(sample.example ? { example: sample.example } : {}) }
      }))
    }
    const counts = (samples: typeof helpersRawExamples) => Object.values(samples).flat().flatMap(section => section.code ?? []).filter(sample => sample.language === 'scss').length
    expect(counts(helpersRawExamples)).toBe(original.raw.flatMap(guide => guide.sections).flatMap(section => ('code' in section ? section.code : []) ?? []).filter(sample => sample.language === 'scss').length)
    expect(read('tests/helpers-docs.test.ts')).toContain('helpersRawExamples[guide.slug]![sectionIndex]!.code')
  })

  it('retains the explicit contrast wrapper, copied CSS and script in their original owners and position', () => {
    expect(Object.keys(helpersRuntimeScripts)).toEqual(['helpers/stretched-link'])
    for (const guide of original.published) expect(helpersRuntimeScripts[guide.slug] ?? '').toBe(('clientScript' in guide ? guide.clientScript : '') ?? '')
    const stretched = helpersExamples['helpers/stretched-link']!
    expect(stretched[0]!.code![0]!.language).toBe('css')
    expect(stretched[1]!.example).toContain('demo-contrast')
    expect(read('site/src/components/GuideScripts.astro')).toContain('formsRuntimeScripts[Astro.props.slug] ?? helpersRuntimeScripts[Astro.props.slug]')
    const route = read('site/src/pages/[...guide].astro')
    expect(route.indexOf('<GuideScripts')).toBeLessThan(route.indexOf('<GuidePagination slug='))
  })

  for (const [order, guide] of original.published.entries()) it(guide.slug + ' retains authored prose, hierarchy, IDs, code and source ownership', () => {
    const file = 'site/src/content/docs/' + guide.slug + '.mdx', source = read(file)
    expect(JSON.parse(source.match(/^---\n([\s\S]*?)\n---/)![1]!).order).toBe(order)
    expect(source).not.toContain('<GuideContent')
    const headings = [...source.matchAll(/<(h[23]) id="(section-\d+)">(\{[\s\S]*?\})<\/h[23]>/g)]
    expect(headings.map(heading => heading[2])).toEqual(guide.sections.map((_, index) => 'section-' + index))
    expect(headings.map(heading => JSON.parse(heading[3]!.slice(1, -1)))).toEqual(guide.sections.map(section => section.heading))
    for (const [index, section] of guide.sections.entries()) {
      for (const paragraph of section.paragraphs ?? []) expect(source).toContain('<p><Html source={' + JSON.stringify(paragraph) + '} /></p>')
      for (const [codeIndex] of ('code' in section ? section.code ?? [] : []).entries()) expect(source).toContain(`sample={samples[${JSON.stringify(guide.slug)}][${index}].code[${codeIndex}]}`)
    }
    expect(helpersGuides[order]!.reference!.url).toBe('https://github.com/DevCiel/tremplin/blob/main/' + file)
  })

  it('reads current authored metadata for sidebar and search without caching stale titles', () => {
    const reader = metadataReader.mdxGuideMetadata
    const updated = reader('helpers').map((guide, index) => index === 0 ? { ...guide, title: 'Updated Helpers focus guide' } : guide)
    const spy = vi.spyOn(metadataReader, 'mdxGuideMetadata').mockImplementation(group => group === 'helpers' ? updated : reader(group))
    try {
      const navigation = documentationNavigation()
      expect(navigation.guideGroups.find(([group]) => group === 'Helpers')![1][0]!.title).toBe('Updated Helpers focus guide')
      expect(navigation.searchPages.find(page => page.href === '/helpers/focus-ring/')!.title).toBe('Updated Helpers focus guide')
    } finally { spy.mockRestore() }
  })
})
