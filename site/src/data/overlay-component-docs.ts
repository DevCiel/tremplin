import { authoredComponentDetail } from '../libs/component-mdx'
import type { ComponentDetail } from './component-docs'
import { documentedTokens } from './documented-tokens'

export type OverlayTopic = 'dialog' | 'drawer' | 'tooltip' | 'popover'
const button = (label: string, attrs = '') => `<button class="btn-outline theme-inverse" type="button" ${attrs}>${label}</button>`
const close = (name: 'dialog' | 'drawer', label: string) => `<button class="btn-close" type="button" data-trm-dismiss="${name}" aria-label="${label}" autofocus></button>`
const trigger = (name: 'dialog' | 'drawer', label: string, id: string, attrs = '') => button(label, `data-trm-toggle="${name}" data-trm-target="#${id}" aria-controls="${id}" ${attrs}`)
const dialog = (id: string, title: string, body: string, classes = '', attrs = '', footer = '') => `<dialog class="dialog ${classes}" id="${id}" aria-labelledby="${id}-title" tabindex="-1" ${attrs}><header class="dialog-header"><h3 class="h5 mb-0" id="${id}-title">${title}</h3>${close('dialog', 'Close '+title)}</header><div class="dialog-body">${body}</div>${footer ? `<footer class="dialog-footer">${footer}</footer>` : ''}</dialog>`
const drawer = (id: string, title: string, body: string, classes = 'drawer drawer-start', attrs = '') => `<dialog class="${classes}" id="${id}" aria-labelledby="${id}-title" tabindex="-1" ${attrs}><header class="drawer-header"><h3 class="drawer-title h5" id="${id}-title">${title}</h3>${close('drawer', 'Close '+title)}</header><div class="drawer-body">${body}</div><footer class="drawer-footer">${button('Done', 'data-trm-dismiss="drawer"')}</footer></dialog>`
const tip = (label: string, title: string, attrs = '') => button(label, `data-trm-toggle="tooltip" data-trm-title="${title}" ${attrs}`)
const pop = (label: string, title: string, content: string, attrs = '') => button(label, `data-trm-toggle="popover" data-trm-title="${title}" data-trm-content="${content}" ${attrs}`)
const dark = (id: string, html: string) => `<div id="${id}" data-trm-theme="dark" dir="rtl" class="p-3 rounded-5 bg-body fg-body">${html}</div>`
const longText = Array.from({ length: 12 }, (_, i) => `<p>Section ${i+1}: Review the workspace terms, access policy and release requirements before continuing.</p>`).join('')

