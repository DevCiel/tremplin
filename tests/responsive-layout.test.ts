import { describe, expect, it } from 'vitest'
import { sass, sheet, ast, rules, values, ancestors, cssTree } from './helpers/pinned-sass'

const css = sheet('tremplin-grid')
const tree = ast(css)
const custom = (options: string) => {
  const source = "@use 'src/scss/config' with (" + options + "); @use 'src/scss/tremplin-grid';"
  const output = sass(source)
  expect(cssTree(output)).toBe(cssTree(sass(source, true)))
  return output
}

describe('Pinned Bootstrap 6 responsive containers and Flexbox', () => {
  it('gives every canonical container full-width base geometry', () => {
    for (const prefix of ['sm', 'md', 'lg', 'xl', '\\32 xl']) {
      const selector = '.' + prefix + '\\:container'
      expect(values(selector, 'width', tree), selector).toContain('100%')
      expect(values(selector, 'padding-inline', tree)).toContain('calc(var(--trm-gutter-x) * 0.5)')
      expect(values(selector, 'margin-inline', tree)).toContain('auto')
    }
    expect(rules('.xs\\:container', tree)).toEqual([])
    expect(values('.container-fluid', 'max-width', tree)).toEqual([])
  })

  it('progresses early containers through later maxima without constraining late variants early', () => {
    expect(values('.sm\\:container', 'max-width', tree)).toEqual(['540px', '720px', '960px', '1200px', '1440px'])
    expect(values('.md\\:container', 'max-width', tree)).toEqual(['720px', '960px', '1200px', '1440px'])
    expect(values('.\\32 xl\\:container', 'max-width', tree)).toEqual(['1440px'])
    for (const rule of rules('.md\\:container', tree).filter(rule => values('.md\\:container', 'max-width', ast(rule.toString())).length)) {
      expect(ancestors(rule, 'media')).not.toContain('(width >= 576px)')
    }
  })

  it('emits prefix columns and bounded offsets without old infix aliases', () => {
    expect(values('.md\\:col', 'flex', tree)).toEqual(['1 0 0'])
    expect(values('.md\\:col-auto', 'width', tree)).toEqual(['auto'])
    expect(values('.md\\:col-6', 'width', tree)).toEqual(['50%'])
    expect(values('.md\\:offset-0', 'margin-inline-start', tree)).toEqual(['0'])
    expect(values('.md\\:offset-11', 'margin-inline-start', tree)).toEqual(['91.6666666667%'])
    for (const selector of ['.col-md', '.col-md-auto', '.col-md-6', '.offset-md-0', '.offset-md-12', '.md\\:offset-12', '.xs\\:col-6']) expect(rules(selector, tree), selector).toEqual([])
  })

  it('applies row counts only to direct children', () => {
    for (const suffix of ['auto', '1', '3', '6']) expect(rules('.md\\:row-cols-' + suffix + ' > *', tree).length).toBeGreaterThan(0)
    expect(values('.md\\:row-cols-3 > *', 'width', tree)).toEqual(['33.3333333333%'])
    expect(values('.md\\:row-cols-auto > *', 'width', tree)).toEqual(['auto'])
    expect(rules('.md\\:row-cols-3', tree)).toEqual([])
    expect(rules('.row-cols-md-3 > *', tree)).toEqual([])
  })

  it('uses upstream shared gutter groups and utility order values', () => {
    expect(values('.md\\:gx-4', '--trm-gutter-x', tree)).toEqual(['0.75rem'])
    expect(values('.md\\:gy-4', '--trm-gutter-x', tree)).toEqual([])
    expect(values('.md\\:g-4', '--trm-gutter-y', tree)).toEqual(['0.75rem'])
    for (const rule of rules('.md\\:gx-4', tree)) expect(rule.selectors).toContain('.md\\:g-4')
    expect(values('.md\\:order-last', 'order', tree)).toEqual(['6'])
    expect(values('.md\\:order-first', 'order', tree)).toEqual(['-1'])
    expect(rules('.g-md-4', tree)).toEqual([])
  })

  it('supports custom digit-prefixed keys, widths and column counts', () => {
    const output = custom("$breakpoints: (base: 0, '2xl': 900px), $container-max-widths: (sm: null, md: null, lg: null, xl: null, 2xl: null, '2xl': 800px), $grid-columns: 6")
    for (const name of ['container', 'col-3', 'row-cols-3 > *', 'offset-0', 'g-4', 'order-first']) expect(rules('.\\32 xl\\:' + name, output).length, name).toBeGreaterThan(0)
    expect(values('.\\32 xl\\:col-3', 'width', output)).toEqual(['50%'])
    expect(values('.\\32 xl\\:container', 'max-width', output)).toEqual(['800px'])
    expect(rules('.\\32 xl\\:offset-6', output)).toEqual([])
    expect(output).not.toContain('.col-2xl-')
    expect(output).not.toContain('.md\\:')
  })

  it('removes width-map defaults explicitly rather than promising whole-map replacement', () => {
    const output = custom('$container-max-widths: (sm: 30rem, md: null, lg: 55rem, xl: null, 2xl: null)')
    expect(values('.sm\\:container', 'max-width', output)).toEqual(['30rem', '55rem'])
    expect(output).not.toContain('max-width: 720px')
    expect(output).not.toContain('max-width: 1440px')
  })

  it('records the pinned unmatched-width-key behavior instead of adding a local filter', () => {
    const output = custom('$container-max-widths: (unknown: 50rem)')
    expect(values('.container', 'max-width', output)).toContain('50rem')
    expect(rules('.unknown\\:container', output)).toEqual([])
    // Unknown min lookups yield null: this pin emits an unqueried container max.
    const unmatched = rules('.container', output).find(rule => rule.nodes.some(node => node.type === 'decl' && node.prop === 'max-width' && node.value === '50rem'))!
    expect(ancestors(unmatched, 'media')).toEqual([])
  })

  it('supports a coherent custom breakpoint/width pair without the removed CQ map', () => {
    const output = custom('$breakpoints: (xs: 0, sm: 30rem, md: 48rem, lg: 64rem), $container-max-widths: (xl: null, 2xl: null)')
    expect(values('.lg\\:container', 'max-width', output)).toEqual(['960px'])
    expect(output).toContain('@media (width >= 30rem)')
    expect(output).not.toContain('.xl\\:container')
    expect(output).not.toContain('cq-span')
  })

  it('honors container, Flexbox and CSS Grid switches independently', () => {
    const noContainers = custom('$enable-container-classes: false')
    expect(rules('.md\\:container', noContainers)).toEqual([])
    expect(rules('.md\\:col-6', noContainers).length).toBeGreaterThan(0)
    const noFlex = custom('$enable-grid-classes: false')
    expect(rules('.md\\:col-6', noFlex)).toEqual([])
    expect(rules('.md\\:g-4', noFlex)).toEqual([])
    expect(rules('.md\\:container', noFlex).length).toBeGreaterThan(0)
    expect(rules('.md\\:g-col-6', noFlex).length).toBeGreaterThan(0)
    const noGrid = custom('$enable-cssgrid: false')
    expect(rules('.md\\:col-6', noGrid).length).toBeGreaterThan(0)
    expect(rules('.md\\:g-col-6', noGrid)).toEqual([])
  })

  it('separates viewport Flexbox ranges from container Grid ranges with no span aliases', () => {
    for (const rule of rules('.md\\:col-6', tree)) expect(ancestors(rule, 'media')).toEqual(['(width >= 768px)'])
    for (const rule of rules('.md\\:g-col-6', tree)) expect(ancestors(rule, 'container')).toEqual(['(width >= 768px)'])
    for (const selector of ['.span-md-6', '.cq-span-md-6', '.md\\:span-6']) expect(rules(selector, tree)).toEqual([])
  })
})
