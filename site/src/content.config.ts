import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const docs = defineCollection({
  loader: glob({
    pattern: '**/*.mdx', base: new URL('./content/docs/', import.meta.url),
    generateId: ({ entry }) => entry.replaceAll('\\', '/').replace(/\/index\.mdx$/, '').replace(/\.mdx$/, '')
  }),
  schema: z.object({
    title: z.string().min(1), description: z.string().min(1),
    component: z.string().optional(), implementation: z.string().optional(),
    variants: z.array(z.object({ title: z.string().min(1), description: z.string().min(1) })).optional(),
    keyboard: z.array(z.object({ keys: z.string(), behavior: z.string() })).optional(),
    guidelines: z.array(z.string().min(1)).optional(),
    events: z.record(z.string(), z.string().min(1)).optional(),
    utility: z.object({ category: z.string().min(1), classes: z.array(z.string().min(1)), notes: z.string(), responsive: z.boolean().optional(), fallback: z.string().optional() }).optional(),
    group: z.string().optional(), lead: z.string().optional(), order: z.number().int().nonnegative().optional()
  })
})

export const collections = { docs }
