import { authoredComponentDetail } from '../libs/component-mdx'
import type { ComponentDetail } from './component-docs'
import { documentedTokens } from './documented-tokens'

export type CollectionTopic = 'breadcrumb' | 'list-group' | 'pagination' | 'collapse'
const dark = (html: string) => `<div data-trm-theme="dark" dir="rtl" class="p-3 rounded-5 bg-body fg-body">${html}</div>`
const divider = (content = '') => `<li class="breadcrumb-divider" aria-hidden="true" role="presentation">${content}</li>`
const trail = (label: string, separator = '', current = 'Docs') => `<nav aria-label="${label}"><ol class="breadcrumb"><li class="breadcrumb-item"><a class="breadcrumb-link fg-body" href="/">Home</a></li>${divider(separator)}<li class="breadcrumb-item"><a class="breadcrumb-link fg-body" href="/components/">Components</a></li>${divider(separator)}<li class="breadcrumb-item" aria-current="page"><span class="breadcrumb-link active">${current}</span></li></ol></nav>`
const trigger = (label: string, target: string, controls = target.replaceAll('#', '').replaceAll(',', ''), open = false) => `<button class="btn-outline theme-inverse" type="button" data-trm-toggle="collapse" data-trm-target="${target}" aria-controls="${controls}" aria-expanded="${open}">${label}</button>`
const panel = (id: string, body: string, attrs = '', open = false) => `<div class="collapse${open ? ' show' : ''}" id="${id}" ${attrs}><div class="card card-body mt-2">${body}</div></div>`
const pagination = (label: string, classes = 'pagination theme-inverse', current = 1, boundaries = false) => `<nav aria-label="${label}"><ul class="${classes}">${boundaries ? '<li class="page-item disabled"><a class="page-link" role="link" aria-disabled="true" tabindex="-1">Previous</a></li>' : ''}${[1, 2, 3].map(n => `<li class="page-item${n === current ? ' active' : ''}"><a class="page-link" href="/components/pagination/?page=${n}"${n === current ? ' aria-current="page"' : ''}>${n}</a></li>`).join('')}${boundaries ? '<li class="page-item"><a class="page-link" href="/components/pagination/?page=2">Next</a></li>' : ''}</ul></nav>`

export const collectionClasses: Record<CollectionTopic, string[]> = {
  breadcrumb: ['breadcrumb', 'breadcrumb-item', 'breadcrumb-link', 'breadcrumb-divider', 'active'],
  'list-group': ['list-group', 'list-group-flush', 'list-group-numbered', 'list-group-horizontal', 'sm:list-group-horizontal', 'md:list-group-horizontal', 'lg:list-group-horizontal', 'xl:list-group-horizontal', '2xl:list-group-horizontal', 'list-group-item', 'list-group-item-action', 'active', 'disabled'],
  pagination: ['pagination', 'pagination-sm', 'pagination-lg', 'page-item', 'page-link', 'active', 'disabled'],
  collapse: ['collapse', 'collapse-horizontal', 'show']
}
export const collectionAccessibility: Record<CollectionTopic, string> = {
  breadcrumb: 'Name the navigation and ordered hierarchy. Use explicit breadcrumb-link and decorative breadcrumb-divider elements; authored aria-hidden excludes separators. Mark one current item with aria-current=page.',
  'list-group': 'Choose real list, navigation or control semantics. Native inputs retain selection behavior; CSS active state supplies no controller. Use native disabled or remove/guard unavailable link destinations. Responsive horizontal variants need a query container.',
  pagination: 'Name the result navigation, mark one current page and guard disabled destinations. CSS supplies connected link styles, not data fetching or application page state.',
  collapse: 'Use named native buttons, matching aria-controls/targets and initial expanded state. Collapse changes show and aria-expanded, emits cancelable start events and completion notifications; it supplies no accordion arrow-key or automatic focus-restoration policy.'
}
export const collectionExamples: Record<CollectionTopic, string> = {
  breadcrumb: trail('Breadcrumb'),
  'list-group': '<nav aria-label="Workspace sections"><div class="list-group"><a class="list-group-item list-group-item-action active" href="/components/list-group/" aria-current="true">Overview</a><a class="list-group-item list-group-item-action" href="/getting-started/install/">Installation</a></div></nav>',
  pagination: pagination('Results pages'),
  collapse: trigger('Show details', '#details') + panel('details', 'Additional project details.')
}

