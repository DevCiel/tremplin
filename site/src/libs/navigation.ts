import { componentNavigationGroups, documentedComponents, componentTitle } from '../data/component-reference'
import { allMdxGuideMetadata } from './mdx-guides'
import navigation from '../../data/navigation.json'

export const componentGroups = componentNavigationGroups
export const componentNames = new Set(documentedComponents.map(component => component.name))
export const displayName = componentTitle
export const groupIcons: Record<string, string> = navigation.groupIcons
/** Read authored metadata per render, so dev edits do not leave stale titles/order. */
export function documentationNavigation() {
  const entries = allMdxGuideMetadata()
  const guideGroups = Object.entries(entries.reduce<Record<string, typeof entries>>((groups, guide) => {
    ;(groups[guide.group] ??= []).push(guide)
    return groups
  }, {}))
  const searchPages = [
    ...entries.map(guide => ({ title: guide.title, href: `/${guide.slug}/`, description: guide.description })),
    ...documentedComponents.map(component => ({
      title: displayName(component.name), href: `/components/${component.name}/`,
      description: `${displayName(component.name)} component documentation and examples`
    }))
  ]
  return { guides: entries, guideGroups, searchPages }
}
