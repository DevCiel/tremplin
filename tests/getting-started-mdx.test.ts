import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import original from './fixtures/mdx-migration/getting-started.before.json' with { type: 'json' }
import { gettingStartedGuides } from '../site/src/data/getting-started-guides'
import { gettingStartedExamples } from '../site/src/data/getting-started-examples'
import { mdxGuideMetadata } from '../site/src/libs/mdx-metadata'
import * as metadataReader from '../site/src/libs/mdx-metadata'
import { documentationNavigation } from '../site/src/libs/navigation'
import { assertGettingStartedMdx } from './tooling/lib/getting-started-mdx.mjs'

const root = 'site/src/content/docs/getting-started/'
const read = (file: string) => readFileSync(file, 'utf8')

describe('authored Getting started MDX', () => {
  it('migrates exactly eleven guides with their independent original order and metadata', () => {
    expect(assertGettingStartedMdx().guides).toBe(11)
    expect(readdirSync(root).filter(file => file.endsWith('.mdx') && file !== 'index.mdx').sort())
      .toEqual(original.map(guide => guide.slug.split('/')[1] + '.mdx').sort())
    expect(gettingStartedGuides.map(({ slug, title, description, group, lead }) => ({ slug, title, description, group, lead })))
      .toEqual(original.map(({ slug, title, description, group, lead }) => ({ slug, title, description, group, lead })))
    expect(gettingStartedGuides.every(guide => guide.source === 'mdx' && guide.sections.length === 0)).toBe(true)
    expect(() => mdxGuideMetadata('../outside')).toThrow('Invalid MDX guide group')
  })

  for (const [order, guide] of original.entries()) it(guide.slug + ' owns its prose and hierarchy', () => {
    const source = read('site/src/content/docs/' + guide.slug + '.mdx')
    const data = JSON.parse(source.match(/^---\n([\s\S]*?)\n---/)![1]!) as { order: number }
    expect(data.order).toBe(order)
    const doc = new DOMParser().parseFromString(source.slice(source.indexOf('\n---', 4) + 4), 'text/html')
    const headings = [...doc.querySelectorAll('section.docs-section > h2, section.docs-section > h3')]
    expect(headings.map(heading => heading.textContent)).toEqual(guide.sections.map(section => section.heading))
    expect(headings.map(heading => heading.id)).toEqual(guide.sections.map((_, index) => 'section-' + index))
    expect(source).not.toContain('<GuideContent')
    expect(gettingStartedGuides[order]!.reference!.url).toBe('https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/' + guide.slug + '.mdx')
  })

  it('keeps samples identical without duplicating prose in TypeScript or retaining a temporary route', () => {
    const expected = Object.fromEntries(original.flatMap(guide => guide.sections.flatMap((section, index) => {
      const item = section as { code?: unknown[]; example?: string }
      return item.code || item.example ? [[`${guide.slug.split('/')[1]}#${index}`, { code: item.code ?? [], ...(item.example ? { example: item.example } : {}) }]] : []
    })))
    // Approved command update; preserve the immutable migration fixture.
    const registry = expected['install#0'] as { code: { source: string }[] }
    registry.code = registry.code.map(sample => ({ ...sample, source: 'npm i tremplin' }))
    const download = expected['download#2'] as { code: { source: string }[] }
    download.code = download.code.map((sample, index) => index === 0 ? { ...sample, source: 'npm install\nnpm run build\nnpm run check\nnpm pack' } : sample)
    const install = expected['install#11'] as { code: { source: string }[] }
    install.code = install.code.map((sample, index) => index === 0 ? { ...sample, source: 'npm install\nnpm run build\nnpm pack' } : sample)
    expect(gettingStartedExamples).toEqual(expected)
    expect(read('site/src/data/getting-started-guides.ts')).not.toMatch(/paragraphs:|heading:|sections:\s*\[/)
    expect(read('site/src/data/installation-examples.ts')).not.toMatch(/paragraphs:|heading:|steps:/)
    expect(existsSync('site/src/data/installation-guide.ts')).toBe(false)
    expect(existsSync('site/src/pages/mdx-review/[slug].astro')).toBe(false)
  })

  it('protects quotes, tokens, wildcard names and URL labels from Markdown typography', () => {
    expect(read(root + 'install.mdx')).toContain('crossorigin={\'"anonymous"\'}')
    expect(read(root + 'install.mdx')).toContain('{"http://127.0.0.1:4321/"}')
    expect(read(root + 'css-variables.mdx')).toContain('{"--trm-body-bg / --trm-body-color"}')
    expect(read(root + 'rtl.mdx')).toContain('{"ms-* / me-*"}')
  })

  it('reads current authored metadata for navigation rather than retaining stale module titles', () => {
    const updated = gettingStartedGuides.map((guide, index) => index === 0 ? { ...guide, title: 'Updated installation title' } : guide)
    const originalReader = metadataReader.mdxGuideMetadata
    const reader = vi.spyOn(metadataReader, 'mdxGuideMetadata').mockImplementation(group => group === 'getting-started' ? updated : originalReader(group))
    try {
      const navigation = documentationNavigation()
      expect(reader).toHaveBeenCalledWith('getting-started')
      expect(navigation.guides).toHaveLength(116)
      expect(navigation.guideGroups[0]![1][0]!.title).toBe('Updated installation title')
      expect(navigation.searchPages.find(page => page.href === '/getting-started/install/')!.title).toBe('Updated installation title')
    } finally { reader.mockRestore() }
  })
})
