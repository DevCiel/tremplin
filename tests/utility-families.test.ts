import { beforeAll, describe, expect, it } from 'vitest'
import { ancestors, rules, values } from './helpers/pinned-sass'
import { checkedFamily, familySource, prepareFamilies } from './helpers/family-sass'

const sources = {
  base: familySource(),
  configured: familySource('$spacers: (3: 2rem, 12: null), $zindex-levels: (dialog: 1200)'),
  removed: familySource('', '', "'space-x': null, 'divide-y': null, 'animation': null, 'link-opacity': null"),
  disabled: familySource('', '', "'animation': (enabled: false)"),
  renamed: familySource('', '', "'animation': (property: animation, class: project-motion, values: (none: none))"),
  switches: familySource('$enable-reduced-motion: false')
}
beforeAll(() => prepareFamilies(sources), 90_000)
describe('pinned Bootstrap 6 shared utility families', () => {
  it('matches the complete utilities distribution to the independent pin', () => { checkedFamily(sources.base) })
  it('provides native schemes and the current root font tokens without global importance', () => {
    const root = checkedFamily(sources.base)
    expect(values('.color-scheme-auto', 'color-scheme', root)).toEqual(['light dark'])
    expect(values('.font-monospace', 'font-family', root)).toEqual(['var(--trm-font-mono)'])
    expect(values('.font-body', 'font-family', root)).toEqual(['var(--trm-body-font-family)'])
    rules('.font-body', root)[0]!.walkDecls(node => { expect(Boolean(node.important)).toBe(false) })
  })
  it('uses the pinned numeric and semantic z-index map without old overlay aliases', () => {
    const root = checkedFamily(sources.base)
    for (const [key, value] of Object.entries({ n1: -1, 0: 0, 1: 1, 2: 2, 3: 3, menu: 1000, sticky: 1010, fixed: 1020, drawer: 1030, dialog: 1040, popover: 1050, tooltip: 1060, toast: 1070 })) expect(values('.z-' + key, 'z-index', root)).toEqual([String(value)])
    for (const key of ['dropdown', 'modal', 'offcanvas']) expect(rules('.z-' + key, root)).toEqual([])
  })
  it('generates viewport-prefixed alignment families without infix aliases', () => {
    const root = checkedFamily(sources.base)
    for (const [name, value] of [['justify-items', 'center'], ['justify-self', 'end'], ['place-items', 'center']] as const) {
      expect(values('.md\\:' + name + '-' + value, name, root)).toEqual([value])
      expect(ancestors(rules('.md\\:' + name + '-' + value, root)[0]!, 'media')).toEqual(['(width >= 768px)'])
      expect(rules('.' + name + '-md-' + value, root)).toEqual([])
    }
  })
  it('uses zero-specificity child exclusions and logical spacing/divider edges', () => {
    const root = checkedFamily(sources.base)
    expect(values(':where(.space-x-3 > :not(:last-child))', 'margin-inline-end', root)).toEqual(['0.5rem'])
    expect(values(':where(.md\\:space-y-2 > :not(:last-child))', 'margin-block-end', root)).toEqual(['0.375rem'])
    expect(values(':where(.divide-x > :not(:first-child))', 'border-inline-start', root)).toEqual(['var(--trm-border-width) var(--trm-border-style) var(--trm-border-color)'])
    expect(values(':where(.md\\:divide-y-0 > :not(:first-child))', 'border-block-start', root)).toEqual(['0'])
  })
  it('provides ten-step link opacity with hover only and no added variable fallback', () => {
    const root = checkedFamily(sources.base)
    for (let step = 10; step <= 100; step += 10) {
      const value = step === 100 ? 'var(--trm-link-color)' : 'color-mix(in oklch, var(--trm-link-color) ' + step + '%, transparent)'
      expect(values('.link-' + step, 'color', root)).toEqual([value])
      expect(values('.hover\\:link-' + step + ':hover', 'color', root)).toEqual([value])
      expect(rules('.focus\\:link-' + step + ':focus', root)).toEqual([])
    }
  })
  it('emits motion controls, global keyframes and a normal-priority flat preference guard', () => {
    const root = checkedFamily(sources.base)
    expect(values('.transition-none', 'transition', root)).toEqual(['none'])
    expect(values('.animation-none', 'animation', root)).toEqual(['none'])
    expect(values('.animation-pop', 'animation', root).at(-1)).toBe('none')
    const guard = rules('.animation-pop', root).at(-1)!
    expect(ancestors(guard, 'media')).toEqual(['(prefers-reduced-motion: reduce)'])
    const frames: string[] = []
    root.walkAtRules('keyframes', node => { frames.push(node.params); expect(ancestors(node)).toEqual([]) })
    expect(frames).toEqual(['animation-shake', 'animation-pop'])
  })
  it('configures spacing independently and replaces the semantic layer map exactly', () => {
    const root = checkedFamily(sources.configured)
    expect(values(':where(.space-y-3 > :not(:last-child))', 'margin-block-end', root)).toEqual(['2rem'])
    expect(rules(':where(.space-y-12 > :not(:last-child))', root)).toEqual([])
    expect(values('.z-dialog', 'z-index', root)).toEqual(['1200'])
    expect(rules('.z-menu', root)).toEqual([])
  })
  it('removes mapped rules but preserves pin keyframes/flat guards when the animation key remains', () => {
    const removed = checkedFamily(sources.removed)
    for (const selector of [':where(.space-x-3 > :not(:last-child))', ':where(.divide-y > :not(:first-child))', '.animation-none', '.link-50']) expect(rules(selector, removed)).toEqual([])
    for (const source of [sources.removed, sources.disabled, sources.renamed]) {
      const root = checkedFamily(source)
      expect(root.toString()).toContain('@keyframes animation-pop')
      expect(values('.animation-pop', 'animation', root)).toEqual(['none'])
    }
    expect(values('.project-motion-none', 'animation', checkedFamily(sources.renamed))).toEqual(['none'])
  })
  it('disables the preference guard without removing keyframes or inventing a global importance option', () => {
    const root = checkedFamily(sources.switches)
    expect(root.toString()).not.toContain('prefers-reduced-motion')
    expect(root.toString()).toContain('@keyframes animation-pop')
  })
})
