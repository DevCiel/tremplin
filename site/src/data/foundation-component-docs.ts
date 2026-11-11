import { authoredComponentDetail } from '../libs/component-mdx'
import type { ComponentDetail } from './component-docs'
import { documentedTokens } from './documented-tokens'

// Canonical authored examples; contrast customization is separately disclosed
// by the existing documentation wrapper, never added to the framework core.
const row = 'hstack flex-wrap align-items-center gap-3'
const dark = (markup: string) => `<div data-trm-theme="dark" dir="rtl" class="p-3 rounded-5 bg-body fg-body">${markup}</div>`
const action = '<a class="btn-outline theme-inverse" href="/getting-started/install/">Open project</a>'
const card = `<article class="card" style="max-inline-size: 28rem"><div class="card-body"><h3 class="card-title h5">Project launch</h3><p>Everything needed for the next milestone.</p>${action}</div></article>`

export const foundationExamples = {
  button: `<div class="${row}"><button class="btn-solid theme-primary" type="button">Solid</button><button class="btn-outline theme-primary" type="button">Outline</button><button class="btn-subtle theme-success" type="button">Subtle</button><button class="btn-outline theme-inverse" type="button" data-trm-toggle="button" aria-pressed="false">Toggle example action</button></div>`,
  alert: `<div class="alert theme-primary" role="status" id="release-notice"><p>A new version is available.</p><button class="btn-close ms-auto" type="button" data-trm-dismiss="alert" aria-label="Dismiss"></button></div>`,
  badge: '<span class="badge theme-primary">New</span>',
  card
}

