export const compositionTopics = ['input-group', 'floating-labels', 'form-adorn', 'layout', 'validation'] as const;
export type CompositionTopic = typeof compositionTopics[number];
// Application/demo styles, copied on every affected guide; no core changes.
export const compositionDemoCss = `[data-form-composition-demo] { --trm-danger-fg: var(--trm-danger-fg-emphasis); --trm-success-fg: var(--trm-success-fg-emphasis); }
[data-form-composition-demo] .form-control { --trm-control-placeholder-color: var(--trm-fg-2); }
[data-form-composition-demo] .form-ghost::placeholder { color: var(--trm-fg-2); opacity: 1; }
[data-form-composition-demo] .form-control-plaintext:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
[data-form-composition-demo] .form-floating { --trm-form-floating-label-opacity: .9; }
:is([dir="rtl"] [data-form-composition-demo], [data-form-composition-demo][dir="rtl"]) select.form-control { --trm-control-select-bg-position: left .75rem center; }
[data-form-composition-demo] .form-adorn:has(:disabled) { background-color: var(--trm-bg-2); }
[data-form-composition-demo] .form-floating label:has(~ :disabled) { color: var(--trm-fg-2); }
[data-form-composition-demo] .form-field:has(> .tooltip) { padding-block-end: 3rem; }
[data-form-composition-demo] .tooltip.invalid-tooltip { color: #fff; background-color: var(--trm-red-700); inset-block-start: auto; inset-block-end: 0; }`;
export const localFormScript = `document.querySelectorAll('[data-composition-local]').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault()
    const status = form.querySelector('[data-composition-status]')
    if (status) status.textContent = form.checkValidity() ? 'Valid. This demo does not send data.' : 'Complete the required fields. Nothing was sent.'
  })
  form.addEventListener('reset', () => {
    const status = form.querySelector('[data-composition-status]')
    if (status) status.textContent = 'No submission attempted.'
  })
  form.querySelectorAll('[data-composition-submit]').forEach(button => { button.disabled = false })
})`;
export const validationScript = `${localFormScript}
document.querySelectorAll('[data-composition-validation]').forEach(form => {
  const fields = [...form.querySelectorAll('[data-composition-validate-field]')]
  const summary = form.querySelector('[data-error-summary]')
  const status = form.querySelector('[role="status"]')
  let attempted = false
  const update = focusSummary => {
    fields.forEach(field => {
      if (field.hasAttribute('data-project-code')) field.setCustomValidity(field.value === 'DEMO00' ? 'Choose a code other than DEMO00.' : '')
      field.classList.toggle('is-invalid', !field.validity.valid)
      field.classList.toggle('is-valid', field.validity.valid)
      field.setAttribute('aria-invalid', String(!field.validity.valid))
    })
    const invalid = fields.filter(field => !field.validity.valid)
    const items = invalid.map(field => {
      const item = document.createElement('li')
      const link = document.createElement('a')
      link.href = '#' + field.id
      link.textContent = field.dataset.errorMessage
      link.addEventListener('click', event => { event.preventDefault(); field.focus() })
      item.append(link)
      return item
    })
    summary.querySelector('ul').replaceChildren(...items)
    summary.hidden = invalid.length === 0
    status.textContent = invalid.length ? '' : 'Valid. This demo does not send data.'
    if (focusSummary && invalid.length) summary.focus()
  }
  form.addEventListener('submit', event => { event.preventDefault(); attempted = true; update(true) })
  form.addEventListener('input', () => { if (attempted) update(false) })
  form.addEventListener('change', () => { if (attempted) update(false) })
  form.addEventListener('reset', () => {
    attempted = false
    fields.forEach(field => { field.setCustomValidity(''); field.classList.remove('is-invalid', 'is-valid'); field.removeAttribute('aria-invalid') })
    summary.hidden = true
    summary.querySelector('ul').replaceChildren()
    status.textContent = 'No submission attempted.'
  })
  form.querySelector('[data-composition-submit]').disabled = false
})`;
// Complete source-derived map tables; the older generic catalog omits these maps.
const tokenRows = (prefix: string, entries: string[][]) => entries.map(([name, value]) => ({ name: prefix + name, defaultValue: value! }));
export const compositionTokens = {
    'input-group': tokenRows('--trm-input-group-addon-', [
        ['padding-y', 'var(--trm-btn-input-padding-y)'], ['padding-x', 'var(--trm-btn-input-padding-x)'],
        ['font-size', 'var(--trm-btn-input-font-size)'], ['line-height', 'var(--trm-btn-input-line-height)'],
        ['color', 'var(--trm-fg-body)'], ['bg', 'var(--trm-bg-2)'], ['border-color', 'var(--trm-border-color)']
    ]),
    'floating-labels': tokenRows('--trm-form-floating-', [
        ['height', 'calc(3.75rem + (var(--trm-border-width) * 2))'], ['line-height', '1.25'],
        ['padding-x', 'calc(var(--trm-btn-input-padding-x) * 1.25)'], ['padding-y', '1rem'],
        ['input-padding-t', '1.625rem'], ['input-padding-b', '.625rem'], ['label-height', '1.5em'],
        ['label-bg', 'var(--trm-btn-input-bg)'], ['label-disabled-bg', 'var(--trm-bg-2)'], ['label-opacity', '.65'],
        ['label-transform', 'scale(.85) translateY(-.5rem) translateX(.15rem)'], ['label-disabled-color', 'var(--trm-fg-3)'],
        ['transition-property', '"opacity, transform"'], ['transition-duration', '.1s'], ['transition-timing', 'ease-in-out']
    ]),
    'form-adorn': tokenRows('--trm-form-adorn-', [['gap', '.375rem'], ['icon-size', '1rem'], ['icon-color', 'var(--trm-fg-2)']]),
    layout: [], validation: []
};
export const compositionSass = {
    'input-group': `@use 'tremplin/scss/forms/input-group' with (\n  $input-group-addon-tokens: (--trm-input-group-addon-bg: var(--trm-bg-1)),\n  $input-group-sizes: (lg: null)\n);`,
    'floating-labels': `@use 'tremplin/scss/forms/floating-labels' with (\n  $form-floating-tokens: (--trm-form-floating-height: 4.25rem)\n);`,
    'form-adorn': `@use 'tremplin/scss/forms/form-adorn' with (\n  $form-adorn-tokens: (--trm-form-adorn-gap: .5rem, --trm-form-adorn-icon-size: 1.125rem)\n);`,
    layout: `@use 'tremplin/scss/config' with ($enable-grid-classes: true);\n@use 'tremplin/scss/layout/grid';`,
    validation: `@use 'tremplin/scss/forms/validation' with (\n  $validation-states: ('warning': 'warning')\n);`
};
