import { describe, expect, it } from 'vitest'
import { ancestors, ast, cssTree, rules, sass, values } from './helpers/pinned-sass'
import { utilityCss, utilityError } from './helpers/pinned-utilities'

const generate = (definition: string) => {
  const css = utilityCss(definition)
  expect(cssTree(css)).toBe(cssTree(utilityCss(definition, true)))
  return ast(css)
}
describe('pinned Bootstrap 6 Utility API generator', () => {
  it('accepts lists, scalar values, implicit prefixes and null class/key combinations', () => {
    const root = generate("'list': (property: cursor, values: pointer wait), 'scalar': (property: resize, values: none), 'classless': (property: display, class: null, responsive: true, values: (project-block: block)), 'suffixless': (property: opacity, class: project-opacity, values: (null: .6))")
    expect(values('.cursor-pointer', 'cursor', root)).toEqual(['pointer'])
    expect(values('.cursor-wait', 'cursor', root)).toEqual(['wait'])
    expect(values('.resize', 'resize', root)).toEqual(['none'])
    expect(values('.project-block', 'display', root)).toEqual(['block'])
    expect(values('.md\\:project-block', 'display', root)).toEqual(['block'])
    expect(values('.project-opacity', 'opacity', root)).toEqual(['0.6'])
    expect(rules('.project-block-md', root)).toEqual([])
    root.walkDecls(node => { expect(Boolean(node.important)).toBe(false) })
  })
  it('assigns the same scalar to every property in a list', () => {
    const root = generate("'padding': (property: padding-inline-start padding-inline-end, class: project-px, values: (2: .5rem))")
    for (const property of ['padding-inline-start', 'padding-inline-end']) expect(values('.project-px-2', property, root)).toEqual(['0.5rem'])
  })
  it('combines property-map defaults with per-value overrides', () => {
    const root = generate("'type': (property: (font-size: 1rem, line-height: 1.5), class: project-type, values: (small: (font-size: .875rem), large: (font-size: 1.25rem, line-height: 1.75)))")
    expect(values('.project-type-small', 'font-size', root)).toEqual(['0.875rem'])
    expect(values('.project-type-small', 'line-height', root)).toEqual(['1.5'])
    expect(values('.project-type-large', 'line-height', root)).toEqual(['1.75'])
  })
  it('preserves property-map defaults for named null values rather than promising removal', () => {
    const root = generate("'surface': (property: (color: red, background-color: blue), class: project-surface, values: (null: null, removed: null)), 'empty': (property: color, class: project-empty, values: (null: null))")
    for (const selector of ['.project-surface', '.project-surface-removed']) {
      expect(values(selector, 'color', root)).toEqual(['red'])
      expect(values(selector, 'background-color', root)).toEqual(['blue'])
    }
    expect(rules('.project-empty', root)).toEqual([])
  })
  it('maps values into explicitly named custom properties and composed declarations', () => {
    const root = generate("'tone': (property: ('--project-tone': null, color: var(--project-tone)), class: project-tone, values: (brand: #075985))")
    expect(values('.project-tone-brand', '--project-tone', root)).toEqual(['#075985'])
    expect(values('.project-tone-brand', 'color', root)).toEqual(['var(--project-tone)'])
  })
  it('prefixes variables maps, lists and scalar names with the fixed framework namespace', () => {
    const root = generate("'static': (property: color, class: project-static, variables: (project-alpha: .8), values: red), 'list': (property: color, class: project-list, variables: (project-color, project-fallback), values: blue), 'scalar': (property: color, class: project-scalar, variables: project-tone, values: green)")
    expect(values('.project-static', '--trm-project-alpha', root)).toEqual(['0.8'])
    for (const name of ['color', 'fallback']) expect(values('.project-list', '--trm-project-' + name, root)).toEqual(['blue'])
    expect(values('.project-scalar', '--trm-project-tone', root)).toEqual(['green'])
  })
  it('applies importance per family across base, viewport, state, print and dark modes', () => {
    const root = generate("'fade': (property: opacity, class: project-fade, responsive: true, state: hover focus, print: true, dark: true, important: true, values: (50: .5)), 'cursor': (property: cursor, values: wait)")
    for (const selector of ['.project-fade-50', '.md\\:project-fade-50', '.hover\\:project-fade-50:hover', '.print\\:project-fade-50', '.dark\\:project-fade-50']) {
      expect(values(selector, 'opacity', root)).toEqual(['0.5'])
      rules(selector, root)[0]!.walkDecls(node => { expect(node.important).toBe(true) })
    }
    rules('.cursor', root)[0]!.walkDecls(node => { expect(Boolean(node.important)).toBe(false) })
    expect(() => sass("@use 'src/scss/tremplin-utilities' with ($enable-important-utilities: false);")).toThrow(/not declared with !default/)
  })
  it('keeps variables helper declarations normal even when property declarations are important', () => {
    const root = generate("'static': (property: color, class: project-static, variables: (project-alpha: .8), important: true, values: red)")
    rules('.project-static', root)[0]!.walkDecls(node => {
      expect(Boolean(node.important)).toBe(node.prop === 'color')
    })
  })
  it('suppresses false, null and disabled families in every mode and property registration', () => {
    const root = generate("'off': (enabled: false, property: --project-off, responsive: true, state: hover, print: true, dark: true, variables: project-off, values: 1), 'false': false, 'removed': null")
    expect(root.toString()).not.toContain('project-off')
  })
  it('wraps child selectors in zero-specificity where across prefixed modes', () => {
    const root = generate("'space': (property: margin-block-start, class: project-space, child-selector: '> * + *', responsive: true, state: hover, print: true, values: (2: .5rem))")
    for (const selector of [':where(.project-space-2 > * + *)', ':where(.md\\:project-space-2 > * + *)', ':where(.hover\\:project-space-2:hover > * + *)', ':where(.print\\:project-space-2 > * + *)']) expect(values(selector, 'margin-block-start', root)).toEqual(['0.5rem'])
    expect(ancestors(rules(':where(.md\\:project-space-2 > * + *)', root)[0]!, 'media')).toEqual(['(width >= 768px)'])
  })
  for (const [name, definition, message] of [
    // The pin interpolates a map in its @error message, which itself fails
    // Sass CSS-value coercion before the intended friendly message is emitted.
    ['property', "'bad': (class: bad, values: (x: 1))", /isn't a valid CSS value/],
    ['values', "'bad': (property: opacity)", /isn't a valid CSS value/],
    ['boolean', "'bad': (property: opacity, important: yes, values: .5)", /should be a boolean/],
    ['selector', "'bad': (property: opacity, selector: attr-contains, values: .5)", /Invalid .selector. value/]
  ] as const) {
    it('matches pinned validation for a malformed ' + name, () => {
      const error = utilityError(definition)
      expect(error).toBe(utilityError(definition, true))
      expect(error).toMatch(message)
    })
  }
  it('integrates shallow replacement, removal and custom additions through the distributed entry', () => {
    const source = "@use 'src/scss/tremplin-utilities' with ($utilities: ('opacity': (property: opacity, class: project-opacity, values: (60: .6)), 'float': null, 'project-cursor': (property: cursor, values: wait)));"
    const output = sass(source)
    expect(cssTree(output)).toBe(cssTree(sass(source, true)))
    const root = ast(output)
    expect(values('.project-opacity-60', 'opacity', root)).toEqual(['0.6'])
    expect(values('.cursor', 'cursor', root)).toEqual(['wait'])
    expect(rules('.opacity-25', root)).toEqual([])
    expect(rules('.float-start', root)).toEqual([])
    expect(values('.d-flex', 'display', root)).toEqual(['flex'])
  })
})
