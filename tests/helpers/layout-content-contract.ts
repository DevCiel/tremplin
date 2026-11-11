import type { Guide } from '../../site/src/data/guide-docs'
import layout from '../fixtures/mdx-migration/layout.before.json' with { type: 'json' }
import content from '../fixtures/mdx-migration/content.before.json' with { type: 'json' }
import { layoutExamples } from '../../site/src/data/layout-examples'
import { contentExamples } from '../../site/src/data/content-examples'

/** Independent prose/hierarchy reference plus actual maintained executable samples. */
const contract = (original: Guide[], samples: Record<string, { code: Guide['sections'][number]['code']; example?: string }>): Guide[] => original.map(guide => ({
  ...guide,
  reference: { title: 'Tremplin source', url: `https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/${guide.slug}.mdx` },
  sections: guide.sections.map((section, index) => {
    const sample = samples[`${guide.slug}#${index}`]
    return { ...section, ...(sample ? { code: section.code ? sample.code : undefined, example: sample.example } : {}) }
  })
}))
export const layoutGuides = contract(layout as Guide[], layoutExamples)
export const contentGuides = contract(content as Guide[], contentExamples)
