import { authoredComponentDetail } from '../libs/component-mdx'
import type { ComponentDetail } from './component-docs'
import { documentedTokens } from './documented-tokens'

export type NavigationTopic = 'button-group' | 'close-button' | 'nav' | 'accordion'
const dark = (markup: string) => `<div data-trm-theme="dark" dir="rtl" class="p-3 rounded-5 bg-body fg-body">${markup}</div>`
const row = 'hstack flex-wrap align-items-start gap-3'
const button = (label: string, classes = 'btn-outline theme-inverse') => `<button type="button" class="${classes}">${label}</button>`
const group = (label: string, classes = 'btn-group', style = 'btn-outline theme-inverse') => `<div class="${classes}" role="group" aria-label="${label}">${['Start', 'Center', 'End'].map(text => button(text, style)).join('')}</div>`
const links = '<a class="nav-link active" href="/components/" aria-current="page">Overview</a><a class="nav-link" href="/components/card/">Cards</a><a class="nav-link" href="/components/button/">Buttons</a>'
const nav = (label: string, classes = 'nav') => `<nav class="${classes}" aria-label="${label}">${links}</nav>`
const menu = (label: string, id: string, classes: string) => `<button type="button" class="${classes}" id="${id}" data-trm-toggle="menu" aria-haspopup="menu" aria-expanded="false">${label}</button><div class="menu" role="menu" aria-labelledby="${id}"><a class="menu-item" role="menuitem" href="/getting-started/install/">Installation</a><a class="menu-item" role="menuitem" href="/components/menu/">Menu guide</a></div>`
const chevron = '<svg class="accordion-icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m2 5 6 6 6-6"></path></svg>'
const item = (label: string, body: string, attrs = '') => `<details class="accordion-item" ${attrs}><summary class="accordion-header">${label}${chevron}</summary><div class="accordion-body">${body}</div></details>`
const accordion = (name: string, label: string, classes = 'accordion') => `<div class="${classes}">${item(label + ' one', 'Content remains normal HTML inside the panel.', `name="${name}" open`)}${item(label + ' two', 'Opening this panel closes its named sibling.', `name="${name}"`)}</div>`

export const navigationClasses: Record<NavigationTopic, string[]> = {
  'button-group': ['btn-group', 'btn-group-vertical', 'btn-group-divider', 'btn-group-xs', 'btn-group-sm', 'btn-group-lg', 'btn-toolbar', 'btn-check'],
  'close-button': ['btn-close'],
  nav: ['nav', 'nav-item', 'nav-link', 'nav-tabs', 'nav-pills', 'nav-pills-vertical', 'nav-underline', 'nav-fill', 'nav-justified'],
  accordion: ['accordion', 'accordion-item', 'accordion-header', 'accordion-icon', 'accordion-body', 'accordion-sm', 'accordion-flush', 'accordion-gap']
}
export const navigationAccessibility: Record<NavigationTopic, string> = {
  'button-group': 'Name groups and toolbars. Native buttons, checkboxes and same-name radios retain their own keyboard behavior; group CSS does not supply roving focus. Nested menus require Menu JavaScript.',
  'close-button': 'Use an empty, named native type=button. The CSS mask supplies the icon, not dismissal or focus restoration; connect an explicit supported action. Native disabled prevents user activation.',
  nav: 'Name navigation landmarks and use aria-current for the current destination. Ordinary links are not ARIA tabs; disabled links need no destination or an actual activation guard. Menus require Menu JavaScript.',
  accordion: 'Use native details/summary with visible labels. Matching, example-specific name values create exclusive groups; omit name for independent panels. Expanded state and keyboard activation are native, not Collapse JavaScript.'
}
export const navigationExamples: Record<NavigationTopic, string> = {
  'button-group': group('Document actions'),
  'close-button': '<button class="btn-close" type="button" aria-label="Close example"></button>',
  nav: nav('Project sections'),
  accordion: `<div class="accordion">${item('Account settings', 'Update your profile and notification preferences.', 'name="account-guide-main" open')}${item('Security settings', 'Review password and passkey controls.', 'name="account-guide-main"')}</div>`
}

