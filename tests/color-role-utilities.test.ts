import { beforeAll, describe, expect, it } from 'vitest'
import { rules, sass, values } from './helpers/pinned-sass'
import { registrations } from './helpers/pinned-utilities'
import { checkedFamily, familySource, prepareFamilies } from './helpers/family-sass'

const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'accent', 'inverse']
const sources = {
  base: familySource(),
  configured: familySource('', "$theme-colors: (primary: (fg: #123456, bg: #654321), accent: null, brand: (fg: #123456, bg: #abcdef)), $theme-fgs: (quiet: #123456, '4': null), $theme-bgs: (panel: #abcdef), $theme-borders: (panel: #123456)", "'bg-opacity': null"),
  removed: familySource('', '', "'fg': (property: color, class: project-fg, responsive: true, state: hover, print: true, dark: true, values: (brand: red)), 'bg-color': null, 'bg-color-subtle': null, 'bg-color-muted': null, 'bg-opacity': null, 'border-color': null, 'border-color-subtle': null"),
  opacity: familySource('', '$util-opacity: (50: null, 25: .25)'),
  functions: "@use 'sass:map'; @use 'src/scss/theme' as theme; .probe { color: map.get(theme.theme-color-refs(fg), primary); background: map.get(theme.theme-token-refs(theme.$theme-bgs, bg), body); --base: #{map.get(theme.theme-color-values(base), primary)}; --opacity: #{map.get(theme.theme-opacity-values(--project-tone, currentcolor), 50)}; }"
}
beforeAll(() => prepareFamilies(sources), 90_000)
describe('pinned Bootstrap 6 semantic color roles', () => {
  it('generates eight semantic role families with canonical root references', () => {
    const root = checkedFamily(sources.base)
    for (const color of colors) {
      for (const [prefix, token, role] of [['fg', '--trm-fg', 'fg'], ['fg-emphasis', '--trm-fg', 'fg-emphasis'], ['fg-contrast', '--trm-fg', 'contrast'], ['bg', '--trm-bg', 'bg'], ['bg-subtle', '--trm-bg', 'bg-subtle'], ['bg-muted', '--trm-bg', 'bg-muted'], ['border-subtle', '--trm-bc', 'border']] as const) expect(values('.' + prefix + '-' + color, token, root)).toEqual(['var(--trm-' + color + '-' + role + ')'])
    }
    for (const selector of ['.text-primary', '.fg-light', '.bg-dark', '.border-light']) expect(rules(selector, root)).toEqual([])
  })
  it('provides neutral roles, explicit reset and no background inherit alias', () => {
    const root = checkedFamily(sources.base)
    for (const name of ['body', '1', '2', '3', '4', 'white', 'black']) {
      expect(values('.fg-' + name, '--trm-fg', root)).toEqual(['var(--trm-fg-' + name + ')'])
      expect(values('.bg-' + name, '--trm-bg', root)).toEqual(['var(--trm-bg-' + name + ')'])
    }
    expect(values('.fg-reset', '--trm-fg', root)).toEqual(['inherit'])
    expect(rules('.bg-inherit', root)).toEqual([])
  })
  it('isolates assigned composition properties without registering referenced theme tokens', () => {
    const root = checkedFamily(sources.base), names = registrations(root)
    for (const token of ['--trm-fg', '--trm-bg', '--trm-bc']) expect(names.filter(name => name === token)).toHaveLength(1)
    for (const token of ['--trm-primary-fg', '--trm-fg-body', '--trm-bg-body']) expect(names).not.toContain(token)
    expect(values('.fg-50', 'color', root)).toEqual(['color-mix(in oklch, var(--trm-fg) 50%, transparent)'])
    expect(values('.bg-100', 'background-color', root)).toEqual(['var(--trm-bg)'])
    expect(values('.border-50', 'border-color', root)).toEqual(['color-mix(in oklch, var(--trm-bc) 50%, transparent)'])
  })
  it('uses light-dark role expressions rather than old color aliases or forced-color reminting', () => {
    const root = checkedFamily(sources.base)
    expect(values(':root', '--trm-primary-fg', root)).toContain('light-dark(var(--trm-blue-600), var(--trm-blue-400))')
    expect(root.toString()).not.toContain('--trm-color-primary-fg:')
    expect(root.toString()).not.toContain('@media (forced-colors: active)')
  })
  it('shallowly replaces theme maps and removes keys using the owning theme module', () => {
    const root = checkedFamily(sources.configured)
    expect(values(':root', '--trm-primary-fg', root)).toContain('#123456')
    for (const selector of ['.fg-accent', '.fg-emphasis-primary', '.border-subtle-primary', '.fg-4', '.bg-50']) expect(rules(selector, root)).toEqual([])
    expect(values('.fg-quiet', '--trm-fg', root)).toEqual(['var(--trm-fg-quiet)'])
    expect(values('.bg-panel', '--trm-bg', root)).toEqual(['var(--trm-bg-panel)'])
    expect(values('.border-panel', '--trm-bc', root)).toEqual(['var(--trm-border-panel)'])
    expect(values('.bg-brand', '--trm-bg', root)).toEqual(['var(--trm-brand-bg)'])
    expect(() => sass("@use 'src/scss/tremplin-utilities' with ($theme-color-roles: (brand: red));")).toThrow(/not declared with !default/)
  })
  it('supports explicit media/state family definitions without retaining removed composition registrations', () => {
    const root = checkedFamily(sources.removed)
    for (const selector of ['.project-fg-brand', '.md\\:project-fg-brand', '.hover\\:project-fg-brand:hover', '.print\\:project-fg-brand', '.dark\\:project-fg-brand']) expect(values(selector, 'color', root)).toEqual(['red'])
    expect(rules('.bg-primary', root)).toEqual([])
    expect(registrations(root)).not.toContain('--trm-bg')
    expect(registrations(root)).not.toContain('--trm-bc')
  })
  it('uses the owning theme module for role-reference functions', () => {
    const root = checkedFamily(sources.functions)
    expect(values('.probe', 'color', root)).toEqual(['var(--trm-primary-fg)'])
    expect(values('.probe', 'background', root)).toEqual(['var(--trm-bg-body)'])
    expect(values('.probe', '--base', root)).toEqual(['var(--trm-blue-500)'])
    expect(values('.probe', '--opacity', root)).toEqual(['color-mix(in oklch, var(--project-tone, currentcolor) 50%, transparent)'])
  })
  it('shares the configured opacity keys across foreground, background and border controls', () => {
    const root = checkedFamily(sources.opacity)
    for (const prefix of ['fg', 'bg', 'border']) {
      expect(rules('.' + prefix + '-50', root)).toEqual([])
      expect(rules('.' + prefix + '-25', root)).toHaveLength(1)
    }
    expect(values('.fg-25', 'color', root)[0]).toContain('25%, transparent)')
  })
})
