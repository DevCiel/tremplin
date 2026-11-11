import { strictControlGuides } from './helpers/forms-mdx-contract'
/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { compileString } from 'sass'
import { describe, expect, it } from 'vitest'
import { strictControlDetails, strictControlExamples } from '../site/src/data/strict-control-docs'

import { componentImport, componentTarget } from '../site/src/data/component-reference'

const sources: Record<string, string> = { chip: '_chip', chips: 'forms/_chip-input', 'otp-input': 'forms/_otp-input', range: 'forms/_form-range', strength: 'forms/_strength', datepicker: '_datepicker', 'nav-overflow': '_nav-overflow' }

describe('Strict control documentation contracts', () => {
  for (const [name, detail] of Object.entries(strictControlDetails)) {
    it(`${name}: uses actual Sass tokens, compilable customization and unique example IDs`, () => {
      const source = readFileSync(`src/scss/${sources[name]}.scss`, 'utf8')
      for (const variable of detail.variables) expect(source).toContain(variable.name)
      if (detail.sass) expect(compileString(detail.sass.replaceAll('tremplin/scss/', 'src/scss/'), { loadPaths: [process.cwd()] }).css).toContain('--trm-')
      const markup = [strictControlExamples[name], ...detail.variants.map(variant => variant.markup)].join('\n')
      const doc = new DOMParser().parseFromString(markup, 'text/html')
      const ids = [...doc.querySelectorAll('[id]')].map(element => element.id)
      expect(new Set(ids).size).toBe(ids.length)
      expect(markup).not.toMatch(/chip-remove|data-trm-otp-input|data-trm-nav-overflow|password-strength-bar|datepicker-day|class="form-range"[^>]*type="range"/)
      expect(detail.variants.length).toBeGreaterThanOrEqual(3)
      expect(detail.guidelines.length).toBeGreaterThanOrEqual(4)
      expect(detail.variants.some(variant => variant.markup.includes('data-trm-theme="dark"') && variant.markup.includes('dir="rtl"'))).toBe(true)
    })
  }
  it('authors single-input OTP and wrapper-based sliders in component and form examples', () => {
    const all = [...Object.values(strictControlExamples), ...Object.values(strictControlDetails).flatMap(detail => detail.variants.map(variant => variant.markup)), ...Object.values(strictControlGuides).flatMap(guide => guide.sections.map(section => section.example ?? ''))]
    for (const markup of all) {
      const doc = new DOMParser().parseFromString(markup, 'text/html')
      for (const otp of doc.querySelectorAll('[data-trm-otp]')) {
        expect(otp.querySelectorAll('input')).toHaveLength(1)
        expect(otp.querySelectorAll('.otp-slot')).toHaveLength(0)
        expect(otp.querySelector('input')?.getAttribute('name')).toBe('code')
      }
      for (const range of doc.querySelectorAll('.form-range')) {
        expect(range.tagName).not.toBe('INPUT')
        expect(range.querySelectorAll('.form-range-input')).toHaveLength(1)
      }
      for (const nav of doc.querySelectorAll('[data-trm-toggle="nav-overflow"]')) {
        expect(nav.querySelector('.nav > .nav-item > .nav-link')).not.toBeNull()
        expect(nav.querySelectorAll('.nav-link [id]')).toHaveLength(0)
      }
    }
  })
  it('shows default per-component imports and resolvable strict initialization targets', () => {
    for (const [name, className] of Object.entries({ chips: 'Chips', 'otp-input': 'OtpInput', range: 'Range', strength: 'Strength', datepicker: 'Datepicker', 'nav-overflow': 'NavOverflow' })) {
      expect(componentImport(name, className)).toBe(`import ${className} from 'tremplin/${name}'`)
      const doc = new DOMParser().parseFromString(strictControlExamples[name]!, 'text/html')
      expect(doc.querySelector(componentTarget(name)), name).not.toBeNull()
    }
  })
})
