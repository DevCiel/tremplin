import { beforeAll, describe, expect, test } from 'vitest'
import { ast, ancestors, cssTree, rules, sass, sheet, values } from './helpers/pinned-sass'
import { approvedSass, prepareApprovedSass } from './helpers/approved-sass'

const sources = {
  main: "@use 'src/scss/tremplin';",
  tokens: "@use 'src/scss/root' with ($root-tokens: (--trm-body-line-height: 1.7, --trm-focus-ring-offset: 2px));",
  scales: "@use 'sass:map'; @use 'src/scss/config' as c with ($spacers: (1: .375rem, 2: null)); .configured { one: map.get(c.$spacers, 1); three: map.get(c.$spacers, 3); removed: map.get(c.$spacers, 2); }",
  utilities: "@use 'src/scss/tremplin-utilities';",
  importance: "@use 'src/scss/tremplin-utilities' with ($utilities: ('cursor': (property: cursor, class: cursor, values: (pointer: pointer), responsive: true, important: false)));",
  mixins: "@use 'src/scss/mixins/border-radius' as radius; @use 'src/scss/mixins/box-shadow' as shadow; @use 'src/scss/mixins/transition' as motion; .mixed { @include radius.border-radius(-1rem .5rem); @include shadow.box-shadow(0 1px 2px #000, 0 0 1px #fff); @include motion.transition(opacity 150ms ease); }",
  layoutFlags: "@use 'src/scss/config' with ($enable-container-classes: false, $enable-grid-classes: false, $enable-cssgrid: false); @use 'src/scss/tremplin-grid';",
  visualFlags: "@use 'src/scss/config' with ($enable-rounded: false, $enable-shadows: false, $enable-transitions: false); @use 'src/scss/mixins/border-radius' as radius; @use 'src/scss/mixins/box-shadow' as shadow; @use 'src/scss/mixins/transition' as motion; .feature { @include radius.border-radius(1rem, 2px); @include shadow.box-shadow(0 1px 2px #000); @include motion.transition(opacity 1s); }",
  api: "@use 'src/scss/utilities/api';"
}
beforeAll(async () => {
  await prepareApprovedSass()
  for (const source of Object.values(sources)) { sass(source); approvedSass(source) }
}, 90_000)
const checked = (key: keyof typeof sources) => {
  const css = sass(sources[key])
  expect(cssTree(css)).toBe(cssTree(approvedSass(sources[key])))
  return css
}

