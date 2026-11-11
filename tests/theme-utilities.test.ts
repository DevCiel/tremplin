import { beforeAll, describe, expect, it } from 'vitest'
import { ancestors, rules, values } from './helpers/pinned-sass'
import { registrations } from './helpers/pinned-utilities'
import { checkedFamily, familySource, prepareFamilies } from './helpers/family-sass'

const sources = {
  base: familySource(),
  custom: familySource('', '$theme-colors: (brand: (bg: red, outline: blue), primary: null)'),
  removed: familySource('', '', "'theme-subtle': null, 'theme-border': (enabled: false), 'theme-contrast': null, 'gradient': null"),
  variants: familySource('', '', "'theme-subtle': (property: (background-color: var(--trm-theme-bg-subtle), color: var(--trm-theme-fg)), class: project-surface, values: (null: null), important: true, responsive: true, print: true, dark: true, state: hover)"),
  gradient: familySource('$gradient: linear-gradient(90deg, red, blue)'),
  mixinOff: "@use 'src/scss/config' with ($enable-gradients: false); @use 'src/scss/mixins/gradients' as g; .probe { @include g.gradient-bg(red); } .three { @include g.gradient-x-three-colors(red, gold, 40%, blue); }",
  mixinOn: "@use 'src/scss/config' with ($enable-gradients: true); @use 'src/scss/mixins/gradients' as g; .probe { @include g.gradient-bg(red); }"
}
beforeAll(() => prepareFamilies(sources), 90_000)
describe('pinned Bootstrap 6 theme modifiers and gradients', () => {
  it('generates contextual role references without a legacy color alias or private registration', () => {
    const root = checkedFamily(sources.base)
    for (const name of ['primary', 'accent', 'secondary', 'success', 'danger', 'warning', 'info', 'inverse']) {
      expect(values('.theme-' + name, '--trm-theme-bg', root)).toEqual(['var(--trm-' + name + '-bg)'])
      expect(values('.theme-' + name, '--trm-theme-base', root)).toEqual(['var(--trm-' + name + '-base)'])
      expect(values('.theme-' + name, '--trm-theme-color', root)).toEqual([])
    }
    expect(registrations(root).filter(name => name.startsWith('--trm-theme-'))).toEqual([])
    expect(ancestors(rules('.theme-primary', root)[0]!, 'layer')).toEqual(['helpers'])
  })
  it('resets the union of configured keys to initial without reviving removed colors', () => {
    const root = checkedFamily(sources.custom)
    expect(rules('.theme-primary', root)).toEqual([])
    expect(values('.theme-brand', '--trm-theme-outline', root)).toEqual(['var(--trm-brand-outline)'])
    for (const key of ['base', 'bg', 'fg', 'contrast', 'focus-ring', 'outline']) expect(values('.theme-reset', '--trm-theme-' + key, root)).toEqual(['initial'])
    expect(values('.theme-reset', '--trm-theme-color', root)).toEqual([])
  })
  it('coordinates normal-priority surface paint separately from inheriting helper reminting', () => {
    const root = checkedFamily(sources.base)
    for (const [name, bg, fg] of [['contrast', 'bg', 'contrast'], ['subtle', 'bg-subtle', 'fg'], ['muted', 'bg-muted', 'fg-emphasis']] as const) {
      expect(values('.theme-' + name, 'background-color', root)).toEqual(['var(--trm-theme-' + bg + ')'])
      expect(values('.theme-' + name, 'color', root)).toEqual(['var(--trm-theme-' + fg + ')'])
    }
    expect(values('.theme-contrast', '--trm-theme-fg', root)).toEqual(['var(--trm-theme-contrast)'])
    expect(values('.theme-border', 'border', root)).toEqual(['var(--trm-border-width) solid var(--trm-theme-border)'])
  })
  it('removes surface paint without removing the separate helper foreground reminting', () => {
    const root = checkedFamily(sources.removed)
    expect(rules('.theme-subtle', root)).toEqual([])
    expect(rules('.theme-border', root)).toEqual([])
    expect(values('.theme-contrast', 'background-color', root)).toEqual([])
    expect(values('.theme-contrast', '--trm-theme-fg', root)).toEqual(['var(--trm-theme-contrast)'])
    expect(rules('.bg-gradient', root)).toEqual([])
  })
  it('supports explicit surface states, media and property importance', () => {
    const root = checkedFamily(sources.variants)
    for (const selector of ['.project-surface', '.md\\:project-surface', '.hover\\:project-surface:hover', '.print\\:project-surface', '.dark\\:project-surface']) {
      expect(values(selector, 'background-color', root)).toEqual(['var(--trm-theme-bg-subtle)'])
      rules(selector, root)[0]!.walkDecls(node => { expect(node.important).toBe(true) })
    }
  })
  it('configures the gradient root token without claiming an upstream forced-colors override', () => {
    const root = checkedFamily(sources.gradient)
    expect(values(':root', '--trm-gradient', root)).toContain('linear-gradient(90deg, red, blue)')
    expect(values('.bg-gradient', 'background-image', root)).toEqual(['var(--trm-gradient)'])
    expect(root.toString()).not.toContain('@media (forced-colors: active)')
  })
  it('imports gradient mixins explicitly and keeps their switch separate from the gradient utility', () => {
    const off = checkedFamily(sources.mixinOff), on = checkedFamily(sources.mixinOn)
    expect(values('.probe', 'background-color', off)).toEqual(['red'])
    expect(values('.probe', 'background-image', off)).toEqual([])
    expect(values('.probe', 'background-image', on)).toEqual(['var(--trm-gradient)'])
    expect(values('.three', 'background-image', off)).toEqual(['linear-gradient(to right, red, gold 40%, blue)'])
  })
})
