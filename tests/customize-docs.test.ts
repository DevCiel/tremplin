import { customizeGuides } from './helpers/guides-customize-contract'
import { checkGuideGroup } from './helpers/guide-sass'
// CSS variables is an explicit local cross-reference to getting-started,
// not an invented upstream customize topic.
checkGuideGroup('customize', customizeGuides, ['customize/css-variables'])
