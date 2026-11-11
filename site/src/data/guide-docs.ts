import { gettingStartedGuides } from './getting-started-guides'
import { workflowGuides } from './workflow-guides'
import { customizeGuides } from './customize-guides'
import { layoutGuides } from './layout-guides'
import { contentGuides } from './content-guides'
import { formsGuides } from './forms-guides'
import { helpersGuides } from './helpers-guides'
import { utilitiesGuides } from './utilities-guides'

export interface CodeSample {
  label?: string
  language: string
  source: string
}

export interface GuideSection {
  heading: string
  level?: 2 | 3
  steps?: string[]
  paragraphs?: string[]
  code?: CodeSample[]
  table?: { headings: string[]; rows: string[][]; keyboardScroll?: boolean }
  callout?: string
  example?: string
}

export interface Guide {
  /** MDX entries expose navigation metadata here; their bodies are in content/docs. */
  source?: 'mdx'
  slug: string
  group: string
  title: string
  description: string
  lead: string
  sections: GuideSection[]
  reference?: { title: string; url: string }
  clientScript?: string
}

export const guides: Guide[] = [
  ...gettingStartedGuides,
  ...workflowGuides,
  ...customizeGuides,
  ...layoutGuides,
  ...contentGuides,
  ...formsGuides,
  ...helpersGuides,
  ...utilitiesGuides
]

export const guideGroups = Object.entries(
  guides.reduce<Record<string, Guide[]>>((groups, guide) => {
    ;(groups[guide.group] ??= []).push(guide)
    return groups
  }, {})
)
