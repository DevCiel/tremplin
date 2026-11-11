import { beforeAll, describe, expect, it } from 'vitest'
import { ancestors, ast, cssTree, rules, sass, sheet, values } from './helpers/pinned-sass'

let root: ReturnType<typeof ast>
const parity = (source: string) => {
  const output = sass(source)
  expect(cssTree(output)).toBe(cssTree(sass(source, true)))
  return ast(output)
}
beforeAll(() => {
  root = ast(sheet('helpers/hover-lift'))
  sheet('tremplin')
  sheet('tremplin-utilities')
}, 90_000)

describe('pinned Bootstrap 6 hover-lift helper', () => {
  it('owns the pinned transform, timing and box-shadow tokens', () => {
    for (const [token, value] of Object.entries({
      '--trm-hover-lift-transition-duration': '0.2s',
      '--trm-hover-lift-transition-timing': 'ease',
      '--trm-hover-lift-transform': 'translateY(-0.25rem)',
      '--trm-hover-lift-box-shadow': 'var(--trm-box-shadow-lg)'
    })) expect(values('.hover-lift', token, root)).toEqual([value])
    expect(values('.hover-lift:hover', 'transform', root)).toEqual(['var(--trm-hover-lift-transform)'])
    expect(values('.hover-lift:focus-visible', 'box-shadow', root)).toEqual(['var(--trm-hover-lift-box-shadow)'])
    expect(root.toString()).not.toContain('--trm-shadow-lg')
  })

  it('transitions only without a reduced-motion preference while retaining both state effects', () => {
    const transition = rules('.hover-lift', root).find(rule => rule.nodes.some(node => node.type === 'decl' && node.prop === 'transition'))!
    expect(ancestors(transition, 'media')).toEqual(['(prefers-reduced-motion: no-preference)'])
    expect(values('.hover-lift', 'transition', root)).toEqual(['transform var(--trm-hover-lift-transition-duration) var(--trm-hover-lift-transition-timing), box-shadow var(--trm-hover-lift-transition-duration) var(--trm-hover-lift-transition-timing)'])
    expect(ancestors(rules('.hover-lift:hover', root)[0]!, 'media')).toEqual([])
    expect(values('.hover-lift:hover', 'transform', root)).not.toContain('none')
  })

  it('merges module-owned overrides before loading the helper index without duplicate token declarations', () => {
    const output = parity("@use 'src/scss/helpers/hover-lift' with ($hover-lift-tokens: ('--trm-hover-lift-transform': translateY(-.5rem), '--trm-hover-lift-transition-duration': .12s)); @use 'src/scss/helpers';")
    expect(values('.hover-lift', '--trm-hover-lift-transform', output)).toEqual(['translateY(-0.5rem)'])
    expect(values('.hover-lift', '--trm-hover-lift-transition-duration', output)).toEqual(['0.12s'])
    expect(values('.hover-lift', '--trm-hover-lift-transition-timing', output)).toEqual(['ease'])
    expect(rules('.hover-lift:hover', output)).toHaveLength(1)
  })

  it('removes null token declarations without changing their consumption or inheritance', () => {
    const output = parity("@use 'src/scss/helpers/hover-lift' with ($hover-lift-tokens: ('--trm-hover-lift-box-shadow': null));")
    expect(values('.hover-lift', '--trm-hover-lift-box-shadow', output)).toEqual([])
    expect(values('.hover-lift:hover', 'box-shadow', output)).toEqual(['var(--trm-hover-lift-box-shadow)'])
    expect(output.toString()).not.toContain('@property')
  })

  it('honors disabled transitions and shadows without removing the state transform', () => {
    const output = parity("@use 'src/scss/config' with ($enable-transitions: false, $enable-shadows: false); @use 'src/scss/helpers/hover-lift';")
    expect(values('.hover-lift', 'transition', output)).toEqual([])
    expect(values('.hover-lift:hover', 'box-shadow', output)).toEqual([])
    expect(values('.hover-lift:hover', 'transform', output)).toEqual(['var(--trm-hover-lift-transform)'])
    expect(output.toString()).not.toContain('@media')
  })

  it('permits an explicit reduced-motion opt-out using the shared switch', () => {
    const output = parity("@use 'src/scss/config' with ($enable-reduced-motion: false); @use 'src/scss/helpers/hover-lift';")
    expect(ancestors(rules('.hover-lift', output)[0]!, 'media')).toEqual([])
    expect(values('.hover-lift', 'transition', output)).toHaveLength(1)
    expect(output.toString()).not.toContain('@media')
  })

  for (const entry of ['tremplin', 'tremplin-utilities']) {
    it(entry + ' includes the helper without duplicate tokens or property registrations', () => {
      const output = ast(sheet(entry))
      expect(values('.hover-lift', '--trm-hover-lift-transition-duration', output)).toEqual(['0.2s'])
      expect(values('.hover-lift:focus-visible', 'transform', output)).toHaveLength(1)
      const properties: string[] = []
      output.walkAtRules('property', node => { properties.push(node.params) })
      expect(properties).not.toContain('--trm-hover-lift-transform')
    })
  }
})
