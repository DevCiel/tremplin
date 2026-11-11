import { authoredComponentDetail, componentNarrative } from '../libs/component-mdx'
import type { ComponentDetail } from './component-docs'
import { documentedTokens } from './documented-tokens'

export type SheetCommandTopic = 'bottom-sheet' | 'command-palette'
const button = (label: string, attrs = '') => `<button type="button" class="btn-outline theme-inverse" ${attrs}>${label}</button>`
const sheet = (id: string, label: string, body: string, classes = '', attrs = '') => `${button('Open '+label, `data-trm-toggle="drawer" data-trm-target="#${id}" aria-controls="${id}"`)}
<dialog id="${id}" class="drawer drawer-bottom drawer-sheet ${classes}" aria-labelledby="${id}-title" tabindex="-1" ${attrs}>
  <header class="drawer-header"><h3 id="${id}-title" class="drawer-title h5">${label}</h3><button type="button" class="btn-close" data-trm-dismiss="drawer" aria-label="Close ${label}" autofocus></button></header>
  <div class="drawer-body">${body}</div>
  <footer class="drawer-footer">${button('Done', 'data-trm-dismiss="drawer"')}</footer>
</dialog>`
const item = (label: string, value: string, attrs = '') => `<div tabindex="-1" class="command-item" data-value="${value}" ${attrs}>${label}</div>`
const commands = item('Inspect project', 'inspect', 'data-keywords="review workspace"')+item('Preview settings', 'settings', 'data-keywords="preferences configuration"')
const palette = (id: string, title: string, items = commands, attrs = '') => `${button('Open '+title, `data-trm-toggle="command-palette" data-trm-target="#${id}" aria-controls="${id}"`)}
<div id="${id}" class="command-palette" data-trm-command-palette data-trm-shortcut="false" hidden aria-labelledby="${id}-title" ${attrs}>
  <div class="command-palette-dialog">
    <div class="command-palette-header"><label id="${id}-title" for="${id}-search" class="visually-hidden">${title}</label><input id="${id}-search" class="command-palette-input" placeholder="Search commands" autocomplete="off"><button type="button" class="btn-close" data-trm-dismiss="command-palette" aria-label="Close ${title}"></button></div>
    <div class="command-palette-list" aria-label="Available commands">${items}</div>
    <div class="command-palette-empty" hidden>No matching commands. Try another search.</div>
  </div>
</div>
<p id="${id}-result" role="status" class="mt-3 mb-0">No command selected.</p>`

