import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import registry from '../metadata/bootstrap6-security-patches.json'
import pin from '../metadata/bootstrap6-reference.json'

describe('Same-origin calendar arrow asset', () => {
  it('ships the approved SVG with a distribution integrity digest and relative CSS URL', () => {
    const asset = registry.assets[0]!
    const source = readFileSync(asset.path)
    expect(createHash('sha256').update(source).digest('hex')).toBe(asset.sha256)
    expect(readFileSync(asset.output).equals(source)).toBe(true)
    const manifest = JSON.parse(readFileSync('dist/integrity.json', 'utf8'))
    expect(manifest.assets['icons/datepicker-chevron.svg'].integrity).toBe(`sha384-${createHash('sha384').update(source).digest('base64')}`)
    for (const file of ['dist/css/tremplin.css', 'dist/css/tremplin.min.css']) {
      const css = readFileSync(file, 'utf8')
      expect(css).toContain('../icons/datepicker-chevron.svg')
    }
  })

  it('retains exactly the upstream arrow geometry without active SVG content', () => {
    const original = readFileSync(`artifacts/bootstrap6-strict/${pin.commit}/scss/_datepicker.scss`, 'utf8')
    const inline = original.match(/data:image\/svg\+xml,(<svg.*?<\/svg>)/)![1]!
    const expected = new DOMParser().parseFromString(inline, 'image/svg+xml').documentElement
    const actual = new DOMParser().parseFromString(readFileSync(registry.assets[0]!.path, 'utf8'), 'image/svg+xml').documentElement
    expect(actual.localName).toBe('svg')
    expect(actual.getAttribute('xmlns')).toBe(expected.getAttribute('xmlns'))
    expect(actual.getAttribute('viewBox')).toBe(expected.getAttribute('viewBox'))
    expect([...actual.attributes].map(attribute => attribute.name).sort()).toEqual(['viewBox', 'xmlns'])
    expect(actual.children).toHaveLength(1)
    expect(actual.children[0]!.localName).toBe('path')
    expect([...actual.children[0]!.attributes].map(attribute => attribute.name)).toEqual(['d'])
    expect(actual.children[0]!.getAttribute('d')).toBe(expected.children[0]!.getAttribute('d'))
  })
})
