import { authoredComponentDetail } from '../libs/component-mdx'
import type { ComponentDetail } from './component-docs'
import { documentedTokens } from './documented-tokens'

export type ChipTableTopic = 'chip' | 'table'
// Documentation prose tables have unlayered cell rules. Locally return live
// examples to the framework layers instead of overriding any core token/value.
export const tableDemoIsolationCss = `.docs-main .docs-example .table > :not(caption) > * > * {
  padding: revert-layer;
  border-block-end: revert-layer;
  text-align: revert-layer;
}`
const group = (markup: string) => `<div class="d-flex flex-wrap align-items-center gap-2">${markup}</div>`
const dark = (markup: string) => `<div data-trm-theme="dark" dir="rtl" class="p-3 rounded-5 bg-body fg-body">${markup}</div>`
const closeIcon = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="m4 4 8 8m0-8-8 8"/></svg>'
const personIcon = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false"><path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/></svg>'

// Explicit application behavior for standalone chips; not a Chip plugin or Chips data API.
export const standaloneChipJavascript = `document.querySelectorAll('[data-demo-chip-toggle]').forEach(button => {
  button.addEventListener('click', () => {
    const selected = button.getAttribute('aria-pressed') !== 'true'
    button.setAttribute('aria-pressed', String(selected))
    button.classList.toggle('active', selected)
  })
})
document.querySelectorAll('[data-demo-chip-dismiss]').forEach(button => {
  button.addEventListener('click', () => {
    const chip = button.closest('.chip')
    const next = document.querySelector('#chip-removal-next')
    if (!chip || !next) return
    chip.remove()
    document.querySelector('#chip-removal-status').textContent = 'Design filter removed.'
    next.focus()
  })
})`

export const chipTableClasses: Record<ChipTableTopic, string[]> = {
  chip: ['chip', 'chip-img', 'chip-icon', 'chip-dismiss', 'active', 'disabled'],
  table: ['table', 'table-sm', 'table-striped', 'table-striped-columns', 'table-hover', 'table-active', 'table-bordered', 'table-borderless', 'table-group-divider', 'caption-top', 'table-card', 'table-responsive', 'sm:table-responsive', 'md:table-responsive', 'lg:table-responsive', 'xl:table-responsive', '2xl:table-responsive', 'table-stacked', 'sm:table-stacked', 'md:table-stacked', 'lg:table-stacked', 'xl:table-stacked', '2xl:table-stacked']
}
export const chipTableAccessibility: Record<ChipTableTopic, string> = {
  chip: 'Standalone Chip styling supplies no selection, dismissal or keyboard controller. Use native buttons/links for actions, explicitly synchronize aria-pressed and active, name removal targets and arrange focus after removal. The shown application handler is separate from the editable Chips plugin.',
  table: 'Use captions and scoped headers with explicit status text. Name keyboard-focusable horizontal scroll regions. Stacked data-cell labels are visual generated content, not a replacement for real headers. CSS does not implement sorting, selection or grid keyboard navigation.'
}