export const collectionDetails: Record<CollectionTopic, ComponentDetail> = {
  breadcrumb: authoredComponentDetail("breadcrumb", {
    variants: [
        { markup: trail('Slash breadcrumb', '/', 'Breadcrumb') },
        { markup: trail('SVG breadcrumb', '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" aria-hidden="true" focusable="false"><path d="m5 3 5 5-5 5"></path></svg>', 'Examples') },
        { markup: `<div style="--trm-breadcrumb-divider-width: .5rem; --trm-breadcrumb-divider-height: 1rem">${trail('Sized breadcrumb', '', 'Tokens')}</div>` },
        { markup: '<nav aria-label="Long breadcrumb"><ol class="breadcrumb"><li class="breadcrumb-item"><a class="breadcrumb-link fg-body" href="/">Organization</a></li>' + divider() + '<li class="breadcrumb-item"><a class="breadcrumb-link fg-body" href="/components/">Design systems</a></li>' + divider() + '<li class="breadcrumb-item" aria-current="page"><span class="breadcrumb-link active">Accessibility</span></li></ol></nav>' },
        { markup: dark(trail('RTL breadcrumb', '&#8249;', 'Current page')) }
    ],
    variables: documentedTokens('breadcrumb'),
    sass: `@use 'tremplin/scss/breadcrumb' with (
  $breadcrumb-tokens: (
    --trm-breadcrumb-divider-margin-x: .25rem,
    --trm-breadcrumb-link-padding-x: .5rem
  )
);`
}),
  'list-group': authoredComponentDetail("list-group", {
    variants: [
        { markup: '<div class="vstack gap-3"><ul class="list-group"><li class="list-group-item">Design</li><li class="list-group-item">Build</li></ul><ul class="list-group list-group-flush"><li class="list-group-item">Documentation</li><li class="list-group-item">Examples</li></ul></div>' },
        { markup: '<div class="list-group" role="group" aria-label="Project actions"><a class="list-group-item list-group-item-action" href="/components/">Open dashboard</a><button class="list-group-item list-group-item-action" type="button">Duplicate project</button><button class="list-group-item list-group-item-action" type="button" disabled>Delete project</button><a class="list-group-item list-group-item-action disabled" role="link" aria-disabled="true" tabindex="-1">Archived project</a></div>' },
        { markup: '<ol class="list-group list-group-numbered"><li class="list-group-item"><strong>Install Tremplin</strong><p class="mb-0 fg-body">Import the package stylesheet.</p></li><li class="list-group-item"><strong>Review tasks</strong> <span class="badge theme-inverse">4<span class="visually-hidden"> pending tasks</span></span></li></ol>' },
        { markup: '<div class="contains-inline"><ul class="list-group sm:list-group-horizontal"><li class="list-group-item flex-fill">Design</li><li class="list-group-item flex-fill">Build</li><li class="list-group-item flex-fill">Ship</li></ul></div>' },
        { markup: '<ul class="list-group"><li class="list-group-item theme-success">Deployment succeeded</li><li class="list-group-item theme-warning">Review pending</li></ul>' },
        { markup: '<div class="vstack gap-3"><ul class="list-group"><li class="list-group-item"><div class="form-field"><input class="check" type="checkbox" id="list-updates"><label for="list-updates">Email updates</label></div></li><li class="list-group-item"><div class="form-field"><input class="check" type="checkbox" id="list-locked" disabled><label for="list-locked">Locked updates</label></div></li></ul><ul class="list-group"><li class="list-group-item"><div class="form-field"><input class="radio" type="radio" id="list-mode-one" name="list-mode" checked><label for="list-mode-one">Compact mode</label></div></li><li class="list-group-item"><div class="form-field"><input class="radio" type="radio" id="list-mode-two" name="list-mode"><label for="list-mode-two">Detailed mode</label></div></li></ul></div>' },
        { markup: dark('<nav aria-label="Dark workspace"><div class="list-group"><a class="list-group-item list-group-item-action active" href="/components/list-group/" aria-current="true">Current workspace</a><a class="list-group-item list-group-item-action" href="/components/">Components</a></div></nav>') }
    ],
    variables: documentedTokens('list-group'),
    sass: `@use 'tremplin/scss/list-group' with (
  $list-group-tokens: (
    --trm-list-group-border-radius: .75rem,
    --trm-list-group-item-padding-y: 1rem
  )
);`
}),
  pagination: authoredComponentDetail("pagination", {
    variants: [
        { markup: pagination('Search results pages', 'pagination theme-inverse', 1, true) },
        { markup: '<div class="vstack gap-3">' + pagination('Compact pages', 'pagination pagination-sm theme-inverse', 2) + pagination('Default pages', 'pagination theme-inverse', 2) + pagination('Large pages', 'pagination pagination-lg theme-inverse', 2) + '</div>' },
        { markup: '<nav aria-label="Article pages"><ul class="pagination theme-inverse"><li class="page-item"><a class="page-link" href="/components/pagination/?page=4" aria-label="Previous page"><span aria-hidden="true">&#8249;</span></a></li><li class="page-item active"><a class="page-link" href="/components/pagination/?page=5" aria-current="page">5</a></li><li class="page-item"><a class="page-link" href="/components/pagination/?page=6" aria-label="Next page"><span aria-hidden="true">&#8250;</span></a></li></ul></nav>' },
        { markup: '<div class="vstack gap-3">' + pagination('Centered pages', 'pagination theme-inverse justify-content-center flex-wrap', 2) + pagination('End-aligned pages', 'pagination theme-inverse justify-content-end flex-wrap', 2) + '</div>' },
        { markup: '<nav aria-label="Static current page"><ul class="pagination theme-inverse"><li class="page-item active"><span class="page-link" aria-current="page">1</span></li><li class="page-item"><a class="page-link" href="/components/pagination/?page=2">2</a></li></ul></nav>' },
        { markup: dark(pagination('RTL results', 'pagination theme-inverse', 2)) }
    ],
    variables: documentedTokens('pagination'),
    sass: `@use 'tremplin/scss/pagination' with (
  $pagination-tokens: (
    --trm-pagination-border-radius: .5rem,
    --trm-pagination-padding-x: .875rem
  )
);`
}),
  collapse: authoredComponentDetail("collapse", {
    variants: [
        { markup: trigger('Project details', '#collapse-project') + panel('collapse-project', 'Project ownership and delivery status.') },
        { markup: trigger('Release notes', '#collapse-open', 'collapse-open', true) + panel('collapse-open', 'This panel starts open.', '', true) },
        { markup: trigger('Toggle width', '#collapse-horizontal') + '<div style="min-block-size: 8rem"><div class="collapse collapse-horizontal" id="collapse-horizontal"><div class="card card-body mt-2" style="inline-size: 14rem">A compact horizontal panel.</div></div></div>' },
        { markup: '<div class="hstack flex-wrap gap-2">' + trigger('Toggle first panel', '#collapse-first') + trigger('Toggle second panel', '#collapse-second') + trigger('Toggle both panels', '#collapse-first, #collapse-second', 'collapse-first collapse-second') + '</div>' + panel('collapse-first', 'First target.') + panel('collapse-second', 'Second target.') },
        { markup: '<div id="collapse-parent">' + trigger('Account', '#collapse-one', 'collapse-one', true) + panel('collapse-one', 'Account preferences.', 'data-trm-parent="#collapse-parent"', true) + trigger('Notifications', '#collapse-two') + panel('collapse-two', 'Notification preferences.', 'data-trm-parent="#collapse-parent"') + '</div>' },
        { markup: '<div id="collapse-nested-parent">' + trigger('Outer one', '#collapse-outer-one', 'collapse-outer-one', true) + panel('collapse-outer-one', trigger('Nested details', '#collapse-nested-child') + panel('collapse-nested-child', 'Nested content.'), 'data-trm-parent="#collapse-nested-parent"', true) + trigger('Outer two', '#collapse-outer-two') + panel('collapse-outer-two', 'Second outer panel.', 'data-trm-parent="#collapse-nested-parent"') + '</div>' },
        { markup: dark(trigger('RTL details', '#collapse-rtl', 'collapse-rtl', true) + panel('collapse-rtl', 'The project is ready for review.', '', true)) }
    ],
    variables: documentedTokens('collapse'),
    sass: `@use 'tremplin/scss/transitions' with (
  $collapse-tokens: (
    --trm-transition-collapse-duration: .25s,
    --trm-transition-collapse-timing: ease-out
  )
);`
})
}
