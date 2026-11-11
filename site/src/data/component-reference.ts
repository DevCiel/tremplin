import { componentMdxMetadata, componentNarrative } from '../libs/component-mdx'
import { sheetCommandDetails, sheetCommandExamples, sheetCommandAccessibility, type SheetCommandTopic } from './sheet-command-docs'
import { localPatternAccessibility, type LocalPatternTopic } from './local-pattern-docs'
import { advancedFormsTopic, isAdvancedTopic } from './advanced-input-docs'
import { navigationExamples, navigationDetails, navigationClasses, navigationAccessibility } from './navigation-disclosure-docs'
import { contrastComponentNames, contrastExample } from './contrast-examples'
import manifest from '../../../metadata/components.json' with { type: 'json' }
import { componentDetails, componentIntros, displayName, examples, type ComponentDetail } from './component-docs'
import { strictControlAccessibility, strictControlClasses } from './strict-control-docs'

// Documentation aliases do not add duplicate framework implementations or APIs.
export const coreComponentTopics = [
  'accordion', 'alert', 'avatar', 'badge', 'breadcrumb', 'button', 'button-group', 'card', 'carousel', 'close-button',
  'collapse', 'dialog', 'drawer', 'list-group', 'menu', 'nav', 'nav-overflow', 'navbar', 'pagination', 'placeholder',
  'popover', 'progress', 'scrollspy', 'spinner', 'stepper', 'tab', 'toasts', 'toggler', 'tooltip'
] as const
const aliases: Record<string, string> = { placeholder: 'skeleton', toasts: 'toast', 'bottom-sheet': 'drawer' }
export const implementationName = (name: string) => aliases[name] ?? name

const additions = [
  { name: 'button-group', kind: 'css', status: 'stable-alpha', classes: navigationClasses['button-group'], accessibility: navigationAccessibility['button-group'] },
  { name: 'close-button', kind: 'css', status: 'stable-alpha', classes: navigationClasses['close-button'], accessibility: navigationAccessibility['close-button'] },
  { name: 'nav', kind: 'css', status: 'stable-alpha', classes: navigationClasses.nav, accessibility: navigationAccessibility.nav }
]
export const documentedComponents = [
  ...manifest.components.map(component => {
    const current = strictControlClasses[component.name] ? { ...component, classes: strictControlClasses[component.name]!, accessibility: strictControlAccessibility[component.name]! } : component
    // Public prose comes from the maintained guides; immutable API metadata stays unchanged.
    return { ...current, accessibility: localPatternAccessibility[component.name as LocalPatternTopic] ?? sheetCommandAccessibility[component.name as SheetCommandTopic] ?? current.accessibility }
  }), ...additions,
  ...['placeholder', 'toasts'].map(name => ({ ...manifest.components.find(component => component.name === implementationName(name))!, name }))
]
const extensions = new Set(['command-palette', 'data-table', 'divider', 'empty-state', 'status', 'timeline'])
export const componentNavigationGroups = {
  'Core components': [...coreComponentTopics],
  'Additional patterns and compatibility routes': documentedComponents.map(component => component.name).filter(name => !coreComponentTopics.some(topic => topic === name) && !extensions.has(name)),
  Extensions: documentedComponents.map(component => component.name).filter(name => extensions.has(name))
}

const extraExamples: Record<string, string> = { ...sheetCommandExamples, 'button-group': navigationExamples['button-group'], 'close-button': navigationExamples['close-button'], nav: navigationExamples.nav }
export const additionalComponentDetails: Record<string, ComponentDetail> = { ...sheetCommandDetails, 'button-group': navigationDetails['button-group'], 'close-button': navigationDetails['close-button'], nav: navigationDetails.nav }
export const componentExample = (name: string) => {
  const markup = extraExamples[name] ?? examples[implementationName(name)]
  return markup && contrastComponentNames.has(name) ? contrastExample(markup) : markup
}
export const componentDetail = (name: string) => {
  const detail = additionalComponentDetails[name] ?? componentDetails[implementationName(name)]
  return detail && contrastComponentNames.has(name) ? { ...detail, variants: detail.variants.map(variant => ({ ...variant, markup: contrastExample(variant.markup) })) } : detail
}
export const componentTitle = (name: string) => componentMdxMetadata(name)?.title ?? (name === 'placeholder' ? 'Placeholder' : name === 'toasts' ? 'Toasts' : displayName(name))
const extraIntros: Record<string, string> = { get 'bottom-sheet'() { return componentNarrative('bottom-sheet').lead }, get "button-group"() { return componentNarrative('button-group').lead }, get "close-button"() { return componentNarrative('close-button').lead }, get "nav"() { return componentNarrative('nav').lead } }
export const componentIntro = (name: string) => extraIntros[name] ?? componentIntros[implementationName(name)]

const sourceOverrides: Record<string, string> = {
  button: 'buttons/_button.scss', 'button-group': 'buttons/_button-group.scss', 'close-button': 'buttons/_close.scss',
  forms: 'forms/index.scss', table: 'content/_tables.scss', chips: 'forms/_chip-input.scss', combobox: 'forms/_combobox.scss',
  'otp-input': 'forms/_otp-input.scss', range: 'forms/_form-range.scss', strength: 'forms/_strength.scss',
  collapse: '_transitions.scss', tab: '_nav.scss', skeleton: '_placeholder.scss', toast: '_toasts.scss', 'bottom-sheet': '_drawer.scss',
  ...Object.fromEntries([...extensions].map(name => [name, `extensions/_${name}.scss`]))
}
export function componentSource(name: string) {
  const local = implementationName(name)
  if (local === 'toggler' || local === 'scrollspy') return `src/js/${local}.ts`
  return `src/scss/${sourceOverrides[local] ?? `_${local}.scss`}`
}
export function componentReference(name: string) { return 'https://github.com/DevCiel/tremplin/blob/main/' + componentSource(name) }
export function componentImport(name: string, className: string) {
  const local = implementationName(name)
  const specifier = local === 'command-palette' ? 'tremplin/extensions/command-palette' : `tremplin/${local}`
  return local === 'command-palette'
    ? `import { ${className} } from '${specifier}'` : `import ${className} from '${specifier}'`
}
export function componentTarget(name: string) {
  if (name === 'bottom-sheet') return '#actions'
  const local = implementationName(name)
  const targets: Record<string, string> = {
    alert: '.alert', button: '[data-trm-toggle="button"]', carousel: '#demo-carousel', chips: '[data-trm-chips]', collapse: '#details', combobox: '#city',
    'command-palette': '#commands', datepicker: '#deadline', dialog: '#confirm', drawer: '#navigation',
    menu: '[data-trm-toggle="menu"]', 'nav-overflow': '[data-trm-toggle="nav-overflow"]', 'otp-input': '[data-trm-otp]',
    popover: '[data-trm-toggle="popover"]', range: '#volume-range', scrollspy: '[data-trm-spy="scroll"]',
    strength: '[data-trm-strength]', tab: '[data-trm-toggle="tab"]', toast: '.toast', toggler: '#generic-panel', tooltip: '[data-trm-toggle="tooltip"]'
  }
  return targets[local] ?? '#example'
}