const rows = '<tr><th scope="row">#1042</th><td>Acme Studio</td><td>$240</td></tr><tr><th scope="row">#1043</th><td>Northstar</td><td>$560</td></tr>'
const headers = '<thead><tr><th scope="col">Invoice</th><th scope="col">Customer</th><th scope="col">Total</th></tr></thead>'
const table = (classes = '', caption = 'Recent invoices', body = rows, attrs = '') => `<table class="table ${classes}" ${attrs}><caption>${caption}</caption>${headers}<tbody>${body}</tbody></table>`
const scroll = (markup: string, label: string, classes = 'table-responsive', attrs = '') => `<div class="${classes} focus-ring" role="region" aria-label="${label}" tabindex="0" ${attrs}>${markup}</div>`
const wide = (caption: string) => `<table class="table table-striped" style="min-inline-size: 58rem"><caption>${caption}</caption><thead><tr><th scope="col">Product</th>${['Q1','Q2','Q3','Q4','Forecast','Owner'].map(label=>`<th scope="col">${label}</th>`).join('')}</tr></thead><tbody><tr><th scope="row">Platform</th><td>$24k</td><td>$27k</td><td>$31k</td><td>$36k</td><td>$40k</td><td>Ana Brooks</td></tr><tr><th scope="row">Services</th><td>$8k</td><td>$11k</td><td>$12k</td><td>$14k</td><td>$18k</td><td>Lee Martin</td></tr></tbody></table>`
const stacked = (classes: string, caption: string) => `<table class="table ${classes}" role="table"><caption>${caption}</caption><thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col">Name</th><th role="columnheader" scope="col">Role</th><th role="columnheader" scope="col">Status</th></tr></thead><tbody role="rowgroup"><tr role="row"><td role="cell" data-cell="Name">Ana</td><td role="cell" data-cell="Role">Designer</td><td role="cell" data-cell="Status">Available</td></tr><tr role="row"><td role="cell" data-cell="Name">Lee</td><td role="cell" data-cell="Role">Developer</td><td role="cell" data-cell="Status">Reviewing</td></tr></tbody></table>`

