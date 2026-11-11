import { beforeAll, describe, expect, it } from 'vitest'
import { ancestors, ast, cssTree, rules, sass, sheet, values } from './helpers/pinned-sass'
import { utilityCss, utilityError } from './helpers/pinned-utilities'

const definition = "'fade': (property: opacity, class: project-fade, responsive: true, state: hover focus-visible active, print: true, dark: true, values: (50: .5))"
const generate = (defs = definition, breakpoints?: string) => {
  const css = utilityCss(defs, false, breakpoints)
  expect(cssTree(css)).toBe(cssTree(utilityCss(defs, true, breakpoints)))
  return ast(css)
}
beforeAll(() => { sheet('tremplin-utilities') }, 90_000)
describe('pinned Bootstrap 6 Utility API variants', () => {
  it('ships canonical configured prefixes without legacy names or invented default state/print modes', () => {
    const root = ast(sheet('tremplin-utilities'))
    for (const selector of ['.md\\:d-flex', '.md\\:m-3', '.md\\:mx-3', '.md\\:ps-2', '.md\\:ms--1', '.md\\:gap-2', '.contains-inline', '.contains-size']) expect(rules(selector, root)).toHaveLength(1)
    for (const selector of ['.d-md-flex', '.m-md-3', '.d-print-none', '.print\\:d-none', '.hover-opacity-50:hover', '.hover\\:opacity-50:hover', '.focus\\:link-100:focus']) expect(rules(selector, root)).toEqual([])
    expect(rules('.hover\\:link-100:hover', root)).toHaveLength(1)
  })
  it('combines explicit state lists with viewport, print and OS-dark prefixes', () => {
    const root = generate()
    for (const prefix of ['', 'md\\:', 'print\\:', 'dark\\:']) {
      for (const state of ['hover', 'focus-visible', 'active']) expect(values('.' + prefix + state + '\\:project-fade-50:' + state, 'opacity', root)).toEqual(['0.5'])
    }
    expect(ancestors(rules('.dark\\:project-fade-50', root)[0]!, 'media')).toEqual(['(prefers-color-scheme: dark)'])
    expect(ancestors(rules('.print\\:project-fade-50', root)[0]!, 'media')).toEqual(['print'])
    const css = root.toString()
    expect(css.indexOf('.print\\:project-fade-50')).toBeLessThan(css.indexOf('.dark\\:project-fade-50'))
    expect(css.indexOf('.hover\\:project-fade-50:hover')).toBeLessThan(css.indexOf('.md\\:hover\\:project-fade-50:hover'))
    expect(rules('.project-fade-md-50', root)).toEqual([])
  })
  it('escapes digit-prefixed breakpoints and suffixless/classless values', () => {
    const root = generate("'classless': (property: display, class: null, responsive: true, values: (project-visible: block)), 'suffixless': (property: cursor, class: project-cursor, responsive: true, values: (null: pointer))", "(xs: 0, '2xl': 90rem)")
    expect(values('.\\32 xl\\:project-visible', 'display', root)).toEqual(['block'])
    expect(values('.\\32 xl\\:project-cursor', 'cursor', root)).toEqual(['pointer'])
    expect(ancestors(rules('.\\32 xl\\:project-visible', root)[0]!, 'media')).toEqual(['(width >= 90rem)'])
  })
  it('wraps child selectors in where in every compound mode', () => {
    const root = generate("'children': (property: margin-block-end, class: project-children, child-selector: '> :not(:last-child)', responsive: true, state: hover, dark: true, print: true, values: (2: .5rem))")
    for (const selector of [':where(.md\\:project-children-2 > :not(:last-child))', ':where(.md\\:hover\\:project-children-2:hover > :not(:last-child))', ':where(.print\\:project-children-2 > :not(:last-child))', ':where(.dark\\:hover\\:project-children-2:hover > :not(:last-child))']) expect(values(selector, 'margin-block-end', root)).toEqual(['0.5rem'])
  })
  it('suppresses non-map/disabled families and accepts an explicitly empty state list', () => {
    const root = generate("'off': (enabled: false), 'false': false, 'removed': null, 'empty': (property: cursor, class: project-empty, state: (), values: (pointer: pointer))")
    expect(values('.project-empty-pointer', 'cursor', root)).toEqual(['pointer'])
    expect(rules('.hover\\:project-empty-pointer:hover', root)).toEqual([])
    expect(root.toString()).not.toContain('.off')
  })
  it('preserves literal boolean states rather than inventing hover/focus expansion', () => {
    const root = generate("'a': (property: opacity, class: a, state: true, values: .5), 'b': (property: opacity, class: b, state: false, values: .5)")
    expect(values('.true\\:a:true', 'opacity', root)).toEqual(['0.5'])
    expect(values('.false\\:b:false', 'opacity', root)).toEqual(['0.5'])
    expect(rules('.hover\\:a:hover', root)).toEqual([])
  })
  it('validates dark flags but does not perform semantic state-identifier validation', () => {
    const badFlag = "'bad': (property: opacity, values: .5, dark: yes)"
    expect(utilityError(badFlag)).toBe(utilityError(badFlag, true))
    expect(utilityError(badFlag)).toMatch(/should be a boolean/)
    const root = generate("'a': (property: opacity, state: 'hover focus', values: .5)")
    expect(root.toString()).toContain('.hover focus\\:opacity:hover focus')
    const invalid = "'a': (property: opacity, state: 12, values: .5)"
    expect(utilityError(invalid)).toBe(utilityError(invalid, true))
    expect(utilityError(invalid)).not.toBeNull()
  })
  it('records the flat reduced-motion guard rather than promising cancellation of renamed compound variants', () => {
    const source = "@use 'src/scss/tremplin-utilities' with ($utilities: ('animation': (property: animation, class: project-motion, state: hover, responsive: true, dark: true, print: true, values: (pop: animation-pop .3s ease both))));"
    const css = sass(source)
    expect(cssTree(css)).toBe(cssTree(sass(source, true)))
    const root = ast(css)
    expect(values('.animation-pop', 'animation', root)).toEqual(['none'])
    expect(ancestors(rules('.animation-pop', root)[0]!, 'media')).toEqual(['(prefers-reduced-motion: reduce)'])
    for (const selector of ['.hover\\:project-motion-pop:hover', '.md\\:hover\\:project-motion-pop:hover', '.dark\\:project-motion-pop', '.print\\:project-motion-pop']) {
      expect(values(selector, 'animation', root)).toEqual(['animation-pop 0.3s ease both'])
      expect(rules(selector, root).some(rule => ancestors(rule, 'media').includes('(prefers-reduced-motion: reduce)'))).toBe(false)
    }
  })
})
