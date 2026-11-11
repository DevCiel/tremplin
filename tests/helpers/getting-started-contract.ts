import type { Guide } from '../../site/src/data/guide-docs'
import original from '../fixtures/mdx-migration/getting-started.before.json' with { type: 'json' }
import { gettingStartedExamples } from '../../site/src/data/getting-started-examples'

/** Independent pre-migration prose/structure; samples use the real typed modules. */
export const gettingStartedGuides: Guide[] = (original as Guide[]).map(guide => ({
  ...guide,
  reference: { title: 'Tremplin source', url: `https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/${guide.slug}.mdx` },
  sections: guide.sections.map((section, index) => {
    const sample = gettingStartedExamples[`${guide.slug.split('/')[1]}#${index}`]
    return { ...section, ...(sample ? { code: section.code ? sample.code : undefined, example: sample.example } : {}) }
  })
}))
export const installationGuide = gettingStartedGuides.find(guide => guide.slug === 'getting-started/install')!
