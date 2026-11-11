import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { customizeExamples } from '../site/src/data/customize-examples'
import { ast, sass, topology, values } from './helpers/pinned-sass'

let actual: string, reference: string
beforeAll(() => {
  // Compile shared full-entry fixtures before the bounded assertion cases.
  const recipe = customizeExamples['customize/sass#2']!.code[0]!.source
  const source = recipe.replace(/'tremplin\/scss(?:\/([^']+))?'/g, (_, path: string | undefined) => "'src/scss/" + (path ?? 'tremplin') + "'")
  actual = sass(source)
  reference = sass(source, true)
})

describe('Customize overview uses the actual Sass API', () => {
  it('shares the maintained Sass guide recipe rather than advertising retired aliases', () => {
    const source = readFileSync('site/src/content/docs/customize/index.mdx', 'utf8')
    expect(source).toContain("sample={customizeExamples['customize/sass#2'].code[0]}")
    expect(source).not.toMatch(/\$border-radius|\$grid-gutter|trm\.spacer|trm\.focus-ring|`token\(\)`|`media-up`/)
    expect(source).toContain('import mixins explicitly from their owning modules')
    expect(source).toContain('<GuideIndex group="customize" />')
  })

  it('compiles the exact copied recipe and applies spacing and focus geometry from their real owners', () => {
    const tree = ast(actual)
    expect(values('.product-focus', 'padding', tree)).toEqual(['0.5rem'])
    expect(values('.product-focus:focus-visible', 'outline', tree)).toEqual(['var(--trm-focus-ring)'])
    expect(values('.product-focus:focus-visible', 'outline-offset', tree)).toEqual(['var(--trm-focus-ring-offset)'])
    expect(topology(actual)).toEqual(topology(reference))
  })

  it('demonstrates why the replaced recipe cannot be copied into the strict core', () => {
    expect(() => sass("@use 'src/scss/tremplin' as trm with ($border-radius: .4rem, $grid-gutter: 2rem); .product-focus { @include trm.focus-ring; padding: trm.spacer(3); }")).toThrow(/not declared with !default/)
  })
})
