import { beforeAll, describe, expect, it } from 'vitest'
import { ancestors, ast, cssTree, rules, sass, sheet, values } from './helpers/pinned-sass'

const styles: Record<string, ReturnType<typeof ast>> = {}
const parity = (source: string) => {
  const output = sass(source)
  expect(cssTree(output)).toBe(cssTree(sass(source, true)))
  return ast(output)
}
beforeAll(() => {
  for (const entry of ['helpers/focus-ring', 'helpers/icon-link', 'helpers/stretched-link', 'helpers/vr', 'root', 'tremplin', 'tremplin-utilities']) styles[entry] = ast(sheet(entry))
}, 90_000)

describe('pinned Bootstrap 6 focus, icon-link, stretched-link and vertical-rule helpers', () => {
  it('uses root focus geometry and contextual color without legacy fallbacks or helper-owned offsets', () => {
    const root = styles['helpers/focus-ring']!
    expect(values('.focus-ring:focus-visible', 'outline', root)).toEqual(['var(--trm-focus-ring-width) solid var(--trm-theme-focus-ring, var(--trm-focus-ring-color))'])
    expect(values('.focus-ring:focus-visible', 'outline-offset', root)).toEqual([])
    expect(ancestors(rules('.focus-ring:focus-visible', root)[0]!, 'layer')).toEqual(['helpers'])
    expect(values(':root', '--trm-focus-ring-width', styles.root!)).toContain('3px')
    expect(values(':root', '--trm-focus-ring-offset', styles.root!)).toContain('1px')
    expect(values(':root', '--trm-focus-ring-color', styles.root!)).toContain('var(--trm-primary-focus-ring)')
    expect(root.toString()).not.toContain('--trm-focus-color')
    expect(root.toString()).not.toContain('Highlight')
  })

  it('configures focus through the root token map and explicit mixin module', () => {
    const output = parity("@use 'src/scss/root' with ($root-tokens: ('--trm-focus-ring-width': 4px, '--trm-focus-ring-offset': 3px)); @use 'src/scss/mixins/focus-ring' as focus; .project:focus-visible { @include focus.focus-ring(true, #075985); } .default:focus-visible { @include focus.focus-ring(); }")
    expect(values(':root', '--trm-focus-ring-width', output)).toContain('4px')
    expect(values(':root', '--trm-focus-ring-offset', output)).toContain('3px')
    expect(values('.project:focus-visible', 'outline', output)).toEqual(['var(--trm-focus-ring-width) solid #075985'])
    expect(values('.project:focus-visible', 'outline-offset', output)).toEqual(['var(--trm-focus-ring-offset)'])
    expect(values('.default:focus-visible', 'outline', output)).toEqual(['var(--trm-focus-ring)'])
    expect(values('.default:focus-visible', 'outline-offset', output)).toEqual([])
    expect(() => sass("@use 'src/scss/tremplin' with ($focus-ring-width: 4px);")).toThrow(/not declared with !default/)
  })

  it('sizes and animates only direct bi children, not arbitrary SVGs or old icon hooks', () => {
    const root = styles['helpers/icon-link']!
    expect(values('.icon-link', '--trm-icon-link-gap', root)).toEqual(['0.375rem'])
    expect(values('.icon-link', '--trm-icon-link-icon-size', root)).toEqual(['1em'])
    expect(values('.icon-link', 'text-decoration-color', root)).toEqual(['color-mix(in oklch, var(--trm-link-color) 50%, transparent)'])
    expect(values('.icon-link > .bi', 'width', root)).toEqual(['var(--trm-icon-link-icon-size)'])
    expect(values('.icon-link > .bi', 'height', root)).toEqual(['var(--trm-icon-link-icon-size)'])
    for (const state of ['hover', 'focus-visible']) expect(values('.icon-link-hover:' + state + ' > .bi', 'transform', root)).toEqual(['var(--trm-icon-link-transform, var(--trm-icon-link-icon-transform))'])
    for (const selector of ['.icon-link > svg', '.icon-link > .icon', '.icon-link-hover:hover > svg', '.icon-link-hover:hover .bi']) expect(rules(selector, root)).toEqual([])
  })

  it('merges module-owned icon tokens, removes null tokens and loads each helper only once', () => {
    const output = parity("@use 'src/scss/helpers/icon-link' with ($icon-link-tokens: ('--trm-icon-link-gap': .75rem, '--trm-icon-link-icon-transform': null)); @use 'src/scss/helpers';")
    expect(values('.icon-link', '--trm-icon-link-gap', output)).toEqual(['0.75rem'])
    expect(values('.icon-link', '--trm-icon-link-icon-transform', output)).toEqual([])
    expect(rules('.icon-link', output)).toHaveLength(1)
  })

  it('honors transition and reduced-motion switches while retaining icon state transforms', () => {
    const normal = styles['helpers/icon-link']!
    const transition = rules('.icon-link > .bi', normal).find(rule => rule.nodes.some(node => node.type === 'decl' && node.prop === 'transition'))!
    expect(ancestors(transition, 'media')).toEqual(['(prefers-reduced-motion: no-preference)'])
    for (const [config, hasTransition, hasMedia] of [
      ['$enable-transitions: false', false, false],
      ['$enable-reduced-motion: false', true, false]
    ] as const) {
      const output = parity("@use 'src/scss/config' with (" + config + "); @use 'src/scss/helpers/icon-link';")
      expect(values('.icon-link > .bi', 'transition', output).length > 0).toBe(hasTransition)
      expect(output.toString().includes('@media')).toBe(hasMedia)
      expect(values('.icon-link-hover:hover > .bi', 'transform', output)).toHaveLength(1)
    }
  })

  it('stretches after by default and supports a configured before pseudo-element and layer', () => {
    expect(values('.stretched-link', '--trm-stretched-link-z-index', styles['helpers/stretched-link']!)).toEqual(['1'])
    expect(values('.stretched-link::after', 'inset', styles['helpers/stretched-link']!)).toEqual(['0'])
    const output = parity("@use 'src/scss/helpers/stretched-link' with ($stretched-link-pseudo-element: before, $stretched-link-tokens: ('--trm-stretched-link-z-index': 7));")
    expect(values('.stretched-link', '--trm-stretched-link-z-index', output)).toEqual(['7'])
    expect(values('.stretched-link::before', 'position', output)).toEqual(['absolute'])
    expect(values('.stretched-link::before', 'inset', output)).toEqual(['0'])
    expect(rules('.stretched-link::after', output)).toEqual([])
  })

  it('preserves upstream pseudo-name forwarding rather than inventing Sass validation', () => {
    const output = parity("@use 'src/scss/helpers/stretched-link' with ($stretched-link-pseudo-element: banana);")
    expect(rules('.stretched-link::banana', output)).toHaveLength(1)
  })

  it('uses physical vertical-rule dimensions and opaque boundary tokens without literal fallbacks', () => {
    const root = styles['helpers/vr']!
    expect(values('.vr', 'width', root)).toEqual(['var(--trm-vr-border-width, var(--trm-border-width))'])
    expect(values('.vr', 'min-height', root)).toEqual(['1em'])
    expect(values('.vr', 'background-color', root)).toEqual(['var(--trm-border-color)'])
    for (const property of ['inline-size', 'min-block-size', 'opacity']) expect(values('.vr', property, root)).toEqual([])
  })

  for (const entry of ['tremplin', 'tremplin-utilities']) {
    it(entry + ' includes the helpers without freezing their inheriting input tokens', () => {
      const root = styles[entry]!
      for (const selector of ['.focus-ring:focus-visible', '.icon-link', '.icon-link-hover:hover > .bi', '.stretched-link::after', '.vr']) expect(rules(selector, root).length).toBeGreaterThan(0)
      const registrations: string[] = []
      root.walkAtRules('property', node => { registrations.push(node.params) })
      for (const token of ['--trm-icon-link-gap', '--trm-stretched-link-z-index', '--trm-vr-border-width']) expect(registrations).not.toContain(token)
    })
  }
})
