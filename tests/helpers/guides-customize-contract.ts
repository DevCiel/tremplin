import type { Guide } from '../../site/src/data/guide-docs'
import workflow from '../fixtures/mdx-migration/workflow.before.json' with { type: 'json' }
import customize from '../fixtures/mdx-migration/customize.before.json' with { type: 'json' }
import { workflowExamples } from '../../site/src/data/workflow-examples'
import { customizeExamples } from '../../site/src/data/customize-examples'

/** Independent prose/hierarchy reference plus actual maintained executable samples. */
const contract = (original: Guide[], samples: Record<string, { code: Guide['sections'][number]['code']; example?: string }>): Guide[] => original.map(guide => ({
  ...guide,
  reference: { title: 'Tremplin source', url: `https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/${guide.slug}.mdx` },
  sections: guide.sections.map((section, index) => {
    const sample = samples[`${guide.slug}#${index}`]
    return { ...section, ...(sample ? { code: section.code ? sample.code : undefined, example: sample.example } : {}) }
  })
}))
export const workflowGuides = contract(workflow as Guide[], workflowExamples)
export const customizeGuides = contract(customize as Guide[], customizeExamples)
