import type { Guide } from '../../site/src/data/guide-docs'
import raw from '../fixtures/mdx-migration/utilities-raw.before.json' with { type: 'json' }
import published from '../fixtures/mdx-migration/utilities-published.before.json' with { type: 'json' }
import { utilitiesRawExamples, utilitiesExamples, utilitiesRuntimeScripts } from '../../site/src/data/utilities-examples'
export { utilityTopics } from '../../site/src/data/utilities-guides'

// Test-only original hierarchy/prose with samples from the maintained owner.
// The website does not import this contract or the pre-migration evidence.
const contract = (guide: Guide, samples: typeof utilitiesExamples): Guide => ({
  ...guide,
  reference: { title: 'Tremplin source', url: `https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/${guide.slug}.mdx` },
  ...(guide.clientScript ? { clientScript: utilitiesRuntimeScripts[guide.slug] } : {}),
  sections: guide.sections.map((section, index) => ({ ...section,
    ...(section.code ? { code: samples[guide.slug]![index]!.code } : {}),
    ...(section.example ? { example: samples[guide.slug]![index]!.example } : {})
  }))
})
export const utilitiesGuides = (raw as Guide[]).map(guide => contract(guide, utilitiesRawExamples))
export const publishedUtilitiesGuides = (published as Guide[]).map(guide => contract(guide, utilitiesExamples))
