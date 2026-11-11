import { mdxGuideMetadata } from '../libs/mdx-metadata'
export { frameworkVersion, installCommand, starterHtml } from './installation-examples'

// Navigation metadata comes from the authored MDX; no prose is duplicated here.
export const gettingStartedGuides = mdxGuideMetadata('getting-started')
export const installationGuide = gettingStartedGuides.find(guide => guide.slug === 'getting-started/install')!
