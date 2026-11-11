import { authoredComponentDetail } from '../libs/component-mdx'
import type { ComponentDetail } from './component-docs'
import { documentedTokens } from './documented-tokens'

export const localPatternTopics = ['status','timeline','divider','empty-state','data-table'] as const
export type LocalPatternTopic = typeof localPatternTopics[number]
export const isLocalPattern = (name: string): name is LocalPatternTopic => localPatternTopics.some(topic=>topic===name)
export const localPatternLayer = 'custom'
const group = (markup:string)=>`<div class="d-flex flex-wrap align-items-center gap-3">${markup}</div>`
const dark = (markup:string)=>`<div data-trm-theme="dark" dir="rtl" class="p-3 rounded-5 bg-body fg-body">${markup}</div>`
const outline = 'btn-outline theme-inverse'

// Application/demo code only. No local Status, EmptyState or DataTable plugin.
export const localPatternJavascript: Partial<Record<LocalPatternTopic,string>> = {
  status: `document.querySelectorAll('[data-demo-status-state]').forEach(button => {
  button.addEventListener('click', () => {
    const output = button.closest('[data-demo-status-root]').querySelector('.status')
    output.classList.remove('status-success', 'status-warning')
    output.classList.add('status-' + button.dataset.demoStatusState)
    output.textContent = button.dataset.demoStatusMessage
  })
})`,
  'empty-state': `document.querySelectorAll('[data-demo-create-project]').forEach(button => {
  button.addEventListener('click', () => {
    const root = button.closest('[data-demo-empty-root]')
    const result = root.querySelector('[data-demo-created-project]')
    root.querySelector('.empty-state').remove()
    result.hidden = false
    root.querySelector('[role="status"]').textContent = 'Demo project created in this page only.'
    result.querySelector('a').focus()
  })
})`,
  'data-table': `document.querySelectorAll('[data-demo-members]').forEach(root => {
  const input = root.querySelector('input[type="search"]')
  const body = root.querySelector('tbody')
  const rows = Array.from(body.querySelectorAll('[data-demo-member]'))
  const empty = body.querySelector('[data-demo-empty-row]')
  const update = () => {
    const query = input.value.trim().toLocaleLowerCase('en')
    rows.forEach(row => { row.hidden = !row.textContent.toLocaleLowerCase('en').includes(query) })
    const count = rows.filter(row => !row.hidden).length
    empty.hidden = count !== 0
    root.querySelector('[role="status"]').textContent = count + (count === 1 ? ' matching member.' : ' matching members.')
  }
  input.addEventListener('input', update)
  root.querySelector('[data-demo-clear-search]').addEventListener('click', () => { input.value = ''; update() })
  root.querySelectorAll('[data-demo-sort]').forEach(button => {
    button.addEventListener('click', () => {
      const header = button.closest('th')
      const descending = header.getAttribute('aria-sort') === 'ascending'
      root.querySelectorAll('th[aria-sort]').forEach(th => th.removeAttribute('aria-sort'))
      header.setAttribute('aria-sort', descending ? 'descending' : 'ascending')
      const column = Number(button.dataset.demoSort)
      rows.sort((a, b) => (descending ? -1 : 1) * a.cells[column].textContent.trim().localeCompare(b.cells[column].textContent.trim(), 'en'))
      rows.forEach(row => body.append(row))
      update()
    })
  })
})
document.querySelectorAll('[data-demo-selection]').forEach(root => {
  root.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', () => {
      input.closest('tr').classList.toggle('table-active', input.checked)
      const count = root.querySelectorAll('input:checked').length
      root.querySelector('[role="status"]').textContent = count + (count === 1 ? ' release selected.' : ' releases selected.')
    })
  })
})`
}

