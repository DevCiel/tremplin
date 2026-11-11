import { authoredComponentDetail } from '../libs/component-mdx'
import type { ComponentDetail } from './component-docs'
import { documentedTokens } from './documented-tokens'

export type LoadingTopic = 'progress' | 'spinner' | 'skeleton' | 'avatar'
const stack = (html: string) => `<div class="vstack gap-3">${html}</div>`
const row = (html: string) => `<div class="hstack flex-wrap gap-3">${html}</div>`
const dark = (html: string) => `<div data-trm-theme="dark" dir="rtl" class="p-3 rounded-5 bg-body fg-body">${html}</div>`
const progress = (name: string, value: number, classes = '', label = '', style = '') => `<div class="progress" role="progressbar" aria-label="${name}" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100" ${style ? `style="${style}"` : ''}><div class="progress-bar ${classes}" style="width: ${value}%">${label}</div></div>`
const spinner = (kind = 'border', classes = '', label = 'Loading results') => `<span class="spinner-${kind} ${classes}" role="status"><span class="visually-hidden">${label}</span></span>`
const placeholder = (classes = 'col-6', style = '') => `<span class="placeholder ${classes}"${style ? ` style="${style}"` : ''}></span>`
const shapes = (html: string, classes = '') => `<div class="${classes}" aria-hidden="true">${html}</div>`
const initials = (name: string, text: string, classes = '', style = '') => `<span class="avatar ${classes}" role="img" aria-label="${name}"${style ? ` style="${style}"` : ''}>${text}</span>`
const image = (name = 'Alex Brooks', classes = '', status = '') => `<span class="avatar ${classes}"><img class="avatar-img" src="/img/avatar-demo.svg" alt="Illustration of ${name}" width="80" height="80">${status ? `<span class="avatar-status status-${status}" role="img" aria-label="${name}: ${status}"></span>` : ''}</span>`
const members = () => initials('Alex Brooks', 'AB')+initials('Casey Davis', 'CD')+initials('Ellis Ford', 'EF')

export const loadingClasses: Record<LoadingTopic, string[]> = {
  progress: ['progress','progress-stacked','progress-bar','progress-bar-striped','progress-bar-animated'],
  spinner: ['spinner-border','spinner-grow','spinner-sm','spinner-rotate'],
  skeleton: ['placeholder','placeholder-xs','placeholder-sm','placeholder-lg','placeholder-wave','placeholder-pulse','placeholder-glow'],
  avatar: ['avatar','avatar-img','avatar-subtle','avatar-xs','avatar-sm','avatar-lg','avatar-xl','avatar-status','status-online','status-offline','status-busy','status-away','avatar-stack','avatar-stack-xs','avatar-stack-sm','avatar-stack-lg','avatar-stack-xl']
}
export const loadingAccessibility: Record<LoadingTopic, string> = {
  progress: 'Name each progress wrapper and keep aria-valuenow/min/max synchronized with its visual value. Stacked segments have their own named progressbar wrappers. Animation does not make a determinate value indeterminate or announce updates automatically.',
  spinner: 'Give a standalone spinner role=status and hidden loading text, or hide decorative spinners when adjacent status text already explains the operation. Native disabled buttons cannot be activated. Reduced motion slows border/grow; custom rotation has no automatic reduction.',
  skeleton: 'Use real placeholder classes, hide decorative shapes and keep one meaningful loading message outside the busy region. The application replaces content and clears aria-busy. Skeleton is a documentation route alias, not a core CSS class or JavaScript loader.',
  avatar: 'Give images meaningful alt text and initials a full accessible identity. Name presence indicators independently; do not communicate status only through color. Stacks are presentation, not focus managers; use native links/buttons for actual actions.'
}
export const loadingExamples: Record<LoadingTopic, string> = {
  progress: progress('Upload progress',65,'','65%'),
  spinner: spinner(),
  skeleton: '<p role="status">Loading profile...</p><div aria-label="Profile content" role="region" aria-busy="true">'+shapes(placeholder('col-8')+'<br>'+placeholder('col-6'),'placeholder-wave')+'</div>',
  avatar: '<div class="hstack gap-2" role="group" aria-label="Project members">'+members()+'</div>'
}

