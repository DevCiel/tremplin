import { beforeAll, describe, expect, it } from 'vitest'
import { ancestors, ast, cssTree, rules, sass, sheet, values } from './helpers/pinned-sass'

let stacks: ReturnType<typeof ast>
let positions: ReturnType<typeof ast>
const parity = (source: string) => {
  const output = sass(source)
  expect(cssTree(output)).toBe(cssTree(sass(source, true)))
  return ast(output)
}
beforeAll(() => {
  stacks = ast(sheet('helpers/stacks'))
  positions = ast(sheet('helpers/position'))
  sheet('tremplin-utilities')
}, 90_000)

describe('pinned Bootstrap 6 stack and position helpers', () => {
  it('establishes containment and inherited stack controls through upstream substring selectors', () => {
    expect(values('.stack-container', 'container-type', stacks)).toEqual(['inline-size'])
    const selector = '[class*=hstack]'
    expect(values(selector, 'display', stacks)).toEqual(['flex'])
    expect(values(selector, 'flex', stacks)).toEqual(['var(--trm-stack-flex, 1 1 auto)'])
    expect(values(selector, 'align-self', stacks)).toEqual(['var(--trm-stack-align-self, stretch)'])
    expect(values(selector, 'align-items', stacks)).toEqual(['var(--trm-stack-align-items, center)'])
    expect(values('[class*=vstack]', 'display', stacks)).toEqual(['flex'])
    expect(values('.hstack', '--trm-stack-direction', stacks)).toEqual(['row'])
    expect(values('.hstack', '--trm-stack-align-items', stacks)).toEqual(['flex-start'])
    expect(values('.vstack', '--trm-stack-direction', stacks)).toEqual(['column'])
    expect(values('.vstack', '--trm-stack-align-items', stacks)).toEqual(['stretch'])
    expect(values('.hstack', 'gap', stacks)).toEqual([])
  })

  it('uses canonical container prefixes rather than viewport or old cq scales', () => {
    expect(ancestors(rules('.md\\:hstack', stacks)[0]!, 'container')).toEqual(['(width >= 768px)'])
    expect(ancestors(rules('.md\\:vstack', stacks)[0]!, 'media')).toEqual([])
    expect(rules('.\\32 xl\\:hstack', stacks)).toHaveLength(1)
    for (const selector of ['.hstack-md', '.xxl\\:hstack', '.stack', '.cluster']) expect(rules(selector, stacks)).toEqual([])
    expect(stacks.toString()).not.toContain('@property --trm-stack-')
  })

  it('uses normal-priority physical sticky edges and root-owned layer inputs', () => {
    for (const [name, edge] of [['top', 'top'], ['bottom', 'bottom']] as const) {
      for (const prefix of ['', 'md\\:']) {
        const selector = '.' + prefix + 'sticky-' + name
        expect(values(selector, 'position', positions)).toEqual(['sticky'])
        expect(values(selector, edge, positions)).toEqual(['0'])
        expect(values(selector, 'z-index', positions)).toEqual(['var(--trm-z-sticky)'])
        expect(values(selector, 'inset-block-start', positions)).toEqual([])
        for (const rule of rules(selector, positions)) rule.walkDecls(node => { expect(Boolean(node.important)).toBe(false) })
      }
      expect(ancestors(rules('.md\\:sticky-' + name, positions)[0]!, 'media')).toEqual(['(width >= 768px)'])
    }
    expect(positions.toString()).not.toContain('@container')
    expect(values('.fixed-top', 'inset', positions)).toEqual(['0 0 auto'])
    expect(values('.fixed-bottom', 'inset', positions)).toEqual(['auto 0 0'])
    expect(values('.fixed-top', 'z-index', positions)).toEqual(['var(--trm-z-fixed)'])
  })

  it('shares exact custom breakpoint maps and escapes digit-prefixed names', () => {
    const output = parity("@use 'src/scss/config' with ($breakpoints: (base: 0, wide: 30rem, '2xl': 80rem)); @use 'src/scss/helpers/stacks'; @use 'src/scss/helpers/position';")
    for (const name of ['hstack', 'vstack', 'sticky-top', 'sticky-bottom']) expect(rules('.\\32 xl\\:' + name, output)).toHaveLength(1)
    expect(ancestors(rules('.wide\\:hstack', output)[0]!, 'container')).toEqual(['(width >= 30rem)'])
    expect(ancestors(rules('.wide\\:sticky-top', output)[0]!, 'media')).toEqual(['(width >= 30rem)'])
    expect(rules('.md\\:hstack', output)).toEqual([])
    expect(rules('.base\\:hstack', output)).toEqual([])
  })

  it('uses explicit breakpoint-module mixins and preserves the pinned unknown-key behavior', () => {
    const output = parity("@use 'src/scss/config' with ($breakpoints: (base: 0, wide: 30rem)); @use 'src/scss/layout/breakpoints' as bp; .frame { @include bp.set-container(inline-size, sidebar); } .size { @include bp.set-container(size); } @include bp.container-breakpoint-up(base) { .base { display: block; } } @include bp.container-breakpoint-up(wide, sidebar) { .named { display: grid; } } @include bp.loop-breakpoints-up() using ($name, $prefix) { .#{$prefix}probe { color: red; } } @include bp.container-breakpoint-up(missing) { .unknown { display: block; } }")
    expect(values('.frame', 'container', output)).toEqual(['sidebar/inline-size'])
    expect(values('.size', 'container-type', output)).toEqual(['size'])
    expect(ancestors(rules('.named', output)[0]!, 'container')).toEqual(['sidebar (width >= 30rem)'])
    expect(rules('.wide\\:probe', output)).toHaveLength(1)
    expect(ancestors(rules('.unknown', output)[0]!, 'container')).toEqual([])
    expect(values('.unknown', 'display', output)).toEqual(['block'])
  })

  it('includes stacks and position in utilities-only CSS without legacy stack or cluster rules', () => {
    const root = ast(sheet('tremplin-utilities'))
    for (const selector of ['.stack-container', '.hstack', '.vstack', '.md\\:hstack', '.md\\:sticky-top', '.fixed-top', '.fixed-bottom']) expect(rules(selector, root)).toHaveLength(1)
    for (const selector of ['.stack', '.cluster', '.sticky-md-top']) expect(rules(selector, root)).toEqual([])
  })
})
