import { componentMdxMetadata, componentNarrative } from '../libs/component-mdx'
import { formsDetails, formsExample } from './forms-overview-docs'
import { sheetCommandDetails, sheetCommandExamples } from './sheet-command-docs'
import { documentedTokens } from './documented-tokens'
import { localPatternExamples, localPatternDetails } from './local-pattern-docs'
import { chipTableExamples, chipTableDetails } from './chip-table-docs'
import { adaptiveExamples } from './adaptive-navigation-docs'
import { loadingExamples, loadingDetails } from './loading-identity-docs'
import { overlayExamples, overlayDetails } from './overlay-component-docs'
import { selectionExamples, selectionDetails } from './selection-feedback-docs'
import { collectionExamples, collectionDetails } from './collection-disclosure-docs'
import { navigationExamples, navigationDetails } from './navigation-disclosure-docs'
import { foundationExamples, foundationDetails } from './foundation-component-docs'
import { stepperExample, stepperDetails, carouselExample, carouselDetails } from './progress-media-docs'
import { cityChoices, comboboxExample, comboboxDetails, navbarDetails, togglerExample, togglerDetails } from './interaction-docs'
import { strictControlDetails, strictControlExamples, strictControlIntros } from './strict-control-docs'

export const componentGroups = {
  'Content and forms': ['forms', 'table', 'data-table'],
  'Layout and navigation': ['breadcrumb', 'card', 'list-group', 'navbar', 'pagination', 'stepper', 'timeline'],
  'Actions and disclosure': ['accordion', 'button', 'collapse', 'menu', 'nav-overflow', 'tab', 'toggler'],
  'Feedback and status': ['alert', 'badge', 'empty-state', 'progress', 'skeleton', 'spinner', 'status', 'toast'],
  'Overlays': ['bottom-sheet', 'dialog', 'drawer', 'popover', 'tooltip'],
  'Inputs and selection': ['chip', 'chips', 'combobox', 'datepicker', 'otp-input', 'range', 'strength'],
  'Media and helpers': ['avatar', 'carousel', 'divider', 'scrollspy'],
  'Extensions': ['command-palette']
} as const

export const componentIntros: Record<string, string> = {
  get accordion() { return componentNarrative('accordion').lead },
  get alert() { return componentNarrative('alert').lead },
  get avatar() { return componentNarrative('avatar').lead },
  get badge() { return componentNarrative('badge').lead },
  'bottom-sheet': 'Present a mobile-friendly action surface from the bottom edge using Drawer behavior.',
  get "breadcrumb"() { return componentNarrative('breadcrumb').lead },
  get button() { return componentNarrative('button').lead },
  get card() { return componentNarrative('card').lead },
  get 'carousel'() { return componentNarrative('carousel').lead },
  get 'chip'() { return componentNarrative('chip').lead },
  get 'chips'() { return componentNarrative('chips').lead },
  get collapse() { return componentNarrative('collapse').lead },
  get 'combobox'() { return componentNarrative('combobox').lead },
  get 'command-palette'() { return componentNarrative('command-palette').lead },
  get 'data-table'() { return componentNarrative('data-table').lead },
  get 'datepicker'() { return componentNarrative('datepicker').lead },
  get dialog() { return componentNarrative('dialog').lead },
  get 'divider'() { return componentNarrative('divider').lead },
  get drawer() { return componentNarrative('drawer').lead },
  get 'empty-state'() { return componentNarrative('empty-state').lead },
  get 'forms'() { return componentNarrative('forms').lead },
  get "list-group"() { return componentNarrative('list-group').lead },
  get menu() { return componentNarrative('menu').lead },
  get 'navbar'() { return componentNarrative('navbar').lead },
  get 'nav-overflow'() { return componentNarrative('nav-overflow').lead },
  get 'otp-input'() { return componentNarrative('otp-input').lead },
  get "pagination"() { return componentNarrative('pagination').lead },
  get popover() { return componentNarrative('popover').lead },
  get progress() { return componentNarrative('progress').lead },
  get 'range'() { return componentNarrative('range').lead },
  get scrollspy() { return componentNarrative('scrollspy').lead },
  get skeleton() { return componentNarrative('skeleton').lead },
  get spinner() { return componentNarrative('spinner').lead },
  get 'status'() { return componentNarrative('status').lead },
  get 'strength'() { return componentNarrative('strength').lead },
  get 'stepper'() { return componentNarrative('stepper').lead },
  get tab() { return componentNarrative('tab').lead },
  get 'table'() { return componentNarrative('table').lead },
  get 'timeline'() { return componentNarrative('timeline').lead },
  get 'toggler'() { return componentNarrative('toggler').lead },
  get toast() { return componentNarrative('toast').lead },
  get tooltip() { return componentNarrative('tooltip').lead }
}

