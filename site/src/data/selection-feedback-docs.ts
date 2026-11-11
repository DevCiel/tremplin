import { authoredComponentDetail } from '../libs/component-mdx'
import type { ComponentDetail } from './component-docs'
import { documentedTokens } from './documented-tokens'

export type SelectionTopic = 'menu' | 'tab' | 'toast' | 'scrollspy'
const dark = (html: string) => `<div data-trm-theme="dark" dir="rtl" class="p-3 rounded-5 bg-body fg-body">${html}</div>`
const item = (text: string, extra = '') => `<button class="menu-item" type="button" ${extra}>${text}</button>`
const liveMenu = (label: string, id: string, body: string, attrs = '') => `<div><button class="btn-outline theme-inverse" type="button" data-trm-toggle="menu" aria-expanded="false" aria-controls="${id}" ${attrs}>${label}</button><div class="menu" id="${id}">${body}</div></div>`
const staticMenu = (body: string, classes = '', style = '') => `<div class="menu show position-static ${classes}" style="max-inline-size: 100%; ${style}">${body}</div>`
const actions = item('Rename') + item('Duplicate') + '<hr class="menu-divider">' + item('Archive unavailable', 'disabled')
// Explicit application composition: List group active colors do not consume theme-inverse.
const listContrast = ' style="--trm-list-group-active-bg: var(--trm-fg-body); --trm-list-group-active-color: var(--trm-bg-body); --trm-list-group-active-border-color: var(--trm-fg-body)"'
const tabset = (id: string, labels: string[], classes = 'nav nav-tabs', disabled = -1, instant = false) => `<div class="vstack gap-3"><div class="${classes}"${classes.includes('list-group') ? listContrast : ''} role="tablist" aria-label="${id} sections"${classes.includes('vertical') ? ' aria-orientation="vertical"' : ''}>${labels.map((label, i) => `<button class="${classes.includes('list-group') ? 'list-group-item list-group-item-action' : 'nav-link'}${i === 0 ? ' active' : ''}" type="button" role="tab" id="${id}-${i}-tab" data-trm-toggle="tab" data-trm-target="#${id}-${i}-panel" aria-controls="${id}-${i}-panel" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''}${i === disabled ? ' disabled' : ''}>${label}</button>`).join('')}</div><div class="tab-content">${labels.map((label, i) => `<section class="tab-pane${instant ? ' tab-pane-instant' : ''}${i === 0 ? ' active show' : ''}" id="${id}-${i}-panel" role="tabpanel" aria-labelledby="${id}-${i}-tab" tabindex="0">${label} content</section>`).join('')}</div></div>`
const dismiss = (label = 'Dismiss notification') => `<button class="btn-close" type="button" data-trm-dismiss="toast" aria-label="${label}"></button>`
const toast = (body: string, title = 'Tremplin', classes = '', attrs = '') => `<div class="toast show toast-instant ${classes}" role="status" aria-live="polite" aria-atomic="true" data-trm-autohide="false" ${attrs}><div class="toast-header"><strong class="me-auto fg-body">${title}</strong>${dismiss()}</div><div class="toast-body">${body}</div></div>`
const spy = (prefix: string, labels: string[], attrs = '', links = 'nav nav-pills theme-inverse', ids = labels.map((_, i) => `${prefix}-${i}`)) => `<div class="vstack gap-3"><nav id="${prefix}-nav" aria-label="${prefix} sections"><div class="${links}"${links.includes('list-group') ? listContrast : ''}>${labels.map((label, i) => `<a class="${links.includes('list-group') ? 'list-group-item list-group-item-action' : 'nav-link'}" href="#${ids[i]}">${label}</a>`).join('')}</div></nav><div id="${prefix}-content" class="border rounded-5 p-3" style="block-size: 14rem; overflow-y: auto" data-trm-spy="scroll" data-trm-target="#${prefix}-nav" tabindex="0" role="region" aria-label="${prefix} scrollable sections" ${attrs}>${labels.map((label, i) => `<section id="${ids[i]}" style="min-block-size: ${i === labels.length - 1 ? '5' : '12'}rem" tabindex="-1"><h3 class="h5">${label}</h3><p>${label} section content for this scrollable example.</p></section>`).join('')}</div></div>`

