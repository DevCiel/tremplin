import { authoredComponentDetail, componentNarrative } from '../libs/component-mdx'
import type { ComponentDetail } from './component-docs'
import { documentedTokens } from './documented-tokens'

export type AdaptiveTopic = 'navbar' | 'nav-overflow' | 'toggler'
// Explicit application policy for these demos, not a change to the pinned Drawer implementation.
export const navbarFocusJavascript = `document.querySelectorAll('.navbar dialog.drawer').forEach(panel => {
  panel.addEventListener('shown.trm.drawer', () => {
    if (!panel.matches(':modal')) return
    panel.querySelector('[autofocus]')?.focus({ preventScroll: true })
  })
})`
// The frozen scanner misses alias-declared TogglerConfig; these rows describe the actual pinned source.
export const togglerOptionRows = [
  {name:'attribute',type:'string',defaultValue:'class',description:'Attribute to mutate on the target. id is protected.'},
  {name:'value',type:'string | number | boolean',defaultValue:'null (unset)',description:'One class token or the attribute value. Runtime null/missing values do nothing; the public TypeScript config excludes null.'}
]
// The frozen scanner derives a kebab-case key from the filename; runtime NAME is navoverflow.
export const adaptiveRuntimeEvent = (event: string) => event.replace(/\.trm\.nav-overflow$/, '.trm.navoverflow')
export const adaptiveEventDescriptions: Record<string,string> = {
  get 'update.trm.navoverflow'() { return authoredAdaptiveEvent('nav-overflow', 'update.trm.navoverflow') },
  get 'overflow.trm.navoverflow'() { return authoredAdaptiveEvent('nav-overflow', 'overflow.trm.navoverflow') },
  get 'resize.trm.navoverflow'() { return authoredAdaptiveEvent('nav-overflow', 'resize.trm.navoverflow') },
  get 'toggle.trm.toggler'() { return authoredAdaptiveEvent('toggler', 'toggle.trm.toggler') },
  get 'toggled.trm.toggler'() { return authoredAdaptiveEvent('toggler', 'toggled.trm.toggler') }
}
const button = (text: string, attributes: string) => `<button class="btn-outline theme-inverse" type="button" ${attributes}>${text}</button>`
const dark = (html: string) => `<div data-trm-theme="dark" dir="rtl" class="p-3 rounded-5 bg-body fg-body">${html}</div>`
const links = '<li class="nav-item"><a class="nav-link active" aria-current="page" href="/">Home</a></li><li class="nav-item"><a class="nav-link" href="/components/">Components</a></li>'
const bar = (label: string, body: string, classes = 'navbar-expand', attributes = '') => `<nav class="navbar ${classes} bg-1" aria-label="${label}" ${attributes}><div class="container-fluid"><a class="navbar-brand" href="/">Tremplin</a>${body}</div></nav>`
const menuLinks = '<a class="menu-item" href="/components/">Components</a><a class="menu-item" href="/getting-started/install/">Installation</a>'
const responsive = (id: string, label: string, prefix = 'md:navbar-expand', placement = 'end', body = `<ul class="nav navbar-nav">${links}</ul>`, attributes = '') => bar(label, `<button class="btn-icon navbar-toggler" type="button" data-trm-toggle="drawer" data-trm-target="#${id}" aria-controls="${id}" aria-haspopup="dialog" aria-label="${label}"><span class="navbar-toggler-icon" aria-hidden="true"></span></button><dialog class="drawer drawer-${placement}" id="${id}" tabindex="-1" aria-labelledby="${id}-title"><header class="drawer-header"><h3 class="drawer-title h5" id="${id}-title">Navigation</h3><button class="btn-close" type="button" data-trm-dismiss="drawer" aria-label="Close ${label}" autofocus></button></header><div class="drawer-body">${body}</div></dialog>`,prefix,attributes)
const search = '<form class="d-flex flex-wrap gap-2" role="search" aria-label="Example documentation search" action="/components/" method="get"><label class="visually-hidden" for="adaptive-nav-search">Search components</label><input class="form-control" style="width: 10rem; max-width: 100%" id="adaptive-nav-search" name="q" type="search"><button class="btn-outline theme-inverse" type="submit">Search</button></form>'
const overflowItems = '<li class="nav-item nav-overflow-keep"><a class="nav-link active" aria-current="page" href="/">Overview</a></li><li class="nav-item"><a class="nav-link" href="/components/">Activity</a></li><li class="nav-item"><a class="nav-link" href="/customize/">Project settings</a></li>'
const overflow = (id: string, options = 'data-trm-collapse-below="600"', items = overflowItems, style = '', navClass = '') => `<nav id="${id}" class="nav-overflow" aria-label="${id} project sections" data-trm-toggle="nav-overflow" style="width:100%;max-width:24rem;${style}" ${options}><ul class="nav ${navClass}">${items}</ul></nav>`
const mutate = (id: string, label: string, attributes = 'data-trm-value="bg-2"', body = 'Always available project information.', classes = 'p-3 mt-2', triggerAttributes = '') => button(label,`data-trm-toggle="toggler" data-trm-target="#${id}" ${triggerAttributes}`)+`<div id="${id}" class="${classes}" ${attributes}>${body}</div>`

