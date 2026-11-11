import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mdxGuideMetadata } from '../libs/mdx-metadata'
import { utilitiesRawExamples } from './utilities-examples'

export interface UtilityTopic {
  slug: string; title: string; category: string; classes: string[]
  description: string; example: string; notes: string; responsive?: boolean; fallback?: string
}

// Metadata only. Read the authored collection afresh for overview rendering.
export const utilitiesGuides = mdxGuideMetadata('utilities')
export function utilityTopicMetadata(): UtilityTopic[] {
  const root = existsSync('site/src/content/docs') ? 'site/src/content/docs' : 'src/content/docs'
  return mdxGuideMetadata('utilities').filter(guide => guide.slug !== 'utilities/api').map(guide => {
    const source = readFileSync(resolve(root, guide.slug + '.mdx'), 'utf8').replaceAll('\r\n', '\n')
    const value = JSON.parse(source.match(/^---\n([\s\S]*?)\n---/)![1]!).utility as Omit<UtilityTopic, 'slug' | 'title' | 'description' | 'example'>
    if (!value || typeof value.category !== 'string' || typeof value.notes !== 'string' || !Array.isArray(value.classes) || !value.classes.every(name => typeof name === 'string') || (value.responsive !== undefined && typeof value.responsive !== 'boolean') || (value.fallback !== undefined && typeof value.fallback !== 'string')) throw new Error('Invalid utility metadata: ' + guide.slug)
    return { ...value, slug: guide.slug.slice('utilities/'.length), title: guide.title, description: guide.description, example: utilitiesRawExamples[guide.slug]![0]!.example! }
  })
}
export const utilityTopics = utilityTopicMetadata()