export const loadingDetails: Record<LoadingTopic, ComponentDetail> = {
  progress: authoredComponentDetail("progress", {
    variants: [
        { markup: stack([0, 25, 50, 75, 100].map(n => progress('Example ' + n + ' percent', n)).join('')) },
        { markup: stack('<div class="progress" role="progressbar" aria-label="Width utility example" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar w-75"></div></div>' + progress('Thin track', 25, '', '', 'height: 2px') + progress('Tall track', 25, '', '', '--trm-progress-height: 1.5rem')) },
        { markup: stack(progress('Completed upload', 75, '', '75%') + '<div><p id="progress-long-label">Uploading project assets: 5% complete</p><div class="progress" role="progressbar" aria-labelledby="progress-long-label" aria-valuenow="5" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" style="width: 5%"></div></div></div>') },
        { markup: stack(progress('Successful build', 100, 'bg-success') + progress('Storage used', 75, 'theme-warning', '75%') + progress('Files reviewed', 50, 'theme-info', '50%')) },
        { markup: '<div class="progress-stacked" id="allocation-progress"><div class="progress" role="progressbar" aria-label="Documents allocation" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100" style="width: 30%"><div class="progress-bar"></div></div><div class="progress" role="progressbar" aria-label="Media allocation" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width: 20%"><div class="progress-bar bg-info"></div></div></div><p class="mt-2 mb-0">Documents 30%; media 20%; free 50%.</p>' },
        { markup: stack(progress('Striped deployment', 45, 'progress-bar-striped') + progress('Animated deployment', 75, 'progress-bar-striped progress-bar-animated', '75%')) },
        { markup: '<p id="progress-unknown-label">Preparing the export; completion is not yet known.</p><div class="progress" role="progressbar" aria-labelledby="progress-unknown-label"><div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div></div>' },
        { markup: dark(progress('Download progress', 72, '', '72%')) }
    ], variables: documentedTokens('progress'),
    sass: `@use 'tremplin/scss/progress' with (
  $progress-tokens: (--trm-progress-height: 1.25rem, --trm-progress-border-radius: .5rem)
);`
}),
  spinner: authoredComponentDetail("spinner", {
    variants: [
        { markup: row(spinner('border', '', 'Loading account') + spinner('grow', '', 'Loading activity')) },
        { markup: row(spinner('border', 'fg-primary', 'Loading primary results') + spinner('grow', 'fg-accent', 'Loading additional results')) },
        { markup: row(spinner('border', 'spinner-sm', 'Small border loader') + spinner('grow', 'spinner-sm', 'Small grow loader') + '<span class="spinner-border" style="--trm-spinner-width: 3rem; --trm-spinner-height: 3rem" role="status"><span class="visually-hidden">Large loader</span></span>') },
        { markup: row('<button class="btn-subtle theme-inverse" type="button" disabled aria-label="Saving project..."><span class="spinner-border spinner-sm" aria-hidden="true"></span><span role="status">Saving project...</span></button><span class="badge theme-inverse"><span class="spinner-grow spinner-sm" aria-hidden="true"></span><span role="status">Syncing</span></span>') },
        { markup: '<div class="d-flex justify-content-center align-items-center gap-2"><span class="spinner-border" aria-hidden="true"></span><span role="status">Fetching results...</span></div>' },
        { markup: '<div class="hstack gap-2"><svg class="spinner-rotate" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M12 3a9 9 0 1 1-9 9"/></svg><span role="status">Loading custom view...</span></div>' },
        { markup: dark(row(spinner('border', '', 'Loading dark view') + spinner('grow', '', 'Loading dark activity'))) }
    ], variables: documentedTokens('spinner'),
    sass: `@use 'tremplin/scss/spinner' with (
  $spinner-border-tokens: (--trm-spinner-width: 1.5em, --trm-spinner-height: 1.5em),
  $spinner-grow-tokens: (--trm-spinner-width: 1.5em, --trm-spinner-height: 1.5em)
);`
}),
  skeleton: authoredComponentDetail("skeleton", {
    variants: [
        { markup: shapes(stack(placeholder('col-6') + placeholder('w-75') + placeholder('', 'width: 25%') + placeholder('col-12 placeholder-lg') + placeholder('col-12 placeholder-sm') + placeholder('col-12 placeholder-xs'))) },
        { markup: shapes(stack(placeholder('col-9') + placeholder('col-6 bg-success') + placeholder('col-6 bg-info'))) },
        { markup: shapes(stack('<div class="placeholder-wave">' + placeholder('col-12') + '</div><div class="placeholder-pulse">' + placeholder('col-8') + '</div>')) },
        { markup: '<p role="status">Preparing your report...</p><span class="placeholder-wave fg-3" aria-hidden="true">Working on it...</span>' },
        { markup: '<div class="d-flex flex-wrap gap-3"><article class="card flex-grow-1" style="flex-basis: 16rem"><div class="card-body"><h3 class="h5">Project ready</h3><p>The project details are available.</p><a class="btn-outline theme-inverse" href="/components/">Browse components</a></div></article><div class="flex-grow-1" style="flex-basis: 16rem"><p role="status">Loading another project...</p><div class="card" role="region" aria-label="Pending project" aria-busy="true"><div class="card-body" aria-hidden="true"><div class="placeholder-wave">' + placeholder('col-6') + '<br>' + placeholder('col-12') + '<br>' + placeholder('col-8') + '</div><button class="btn btn-outline theme-inverse placeholder col-6 mt-3" type="button" disabled tabindex="-1" aria-label="Project action unavailable"></button></div></div></div></div>' },
        { markup: '<p role="status" id="feed-loading-status">Loading activity feed...</p><section aria-label="Activity feed" aria-busy="true" id="feed-placeholder">' + shapes(stack(placeholder('col-4 placeholder-lg') + placeholder('col-12') + placeholder('col-9')), 'placeholder-pulse') + '</section>' },
        { markup: dark('<p role="status">Loading article...</p><div role="region" aria-label="Article content" aria-busy="true">' + shapes(placeholder('col-10'), 'placeholder-wave') + '</div>') }
    ], variables: documentedTokens('skeleton'),
    sass: `@use 'tremplin/scss/placeholder' with (
  $placeholder-tokens: (--trm-placeholder-opacity-max: .25, --trm-placeholder-opacity-min: .12),
  $placeholder-wave-tokens: (--trm-placeholder-wave-opacity-max: .9, --trm-placeholder-wave-opacity-min: .3)
);`
}),
  avatar: authoredComponentDetail("avatar", {
    variants: [
        { markup: row(image() + '<img class="avatar-img" src="/img/avatar-demo.svg" alt="Illustration of Casey Davis" width="50" height="50">') },
        { markup: row(initials('Alex Brooks', 'AB') + initials('Casey Davis', 'CD', 'theme-primary') + initials('Ellis Ford', 'EF', 'avatar-subtle theme-primary') + initials('Morgan North', 'MN', 'theme-inverse')) },
        { markup: row(['xs', 'sm', '', 'lg', 'xl'].map(s => image('Alex Brooks', s ? 'avatar-' + s : '')).join('') + initials('Large identity', 'LI', '', '--trm-avatar-size: 5rem')) },
        { markup: row(['online', 'offline', 'busy', 'away'].map((s, i) => image(['Alex Brooks', 'Casey Davis', 'Ellis Ford', 'Morgan North'][i]!, '', s)).join('')) },
        { markup: row(['xs', 'sm', '', 'lg', 'xl'].map(s => image('Alex Brooks', s ? 'avatar-' + s : '', 'online')).join('')) },
        { markup: '<div class="avatar-stack" role="group" aria-label="Project team">' + members() + '</div>' },
        { markup: stack(['xs', 'sm', 'lg', 'xl'].map(s => '<div class="avatar-stack avatar-stack-' + s + '" role="group" aria-label="' + s + ' project team">' + members() + initials('Five additional members', '+5', 'theme-inverse') + '</div>').join('')).replace('vstack gap-3', 'vstack align-items-start gap-3') },
        { markup: '<a class="d-inline-flex align-items-center gap-2 fg-body" href="/components/"><span class="avatar" aria-hidden="true">AB</span><span>Alex Brooks: browse components</span></a>' },
        { markup: dark('<div class="avatar-stack" role="group" aria-label="Dark project team">' + members() + '</div>') }
    ], variables: documentedTokens('avatar'),
    sass: `@use 'tremplin/scss/avatar' with (
  $avatar-tokens: (--trm-avatar-border-radius: .75rem),
  $avatar-sizes: (lg: (size: 3.25rem, status-size: 1rem, border-width: 3px))
);`
})
}
