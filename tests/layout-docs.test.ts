import { beforeAll, describe, expect, it } from 'vitest'
import { layoutGuides } from './helpers/layout-content-contract'
import { checkGuideGroup } from './helpers/guide-sass'
import { cssTree, rules, sass, sheet, values } from './helpers/pinned-sass'

checkGuideGroup('layout', layoutGuides)
const customSource = "@use 'src/scss/config' with ($grid-columns: 6); @use 'src/scss/tremplin-grid';"
beforeAll(() => { for (const reference of [false, true]) { sheet('tremplin-grid', reference); sass(customSource, reference) } }, 60_000)
describe('pinned layout guide integration', () => {
  it('uses physical row-auto widths and canonical zero-offset prefixes', () => {
    const css = sheet('tremplin-grid')
    expect(cssTree(css)).toBe(cssTree(sheet('tremplin-grid', true)))
    expect(values('.md\\:offset-0', 'margin-inline-start', css)).toEqual(['0'])
    expect(values('.row-cols-auto > *', 'width', css)).toEqual(['auto'])
    expect(rules('.md\\:row-cols-auto > *', css)).toHaveLength(1)
    expect(rules('.offset-md-0', css)).toHaveLength(0)
  })
  it('configures the shared column count without legacy span tokens', () => {
    const css = sass(customSource)
    expect(cssTree(css)).toBe(cssTree(sass(customSource, true)))
    expect(values('.grid', '--trm-columns', css)).toEqual(['6'])
    expect(values('.grid', 'grid-template-columns', css)).toEqual(['repeat(var(--trm-columns), 1fr)'])
    expect(values('.col-3', 'width', css)).toEqual(['50%'])
    expect(values('.g-col-6', 'grid-column', css)).toEqual(['auto/span 6'])
    expect(rules('.g-col-7', css)).toHaveLength(0)
  })
})
