import { sass } from './helpers/pinned-sass'
import { describe, expect, it } from 'vitest'

const snippet = (source: string) => {
  const input = "@use 'src/scss/layout/breakpoints' as bp; " + source
  const actual = sass(input)
  expect(actual).toBe(sass(input, true))
  return actual
}
const media = (call: string) => snippet(`@include bp.${call} { .probe { display: grid; } }`)
const container = (call: string) => media(`container-breakpoint-${call}`)

describe('Bootstrap 6 breakpoint functions and loops', () => {
  it('returns next/min/max values without Bootstrap 5 epsilon subtraction', () => {
    const css = snippet("@use 'sass:meta'; .values { --next: #{bp.breakpoint-next(md)}; --last: #{meta.inspect(bp.breakpoint-next(2xl))}; --minimum: #{bp.breakpoint-min(md)}; --maximum: #{bp.breakpoint-max(md)}; --zero: #{meta.inspect(bp.breakpoint-min(xs))}; --zero-max: #{meta.inspect(bp.breakpoint-max(xs))}; --null-max: #{meta.inspect(bp.breakpoint-max(null))}; }")
    for (const value of ['--next: lg', '--last: null', '--minimum: 768px', '--maximum: 768px', '--zero: null', '--zero-max: null', '--null-max: null']) expect(css).toContain(value)
    expect(css).not.toContain('47.98')
  })

  it('uses insertion order or an explicit names list instead of sorting widths', () => {
    const css = snippet(".values { --next: #{bp.breakpoint-next(compact, (base: 0, compact: 400px, wide: 800px))}; --explicit: #{bp.breakpoint-next(sm, $breakpoint-names: (sm, xl, md))}; }")
    expect(css).toContain('--next: wide')
    expect(css).toContain('--explicit: xl')
  })

  it('keeps upstream null results for missing min/max lookups and errors for unknown next names', () => {
    const css = snippet("@use 'sass:meta'; .values { --minimum: #{meta.inspect(bp.breakpoint-min(missing))}; --maximum: #{meta.inspect(bp.breakpoint-max(missing))}; }")
    expect(css).toContain('--minimum: null')
    expect(css).toContain('--maximum: null')
    expect(() => snippet('.probe { width: bp.breakpoint-next(missing); }')).toThrow(/not found/)
    expect(snippet('.probe { content: bp.breakpoint-prefix(missing); }')).toContain('content: ""')
    expect(container('up(missing)')).not.toContain('@container')
  })

  it('provides current/next/escaped-next-prefix values including the terminal iteration', () => {
    const source = "@include bp.loop-breakpoints-down((base: 0, compact: 400px, '2xl': 800px)) using ($name, $next, $prefix) { .#{$prefix}loop-#{$name} { --next: #{if(sass($next == null): 'end'; else: $next)}; } }"
    const css = snippet(source)
    expect(css).toContain('.compact\\:loop-base')
    expect(css).toContain('.\\32 xl\\:loop-compact')
    expect(css).toMatch(/\.loop-2xl \{\s*--next: end;/)
    expect(snippet(source.replace('loop-breakpoints-down', 'loop-breakpoints'))).toBe(css)
    expect(snippet(".probe { content: bp.breakpoint-prefix(null); }")).toContain('content: ""')
  })

  it('supports empty and single-tier maps without out-of-range list access', () => {
    expect(snippet('@include bp.loop-breakpoints-down(()) using ($name, $next, $prefix) { .probe { color: red; } }')).toBe('')
    const css = snippet('@include bp.loop-breakpoints-down((base: 0)) using ($name, $next, $prefix) { .#{$prefix}probe { color: red; } } @include bp.media-breakpoint-only(base, (base: 0)) { .only { color: red; } } @include bp.container-breakpoint-only(base, shell, (base: 0)) { .container-only { color: red; } }')
    expect(css).toContain('.probe')
    expect(css).toContain('.only')
    expect(css).toContain('.container-only')
    expect(css).not.toContain('@media')
    expect(css).not.toContain('@container')
  })
})

describe('Bootstrap 6 viewport range mixins', () => {
  for (const [call, expected] of [
    ['media-breakpoint-up(md)', '@media (width >= 768px)'],
    ['media-breakpoint-down(md)', '@media (width < 768px)'],
    ['media-breakpoint-down(2xl)', '@media (width < 1536px)'],
    ['media-breakpoint-between(md, xl)', '@media (width >= 768px) and (width < 1280px)'],
    ['media-breakpoint-between(xs, md)', '@media (width < 768px)'],
    ['media-breakpoint-between(md, null)', '@media (width >= 768px)'],
    ['media-breakpoint-only(xs)', '@media (width < 576px)'],
    ['media-breakpoint-only(md)', '@media (width >= 768px) and (width < 1024px)'],
    ['media-breakpoint-only(2xl)', '@media (width >= 1536px)'],
    ['media-breakpoint-between(small, large, (small: 20em, large: 40em))', '@media (width >= 20em) and (width < 40em)']
  ] as const) it(`${call} emits an exact range`, () => { expect(media(call)).toContain(expected) })

  for (const call of ['media-breakpoint-up(xs)', 'media-breakpoint-up(missing)', 'media-breakpoint-down(xs)', 'media-breakpoint-down(null)', 'media-breakpoint-between(xs, null)', 'media-breakpoint-between(null, null)']) {
    it(`${call} emits content without a query`, () => { const css = media(call); expect(css).toContain('.probe'); expect(css).not.toContain('@media') })
  }

  it('does not expose the retired media-up alias', () => {
    expect(snippet("@use 'sass:meta'; .probe { available: meta.mixin-exists('media-up', bp); }")).toContain('available: false')
    for (const reference of [false, true]) expect(() => sass("@use 'src/scss/layout/breakpoints' as bp; @include bp.media-up(md) { .probe { display: grid; } }", reference)).toThrow(/Undefined mixin/)
  })
})

describe('Bootstrap 6 container range mixins', () => {
  for (const [call, expected] of [
    ['down(md)', '@container (width < 768px)'],
    ['down(md, shell)', '@container shell (width < 768px)'],
    ['between(sm, lg)', '@container (width >= 576px) and (width < 1024px)'],
    ['between(sm, lg, shell)', '@container shell (width >= 576px) and (width < 1024px)'],
    ['between(xs, md, shell)', '@container shell (width < 768px)'],
    ['between(md, null, shell)', '@container shell (width >= 768px)'],
    ['only(xs)', '@container (width < 576px)'],
    ['only(md, shell)', '@container shell (width >= 768px) and (width < 1024px)'],
    ['only(2xl, shell)', '@container shell (width >= 1536px)'],
    ['only(compact, shell, (base: 0, compact: 300.5px, wide: 600.5px))', '@container shell (width >= 300.5px) and (width < 600.5px)']
  ] as const) it(`${call} emits an exact named/unnamed range`, () => { expect(container(call)).toContain(expected) })

  for (const call of ['down(xs, shell)', 'down(null, shell)', 'between(xs, null, shell)', 'between(null, null, shell)', 'between(missing, null, shell)']) {
    it(`${call} emits content without a query`, () => { const css = container(call); expect(css).toContain('.probe'); expect(css).not.toContain('@container') })
  }

  it('does not reinterpret equal or reversed bounds as a different range', () => {
    expect(container('between(md, md)')).toContain('(width >= 768px) and (width < 768px)')
    expect(media('media-breakpoint-between(lg, sm)')).toContain('(width >= 1024px) and (width < 576px)')
    expect(() => container('only(missing)')).toThrow(/not found/)
    expect(() => media('media-breakpoint-only(missing)')).toThrow(/not found/)
  })
})
