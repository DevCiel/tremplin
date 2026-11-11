import { describe, expect, it } from 'vitest'
import reference from './bootstrap6-layout-defaults-reference.json'
import { sass, sheet, ast, rules, values, ancestors, sassPin } from './helpers/pinned-sass'

const css = sheet('tremplin-grid')
const tree = ast(css)
const snippet = (source: string) => {
  const actual = sass(source)
  expect(actual).toBe(sass(source, true))
  return actual
}

describe('Pinned Bootstrap 6 breakpoint and container defaults', () => {
  it('binds the literal default inventory to the active pin', () => {
    expect(reference.upstreamCommit).toBe(sassPin.commit)
    const output = snippet("@use 'sass:map'; @use 'src/scss/config' as cfg; .config { names: map.keys(cfg.$breakpoints); @each $key, $value in cfg.$breakpoints { --bp-#{$key}: #{$value}; } @each $key, $value in cfg.$container-max-widths { --container-#{$key}: #{$value}; } }")
    expect(output).toContain('names: xs, sm, md, lg, xl, 2xl')
    for (const [name, value] of Object.entries(reference.breakpoints)) expect(output).toContain('--bp-' + name + ': ' + value)
    for (const [name, value] of Object.entries(reference.containerMaxWidths)) expect(output).toContain('--container-' + name + ': ' + value)
    expect(output).not.toContain('--bp-xxl')
  })

  it('uses exact Sass map key identity, not retired xxl or quoted-key coercion', () => {
    const output = snippet("@use 'sass:meta'; @use 'src/scss/layout/breakpoints' as bp; .values { canonical: bp.breakpoint-min(2xl); quoted: meta.inspect(bp.breakpoint-min('2xl')); old: meta.inspect(bp.breakpoint-min(xxl)); next: bp.breakpoint-next(xl); last: meta.inspect(bp.breakpoint-next(2xl)); }")
    expect(output).toContain('canonical: 1536px')
    expect(output).toContain('quoted: null')
    expect(output).toContain('old: null')
    expect(output).toContain('next: 2xl')
    expect(output).toContain('last: null')
  })

  it('emits canonical escaped prefixes without Tremplin-only infix or xxl aliases', () => {
    for (const selector of ['.\\32 xl\\:container', '.\\32 xl\\:col-6', '.\\32 xl\\:offset-0', '.\\32 xl\\:row-cols-2 > *', '.\\32 xl\\:g-col-6', '.\\32 xl\\:g-start-2', '.\\32 xl\\:p-3', '.\\32 xl\\:d-flex']) {
      expect(rules(selector, tree).length, selector).toBeGreaterThan(0)
    }
    for (const selector of ['.xxl\\:container', '.col-2xl-6', '.col-xxl-6', '.p-2xl-3', '.span-2xl-6']) expect(rules(selector, tree), selector).toEqual([])
    for (const rule of rules('.\\32 xl\\:col-6', tree)) expect(ancestors(rule, 'media')).toEqual(['(width >= 1536px)'])
    for (const rule of rules('.\\32 xl\\:g-col-6', tree)) expect(ancestors(rule, 'container')).toEqual(['(width >= 1536px)'])
  })

  it('emits only configured breakpoint runtime tokens and no legacy Grid child resets', () => {
    expect(css).toContain('--trm-breakpoint-2xl: 1536px')
    expect(css).not.toContain('--trm-breakpoint-xxl')
    expect(css).not.toContain('.grid > :where(')
    expect(css).not.toContain('--trm-grid-span')
  })

  it('preserves class and value fragments containing 2xl without alias rewriting', () => {
    const output = snippet("@use 'src/scss/tremplin-utilities' with ($utilities: ('project': (property: opacity, class: project-2xl, responsive: true, state: hover, values: (2xl: .5))));")
    for (const selector of ['.project-2xl-2xl', '.\\32 xl\\:project-2xl-2xl', '.\\32 xl\\:hover\\:project-2xl-2xl:hover']) expect(rules(selector, output).length, selector).toBeGreaterThan(0)
    expect(output).not.toContain('.xxl\\:')
    expect(output).not.toContain('.project-xxl')
  })

  it('supports an explicit independent xxl tier, without creating an automatic alias', () => {
    const output = snippet("@use 'src/scss/config' with ($breakpoints: (base: 0, 2xl: 900px, xxl: 1100px)); @use 'src/scss/layout/breakpoints' as bp; @use 'src/scss/layout/grid'; .values { canonical: bp.breakpoint-min(2xl); custom: bp.breakpoint-min(xxl); }")
    expect(output).toContain('canonical: 900px')
    expect(output).toContain('custom: 1100px')
    for (const rule of rules('.\\32 xl\\:col-6', output)) expect(rule.selectors).not.toContain('.xxl\\:col-6')
    expect(rules('.xxl\\:col-6', output).length).toBeGreaterThan(0)
  })

  it('uses the canonical container-max-widths map with merged defaults and null removals', () => {
    const output = snippet("@use 'src/scss/config' with ($container-max-widths: (md: null, 2xl: 1450px)); @use 'src/scss/layout/containers';")
    expect(output).not.toContain('max-width: 720px')
    expect(values('.\\32 xl\\:container', 'max-width', output)).toContain('1450px')
    for (const reference of [false, true]) expect(() => sass("@use 'src/scss/tremplin' with ($container-widths: (md: 720px));", reference)).toThrow(/not declared with !default/)
  })

  it('keeps spacing and gutter defaults independent and exposes no separate legacy CQ scale', () => {
    const output = snippet("@use 'sass:map'; @use 'sass:meta'; @use 'src/scss/config' as cfg; .values { space: map.get(cfg.$spacers, 3); gutter: cfg.$grid-gutter-x; legacy-cq: meta.global-variable-exists('container-breakpoints', cfg); }")
    expect(output).toContain('space: 0.5rem')
    expect(output).toContain('gutter: 1.5rem')
    expect(output).toContain('legacy-cq: false')
  })
})