export const adaptiveClasses: Record<AdaptiveTopic, string[]> = {
  navbar:['navbar','navbar-brand','navbar-nav','navbar-text','navbar-toggler','navbar-toggler-icon','navbar-expand','sm:navbar-expand','md:navbar-expand','lg:navbar-expand','navbar-translucent','nav-link','active'],
  'nav-overflow':['nav-overflow','nav-overflow-initialized','nav-overflow-item','nav-overflow-icon','nav','nav-item','nav-link','nav-overflow-toggle','nav-overflow-menu','menu-item','show'],
  toggler:[]
}
export const adaptiveAccessibility: Record<AdaptiveTopic, string> = {
  navbar:'Name the navigation landmark and current destination. Layout expands from the navbar container width, not viewport width. Responsive examples require Drawer JavaScript for native modal focus, Escape and visible-opener focus return. No Navbar plugin or automatic aria-expanded synchronization is supplied.',
  'nav-overflow':'Keep a named navigation landmark and real destinations. Menu supplies overflow keyboard entry and Escape focus return. Links are cloned and originals hidden; existing menus are relocated. Approved A11Y-001 remaps cloned descendant IDs and local references while preserving originals. Resizing can rebuild an open menu.',
  toggler:'This JavaScript primitive has no fixed CSS class. Put mutation configuration on each target and use native triggers. It does not synchronize disclosure ARIA, handle Escape, manage focus or implement an outside-dismissal policy. Use Collapse or Dialog/Drawer for those behaviors.'
}
export const adaptiveExamples: Record<AdaptiveTopic,string> = {
  navbar:bar('Main navigation','<ul class="nav navbar-nav"><li class="nav-item"><a class="nav-link active" aria-current="page" href="/">Home</a></li><li class="nav-item"><a class="nav-link" href="/getting-started/install/">Docs</a></li></ul>'),
  'nav-overflow':overflow('project-navigation'),
  toggler:mutate('generic-panel','Toggle highlight','data-trm-value="bg-2"','Always available content; only its background class changes.')
}
export const adaptiveDetails: Record<AdaptiveTopic,ComponentDetail> = {
  navbar:authoredComponentDetail("navbar", {
    variants: [
        { markup: bar('Brand example', `<ul class="nav navbar-nav">${links}</ul>`) },
        { markup: responsive('docs-navbar', 'Open navigation') },
        { markup: responsive('container-navbar', 'Open container navigation', 'sm:navbar-expand') },
        { markup: responsive('always-navbar', 'Open always-collapsed navigation', '') },
        { markup: bar('Navbar with Menu', `<ul class="nav navbar-nav">${links}<li class="nav-item"><button class="nav-link" type="button" data-trm-toggle="menu" aria-expanded="false">Project actions</button><div class="menu">${menuLinks}</div></li></ul>`) },
        { markup: bar('Search example', search, '') },
        { markup: bar('Text example', '<span class="navbar-text">Workspace <a href="/components/">components</a></span>') },
        { markup: bar('Illustrated brand', '<span class="navbar-text">Brand illustration</span>').replace('>Tremplin</a>', '><img class="d-inline-block align-text-top" src="/content-sample.svg" width="32" height="24" alt=""> Tremplin</a>') },
        { markup: responsive('top-navbar', 'Open top navigation', '', 'top') },
        { markup: bar('Translucent example', '<span class="navbar-text">In-flow navigation surface</span>', 'navbar-expand navbar-translucent') },
        { markup: dark(responsive('dark-navbar', 'Open dark navigation', 'sm:navbar-expand', 'start', `<ul class="nav navbar-nav">${links}</ul>`, 'data-trm-theme="dark" dir="rtl"')) }
    ], variables: documentedTokens('navbar'),
    sass: `@use 'tremplin/scss/navbar' with (
  $navbar-tokens: (--trm-navbar-min-height: 4rem),
  $navbar-nav-tokens: (--trm-nav-gap: .5rem),
  $navbar-dark-tokens: (--trm-navbar-brand-color: var(--trm-white))
);`
}),
  'nav-overflow':authoredComponentDetail("nav-overflow", {
    variants: [
        { markup: overflow('guide-project-navigation') },
        { markup: overflow('progressive-navigation', 'data-trm-collapse-below="0"', overflowItems + '<li class="nav-item"><a class="nav-link" href="/utilities/">Utilities</a></li><li class="nav-item"><a class="nav-link" href="/examples/">Examples</a></li>') },
        { markup: overflow('tabs-navigation', 'data-trm-collapse-below="600"', overflowItems, '', 'nav-tabs theme-inverse') + overflow('underline-navigation', 'data-trm-collapse-below="600"', overflowItems, '', 'nav-underline theme-inverse') },
        { markup: overflow('styled-navigation', 'data-trm-collapse-below="600"', overflowItems + '<li class="nav-item"><button class="nav-link" type="button" disabled>Unavailable section</button></li>', '', 'nav-pills theme-inverse') },
        { markup: overflow('icon-navigation', 'data-trm-more-text="false" data-trm-collapse-below="600"') + overflow('label-navigation', 'data-trm-more-text="More sections" data-trm-icon-placement="end" data-trm-collapse-below="600"') },
        { markup: overflow('authored-navigation', 'data-trm-collapse-below="600"', overflowItems + '<li class="nav-item nav-overflow-item"><button class="nav-link nav-overflow-toggle" type="button" data-trm-toggle="menu" aria-expanded="false" aria-label="More project links"><span class="nav-overflow-icon" aria-hidden="true">...</span></button><div class="nav-overflow-menu menu"></div></li>') + overflow('custom-icon-navigation', 'data-trm-collapse-below="600"').replace('</nav>', '<svg data-trm-overflow-icon width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="3" fill="currentColor"/></svg></nav>') },
        { markup: overflow('submenu-navigation', 'data-trm-collapse-below="600"', overflowItems + '<li class="nav-item"><button class="nav-link" type="button" data-trm-toggle="menu" aria-expanded="false">Project tools</button><div class="menu" id="overflow-tools"><a class="menu-item" href="/components/">Browse tools</a><label class="menu-text" for="overflow-note">Workspace note</label><input class="form-control" id="overflow-note" value="Draft"></div></li>') },
        { markup: overflow('breakpoint-navigation', 'data-trm-collapse-below="sm"') + overflow('threshold-navigation', 'data-trm-threshold="1" data-trm-collapse-below="0"') },
        { markup: bar('Priority navbar', overflow('navbar-overflow', 'data-trm-collapse-below="600"')) },
        { markup: dark(overflow('rtl-navigation')) }
    ], variables: [],
    sass: `@use 'tremplin/scss/nav' with ($nav-tokens: (--trm-nav-gap: .5rem));
@use 'tremplin/scss/nav-overflow';`
}),
  toggler:authoredComponentDetail("toggler", {
    variants: [
        { markup: mutate('toggler-panel', 'Toggle project highlight') },
        { markup: mutate('toggler-existing', 'Remove or restore highlight', 'data-trm-value="bg-2"', 'Starts highlighted.', 'p-3 mt-2 bg-2') },
        { markup: button('Toggle this button', 'id="self-toggler" data-trm-toggle="toggler" data-trm-target="#self-toggler" data-trm-value="bg-2"') + button('Toggle two targets', 'data-trm-toggle="toggler" data-trm-target="[data-tgl-pair]"') + '<p data-tgl-pair data-trm-value="bg-2">First target</p><p data-tgl-pair data-trm-value="border" class="p-2">Second target</p>' },
        { markup: mutate('toggler-custom', 'Toggle text emphasis', 'data-trm-attribute="style" data-trm-value="font-weight: 700"', 'Attribute target') + mutate('numeric-toggler', 'Toggle numeric marker', 'data-trm-attribute="data-count" data-trm-value="0"', 'Inspect data-count to see the numeric value set/removed.') },
        { markup: button('Toggle form availability', 'data-trm-toggle="toggler" data-trm-target="#toggler-fieldset"') + '<fieldset id="toggler-fieldset" data-trm-attribute="disabled" data-trm-value="true" class="mt-2"><legend class="h6">Project properties</legend><label for="toggler-name">Project name</label><input class="form-control" id="toggler-name" value="Tremplin"></fieldset>' },
        { markup: mutate('toggler-disabled', 'Unavailable toggle', 'data-trm-value="bg-2"', 'Unchanged target', 'p-3 mt-2', 'disabled') },
        { markup: mutate('protected-toggler', 'Try protected id', 'data-trm-attribute="id" data-trm-value="replacement"', 'This id remains protected.') + mutate('null-toggler', 'Try null value', 'data-trm-value="null"', 'Null leaves this target unchanged.') },
        { markup: dark(mutate('toggler-rtl', 'Toggle RTL highlight')) }
    ], variables: []
})
}

function authoredAdaptiveEvent(name: AdaptiveTopic, event: string): string {
  const description = componentNarrative(name).events?.[event]
  if (!description) throw new Error('Missing authored lifecycle description: ' + event)
  return description
}
