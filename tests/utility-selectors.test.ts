import { beforeAll, describe, expect, it } from 'vitest'
import { ancestors, ast, cssTree, rules, sheet, values } from './helpers/pinned-sass'
import { registrations, utilityCss, utilityError } from './helpers/pinned-utilities'

const generate = (definition: string) => {
  const css = utilityCss(definition)
  expect(cssTree(css)).toBe(cssTree(utilityCss(definition, true)))
  return ast(css)
}
beforeAll(() => { sheet('tremplin-utilities') }, 90_000)
describe('pinned Bootstrap 6 attribute selectors and composition properties', () => {
  it('emits start and substring patterns without appending value suffixes', () => {
    const root = generate("'starts': (selector: attr-starts, class: 'project-start-', property: outline-width, values: 2px), 'includes': (selector: attr-includes, class: 'project-part-', property: outline-style, values: solid)")
    expect(values('[class^=project-start-]', 'outline-width', root)).toEqual(['2px'])
    expect(values('[class*=project-part-]', 'outline-style', root)).toEqual(['solid'])
    expect(rules('.project-start-', root)).toEqual([])
  })
  it('keeps attribute patterns fixed across viewport, print, dark and child contexts', () => {
    const root = generate("'children': (selector: attr-includes, class: 'project-child-', property: margin-block-end, values: .5rem, child-selector: '> *', responsive: true, print: true, dark: true)")
    const found = rules(':where([class*=project-child-] > *)', root)
    expect(found).toHaveLength(5)
    expect(found.map(rule => ancestors(rule, 'media'))).toEqual([[], ['(width >= 768px)'], ['(width >= 1536px)'], ['print'], ['(prefers-color-scheme: dark)']])
    for (const rule of found) expect(rule.toString()).toContain('margin-block-end: 0.5rem')
    expect(root.toString()).not.toContain('[class*="md')
  })
  it('requires a class key but preserves unvalidated empty and null patterns', () => {
    const definition = "'bad': (selector: attr-starts, property: opacity, values: .5)"
    expect(utilityError(definition)).toBe(utilityError(definition, true))
    expect(utilityError(definition)).toMatch(/requires a .class. key/)
    for (const value of ["''", 'null']) {
      const root = generate("'a': (selector: attr-starts, class: " + value + ', property: opacity, values: .5)')
      expect(values('[class^=""]', 'opacity', root)).toEqual(['0.5'])
    }
  })
  it('records attribute-state output as an unusable class variant instead of promising rejection', () => {
    const root = generate("'a': (selector: attr-includes, class: project, state: hover, property: opacity, values: .5)")
    expect(values('[class*=project]', 'opacity', root)).toEqual(['0.5'])
    expect(values('.hover\\::hover', 'opacity', root)).toEqual(['0.5'])
  })
  it('supports deliberately escaped backslashes but does not auto-escape double quotes', () => {
    const pattern = 'project-' + '\\'.repeat(4) + 'mark'
    const root = generate("'a': (selector: attr-starts, class: '" + pattern + "', property: opacity, values: .5)")
    expect(values('[class^="project-' + '\\'.repeat(2) + 'mark"]', 'opacity', root)).toEqual(['0.5'])
    const definition = "'a': (selector: attr-includes, class: 'project-\"mark', property: opacity, values: .5)"
    expect(utilityError(definition)).toBe(utilityError(definition, true))
    expect(utilityError(definition)).toMatch(/expected "\]"/)
  })
  it('registers explicit assigned custom properties once, globally, but not referenced tokens', () => {
    const root = generate("'one': (property: --project-one, class: one, values: (x: 1)), 'two': (property: --project-two --project-three, class: two, values: (x: 2)), 'map': (property: ('--project-four': null, color: var(--project-reference)), class: four, values: (x: red)), 'duplicate': (property: --project-one, class: again, values: 1)")
    expect(registrations(root)).toEqual(['--project-one', '--project-two', '--project-three', '--project-four'])
    expect(registrations(root)).not.toContain('--project-reference')
    root.walkAtRules('property', node => {
      expect(ancestors(node)).toEqual([])
      expect(node.toString()).toContain('inherits: false')
      expect(node.toString()).toContain('syntax: "*"')
    })
    expect(root.toString().indexOf('@property --project-one')).toBeLessThan(root.toString().indexOf('@layer utilities'))
  })
  it('records the variables emission/registration namespace mismatch without silently fixing the core', () => {
    const root = generate("'a': (property: color, class: a, variables: project-alpha, values: red), 'b': (property: color, class: b, variables: (project-alpha, project-beta), values: blue), 'c': (property: color, class: c, variables: (project-beta: blue, project-static: .8), values: green)")
    expect(registrations(root)).toEqual(['--project-alpha', '--project-beta', '--project-static'])
    expect(values('.a', '--trm-project-alpha', root)).toEqual(['red'])
    expect(values('.c', '--trm-project-static', root)).toEqual(['0.8'])
    expect(registrations(root)).not.toContain('--trm-project-alpha')
    expect(values('.a', '--project-alpha', root)).toEqual([])
  })
  it('does not normalize pre-prefixed or empty variables names', () => {
    const root = generate("'a': (property: color, class: a, variables: --project-beta, values: blue), 'b': (property: color, class: b, variables: '', values: red)")
    expect(registrations(root)).toEqual(['----project-beta', '--'])
    expect(values('.a', '--trm---project-beta', root)).toEqual(['blue'])
    expect(values('.b', '--trm-', root)).toEqual(['red'])
  })
  it('does not register disabled, false or removed definitions', () => {
    const root = generate("'off': (enabled: false, property: --project-off, values: 1, variables: project-hidden), 'false': false, 'removed': null")
    expect(registrations(root)).toEqual([])
  })
  it('does not register referenced root/theme tokens in the default utilities build', () => {
    const names = registrations(sheet('tremplin-utilities'))
    for (const name of ['--trm-primary-base', '--trm-fg-body', '--trm-border-color', '--trm-link-color']) expect(names).not.toContain(name)
  })
})
