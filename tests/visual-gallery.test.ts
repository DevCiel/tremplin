import { readFileSync } from 'node:fs'
import postcss from 'postcss'
import { describe, expect, it } from 'vitest'

const markup = readFileSync('examples/visual-regression.html', 'utf8')
const doc = new DOMParser().parseFromString(markup, 'text/html')
const core = postcss.parse(readFileSync('dist/css/tremplin.css', 'utf8'))
const fixture = postcss.parse(doc.querySelector('style')!.textContent!)

describe('current-pin visual gallery', () => {
  it('uses existing core classes or explicit fixture-owned selectors, not retired aliases', () => {
    for (const name of new Set([...doc.querySelectorAll('[class]')].flatMap(element => [...element.classList]))) {
      const pattern = new RegExp('\\.' + name + '(?![\\w-])')
      let found = false
      for (const root of [core, fixture]) root.walkRules(rule => { if (pattern.test(rule.selector)) found = true })
      expect(found, name).toBe(true)
    }
    expect(doc.querySelectorAll('.cluster, .btn-primary, .btn-outline-primary, .alert-success')).toHaveLength(0)
    expect(doc.querySelector('h1')?.classList.contains('h3')).toBe(true)
    expect(doc.querySelector('h2')?.classList.contains('h5')).toBe(true)
  })

  it('references declared tokens without recreating obsolete body/radius tokens', () => {
    const properties = new Set<string>()
    core.walkDecls(decl => { if (decl.prop.startsWith('--trm-')) properties.add(decl.prop) })
    for (const token of markup.matchAll(/var\((--trm-[\w-]+)/g)) expect(properties.has(token[1]!), token[1]).toBe(true)
    expect(markup).not.toMatch(/--trm-(?:body-bg|body-color|radius)\b(?!-)/)
    expect(markup).toContain('Explicit application contrast choice')
  })

  it('labels the determinate progress example and uses native non-submit actions', () => {
    const progress = doc.querySelector('[role="progressbar"]')!
    expect(progress.getAttribute('aria-label')).toBe('Upload progress')
    expect(progress.getAttribute('aria-valuenow')).toBe('64')
    expect(progress.getAttribute('aria-valuemin')).toBe('0')
    expect(progress.getAttribute('aria-valuemax')).toBe('100')
    for (const button of doc.querySelectorAll('button')) expect(button.type).toBe('button')
    expect(doc.querySelector('label')?.htmlFor).toBe(doc.querySelector('input')?.id)
  })
})