export const localPatternClasses: Record<LocalPatternTopic,string[]> = {
  status: ['status','status-dot','status-sm','status-lg','status-pulse','status-primary','status-secondary','status-success','status-danger','status-warning','status-info'],
  timeline: ['timeline','timeline-item','timeline-title','timeline-time','timeline-content','timeline-compact','timeline-horizontal','timeline-item-success','timeline-item-warning','timeline-item-danger','timeline-item-info'],
  divider: ['divider','divider-start','divider-end','divider-vertical','divider-strong'],
  'empty-state': ['empty-state','empty-state-icon','empty-state-actions','empty-state-compact','empty-state-borderless','empty-state-start'],
  'data-table': ['data-table','data-table-toolbar','data-table-title','data-table-actions','data-table-scroll','data-table-sort','data-table-select','data-table-sticky','data-table-empty','data-table-footer']
}
export const localPatternAccessibility: Record<LocalPatternTopic,string> = {
  status: 'Local optional CSS extension, separate from the core distribution. Visible text carries the state; decorative dots and pulse are supplementary. Create a live region before application updates. CSS does not poll services or announce changes by itself.',
  timeline: 'Local optional CSS extension, separate from the core distribution. Preserve chronological list order and valid time values. The actual horizontal scrolling list must be named and keyboard focusable. CSS provides no roving focus or activity-fetching controller.',
  divider: 'Local optional CSS extension, separate from the core distribution. Hide purely decorative separators, or name meaningful separator roles and set vertical orientation when appropriate. Separators are not focusable splitters or section headings.',
  'empty-state': 'Local optional CSS extension, separate from the core distribution. Explain the absence with a heading and useful native action. Hide decorative artwork. The explicit demo owns creation, status text and focus; it does not save a project or contact a backend.',
  'data-table': 'Local optional CSS extension, separate from the core distribution. Keep captions/scoped headers and labelled native search, sort and checkbox controls. Application code owns data, filtering, order and selection. Plain tables do not gain grid navigation or selection semantics from styling.'
}

const projectIcon = '<svg class="empty-state-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M6 12h14l4 5h18v23H6z"/><path d="M24 23v11m-5-5h10"/></svg>'
const emptyDemo = (id:string)=>`<div id="${id}" data-demo-empty-root><section class="empty-state" aria-labelledby="${id}-title">${projectIcon}<h3 id="${id}-title">No projects yet</h3><p>Create a temporary project in this example only.</p><div class="empty-state-actions"><button class="${outline}" type="button" data-demo-create-project>Create project</button></div></section><p hidden data-demo-created-project><a href="/components/">Demo project: browse components</a></p><p role="status">No demo projects.</p></div>`
const history = '<li class="timeline-item"><h3 class="timeline-title">Project created</h3><time class="timeline-time" datetime="2026-10-24T09:30:00+05:30">24 October, 09:30</time><div class="timeline-content"><p>The workspace was created.</p></div></li><li class="timeline-item"><h3 class="timeline-title">Review requested</h3><time class="timeline-time" datetime="2026-10-25T11:15:00+05:30">25 October, 11:15</time><div class="timeline-content"><p>A review was requested.</p></div></li>'
const memberTable = '<table class="table"><caption>Team members</caption><thead><tr><th scope="col">Name</th><th scope="col">Role</th></tr></thead><tbody><tr><th scope="row">Ana</th><td>Designer</td></tr><tr><th scope="row">Noah</th><td>Developer</td></tr></tbody></table>'
const membersDemo = `<section class="data-table" aria-labelledby="members-title" data-demo-members><div class="data-table-toolbar"><h3 class="data-table-title" id="members-title">Team members</h3><div class="data-table-actions"><label for="member-search">Search</label><input class="form-control" id="member-search" type="search" aria-describedby="members-help"><button class="${outline}" type="button" data-demo-clear-search>Clear search</button></div></div><p id="members-help">Search this example's two members by name or role. No network request is made.</p><div class="data-table-scroll focus-ring" role="region" aria-label="Searchable team members" tabindex="0"><table class="table"><caption>Team members and roles</caption><thead><tr><th scope="col" aria-sort="ascending"><button class="data-table-sort" type="button" aria-label="Name" data-demo-sort="0">Name</button></th><th scope="col"><button class="data-table-sort" type="button" aria-label="Role" data-demo-sort="1">Role</button></th></tr></thead><tbody><tr data-demo-member><th scope="row">Ana</th><td>Designer</td></tr><tr data-demo-member><th scope="row">Noah</th><td>Developer</td></tr><tr hidden data-demo-empty-row><td class="data-table-empty" colspan="2">No members match this search.</td></tr></tbody></table></div><div class="data-table-footer"><span role="status">2 matching members.</span><span>Local demo; no paging or remote data.</span></div></section>`
const stickyTable = `<section class="data-table data-table-sticky" aria-label="Revenue example"><div class="data-table-scroll focus-ring" id="data-table-sticky-demo" role="region" aria-label="Quarterly revenue" tabindex="0" style="max-block-size: 12rem"><table class="table" style="min-inline-size: 48rem"><caption>Quarterly revenue by product</caption><thead><tr><th scope="col">Product</th><th scope="col">Q1</th><th scope="col">Q2</th><th scope="col">Q3</th><th scope="col">Q4</th></tr></thead><tbody>${Array.from({length:10},(_,i)=>`<tr><th scope="row">Product ${i+1}</th><td>$24k</td><td>$27k</td><td>$31k</td><td>$36k</td></tr>`).join('')}</tbody></table></div></section>`

