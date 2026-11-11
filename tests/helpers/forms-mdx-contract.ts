import type { Guide } from '../../site/src/data/guide-docs'
import original from '../fixtures/mdx-migration/forms.before.json' with { type: 'json' }
import { formsRawExamples, formsExamples, formsRawScripts, formsRuntimeScripts } from '../../site/src/data/forms-examples'
import { formsTables } from '../../site/src/data/forms-tables'
export { validationScript } from '../../site/src/data/form-composition-guides'

// Independent pre-migration prose/hierarchy plus maintained executable inputs.
const contract = (guide: Guide, published = false): Guide => ({
  ...guide,
  reference: { title: 'Tremplin source', url: `https://github.com/DevCiel/tremplin/blob/main/site/src/content/docs/${guide.slug}.mdx` },
  ...(guide.clientScript ? { clientScript: (published ? formsRuntimeScripts : formsRawScripts)[guide.slug] } : {}),
  sections: guide.sections.map((section, index) => {
    const sample = (published ? formsExamples : formsRawExamples)[guide.slug]![index]!
    const rows = formsTables[`${guide.slug}#${index}`]
    return { ...section, ...(section.code ? { code: sample.code } : {}), ...(section.example ? { example: sample.example } : {}), ...(section.table && rows ? { table: { ...section.table, rows } } : {}) }
  })
})
export const formsGuides = (original.formsGuides as Guide[]).map(guide => contract(guide))
const bySlug = Object.fromEntries(formsGuides.map(guide => [guide.slug, guide]))
export const publishedFormsGuides = (original.publishedFormsGuides as Guide[]).map(guide =>
  guide.sections.length === bySlug[guide.slug]!.sections.length ? bySlug[guide.slug]! : contract(guide, true))
export const formsOverviewGuide = bySlug['forms/overview']!
const group = <T extends Record<string, Guide>>(entries: T): T => Object.fromEntries(Object.entries(entries).map(([key, guide]) => [key, bySlug[guide.slug]!])) as T
export const nativeFormGuides = group(original.nativeFormGuides as Record<'field' | 'form-control' | 'checkbox' | 'radio' | 'switch', Guide>)
export const compositionGuides = group(original.compositionGuides as Record<'input-group' | 'floating-labels' | 'form-adorn' | 'layout' | 'validation', Guide>)
export const choiceFormsGuides = group(original.choiceFormsGuides as Record<'chips' | 'combobox', Guide>)
export const advancedFormsGuides = group(original.advancedFormsGuides as Record<'datepicker' | 'otp-input' | 'range' | 'strength', Guide>)
export const strictControlGuides: Record<string, Guide> = {
  chips: choiceFormsGuides.chips, datepicker: advancedFormsGuides.datepicker,
  'otp-input': advancedFormsGuides['otp-input'], range: advancedFormsGuides.range,
  'password-strength': advancedFormsGuides.strength
}