export const navigationDetails: Record<NavigationTopic, ComponentDetail> = {
  'button-group': authoredComponentDetail("button-group", {
    variants: [
        { markup: `<div class="${row}">${group('Solid controls', 'btn-group btn-group-divider', 'btn-solid theme-inverse')}${group('Subtle controls', 'btn-group btn-group-divider', 'btn-subtle theme-inverse')}</div>` },
        { markup: `<div class="vstack align-items-start gap-3">${(['xs', 'sm', '', 'lg'] as const).map(size => group((size || 'Default') + ' actions', 'btn-group' + (size ? ' btn-group-' + size : ''))).join('')}</div>` },
        { markup: '<div class="btn-group" role="group" aria-label="Formatting options"><label class="btn-check btn-outline theme-inverse"><input type="checkbox" name="format-bold"> Bold</label><label class="btn-check btn-outline theme-inverse"><input type="checkbox" name="format-italic"> Italic</label><label class="btn-check btn-outline theme-inverse"><input type="checkbox" disabled> Locked</label></div>' },
        { markup: '<div class="btn-group" role="group" aria-label="Text alignment"><label class="btn-check btn-outline theme-inverse"><input type="radio" name="group-alignment" value="start" checked> Align start</label><label class="btn-check btn-outline theme-inverse"><input type="radio" name="group-alignment" value="center"> Align center</label><label class="btn-check btn-outline theme-inverse"><input type="radio" name="group-alignment" value="end"> Align end</label></div>' },
        { markup: `<div class="btn-toolbar" role="toolbar" aria-label="Document toolbar"><div class="btn-group" role="group" aria-label="History">${button('Undo')}${button('Redo')}</div><div class="input-group" style="max-inline-size: 14rem"><span class="input-group-text" id="group-page-prefix">Page</span><input class="form-control" type="text" aria-label="Page number" aria-describedby="group-page-prefix" value="1"></div>${button('Save document')}</div>` },
        { markup: `<div class="btn-group" role="group" aria-label="Publishing actions">${button('Save draft')}<div class="btn-group" role="group" aria-label="Additional actions">${menu('More actions', 'group-menu-trigger', 'btn-outline theme-inverse')}</div></div>` },
        { markup: `<div class="${row}">${group('Vertical actions', 'btn-group-vertical btn-group-divider', 'btn-solid theme-inverse')}<nav class="btn-group" aria-label="Related guides"><a class="btn-outline theme-inverse active" href="/components/button-group/" aria-current="page">Groups</a><a class="btn-outline theme-inverse" href="/components/button/">Buttons</a></nav></div>` },
        { markup: dark(group('RTL actions')) }
    ],
    variables: documentedTokens('button-group'),
    sass: `@use 'tremplin/scss/buttons/button' with (
  $button-tokens: (--trm-btn-border-radius: .5rem)
);
@use 'tremplin/scss/buttons/button-group';`
}),
  'close-button': authoredComponentDetail("close-button", {
    variants: [
        { markup: '<button class="btn-close" type="button" aria-label="Unavailable close action" disabled></button>' },
        { markup: '<div class="alert" role="status" id="reference-close-alert"><p>A dismissible example.</p><button class="btn-close ms-auto" type="button" data-trm-dismiss="alert" aria-label="Dismiss example message"></button></div>' },
        { markup: '<button class="btn-close" type="button" aria-label="Close larger example" style="--trm-btn-close-size: 1.5rem; --trm-btn-close-opacity: .8"></button>' },
        { markup: dark('<div class="hstack gap-3"><button class="btn-close" type="button" aria-label="Close dark example"></button><button class="btn-close" type="button" aria-label="Unavailable dark close" disabled></button></div>') }
    ],
    variables: documentedTokens('close-button'),
    sass: `@use 'tremplin/scss/buttons/close' with (
  $btn-close-tokens: (
    --trm-btn-close-size: 1.5rem,
    --trm-btn-close-opacity: .8
  )
);`
}),
  nav: authoredComponentDetail("nav", {
    variants: [
        { markup: '<nav aria-label="List navigation"><ul class="nav"><li class="nav-item"><a class="nav-link active" href="/components/nav/" aria-current="page">Nav</a></li><li class="nav-item"><a class="nav-link" href="/components/tab/">Tab plugin</a></li><li class="nav-item"><a class="nav-link disabled" role="link" aria-disabled="true" tabindex="-1">Unavailable destination</a></li></ul></nav>' },
        { markup: nav('Tab-styled links', 'nav nav-tabs') },
        { markup: nav('Pill links', 'nav nav-pills theme-inverse') },
        { markup: `<div class="vstack align-items-start gap-3">${nav('Vertical pill links', 'nav nav-pills nav-pills-vertical theme-inverse')}${nav('Underline links', 'nav nav-underline')}</div>` },
        { markup: '<div class="vstack gap-3"><nav class="nav nav-fill" aria-label="Fill links"><a class="nav-link active" aria-current="page" href="/components/">Overview</a><a class="nav-link" href="/getting-started/install/">Longer installation guide</a></nav><nav class="nav nav-justified" aria-label="Justified links"><a class="nav-link active" aria-current="page" href="/components/">Overview</a><a class="nav-link" href="/getting-started/install/">Longer installation guide</a></nav></div>' },
        { markup: nav('Responsive links', 'nav flex-column sm:flex-row justify-content-center') },
        { markup: `<nav class="nav nav-tabs" aria-label="Navigation with menu"><a class="nav-link active" href="/components/nav/" aria-current="page">Nav guide</a><div class="nav-item">${menu('More sections', 'nav-menu-trigger', 'nav-link')}</div></nav>` },
        { markup: dark(nav('Dark RTL links', 'nav nav-pills theme-inverse')) }
    ],
    variables: documentedTokens('nav'),
    sass: `@use 'tremplin/scss/nav' with (
  $nav-tokens: (--trm-nav-link-padding-x: 1rem),
  $nav-pills-tokens: (--trm-nav-pills-border-radius: .75rem)
);`
}),
  accordion: authoredComponentDetail("accordion", {
    variants: [
        { markup: `<div class="accordion theme-inverse">${item('Project overview', 'Goals, owners, and delivery milestones.', 'id="project-overview" name="project-guide" open')}${item('Access control', 'Roles and workspace permissions.', 'id="project-access" name="project-guide"')}</div>` },
        { markup: accordion('compact-guide', 'Compact item', 'accordion accordion-sm') },
        { markup: accordion('flush-guide', 'Flush item', 'accordion accordion-flush') },
        { markup: accordion('gap-guide', 'Gapped item', 'accordion accordion-gap') },
        { markup: `<div class="accordion">${item('Independent one', 'This panel can remain open.', 'open')}${item('Independent two', 'Opening this panel does not close its sibling.')}</div>` },
        { markup: `<div class="accordion">${item('Parent one', 'Child panels belong to a separate named group.' + accordion('nested-inner-guide', 'Child item', 'accordion mt-3'), 'name="nested-outer-guide" open')}${item('Parent two', 'This is the other outer panel.', 'name="nested-outer-guide"')}</div>` },
        { markup: dark(accordion('dark-guide', 'RTL item')) }
    ],
    variables: documentedTokens('accordion'),
    sass: `@use 'tremplin/scss/accordion' with (
  $accordion-tokens: (
    --trm-accordion-border-radius: .75rem,
    --trm-accordion-padding-x: 1rem
  )
);`
})
}