export const selectionClasses: Record<SelectionTopic, string[]> = {
  menu: ['menu', 'menu-scrollable', 'menu-translucent', 'menu-item', 'menu-item-icon', 'menu-item-content', 'menu-item-description', 'menu-item-check', 'menu-header', 'menu-divider', 'menu-text', 'submenu', 'selected', 'disabled', 'show'],
  tab: ['nav', 'nav-tabs', 'nav-pills', 'nav-pills-vertical', 'nav-underline', 'nav-fill', 'nav-justified', 'nav-link', 'tab-content', 'tab-pane', 'tab-pane-instant', 'active', 'show', 'disabled'],
  toast: ['toast-container', 'toast', 'toast-header', 'toast-body', 'toast-translucent', 'toast-instant', 'show'],
  scrollspy: ['nav', 'nav-link', 'nav-pills', 'list-group', 'list-group-item', 'active']
}
export const selectionAccessibility: Record<SelectionTopic, string> = {
  menu: 'Author named native toggles and appropriate content semantics. Menu synchronizes expanded state, supports enabled-item arrows/Home/End and logical submenu keys, and returns focus on Escape. It supplies no typeahead or automatic application-menu roles; unavailable anchors need guarded destinations.',
  tab: 'Author unique trigger/panel IDs, aria-controls, aria-labelledby, initial selection and focusable panels. Tab initializes missing roles and roving tabindex, and supports unmodified arrows/Home/End in DOM order; horizontal arrows are not reversed for RTL.',
  toast: 'Create the live region before updates and choose polite status or urgent alert semantics. Initialize and show notifications explicitly; give persistent/actionable messages sufficient time and a named dismissal control. Autohide pauses during hover/focus; no focus move or automatic restoration is supplied.',
  scrollspy: 'Use resolvable fragment links and a named keyboard-focusable scrolling region. Scrollspy changes active classes, not aria-current. Optional smooth navigation settles the hash and focuses the section; ordinary scrolling does not move focus.'
}
export const selectionExamples: Record<SelectionTopic, string> = {
  menu: liveMenu('Actions', 'example-actions', '<a class="menu-item" href="/getting-started/install/">Edit</a>'+item('Duplicate')),
  tab: '<div class="nav nav-tabs" role="tablist" aria-label="Profile sections"><button class="nav-link active" id="profile-tab" type="button" data-trm-toggle="tab" data-trm-target="#profile" role="tab" aria-controls="profile" aria-selected="true">Profile</button><button class="nav-link" id="settings-tab" type="button" data-trm-toggle="tab" data-trm-target="#settings" role="tab" aria-controls="settings" aria-selected="false" tabindex="-1">Settings</button></div><div class="tab-content p-3"><section class="tab-pane active show" id="profile" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">Profile content</section><section class="tab-pane" id="settings" role="tabpanel" aria-labelledby="settings-tab" tabindex="0">Settings content</section></div>',
  toast: `<div class="toast-container position-static">${toast('Your changes were saved.', 'Saved', '', 'id="example-toast"').replace('aria-label="Dismiss notification"', 'aria-label="Dismiss"')}</div>`,
  scrollspy: spy('section', ['Overview', 'Details'], '', 'nav nav-pills theme-inverse', ['overview', 'details'])
}
export const toastDemoJavascript = `import Toast from 'tremplin/toast'

// Application wiring for the documented button, not a framework show attribute.
const trigger = document.querySelector('[data-docs-toast-show]')
const element = document.querySelector('#demo-live-toast')
const notification = Toast.getOrCreateInstance(element)
trigger.addEventListener('click', () => notification.show())`