export const examples: Record<string, string> = {
  accordion: navigationExamples.accordion,
  alert: foundationExamples.alert,
  avatar: loadingExamples.avatar,
  badge: foundationExamples.badge,
  'bottom-sheet': sheetCommandExamples['bottom-sheet'],
  breadcrumb: collectionExamples['breadcrumb'],
  button: foundationExamples.button,
  card: foundationExamples.card,
  carousel: carouselExample,
  "chip": strictControlExamples["chip"]!,
  "chips": strictControlExamples["chips"]!,
  collapse: collectionExamples['collapse'],
  combobox: comboboxExample('city', 'City', cityChoices),
  'command-palette': sheetCommandExamples['command-palette'],
  'data-table': localPatternExamples['data-table'],
  "datepicker": strictControlExamples["datepicker"]!,
  dialog: overlayExamples.dialog,
  'divider': localPatternExamples['divider'],
  drawer: overlayExamples.drawer,
  'empty-state': localPatternExamples['empty-state'],
  forms: formsExample,
  'list-group': collectionExamples['list-group'],
  menu: selectionExamples.menu,
  "navbar": adaptiveExamples["navbar"],
  "nav-overflow": strictControlExamples["nav-overflow"]!,
  "otp-input": strictControlExamples["otp-input"]!,
  pagination: collectionExamples['pagination'],
  popover: overlayExamples.popover,
  progress: loadingExamples.progress,
  "range": strictControlExamples["range"]!,
  scrollspy: selectionExamples.scrollspy,
  skeleton: loadingExamples.skeleton,
  spinner: loadingExamples.spinner,
  'status': localPatternExamples['status'],
  "strength": strictControlExamples["strength"]!,
  stepper: stepperExample,
  tab: selectionExamples.tab,
  table: chipTableExamples.table,
  'timeline': localPatternExamples['timeline'],
  toggler: togglerExample,
  toast: selectionExamples.toast,
  tooltip: overlayExamples.tooltip
}

export interface ComponentDetail {
  variants: Array<{ title: string; description: string; markup: string }>
  variables: Array<{ name: string; defaultValue: string; purpose: string }>
  keyboard: Array<{ keys: string; behavior: string }>
  guidelines: string[]
  sass?: string
}

export const componentDetails: Record<string, ComponentDetail> = {
  button: foundationDetails.button,
  alert: foundationDetails.alert,
  badge: foundationDetails.badge,
  card: foundationDetails.card,
  forms: formsDetails,
  navbar: navbarDetails,
  menu: selectionDetails.menu,
  collapse: collectionDetails['collapse'],
  dialog: overlayDetails.dialog,
  drawer: overlayDetails.drawer,
  tooltip: overlayDetails.tooltip,
  popover: overlayDetails.popover,
  carousel: carouselDetails,
  tab: selectionDetails.tab,
  toast: selectionDetails.toast,
  scrollspy: selectionDetails.scrollspy,
  accordion: navigationDetails.accordion,
  breadcrumb: collectionDetails['breadcrumb'],
  'list-group': collectionDetails['list-group'],
  pagination: collectionDetails['pagination'],
  progress: loadingDetails.progress,
  spinner: loadingDetails.spinner,
  skeleton: loadingDetails.skeleton,
  avatar: loadingDetails.avatar,
  table: chipTableDetails.table,
  "chip": strictControlDetails["chip"]!,
  stepper: stepperDetails,
  'status': localPatternDetails['status'],
  'timeline': localPatternDetails['timeline'],
  'divider': localPatternDetails['divider'],
  'empty-state': localPatternDetails['empty-state'],
  'data-table': localPatternDetails['data-table'],
  "chips": strictControlDetails["chips"]!,
  combobox: comboboxDetails,
  "datepicker": strictControlDetails["datepicker"]!,
  "otp-input": strictControlDetails["otp-input"]!,
  "range": strictControlDetails["range"]!,
  "strength": strictControlDetails["strength"]!,
  toggler: togglerDetails,
  "nav-overflow": strictControlDetails["nav-overflow"]!,
  'bottom-sheet': sheetCommandDetails['bottom-sheet'],
  'command-palette': sheetCommandDetails['command-palette']
}

export function displayName(name: string): string {
  return componentMdxMetadata(name)?.title ?? name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

export function groupFor(name: string): string {
  return Object.entries(componentGroups).find(([, names]) => (names as readonly string[]).includes(name))?.[0] ?? 'Other'
}