export const overlayClasses: Record<OverlayTopic, string[]> = {
  dialog: ['dialog','dialog-sm','dialog-lg','dialog-xl','dialog-fullscreen','md-down:dialog-fullscreen','dialog-header','dialog-body','dialog-footer','dialog-scrollable','dialog-slide-up','dialog-slide-down','dialog-nonmodal','dialog-instant','dialog-static','dialog-swap-in','hiding'],
  drawer: ['drawer','lg:drawer','drawer-start','drawer-end','drawer-top','drawer-bottom','drawer-fullscreen','drawer-sheet','drawer-translucent','drawer-fit-content','drawer-instant','drawer-static','drawer-header','drawer-title','drawer-body','drawer-footer','hiding'],
  tooltip: ['tooltip','tooltip-arrow','tooltip-inner','tooltip-instant','show'],
  popover: ['popover','popover-arrow','popover-header','popover-body','popover-instant','show']
}
export const overlayAccessibility: Record<OverlayTopic, string> = {
  dialog: 'Use a named native dialog and an obvious dismissal control. Modal focus/inertness comes from showModal; modal=false is non-modal. Configure initial focus in markup. Data-API openers register focus return; programmatic callers own their focus policy. Cancelable show/hide differ from completion and hidePrevented notifications.',
  drawer: 'Use a named native dialog with an explicit placement and a button alternative to gestures. Modal state is backdrop || !scroll; only backdrop=false plus scroll=true is non-modal. Root scroll locking depends on scroll. Data-API triggers restore visible opener focus; responsive presentation is CSS, not a custom focus trap.',
  tooltip: 'Use a named focusable trigger and supplemental content. Default hover/focus content is connected with aria-describedby; Escape dismisses without moving focus. Floating UI and template sanitization are required parts of the implementation. Keep essential information visible outside the tip.',
  popover: 'Default click toggles a non-modal role=tooltip description and does not automatically dismiss on an outside click. A focus trigger supplies outside/focus dismissal. Escape closes without moving focus; no focus trap, roving order or automatic aria-expanded is provided. Prefer concise text and retain sanitization.'
}
export const overlayExamples: Record<OverlayTopic, string> = {
  dialog: trigger('dialog','Open dialog','confirm')+dialog('confirm','Publish project?','<p>Review the project before publishing.</p>', '', '', button('Confirm','data-trm-dismiss="dialog"')),
  drawer: trigger('drawer','Open drawer','navigation')+drawer('navigation','Navigation','<nav class="nav flex-column" aria-label="Drawer navigation"><a class="nav-link fg-body" href="/">Home</a><a class="nav-link fg-body" href="/components/">Components</a></nav>'),
  tooltip: tip('Hover or focus','Copy project link','id="example-tooltip"'),
  popover: pop('Show popover','Project status','This project is ready for review.','id="example-popover"')
}
export const overlayDetails: Record<OverlayTopic, ComponentDetail> = {
  dialog: authoredComponentDetail("dialog", {
    variants: [
        { markup: trigger('dialog', 'Open structured dialog', 'dialog-structure') + dialog('dialog-structure', 'Project review', '<p>Publishing makes this project available to the workspace.</p>', '', '', button('Finish review', 'data-trm-dismiss="dialog"')) },
        { markup: trigger('dialog', 'Review long terms', 'dialog-scroll') + dialog('dialog-scroll', 'Workspace terms', longText, 'dialog-scrollable', 'style="block-size: 24rem"', button('Finish reading', 'data-trm-dismiss="dialog"')) },
        { markup: '<div class="hstack flex-wrap gap-2">' + trigger('dialog', 'Small dialog', 'dialog-small') + trigger('dialog', 'Large dialog', 'dialog-large') + trigger('dialog', 'Responsive fullscreen', 'dialog-full') + '</div>' + dialog('dialog-small', 'Small review', '<p>Compact content.</p>', 'dialog-sm') + dialog('dialog-large', 'Large review', '<p>Wider content.</p>', 'dialog-lg') + dialog('dialog-full', 'Responsive review', '<p>Fullscreen below md.</p>', 'md-down:dialog-fullscreen') },
        { markup: trigger('dialog', 'Open inspector', 'dialog-nonmodal', 'data-trm-modal="false"') + dialog('dialog-nonmodal', 'Page inspector', '<p>Non-modal supporting information.</p>', '', '', button('Done inspecting', 'data-trm-dismiss="dialog"')) },
        { markup: trigger('dialog', 'Review unsaved changes', 'dialog-static', 'data-trm-backdrop="static" data-trm-keyboard="false"') + dialog('dialog-static', 'Unsaved changes', '<p>Choose an explicit action before leaving.</p>', '', '', button('Keep editing', 'data-trm-dismiss="dialog"')) },
        { markup: trigger('dialog', 'Start review flow', 'dialog-first') + dialog('dialog-first', 'First review', trigger('dialog', 'Continue to second review', 'dialog-second')) + dialog('dialog-second', 'Second review', '<p>The first dialog is now closed.</p>') },
        { markup: trigger('dialog', 'Open overlay review', 'dialog-overlays') + dialog('dialog-overlays', 'Overlay review', '<div class="hstack flex-wrap gap-2">' + tip('Explain review', 'Review guidance', 'id="dialog-tooltip"') + pop('Review status', 'Review status', 'Ready for review.', 'id="dialog-popover"') + '</div>') },
        { markup: '<div class="hstack flex-wrap gap-2">' + trigger('dialog', 'Instant dialog', 'dialog-instant-demo') + trigger('dialog', 'Slide up dialog', 'dialog-slide') + '</div>' + dialog('dialog-instant-demo', 'Instant review', '<p>No transition wait.</p>', 'dialog-instant') + dialog('dialog-slide', 'Slide review', '<p>CSS owns the slide transition.</p>', 'dialog-slide-up') },
        { markup: dark('dialog-dark', trigger('dialog', 'Open dark dialog', 'dialog-rtl') + dialog('dialog-rtl', 'Dark review', '<p>Review the project in a dark RTL surface.</p>', '', 'data-trm-theme="dark" dir="rtl"')) }
    ], variables: documentedTokens('dialog'),
    sass: `@use 'tremplin/scss/dialog' with (
  $dialog-tokens: (--trm-dialog-width: 36rem, --trm-dialog-footer-gap: .75rem)
);`
}),
  drawer: authoredComponentDetail("drawer", {
    variants: [
        { markup: '<div class="hstack flex-wrap gap-2">' + trigger('drawer', 'Open start drawer', 'drawer-start-demo') + trigger('drawer', 'Open end drawer', 'drawer-end-demo') + '</div>' + drawer('drawer-start-demo', 'Start panel', '<p>Navigation and supporting content.</p>') + drawer('drawer-end-demo', 'End panel', '<p>Project properties.</p>', 'drawer drawer-end', 'style="--trm-drawer-width: 22rem"') },
        { markup: '<div class="hstack flex-wrap gap-2">' + ['top', 'bottom', 'fullscreen'].map(p => trigger('drawer', 'Open ' + p + ' drawer', 'drawer-' + p + '-demo')).join('') + '</div>' + ['top', 'bottom', 'fullscreen'].map(p => drawer('drawer-' + p + '-demo', p + ' panel', '<p>Directional drawer content.</p>', 'drawer drawer-' + p)).join('') },
        { markup: trigger('drawer', 'Open bottom sheet', 'drawer-sheet-demo') + drawer('drawer-sheet-demo', 'Share project', '<p>Choose a sharing destination.</p><a class="fg-body" href="/components/">Browse components</a>', 'drawer drawer-bottom drawer-sheet') },
        { markup: trigger('drawer', 'Edit project details', 'drawer-regions') + drawer('drawer-regions', 'Edit project', '<div class="form-field"><label for="drawer-name">Project name</label><input class="form-control" id="drawer-name" value="Tremplin"></div>' + longText) },
        { markup: '<div class="hstack flex-wrap gap-2">' + trigger('drawer', 'Modal with page scrolling', 'drawer-scroll') + trigger('drawer', 'Open non-modal drawer', 'drawer-nonmodal') + '</div>' + drawer('drawer-scroll', 'Scrollable background', '<p>The background is still inert because this is modal.</p>', 'drawer drawer-end', 'data-trm-scroll="true"') + drawer('drawer-nonmodal', 'Non-modal panel', '<p>The surrounding page remains interactive.</p>', 'drawer drawer-end', 'data-trm-scroll="true" data-trm-backdrop="false"') },
        { markup: trigger('drawer', 'Open protected drawer', 'drawer-static-demo') + drawer('drawer-static-demo', 'Protected panel', '<p>Use an explicit close action.</p>', 'drawer drawer-start', 'data-trm-backdrop="static" data-trm-keyboard="false"') },
        { markup: trigger('drawer', 'Open responsive drawer', 'drawer-responsive').replace('class="btn-outline theme-inverse"', 'class="btn-outline theme-inverse lg:d-none"') + drawer('drawer-responsive', 'Responsive panel', '<p>In-flow content above lg, a Drawer below lg.</p>', 'lg:drawer drawer-end').replace('class="drawer-footer"', 'class="drawer-footer lg:d-none"') },
        { markup: dark('drawer-dark', trigger('drawer', 'Open dark drawer', 'drawer-rtl') + drawer('drawer-rtl', 'Dark navigation', '<p>Supporting content in a dark RTL panel.</p>', 'drawer drawer-start', 'data-trm-theme="dark" dir="rtl"')) }
    ], variables: documentedTokens('drawer'),
    sass: `@use 'tremplin/scss/drawer' with (
  $drawer-tokens: (--trm-drawer-width: 24rem, --trm-drawer-padding-x: 1.25rem)
);`
}),
  tooltip: authoredComponentDetail("tooltip", {
    variants: [
        { markup: '<div class="hstack flex-wrap gap-2">' + tip('Copy', 'Copy project link') + tip('Download', 'Download report') + '</div>' },
        { markup: '<div class="hstack flex-wrap gap-2">' + ['top', 'right', 'bottom', 'left'].map(p => tip(p + ' tooltip', p + ' supplemental text', `data-trm-placement="${p}"`)).join('') + '</div>' },
        { markup: tip('Responsive tooltip', 'Responsive positioning', 'data-trm-placement="top md:right lg:bottom"') },
        { markup: '<div class="tooltip tooltip-instant show position-static" role="tooltip"><div class="tooltip-inner">Keyboard shortcut: Ctrl + K</div></div>' },
        { markup: '<span class="d-inline-block" tabindex="0" role="button" aria-disabled="true" aria-label="Delete project unavailable" data-trm-toggle="tooltip" data-trm-title="Permission required"><button class="btn-outline theme-inverse" type="button" disabled style="pointer-events: none">Delete project</button></span>' },
        { markup: tip('Formatted help', '&lt;strong&gt;Review&lt;/strong&gt; before publishing', 'data-trm-html="true"') },
        { markup: tip('Instant help', 'Immediate supplemental help', 'data-trm-animation="false"') },
        { markup: dark('tooltip-dark-container', tip('Dark tooltip', 'Supplemental dark help', 'data-trm-container="#tooltip-dark-container" data-trm-placement="bottom"')) }
    ], variables: documentedTokens('tooltip'),
    sass: `@use 'tremplin/scss/tooltip' with (
  $tooltip-tokens: (--trm-tooltip-max-width: 16rem, --trm-tooltip-padding-x: .75rem)
);`
}),
  popover: authoredComponentDetail("popover", {
    variants: [
        { markup: pop('Show project status', 'Project status', 'Ready for review by the design team.') },
        { markup: '<div class="hstack flex-wrap gap-2">' + pop('Left detail', 'Left detail', 'Supporting information.', 'data-trm-placement="left"') + pop('Bottom detail', 'Bottom detail', 'Supporting information.', 'data-trm-placement="bottom"') + pop('Responsive detail', 'Responsive detail', 'Supporting information.', 'data-trm-placement="top md:right lg:bottom"') + '</div>' },
        { markup: pop('Focus for details', 'Context', 'Focus-based supporting information.', 'id="focus-popover" data-trm-trigger="focus"') },
        { markup: '<div class="popover popover-instant show position-static" role="tooltip"><h3 class="popover-header">Deployment</h3><div class="popover-body">Production was updated recently.</div></div>' },
        { markup: pop('Show release', 'Release', '&lt;strong&gt;v0.8&lt;/strong&gt; is ready', 'data-trm-html="true"') },
        { markup: '<span class="d-inline-block" tabindex="0" role="button" aria-disabled="true" aria-label="Publish unavailable" data-trm-toggle="popover" data-trm-trigger="hover focus" data-trm-title="Unavailable" data-trm-content="Review is required first."><button class="btn-outline theme-inverse" type="button" disabled style="pointer-events: none">Publish</button></span>' },
        { markup: dark('popover-dark-container', pop('Dark popover', 'Status', 'Project ready for review.', 'data-trm-container="#popover-dark-container" data-trm-placement="bottom"')) }
    ], variables: documentedTokens('popover'),
    sass: `@use 'tremplin/scss/popover' with (
  $popover-tokens: (--trm-popover-max-width: 20rem, --trm-popover-body-padding-x: 1rem)
);`
})
}
