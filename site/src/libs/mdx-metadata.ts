import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Guide } from '../data/guide-docs'

/** Read metadata only. MDX remains the sole authored source for guide prose. */
export function mdxGuideMetadata(group: string): Guide[] {
  if (!/^[a-z0-9-]+$/.test(group)) throw new Error('Invalid MDX guide group')
  // Astro bundles server modules into .prerender/. Resolve authored sources
  // from the supported root/site working directories, not that output URL.
  const contentRoot = existsSync('site/src/content/docs') ? resolve('site/src/content/docs') : resolve('src/content/docs')
  const directory = join(contentRoot, group)
  const entries = readdirSync(directory).filter(name => name.endsWith('.mdx') && name !== 'index.mdx').map(name => {
    if (!/^[a-z0-9-]+\.mdx$/.test(name)) throw new Error('Invalid MDX guide filename')
    const source = readFileSync(join(directory, name), 'utf8').replaceAll('\r\n', '\n')
    const header = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)?.[1]
    if (!header) throw new Error(`Missing MDX metadata: ${name}`)
    // JSON is a YAML subset, accepted by Astro frontmatter without an extra parser.
    const data = JSON.parse(header) as Record<string, unknown>
    for (const field of ['title', 'description', 'group', 'lead']) {
      if (typeof data[field] !== 'string' || !data[field]) throw new Error(`Invalid ${field} in ${name}`)
    }
    if (!Number.isInteger(data.order) || Number(data.order) < 0) throw new Error(`Invalid guide order in ${name}`)
    const slug = `${group}/${name.slice(0, -4)}`
    const guide: Guide = {
      slug, title: data.title as string, description: data.description as string,
      group: data.group as string, lead: data.lead as string, source: 'mdx', sections: [],
      reference: { title: 'Tremplin source', url: `https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/${slug}.mdx` }
    }
    return { order: Number(data.order), guide }
  }).sort((left, right) => left.order - right.order)
  entries.forEach((entry, index) => {
    if (entry.order !== index) throw new Error(`Duplicate or non-contiguous MDX order in ${group}`)
  })
  return entries.map(entry => entry.guide)
}