export const sheetCommandClasses: Record<SheetCommandTopic,string[]> = {
  'bottom-sheet': ['drawer','drawer-bottom','drawer-sheet','drawer-fit-content','drawer-instant','drawer-header','drawer-title','drawer-body','drawer-footer','hiding'],
  'command-palette': ['command-palette','command-palette-dialog','command-palette-header','command-palette-input','command-palette-list','command-group','command-group-label','command-item','command-shortcut','command-palette-empty','active']
}
export const sheetCommandAccessibility: Record<SheetCommandTopic,string> = {
  'bottom-sheet': 'A Bottom Sheet is a named native Drawer, not another plugin. Default modal focus and background inertness come from showModal; keep an explicit close button. Data-API opening registers visible-opener focus return. Swipe is only an enhancement, not dragging or snap points.',
  'command-palette': "Optional local extension, separate from the core distribution. It tracks an active descendant and returns focus, but its Tab boundary handler is not native modal inertness or a document-wide focus guard. Give the search a label, keep a close control, and coordinate shortcuts and background focus in your application."
}
export const sheetCommandExamples: Record<SheetCommandTopic,string> = {
  'bottom-sheet': sheet('actions','quick actions','<p>Choose a real documentation destination or dismiss this sheet.</p><nav class="d-flex flex-wrap gap-2" aria-label="Quick actions"><a class="btn-outline theme-inverse" href="/components/">Browse components</a><a class="btn-outline theme-inverse" href="/api/drawer/">Drawer API</a></nav>','','style="--trm-drawer-height: min(55vh, 24rem)"'),
  'command-palette': palette('commands','commands')
}
export const sheetCommandDetails: Record<SheetCommandTopic,ComponentDetail> = {
  'bottom-sheet': authoredComponentDetail("bottom-sheet", {
    variants: [
        { markup: sheet('sheet-fit', 'content-height sheet', '<p>A short task with a visible close control.</p>', '', 'style="--trm-drawer-height: auto"') },
        { markup: sheet('sheet-scroll', 'scrollable sheet', Array.from({ length: 10 }, (_, i) => `<p>Review item ${i + 1}: confirm the project documentation and access requirements.</p>`).join(''), '', 'style="--trm-drawer-height: min(65vh, 30rem)"') },
        { markup: sheet('sheet-static', 'protected sheet', '<p>This local example has no unsaved data. Close it with either explicit dismissal button.</p>', '', 'data-trm-backdrop="static" data-trm-keyboard="false"') },
        { markup: sheet('sheet-width', 'compact sheet', '<p>No transition is used in this example. Width and height are authored token overrides.</p>', 'drawer-instant', 'style="--trm-drawer-sheet-width: 34rem; --trm-drawer-height: 18rem; --trm-drawer-inset: .5rem"') },
        { markup: sheet('sheet-rtl', 'RTL sheet', '<p dir="rtl" lang="ar">راجع إعدادات المشروع ثم أغلق اللوحة.</p>', '', 'dir="rtl" data-trm-theme="dark"') }
    ],
    variables: documentedTokens('drawer'),
    sass: `@use 'tremplin/scss/drawer' with (\n  $drawer-tokens: (\n    --trm-drawer-height: 22rem,\n    --trm-drawer-border-radius: 1rem\n  )\n);\n\n// Separate runtime fallback, not a Sass-map key:\n.drawer-sheet { --trm-drawer-sheet-width: 42rem; }`
}),
  'command-palette': authoredComponentDetail("command-palette", {
    variants: [
        { markup: palette('palette-groups', 'grouped commands', `<div class="command-group"><div class="command-group-label" aria-hidden="true">Projects</div>${commands}</div><div class="command-group"><div class="command-group-label" aria-hidden="true">Help</div>${item('Preview help', 'help', 'data-keywords="support manual"')}</div>`) },
        { markup: palette('palette-disabled', 'availability example', commands + item('Protected project', 'protected', 'aria-disabled="true"')) },
        { markup: palette('palette-persistent', 'persistent commands', commands, 'data-trm-close-on-select="false"') },
        { markup: palette('palette-rtl', 'RTL commands', item('<span lang="ar">معاينة المشروع</span>', 'inspect', 'data-keywords="project review"') + item('<span lang="ar">معاينة الإعدادات</span>', 'settings', 'data-keywords="settings preferences"'), 'dir="rtl" data-trm-theme="dark"') }
    ],
    variables: documentedTokens('command-palette'),
    sass: `@use 'tremplin/scss/extensions/command-palette' with (\n  $command-palette-tokens: (\n    --trm-command-palette-width: 44rem,\n    --trm-command-palette-radius: 1rem\n  )\n);`
})
}
export const paletteOptionRows = [
  {name:'shortcut',type:'boolean',defaultValue:'true',description:'Global Ctrl/Meta+K toggle; false in every guide instance so docs search remains the owner.'},
  {name:'closeOnSelect',type:'boolean',defaultValue:'true',description:'Requests hide before selected; false keeps the palette open. A hide veto also leaves it open.'}
]
export const paletteEvents: Record<string,string> = {
  get 'show.trm.command-palette'() { return authoredPaletteEvent('show.trm.command-palette') },
  get 'shown.trm.command-palette'() { return authoredPaletteEvent('shown.trm.command-palette') },
  get 'hide.trm.command-palette'() { return authoredPaletteEvent('hide.trm.command-palette') },
  get 'hidden.trm.command-palette'() { return authoredPaletteEvent('hidden.trm.command-palette') },
  get 'filter.trm.command-palette'() { return authoredPaletteEvent('filter.trm.command-palette') },
  get 'select.trm.command-palette'() { return authoredPaletteEvent('select.trm.command-palette') },
  get 'selected.trm.command-palette'() { return authoredPaletteEvent('selected.trm.command-palette') }
}
export const paletteApiJavascript = `import 'tremplin/css'\nimport 'tremplin/css/extensions'\nimport { CommandPalette } from 'tremplin/extensions/command-palette'\n\n// Configure before automatic initialization; data-trm-shortcut="false"\n// on this guide's root also prevents a competing global shortcut.\nconst root = document.querySelector('#commands')\nconst palette = CommandPalette.getOrCreateInstance(root, { shortcut: false })\nroot.addEventListener('selected.trm.command-palette', event => {\n  const { value } = event.detail\n  // Dispatch a known, authorized application action for value here.\n})\n// await palette.show(); await palette.hide(); palette.dispose();`

// Application-level contrast/focus choices: optional extension source is unchanged.
export const paletteDemoCss = `.command-palette { --trm-command-palette-active-bg: var(--trm-fg-body); --trm-command-palette-active-color: var(--trm-bg-body); }
.command-palette-input:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.command-palette-input::placeholder { color: var(--trm-fg-2); opacity: 1; }`
// Copied and executed identically; transient demo status, never business actions.
export const paletteDemoJavascript = `import { CommandPalette } from 'tremplin/extensions/command-palette'

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-trm-command-palette]').forEach(root => {
    // Each demo has one known launcher. At the show gate, focus it before
    // the extension records its opener; native pointer focus differs in WebKit.
    root.addEventListener('show.trm.command-palette', () => {
      document.querySelector('[data-trm-toggle="command-palette"][data-trm-target="#' + root.id + '"]')?.focus()
    })
    root.addEventListener('selected.trm.command-palette', event => {
      const messages = { inspect: 'Project preview selected. No project was changed.', settings: 'Settings preview selected. No preferences were saved.', help: 'Help preview selected. No request was sent.' }
      const result = document.getElementById(root.id + '-result')
      if (result) result.textContent = messages[event.detail.value] || 'Preview command selected. No action was performed.'
    })
  })
  // Application guard: docs search must not take focus behind an open demo.
  // No global palette shortcut is enabled; when closed, docs search owns K.
  document.addEventListener('keydown', event => {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k') return
    const open = document.querySelector('[data-trm-command-palette]:not([hidden])')
    if (!open) return
    event.preventDefault()
    event.stopImmediatePropagation()
    CommandPalette.getInstance(open)?.hide()
  }, true)
})`

export const sheetDemoJavascript = `document.addEventListener('DOMContentLoaded', () => {
  // Application initial-focus policy after Drawer becomes visible.
  document.querySelectorAll('.docs-example dialog.drawer-sheet').forEach(root => {
    root.addEventListener('shown.trm.drawer', () => root.querySelector('[autofocus]')?.focus())
  })
})`

function authoredPaletteEvent(event: string): string {
  const description = componentNarrative('command-palette').events?.[event]
  if (!description) throw new Error('Missing authored lifecycle description: ' + event)
  return description
}