export const selectionDetails: Record<SelectionTopic, ComponentDetail> = {
  menu: authoredComponentDetail("menu", {
    variants: [
        { markup: staticMenu(actions + '<a class="menu-item disabled" role="link" aria-disabled="true" tabindex="-1">Unavailable destination</a>') },
        { markup: staticMenu('<h3 class="menu-header fg-body">Share project</h3>' + item('<span class="menu-item-content"><strong>Copy link</strong><span class="menu-item-description fg-body">Anyone with the link can view</span></span>') + '<span class="menu-text fg-body">Choose how to share.</span>') },
        { markup: liveMenu('Choose country', 'countries-menu', ['France', 'Germany', 'India', 'Japan', 'United Kingdom'].map(x => item(x)).join('')).replace('class="menu" id="countries-menu"', 'class="menu menu-scrollable" id="countries-menu" style="--trm-menu-max-height: 9rem"') },
        { markup: liveMenu('Project menu', 'project-menu', item('Download') + '<div class="submenu"><button class="menu-item" type="button" aria-expanded="false" aria-controls="share-menu">Share</button><div class="menu" id="share-menu">' + item('Copy project link') + item('Email project') + '</div></div>', 'data-trm-submenu-trigger="click"') },
        { markup: '<div class="hstack flex-wrap gap-2">' + [['Default close', 'true'], ['Inside close', 'inside'], ['Outside close', 'outside'], ['Manual close', 'false']].map(([label, policy], i) => liveMenu(label!, `policy-menu-${i}`, item('Choose option'), `data-trm-auto-close="${policy}"`)).join('') + '</div>' },
        { markup: liveMenu('Responsive placement', 'responsive-menu', actions, 'data-trm-placement="bottom-start md:end"') },
        { markup: liveMenu('Notification options', 'form-menu', '<form class="p-2"><div class="form-field"><input class="check" type="checkbox" id="menu-email"><label for="menu-email">Email notifications</label></div></form>') },
        { markup: staticMenu(item('Compact view <span class="menu-item-check" aria-hidden="true">✓</span>', 'aria-pressed="true"').replace('class="menu-item"', 'class="menu-item selected"') + item('Comfortable view', 'aria-pressed="false"'), 'menu-translucent') },
        { markup: dark(staticMenu(item('Rename project') + item('Duplicate project'))) }
    ],
    variables: documentedTokens('menu'),
    sass: `@use 'tremplin/scss/menu' with (
  $menu-tokens: (
    --trm-menu-padding-x: .5rem,
    --trm-menu-item-padding-y: .375rem
  )
);`
}),
  tab: authoredComponentDetail("tab", {
    variants: [
        { markup: '<div class="nav nav-tabs" role="tablist" aria-label="Account sections">' + ['Account', 'Security', 'Billing'].map((label, i) => { const id = label.toLowerCase(); return `<button class="nav-link${i === 0 ? ' active' : ''}" id="${id}-tab" data-trm-toggle="tab" data-trm-target="#${id}-panel" type="button" role="tab" aria-controls="${id}-panel" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''}>${label}</button>`; }).join('') + '</div><div class="tab-content p-3">' + ['Account', 'Security', 'Billing'].map((label, i) => `<section class="tab-pane${i === 0 ? ' active show' : ''}" id="${label.toLowerCase()}-panel" role="tabpanel" aria-labelledby="${label.toLowerCase()}-tab" tabindex="0">${label} settings</section>`).join('') + '</div>' },
        { markup: tabset('activity', ['Daily', 'Weekly'], 'nav nav-pills theme-inverse') },
        { markup: tabset('team', ['Personal', 'Team'], 'nav nav-pills nav-pills-vertical theme-inverse') },
        { markup: tabset('project', ['Overview', 'Activity', 'Archived'], 'nav nav-underline', 2) },
        { markup: tabset('list-tabs', ['Design', 'Build'], 'list-group theme-inverse') },
        { markup: tabset('instant', ['Preview', 'Source'], 'nav nav-tabs', -1, true) },
        { markup: dark(tabset('rtl-tabs', ['Summary', 'Preferences'])) }
    ], variables: documentedTokens('tab'),
    sass: `@use 'tremplin/scss/nav' with (
  $nav-tabs-tokens: (--trm-nav-tabs-border-radius: .5rem),
  $tab-pane-tokens: (--trm-tab-pane-transition-duration: .2s)
);`
}),
  toast: authoredComponentDetail("toast", {
    variants: [
        { markup: toast('Your project was saved successfully.') },
        { markup: '<button class="btn-outline theme-inverse" id="show-live-toast" type="button" data-docs-toast-show="#demo-live-toast">Show live toast</button><div aria-live="polite" aria-atomic="true" class="mt-3"><div class="toast" id="demo-live-toast" role="status" aria-live="polite" aria-atomic="true" data-trm-delay="5000"><div class="toast-header"><strong class="me-auto fg-body">Notification</strong>' + dismiss('Dismiss live notification') + '</div><div class="toast-body">A live update is ready.</div></div></div>' },
        { markup: '<div class="vstack gap-3">' + toast('Changes saved successfully.', 'Saved', 'theme-success') + toast('Upload failed. Review the persistent error details.', 'Upload issue', 'theme-danger').replace('role="status" aria-live="polite"', 'role="alert" aria-live="assertive"') + '</div>' },
        { markup: toast('<p>Review the installation instructions when convenient.</p><a class="fg-body" href="/getting-started/install/">Open installation guide</a>') },
        { markup: '<div aria-live="polite" aria-atomic="true"><div class="toast-container position-static">' + toast('Ana joined the project.', 'Team update') + toast('Review requested.', 'Review update') + '</div></div>' },
        { markup: toast('Backdrop blur with immediate state changes.', 'Instant notification', 'toast-translucent') },
        { markup: '<div class="position-relative border rounded-5" style="min-block-size: 12rem"><div class="toast-container bottom-0 end-0 p-3">' + toast('Positioned inside this example.', 'Placement') + '</div></div>' },
        { markup: dark(toast('Your project changes were saved.', 'Saved in RTL')) }
    ], variables: documentedTokens('toast'),
    sass: `@use 'tremplin/scss/toasts' with (
  $toast-tokens: (
    --trm-toast-max-width: 24rem,
    --trm-toast-transition-duration: .2s
  )
);`
}),
  scrollspy: authoredComponentDetail("scrollspy", {
    variants: [
        { markup: spy('guide-spy', ['Overview', 'Details', 'Launch'], 'data-trm-top-margin="12%"', 'nav nav-pills theme-inverse', ['guide-overview', 'guide-details', 'guide-launch']) },
        { markup: spy('smooth-spy', ['Introduction', 'API', 'Accessibility'], 'data-trm-smooth-scroll="true"', 'nav nav-pills theme-inverse', ['smooth-intro', 'smooth-api', 'smooth-accessibility']) },
        { markup: '<nav id="nested-spy-nav" aria-label="Nested guide sections"><div class="nav flex-column"><a class="nav-link" href="#nested-start">Getting started</a><div class="nav flex-column ps-3"><a class="nav-link" href="#nested-install">Install</a><a class="nav-link" href="#nested-bundle">Bundle</a></div></div></nav><div id="nested-spy-content" class="border rounded-5 p-3" style="block-size: 14rem; overflow-y: auto" data-trm-spy="scroll" data-trm-target="#nested-spy-nav" tabindex="0" role="region" aria-label="Nested scrollable sections">' + [['nested-start', 'Getting started'], ['nested-install', 'Install'], ['nested-bundle', 'Bundle']].map(([id, label]) => `<section id="${id}" style="min-block-size: 12rem" tabindex="-1"><h3 class="h5">${label}</h3><p>Visible ${label} content.</p></section>`).join('') + '</div>' },
        { markup: spy('list-spy', ['Design', 'Build', 'Release'], 'data-trm-smooth-scroll="true"', 'list-group theme-inverse') },
        { markup: spy('pixel-spy', ['Plan', 'Implementation', 'Release'], 'data-trm-top-margin="48px"') },
        { markup: dark(spy('rtl-spy', ['Summary', 'Details'], 'data-trm-smooth-scroll="true"')) }
    ], variables: documentedTokens('scrollspy'),
    sass: `@use 'tremplin/scss/nav' with (
  $nav-tokens: (--trm-nav-link-padding-y: .5rem)
);`
})
}