export const chipTableExamples: Record<ChipTableTopic, string> = {
  chip: '<span class="chip">Design</span>',
  table: table()
}
export const chipTableDetails: Record<ChipTableTopic, ComponentDetail> = {
  chip: authoredComponentDetail("chip", {
    variants: [
        { markup: group('<span class="chip">Design</span><span class="chip">Engineering</span>') },
        { markup: group(`<span class="chip"><img class="chip-img" src="/img/avatar-demo.svg" width="20" height="20" alt="">Alex Brooks</span><span class="chip"><span class="chip-icon">${personIcon}</span>Project team</span>`) },
        { markup: group(['primary', 'success', 'danger', 'warning', 'info', 'inverse'].map(color => `<span class="chip theme-${color}">${color}</span>`).join('')) + '<div class="theme-success mt-3"><span class="chip">Inherited success theme</span></div>' },
        { markup: group('<span class="chip theme-primary">Default</span><span class="chip theme-primary active">Active appearance</span>') },
        { markup: '<div role="group" aria-label="Project filters" class="d-flex flex-wrap gap-2"><button class="chip theme-primary focus-ring" type="button" aria-pressed="false" data-demo-chip-toggle>Design filter</button><button class="chip theme-primary active focus-ring" type="button" aria-pressed="true" data-demo-chip-toggle>Engineering filter</button></div>' },
        { markup: `<div id="chip-removal-example"><span class="chip" id="removable-design-chip">Design<button class="chip-dismiss" type="button" aria-label="Remove Design filter" data-demo-chip-dismiss>${closeIcon}</button></span><a class="chip focus-ring ms-2" id="chip-removal-next" href="/components/">Browse components</a><p id="chip-removal-status" role="status" class="mt-2">One removable filter.</p></div>` },
        { markup: '<button class="chip theme-primary" type="button" disabled aria-pressed="false">Unavailable filter</button>' },
        { markup: '<span class="chip" style="--trm-chip-height: 2.25rem; --trm-chip-padding-x: .875rem; --trm-chip-img-size: 1.5rem"><img class="chip-img" src="/img/avatar-demo.svg" width="24" height="24" alt="">Alex Brooks</span>' },
        { markup: dark(group('<span class="chip"><img class="chip-img" src="/img/avatar-demo.svg" width="20" height="20" alt="">Alex Brooks</span><a class="chip focus-ring" href="/forms/chips/">Editable Chips guide</a>')) }
    ],
    variables: documentedTokens('chip'),
    sass: "@use 'tremplin/scss/chip' with (\n  $chip-tokens: (\n    --trm-chip-height: 2rem,\n    --trm-chip-gap: .5rem,\n    --trm-chip-img-size: 1.5rem\n  )\n);"
}),
  table: authoredComponentDetail("table", {
    variants: [
        { markup: table('table-striped') },
        { markup: table('table-striped-columns', 'Column striping') },
        { markup: table('theme-success', 'Themed invoice table') + table('', 'Row and cell themes', '<tr class="theme-warning"><th scope="row">#1044</th><td>Review pending</td><td>$380</td></tr><tr><th scope="row">#1045</th><td class="theme-danger">Payment failed</td><td>$120</td></tr><tr class="theme-info"><th scope="row">#1046</th><td>Processing</td><td>$90</td></tr>') },
        { markup: table('table-striped table-hover', 'Invoice accent states', '<tr class="table-active"><th scope="row">#1042</th><td>Acme Studio</td><td>$240</td></tr><tr><th scope="row">#1043</th><td>Northstar</td><td class="table-active">$560</td></tr>') },
        { markup: table('table-bordered border-primary', 'Bordered invoices') },
        { markup: table('table-borderless', 'Borderless invoices') },
        { markup: table('table-sm table-bordered', 'Compact invoices') },
        { markup: `<table class="table"><caption>Invoice totals</caption>${headers}<tbody class="table-group-divider">${rows}</tbody><tfoot class="table-group-divider"><tr><th scope="row" colspan="2">Total billed</th><td>$800</td></tr></tfoot></table>` },
        { markup: table('caption-top', 'Invoice register (top caption)') },
        { markup: `<table class="table align-middle"><caption>Cell alignment</caption><thead><tr><th scope="col">Service</th><th scope="col">Notes</th></tr></thead><tbody><tr><th scope="row">API</th><td>Middle alignment inherited from the table.<br>Additional detail keeps this row tall.</td></tr><tr class="align-bottom"><th scope="row">Web</th><td>Bottom alignment from the row.<br>Deployment review in progress.</td></tr><tr><th scope="row" class="align-top">Queue</th><td>Top alignment on this row header.<br>Background work is ready.</td></tr></tbody></table>` },
        { markup: scroll(`<table class="table table-striped table-bordered" id="outer-invoice-table"><caption>Invoice batches</caption><thead><tr><th scope="col">Batch</th><th scope="col">Contents</th></tr></thead><tbody><tr><th scope="row">November</th><td>${table('mb-0', 'Nested batch invoices')}</td></tr></tbody></table>`, 'Nested invoice tables') },
        { markup: `<div class="table-card">${table('table-striped', 'Invoice card')}</div><div class="border rounded-7 overflow-hidden">${table('table-striped mb-0', 'Utility-composed invoice card')}</div>` },
        { markup: scroll(wide('Quarterly revenue by product'), 'Quarterly revenue table', 'table-responsive', 'id="table-scroll-demo"') },
        ...['sm', 'md', 'lg', 'xl', '2xl'].map(prefix => ({ markup: scroll(table('', `${prefix} responsive invoices`), `${prefix} responsive invoice region`, `${prefix}:table-responsive`) })),
        { markup: scroll(wide('Revenue card'), 'Scrollable revenue card', 'table-responsive table-card') },
        { markup: scroll(stacked('table-stacked', 'Always stacked team'), 'Always stacked team region') },
        { markup: scroll(stacked('md:table-stacked', 'Responsive stacked team'), 'Responsive stacked team region', 'table-responsive', 'id="table-stack-demo" style="max-inline-size: 60rem"') },
        { markup: dark(table('table-striped table-hover', 'Localized invoice register')) }
    ],
    variables: documentedTokens('table'),
    sass: "@use 'tremplin/scss/content/tables' with (\n  $table-tokens: (\n    --trm-table-cell-padding-x: .75rem,\n    --trm-table-striped-bg-factor: 8%,\n    --trm-table-hover-bg-factor: 12%\n  ),\n  $table-striped-order: even,\n  $table-striped-columns-order: odd\n);"
})
}
