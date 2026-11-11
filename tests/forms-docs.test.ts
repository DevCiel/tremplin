import { formsGuides } from './helpers/forms-mdx-contract'
import { compile, compileString } from 'sass'
import postcss from 'postcss'
import { describe, expect, it } from 'vitest'
import { validationScript } from '../site/src/data/forms-guides'

describe('Forms documentation contracts', () => {
  it('covers all seventeen reference topics in order', () => {
    expect(formsGuides.map(guide => guide.slug.split('/')[1])).toEqual(['overview', 'field', 'form-control', 'checkbox', 'radio', 'switch', 'range', 'input-group', 'floating-labels', 'form-adorn', 'chips', 'combobox', 'datepicker', 'otp-input', 'password-strength', 'layout', 'validation'])
    expect(formsGuides.find(guide => guide.slug === 'forms/validation')!.clientScript).toBe(validationScript)
  })
  for (const guide of formsGuides) {
    for (const section of guide.sections) {
      for (const sample of section.code ?? []) {
        if (sample.language !== 'scss') continue
        it(`${guide.slug}: ${section.heading} Sass compiles`, () => {
          const source = sample.source.replaceAll("'tremplin/scss'", "'src/scss/tremplin'").replaceAll('tremplin/scss/', 'src/scss/')
          const css = compileString(source, { loadPaths: [process.cwd()] }).css
          expect(css).toContain('--trm-')
          if (guide.slug === 'forms/field') expect(css).toContain('--trm-radius-7: 0.75rem')
          if (guide.slug === 'forms/form-control') {
            expect(css).toContain('--trm-control-border-radius: 0.5rem')
            expect(css).toContain('--trm-control-box-shadow: none')
          }
          if (guide.slug === 'forms/validation') expect(css).toContain('.warning-feedback')
        })
      }
    }
  }
  it('emits pinned grouped-control sizing, inherited adorned focus and opt-in validation', () => {
    const css = compile('src/scss/tremplin.scss').css
    const root = postcss.parse(css)
    const declarations = (selector: string) => {
      const values = new Map<string, string>()
      root.walkRules(rule => { if (rule.selector.includes(selector)) rule.walkDecls(declaration => { values.set(declaration.prop, declaration.value) }) })
      return values
    }
    const grouped = declarations('.input-group > .form-floating')
    expect(grouped.get('flex')).toBe('1 1 auto')
    expect(grouped.get('width')).toBe('1%')
    expect(grouped.get('min-width')).toBe('0')
    expect(declarations('.form-control:focus-within').get('outline')).toBe('var(--trm-focus-ring)')
    expect(declarations('.form-floating > label:has(~ .form-control:is(select))').get('transform')).toBe('var(--trm-form-floating-label-transform)')
    expect(declarations('.is-valid ~ .valid-feedback').get('display')).toBe('block')
    expect(declarations('[data-trm-validate] :user-invalid ~ .invalid-feedback').get('display')).toBe('block')
    expect(css).toMatch(/\[data-trm-validate~="?valid"?\] :user-valid ~ \.valid-feedback/)
    expect(css).not.toContain('.was-validated')
  })
})