export const localPatternExamples: Record<LocalPatternTopic,string> = {
  status: '<span class="status status-success">Operational</span>',
  timeline: `<ol class="timeline" role="list" aria-label="Project chronology">${history}</ol>`,
  divider: '<div class="divider" aria-hidden="true">or</div>',
  'empty-state': emptyDemo('empty-project-demo'),
  'data-table': `<section class="data-table" aria-label="Basic team table"><div class="data-table-scroll focus-ring" role="region" aria-label="Team table scroll region" tabindex="0">${memberTable}</div></section>`
}
export const localPatternDetails: Record<LocalPatternTopic,ComponentDetail> = {
  status: authoredComponentDetail("status", {
    variants: [
        { markup: group('<span class="status status-success">Operational</span><span class="status status-warning">Maintenance</span><span class="status status-danger">Outage</span><span class="status status-secondary">Offline</span>') },
        { markup: group('<span class="status status-sm status-success">Compact</span><span class="status status-info">Default</span><span class="status status-lg status-warning">Prominent</span>') },
        { markup: `<div data-demo-status-root><p role="status" id="service-demo-status"><span class="status status-success">All systems operational</span></p><div class="d-flex flex-wrap gap-2"><button class="${outline}" type="button" data-demo-status-state="warning" data-demo-status-message="Demo service degraded; review in progress.">Simulate degraded service</button><button class="${outline}" type="button" data-demo-status-state="success" data-demo-status-message="All systems operational">Restore demo service</button></div></div>` },
        { markup: '<span class="status status-info status-pulse" style="--trm-status-pulse-duration: 2s">Processing import</span>' },
        { markup: group('<span class="status-dot" aria-hidden="true" style="--trm-status-dot-size: .55rem; --trm-status-color: var(--trm-fg-2); --trm-status-ring-color: var(--trm-bg-body)"></span><span>Manual review required</span>') },
        { markup: dark(group('<span class="status status-success">Available</span><span class="status status-danger">Unavailable</span>')) }
    ], variables: documentedTokens('status'),
    sass: "@use 'tremplin/scss/extensions/status' with ($status-tokens: (--trm-status-dot-size: .65rem, --trm-status-pulse-duration: 2s));"
}),
  timeline: authoredComponentDetail("timeline", {
    variants: [
        { markup: `<ol class="timeline" role="list" aria-label="Project history">${history}</ol>` },
        { markup: '<ol class="timeline" role="list" aria-label="Deployment history"><li class="timeline-item timeline-item-success"><h3 class="timeline-title">Build passed</h3><p>Checks completed.</p></li><li class="timeline-item timeline-item-warning"><h3 class="timeline-title">Approval pending</h3><p>Waiting for a reviewer.</p></li><li class="timeline-item timeline-item-danger"><h3 class="timeline-title">Release blocked</h3><p>A migration needs attention.</p></li></ol>' },
        { markup: '<ol class="timeline timeline-compact" role="list" aria-label="Recent activity"><li class="timeline-item"><strong>Amélie</strong> updated the brief</li><li class="timeline-item"><strong>Noah</strong> added a comment</li><li class="timeline-item"><strong>Lina</strong> approved the design</li></ol>' },
        { markup: '<ol class="timeline timeline-horizontal focus-ring" role="list" aria-label="Release milestones" tabindex="0" id="horizontal-timeline-demo">' + ['Plan', 'Design', 'Build', 'Review', 'Launch'].map((s, i) => `<li class="timeline-item"><h3 class="timeline-title">${s}</h3><time class="timeline-time" datetime="2026-${String(7 + i).padStart(2, '0')}">${['July', 'August', 'September', 'October', 'November'][i]}</time></li>`).join('') + '</ol>' },
        { markup: `<ol class="timeline" role="list" aria-label="Linked project history" style="--trm-timeline-gap: 2rem"><li class="timeline-item"><h3 class="timeline-title"><a href="/guides/quickstart/">Read the quickstart</a></h3><div class="timeline-content"><p>Prepare your first application.</p></div></li></ol>` },
        { markup: dark(`<ol class="timeline" role="list" aria-label="Localized project history">${history}</ol>`) }
    ], variables: documentedTokens('timeline'),
    sass: "@use 'tremplin/scss/extensions/timeline' with ($timeline-tokens: (--trm-timeline-gap: 2rem, --trm-timeline-marker-bg: var(--trm-success-base)));"
}),
  divider: authoredComponentDetail("divider", {
    variants: [
        { markup: '<p>Sign in with your organization account.</p><div class="divider" aria-hidden="true">or</div><p>Continue with a personal account.</p>' },
        { markup: '<div class="divider divider-start" aria-hidden="true">Project details</div><div class="divider divider-end" aria-hidden="true">End of results</div>' },
        { markup: '<section aria-labelledby="summary-heading"><h3 id="summary-heading">Summary</h3><p>Three tasks are ready.</p></section><div class="divider divider-strong" role="separator" aria-label="Summary and details" aria-orientation="horizontal"></div><section aria-labelledby="details-heading"><h3 id="details-heading">Details</h3><p>Review the assigned tasks below.</p></section>' },
        { markup: '<div class="d-flex align-items-stretch"><div><strong>12</strong><br>Open</div><div class="divider divider-vertical" role="separator" aria-orientation="vertical" aria-label="Open and closed totals"></div><div><strong>28</strong><br>Closed</div></div>' },
        { markup: '<div class="divider divider-strong" aria-hidden="true" style="--trm-divider-gap: 1.25rem; --trm-divider-margin-y: 1.5rem">Next section</div>' },
        { markup: dark('<div class="divider divider-start" aria-hidden="true">Additional options</div>') }
    ], variables: documentedTokens('divider'),
    sass: "@use 'tremplin/scss/extensions/divider' with ($divider-tokens: (--trm-divider-gap: 1rem, --trm-divider-border-width: 2px));"
}),
  'empty-state': authoredComponentDetail("empty-state", {
    variants: [
        { markup: emptyDemo('empty-first-use-demo') },
        { markup: '<section class="empty-state empty-state-compact" aria-labelledby="search-empty-title"><h3 id="search-empty-title">No matching results</h3><p>Browse the full catalog or try a broader search term.</p><div class="empty-state-actions"><a class="btn-outline theme-inverse" href="/components/">Browse all components</a></div></section>' },
        { markup: '<section class="empty-state empty-state-borderless empty-state-start" aria-labelledby="inbox-empty-title"><h3 id="inbox-empty-title">Inbox cleared</h3><p>You have reviewed every notification.</p><a class="btn-text theme-inverse" href="/components/timeline/">View activity pattern</a></section>' },
        { markup: '<section class="empty-state" aria-labelledby="team-empty-title"><h3 id="team-empty-title">No teammates invited</h3><p>Explore interface components or read the framework approach.</p><div class="empty-state-actions"><a class="btn-outline theme-inverse" href="/components/">Explore components</a><a class="btn-text theme-inverse" href="/getting-started/approach/">Read the approach</a></div></section>' },
        { markup: `<section class="empty-state empty-state-compact" aria-labelledby="compact-empty-title">${projectIcon}<h3 id="compact-empty-title">Nothing in the archive</h3><p>Completed work will appear here.</p></section>` },
        { markup: dark(`<section class="empty-state empty-state-start" aria-labelledby="rtl-empty-title">${projectIcon}<h3 id="rtl-empty-title">No saved projects</h3><p>Browse the components to begin.</p><div class="empty-state-actions"><a class="btn-outline theme-inverse" href="/components/">Browse components</a></div></section>`) }
    ], variables: documentedTokens('empty-state'),
    sass: "@use 'tremplin/scss/extensions/empty-state' with ($empty-state-tokens: (--trm-empty-state-min-height: 12rem, --trm-empty-state-padding: 1.5rem));"
}),
  'data-table': authoredComponentDetail("data-table", {
    variants: [
        { markup: membersDemo },
        { markup: `<section class="data-table" aria-label="Release selection example" data-demo-selection><table class="table"><caption>Release candidates</caption><thead><tr><th scope="col">Select</th><th scope="col">Release</th><th scope="col">Status</th></tr></thead><tbody><tr class="table-active"><td><input class="data-table-select" type="checkbox" checked aria-label="Select release 0.8"></td><th scope="row">0.8</th><td>Ready</td></tr><tr><td><input class="data-table-select" type="checkbox" aria-label="Select release 0.9"></td><th scope="row">0.9</th><td>Review</td></tr></tbody></table><p role="status">1 release selected.</p></section>` },
        { markup: stickyTable },
        { markup: `<section class="data-table" aria-labelledby="orders-title"><h3 class="data-table-title" id="orders-title">Orders</h3><div class="data-table-scroll focus-ring" role="region" aria-label="Empty orders table" tabindex="0"><table class="table"><caption>Filtered orders</caption><thead><tr><th scope="col">Order</th><th scope="col">Customer</th></tr></thead><tbody><tr><td class="data-table-empty" colspan="2">No orders match the current filters.</td></tr></tbody></table></div><div class="data-table-footer"><span>0 results</span><a class="btn-outline theme-inverse" href="/components/">Browse all components</a></div></section>` },
        { markup: `<section class="data-table" aria-label="Custom spacing example" style="--trm-data-table-gap: 1.25rem"><div class="data-table-toolbar"><h3 class="data-table-title">Custom spacing</h3><a href="/content/tables/">Read table foundations</a></div><div class="data-table-scroll focus-ring" role="region" aria-label="Custom team table" tabindex="0">${memberTable.replace('Team members</caption>', 'Custom team members</caption>')}</div></section>` },
        { markup: dark(`<section class="data-table" aria-label="Localized team example"><div class="data-table-toolbar"><h3 class="data-table-title">Team members</h3></div><div class="data-table-scroll focus-ring" role="region" aria-label="Localized team table" tabindex="0">${memberTable.replace('Team members</caption>', 'Localized team members</caption>')}</div></section>`) }
    ], variables: documentedTokens('data-table'),
    sass: "@use 'tremplin/scss/extensions/data-table' with ($data-table-tokens: (--trm-data-table-gap: 1rem, --trm-data-table-selected-bg: color-mix(in srgb, var(--trm-primary-base) 15%, transparent)));"
})
}
