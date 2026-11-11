import { beforeAll, describe, expect, it } from 'vitest'
import { contentGuides } from './helpers/layout-content-contract'
import { checkGuideGroup } from './helpers/guide-sass'
import { cssTree, rules, sheet, values } from './helpers/pinned-sass'

checkGuideGroup('content', contentGuides)
let css: string
beforeAll(() => { css = sheet('content'); sheet('content', true) }, 30_000)
describe('pinned content state and typography', () => {
  it('compares the complete focused content output without declaration filtering', () => {
    expect(cssTree(css)).toBe(cssTree(sheet('content', true)))
  })
  it('uses cell state/type layers and preserves native active/hover ordering', () => {
    expect(values('.table-active', '--trm-table-bg-state', css)).toEqual(['color-mix(in srgb, var(--trm-theme-fg, var(--trm-table-color)) var(--trm-table-active-bg-factor), transparent)'])
    expect(values('.table > :not(caption) > * > *', 'box-shadow', css)[0]).toContain('--trm-table-bg-state')
    expect(rules('.table-hover > tbody > tr:hover > *', css).length).toBe(1)
    expect(rules('.table-active', css)[0]!.source!.start!.line).toBeLessThan(rules('.table-hover > tbody > tr:hover > *', css)[0]!.source!.start!.line)
    expect(rules('.table > :not(caption) > tr.table-active > *', css)).toHaveLength(0)
  })
  it('styles every prose heading level but excludes not-prose subtrees', () => {
    expect(values('.prose', 'max-width', css)).toEqual(['1000px'])
    expect(values('.prose', 'display', css)).toEqual(['flex'])
    expect(css).toContain(':where(h1, h2, h3, h4, h5, h6):not([class], :where(.not-prose, .not-prose *))')
    expect(css).toContain(':where(ul, ol):not([class], :where(.not-prose, .not-prose *)) li:not(:last-child)')
  })
})