export const foundationDetails: Record<keyof typeof foundationExamples, ComponentDetail> = {
  button: authoredComponentDetail("button", {
    variants: [
        { markup: `<div class="${row}"><button class="btn" type="button">Base</button><button class="btn-solid theme-primary" type="button">Solid</button><button class="btn-outline theme-primary" type="button">Outline</button><button class="btn-subtle theme-success" type="button">Subtle</button><button class="btn-text theme-danger" type="button">Text</button></div>` },
        { markup: `<div class="${row}"><button class="btn-solid theme-primary btn-xs" type="button">Extra small</button><button class="btn-solid theme-primary btn-sm" type="button">Small</button><button class="btn-solid theme-primary" type="button">Default</button><button class="btn-solid theme-primary btn-lg" type="button">Large</button><button class="btn-outline theme-inverse btn-icon" type="button" aria-label="Add item"><span aria-hidden="true">+</span></button></div>` },
        { markup: `<div class="${row}"><button class="btn-solid theme-primary" type="button" data-trm-toggle="button" aria-pressed="false">Toggle notifications</button><button class="btn-solid theme-primary" type="button" disabled>Disabled</button><a class="btn-outline theme-inverse disabled" role="link" aria-disabled="true" tabindex="-1">Unavailable link</a></div>` },
        { markup: `<div class="${row}"><label class="btn-check btn-outline theme-inverse"><input type="checkbox" name="updates"> Email updates</label><label class="btn-check btn-outline theme-inverse"><input type="checkbox" name="locked-updates" checked disabled> Required updates</label></div>` },
        { markup: `<div class="btn-toolbar" role="toolbar" aria-label="Editor actions"><div class="btn-group" role="group" aria-label="Text alignment"><button class="btn-outline theme-inverse" type="button">Start</button><button class="btn-outline theme-inverse" type="button">Center</button><button class="btn-outline theme-inverse" type="button">End</button></div></div>` },
        { markup: '<button class="btn-solid btn-styled theme-inverse" type="button">Styled action</button>' },
        { markup: dark(`<div class="${row}"><button class="btn-solid theme-inverse" type="button">Save</button><button class="btn-outline theme-inverse" type="button">Cancel</button></div>`) }
    ],
    variables: documentedTokens('button'),
    sass: `@use 'tremplin/scss/buttons/button' with (
  $button-tokens: (
    --trm-btn-border-radius: .75rem,
    --trm-btn-gap: .5rem
  )
);`
}),
  alert: authoredComponentDetail("alert", {
    variants: [
        { markup: '<div class="vstack gap-3"><div class="alert theme-primary" role="status"><p>A project update is available.</p></div><div class="alert theme-success" role="status"><p>Your changes were saved.</p></div><div class="alert theme-danger" role="alert"><p>Payment could not be processed.</p></div></div>' },
        { markup: '<div class="alert theme-warning" role="status"><div><h3 class="alert-heading h5">Review required</h3><p>Confirm the deployment settings before continuing.</p><a class="alert-link" href="/getting-started/approach/">Review the approach</a></div></div>' },
        { markup: '<div class="alert theme-info" id="export-notice" role="status"><p>Your export is ready.</p><button class="btn-close ms-auto" type="button" data-trm-dismiss="alert" aria-label="Dismiss export notification"></button></div>' },
        { markup: '<div class="alert alert-instant" id="instant-notice" role="status"><p>Temporary notice.</p><button class="btn-close ms-auto" type="button" data-trm-dismiss="alert" aria-label="Dismiss temporary notice"></button></div>' },
        { markup: dark('<div class="alert theme-inverse" role="status"><p>Changes saved.</p><button class="btn-close ms-auto" type="button" data-trm-dismiss="alert" aria-label="Dismiss saved notification"></button></div>') }
    ],
    variables: documentedTokens('alert'),
    sass: `@use 'tremplin/scss/alert' with (
  $alert-tokens: (
    --trm-alert-border-radius: .5rem,
    --trm-alert-padding-x: 1.25rem
  )
);`
}),
  badge: authoredComponentDetail("badge", {
    variants: [
        { markup: `<div class="${row}"><h3 class="h5 mb-0">Inbox <span class="badge">12</span></h3><button class="btn-solid theme-primary" type="button">Notifications <span class="badge theme-inverse">4<span class="visually-hidden"> unread</span></span></button><span class="badge">New</span></div>` },
        { markup: `<div class="${row}"><span class="badge theme-success">Approved</span><span class="badge badge-subtle theme-primary">Pending</span><span class="badge badge-outline theme-danger">Rejected</span></div>` },
        { markup: `<div class="${row}"><span class="badge theme-inverse">Standard</span><span class="badge badge-lg theme-inverse">Large</span></div>` },
        { markup: dark(`<div class="${row}"><span>Messages <span class="badge">8</span></span><span class="badge badge-outline theme-inverse">Complete</span></div>`) }
    ],
    variables: documentedTokens('badge'),
    sass: `@use 'tremplin/scss/badge' with (
  $badge-tokens: (
    --trm-badge-padding-x: .75em,
    --trm-badge-border-radius: .5rem
  )
);`
}),
  card: authoredComponentDetail("card", {
    variants: [
        { markup: `<article class="card" style="max-inline-size: 28rem"><header class="card-header">Featured project</header><div class="card-body"><h3 class="card-title h5">Tremplin documentation</h3><p class="card-subtitle">Design system</p><p>Component guidance, live examples, and generated APIs.</p></div><footer class="card-footer">${action}</footer></article>` },
        { markup: '<div class="contains-inline"><div class="card-group"><article class="card"><div class="card-body"><h3 class="card-title h5">Design</h3><p>Tokens and component styles.</p></div><footer class="card-footer">First phase</footer></article><article class="card"><div class="card-body"><h3 class="card-title h5">Build</h3><p>Typed interactions.</p></div><footer class="card-footer">Second phase</footer></article><article class="card"><div class="card-body"><h3 class="card-title h5">Ship</h3><p>Verified distributions.</p></div><footer class="card-footer">Third phase</footer></article></div></div>' },
        { markup: '<section class="card" style="max-inline-size: 28rem" aria-labelledby="card-files"><header class="card-header"><h3 class="h5 mb-0" id="card-files">Project files</h3></header><ul class="list-group list-group-flush"><li class="list-group-item">README.md</li><li class="list-group-item">package.json</li></ul><footer class="card-footer">2 files</footer></section>' },
        { markup: '<article class="card card-subtle theme-primary" style="max-inline-size: 28rem"><img class="card-img-top img-fluid" src="/content-sample.svg" width="800" height="400" alt=""><header class="card-header">Design preview</header><div class="card-body"><h3 class="card-title h5">Interface patterns</h3><p>Decorative media supplements the text.</p></div></article>' },
        { markup: dark(card) }
    ],
    variables: documentedTokens('card'),
    sass: `@use 'tremplin/scss/card' with (
  $card-tokens: (
    --trm-card-spacer-x: 1.5rem,
    --trm-card-body-gap: .75rem
  )
);`
})
}