describe('strict pinned public CSS integration, no hybrid compatibility', () => {
  test('compares the entire full entry against the independently verified approved pin', () => {
    expect(checked('main')).not.toBe('')
  })
  test('configures actual root token maps instead of retired primary/focus exports', () => {
    const css = checked('tokens')
    expect(values(':root', '--trm-body-line-height', css)).toContain('1.7')
    expect(values(':root', '--trm-focus-ring-offset', css)).toContain('2px')
    expect(values(':root', '--trm-primary', css)).toHaveLength(0)
  })
  test('merges supported scale defaults and strips explicit nulls', () => {
    const css = checked('scales')
    expect(values('.configured', 'one', css)).toEqual(['0.375rem'])
    expect(values('.configured', 'three', css)).toEqual(['0.5rem'])
    expect(values('.configured', 'removed', css)).toEqual([])
  })
  test('publishes canonical shared utility families', () => {
    const css = checked('utilities')
    for (const selector of ['.object-fit-cover', '.overflow-x-auto', '.min-vh-100', '.user-select-none', '.fs-xl', '.ratio-16x9', '.m-12', '.m-auto']) expect(rules(selector, css).length, selector).toBeGreaterThan(0)
  })
  test('configures importance and responsive generation per family', () => {
    const css = checked('importance')
    for (const selector of ['.cursor-pointer', '.md\\:cursor-pointer']) {
      expect(values(selector, 'cursor', css)).toEqual(['pointer'])
      expect(rules(selector, css)[0]!.nodes.some(node => node.type === 'decl' && node.important)).toBe(false)
    }
    expect(rules('.d-md-flex', css)).toHaveLength(0)
  })
  test('imports explicit radius, shadow and transition modules', () => {
    const css = checked('mixins')
    expect(values('.mixed', 'border-radius', css)).toEqual(['0 0.5rem'])
    expect(values('.mixed', 'box-shadow', css)).toEqual(['0 1px 2px #000, 0 0 1px #fff'])
    const transition = rules('.mixed', css).find(rule => rule.nodes.some(node => node.type === 'decl' && node.prop === 'transition'))!
    expect(ancestors(transition)).toContain('@media (prefers-reduced-motion: no-preference)')
  })
  test('keeps selected layout utilities when automatic layout classes are disabled', () => {
    const css = checked('layoutFlags')
    for (const selector of ['.container', '.row', '.grid']) expect(rules(selector, css)).toHaveLength(0)
    expect(rules('.row-gap-3', css)).toHaveLength(1)
    expect(rules('.grid-cols-2', css)).toHaveLength(1)
  })
  test('honors mixin flags and radius fallbacks without inventing global removal', () => {
    const css = checked('visualFlags')
    expect(values('.feature', 'border-radius', css)).toEqual(['2px'])
    expect(values('.feature', 'box-shadow', css)).toHaveLength(0)
    expect(values('.feature', 'transition', css)).toHaveLength(0)
  })
  test('standalone utility API emits utilities, not unrelated helpers', () => {
    const css = checked('api')
    expect(rules('.md\\:d-flex', css)).toHaveLength(1)
    expect(rules('.visually-hidden', css)).toHaveLength(0)
  })
  test('keeps unprefixed component/layout classes and canonical viewport syntax', () => {
    const css = checked('main')
    for (const selector of ['.container', '.btn-solid', '.theme-primary', '.md\\:col-6', '.lg\\:row-cols-4 > *']) expect(rules(selector, css).length, selector).toBeGreaterThan(0)
    for (const selector of ['.btn-primary', '.col-md-6', '.row-cols-lg-4']) expect(rules(selector, css), selector).toHaveLength(0)
    expect(css).not.toMatch(/\.trm-[\w-]+/)
  })
  test('does not invent default opacity state, dark/print or CQ compatibility classes', () => {
    const css = checked('main')
    for (const selector of ['.d-md-flex', '.hover-opacity-75:hover', '.dark-bg-surface', '.d-print-none', '.cq-span-md-6', '.cq-d-lg-grid']) expect(rules(selector, css), selector).toHaveLength(0)
    expect(rules('.lg\\:mt-4', css).length).toBeGreaterThan(0)
  })
  test('keeps content/forms and actual modern component classes in core', () => {
    const css = checked('main')
    for (const selector of ['.prose', '.form-floating', '.form-adorn', '.chip-input', '.accordion', '.avatar', '.list-group', '.stepper', '.table-card']) expect(rules(selector, css).length, selector).toBeGreaterThan(0)
  })
  test('does not mix optional extension presentation into the strict core', () => {
    const css = checked('main')
    for (const selector of ['.error-summary', '.timeline', '.data-table', '.status', '.divider', '.empty-state', '.command-palette']) expect(rules(selector, css), selector).toHaveLength(0)
    const extensions = sheet('extensions')
    for (const selector of ['.error-summary', '.timeline', '.data-table', '.command-palette']) expect(rules(selector, extensions).length, selector).toBeGreaterThan(0)
  })
  test('retains logical overlay directions, native backdrop and current interaction selectors', () => {
    const root = ast(checked('main'))
    for (const fragment of ['.drawer', '.tooltip', '.popover', '.navbar-expand', '.carousel-item', '.menu-item', '.combobox', '[data-vc=calendar]']) {
      let found = false
      root.walkRules(rule => { if (rule.selector.includes(fragment)) found = true })
      expect(found, fragment).toBe(true)
    }
  })
})
