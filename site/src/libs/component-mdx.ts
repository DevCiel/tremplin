import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ComponentDetail } from '../data/component-docs'

export const authoredComponentNames = ['accordion', 'alert', 'avatar', 'badge', 'bottom-sheet', 'breadcrumb', 'button', 'button-group', 'card', 'carousel', 'chip', 'chips', 'close-button', 'collapse', 'combobox', 'command-palette', 'data-table', 'datepicker', 'dialog', 'divider', 'drawer', 'empty-state', 'forms', 'list-group', 'menu', 'nav', 'nav-overflow', 'navbar', 'otp-input', 'pagination', 'placeholder', 'popover', 'progress', 'range', 'scrollspy', 'skeleton', 'spinner', 'status', 'stepper', 'strength', 'tab', 'table', 'timeline', 'toast', 'toasts', 'toggler', 'tooltip'] as const
export const isAuthoredComponent = (name: string): boolean => authoredComponentNames.some(topic => topic === name)
interface ComponentMetadata {
  component: string
  title: string
  description: string
  implementation?: string
  lead?: string
  variants?: Array<{ title: string; description: string }>
  keyboard?: ComponentDetail['keyboard']
  guidelines?: string[]
  events?: Record<string, string>
}
type Narrative = ComponentMetadata & Required<Pick<ComponentMetadata, 'lead' | 'variants' | 'keyboard' | 'guidelines'>>

/** Metadata is read per render; authored MDX is the sole owner of this prose. */
export function componentMdxMetadata(name: string): ComponentMetadata | undefined {
  if (!isAuthoredComponent(name)) return undefined
  const directory = existsSync('site/src/content/docs') ? resolve('site/src/content/docs/components') : resolve('src/content/docs/components')
  const source = readFileSync(resolve(directory, name + '.mdx'), 'utf8').replaceAll('\r\n', '\n')
  const header = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)?.[1]
  if (!header) throw new Error('Missing component MDX metadata: ' + name)
  const data = JSON.parse(header) as ComponentMetadata
  if (data.component !== name) throw new Error('Component metadata/filename mismatch: ' + name)
  for (const field of ['title', 'description'] as const) if (typeof data[field] !== 'string' || !data[field]) throw new Error('Invalid component ' + field + ': ' + name)
  if (name === 'placeholder' || name === 'toasts') {
    const canonical = name === 'placeholder' ? 'skeleton' : 'toast'
    if (data.implementation !== canonical || data.variants || data.guidelines || data.keyboard || data.lead || (name === 'toasts' && data.events !== undefined)) throw new Error(name === 'placeholder' ? 'Placeholder must share the authored Skeleton narrative' : 'Toasts must share the authored Toast narrative')
  } else {
    if (data.implementation || typeof data.lead !== 'string' || !data.lead) throw new Error('Invalid component lead: ' + name)
    if (!Array.isArray(data.variants) || data.variants.some(item => typeof item.title !== 'string' || !item.title || typeof item.description !== 'string' || !item.description)) throw new Error('Invalid component variants: ' + name)
    if (!Array.isArray(data.keyboard) || data.keyboard.some(item => typeof item.keys !== 'string' || typeof item.behavior !== 'string')) throw new Error('Invalid component keyboard guidance: ' + name)
    if (!Array.isArray(data.guidelines) || data.guidelines.some(item => typeof item !== 'string' || !item)) throw new Error('Invalid component guidelines: ' + name)
  }
  if (data.events !== undefined && (typeof data.events !== 'object' || data.events === null || Array.isArray(data.events) || Object.values(data.events).some(value => typeof value !== 'string' || !value))) throw new Error('Invalid component lifecycle descriptions: ' + name)
  return data
}

export function componentNarrative(name: string): Narrative {
  const data = componentMdxMetadata(name === 'placeholder' ? 'skeleton' : name === 'toasts' ? 'toast' : name)
  if (!data || !data.lead || !data.variants || !data.guidelines || !data.keyboard) throw new Error('No authored component narrative: ' + name)
  return data as Narrative
}

type ComponentSamples = Omit<ComponentDetail, 'variants' | 'guidelines' | 'keyboard'> & { variants: Array<{ markup: string }> }

/** Keep executable markup/token/Sass data live, with freshly authored prose. */
export function authoredComponentDetail(name: string, samples: ComponentSamples): ComponentDetail {
  return {
    ...samples,
    get variants() {
      const narrative = componentNarrative(name)
      if (narrative.variants.length !== samples.variants.length) throw new Error('Authored variants do not match executable samples: ' + name)
      return samples.variants.map((sample, index) => ({ ...sample, ...narrative.variants[index]! }))
    },
    get keyboard() { return componentNarrative(name).keyboard },
    get guidelines() { return componentNarrative(name).guidelines }
  }
}
