import { authoredComponentDetail } from '../libs/component-mdx'
import type { ComponentDetail } from './component-docs';
import { documentedTokens } from './documented-tokens';
const wrap = (markup: string) => `<div data-docs-forms>${markup}</div>`;
const field = (id: string, label: string, attrs = '', help = '') => `<div class="form-field"><label class="form-label" for="${id}">${label}</label><input class="form-control" id="${id}" ${attrs}${help ? ` aria-describedby="${id}-help"` : ''}>${help ? `<p class="form-text mb-0" id="${id}-help">${help}</p>` : ''}</div>`;
const check = (id: string, label: string, type = 'checkbox', attrs = '') => `<div class="form-field"><input class="${type === 'radio' ? 'radio' : 'check'}" type="${type}" id="${id}" ${attrs}><label for="${id}">${label}</label></div>`;
const switchField = (id: string, label: string) => `<div class="form-field"><span class="switch"><input type="checkbox" role="switch" id="${id}"></span><label for="${id}">${label}</label></div>`;
const button = (label: string, attrs = '') => `<button class="btn-outline theme-inverse" ${attrs}>${label}</button>`;
export const basicForm = (id: string) => wrap(`<form id="${id}" data-docs-forms-preview class="vstack gap-3">
  ${field(id + '-email', 'Email address (required)', 'type="email" name="email" required autocomplete="email"', 'Use an example address for this local preview.')}
  ${field(id + '-project', 'Project name (required)', 'type="text" name="project" required autocomplete="off"')}
  ${check(id + '-updates', 'Include project updates', 'checkbox', 'name="updates" value="yes"')}
  <div class="d-flex flex-wrap gap-2">${button('Check locally', 'type="submit" data-docs-forms-submit disabled')}${button('Reset', 'type="reset"')}</div>
  <p class="form-text mb-0" role="status" data-docs-forms-status>No submission attempted.</p>
</form>`);
export const disabledForm = (id: string) => wrap(`<fieldset disabled class="vstack gap-3">
  <legend>Unavailable settings</legend>
  ${field(id + '-name', 'Disabled display name', 'type="text" name="displayName" value="Unavailable"')}
  <div class="form-field"><label class="form-label" for="${id}-select">Disabled role</label><select class="form-control" id="${id}-select" name="role"><option>Viewer</option><option>Editor</option></select></div>
  ${check(id + '-updates', 'Managed updates', 'checkbox', 'name="updates" checked')}
  <div>${button('Save unavailable settings', 'type="button"')}</div>
</fieldset>`);
export const stateForm = (id: string) => wrap(`<form id="${id}" data-docs-forms-values class="vstack gap-3">
  ${field(id + '-readonly', 'Readonly account', 'name="account" readonly value="example-account"')}
  ${field(id + '-disabled', 'Disabled account note', 'name="note" disabled value="Not submitted"')}
  <div>${button('Inspect included field names', 'type="button" data-docs-forms-inspect disabled')}</div>
  <p class="form-text mb-0" role="status" data-docs-forms-status>No inspection attempted.</p>
</form>`);
export const validationForm = (id: string) => wrap(`<form id="${id}" data-docs-forms-validation novalidate class="vstack gap-3">
  <div class="border rounded-5 p-3 focus-ring" tabindex="-1" role="alert" data-docs-forms-summary hidden><p><strong>Check the required details.</strong></p><ul class="mb-0"><li><a href="#${id}-email">Enter a valid email address.</a></li><li><a href="#${id}-code">Use six uppercase letters or digits for the project code.</a></li></ul></div>
  <div class="form-field"><label class="form-label" for="${id}-email">Email address (required)</label><input class="form-control" type="email" name="email" id="${id}-email" required autocomplete="email" aria-describedby="${id}-email-error"><p class="invalid-feedback mb-0" id="${id}-email-error">Enter a valid email address.</p></div>
  <div class="form-field"><label class="form-label" for="${id}-code">Project code (required)</label><input class="form-control" name="code" id="${id}-code" required pattern="[A-Z0-9]{6}" maxlength="6" aria-describedby="${id}-code-help ${id}-code-error"><p class="form-text mb-0" id="${id}-code-help">Use exactly six uppercase letters or digits.</p><p class="invalid-feedback mb-0" id="${id}-code-error">Enter a six-character code such as ABC123.</p></div>
  <div class="d-flex flex-wrap gap-2">${button('Check details locally', 'type="submit" data-docs-forms-submit disabled')}${button('Reset validation', 'type="reset"')}</div>
  <p class="form-text mb-0" role="status" data-docs-forms-status>No submission attempted.</p>
</form>`);
const controls = (id: string) => wrap(`<div class="vstack gap-3">
  <div class="form-field"><label class="form-label" for="${id}-role">Project role</label><select class="form-control" id="${id}-role" name="role"><option value="designer">Designer</option><option value="developer">Developer</option></select></div>
  <div class="form-field"><label class="form-label" for="${id}-notes">Project notes</label><textarea class="form-control" id="${id}-notes" name="notes" rows="3" aria-describedby="${id}-notes-help"></textarea><p class="form-text mb-0" id="${id}-notes-help">Keep personal information out of this preview.</p></div>
  ${field(id + '-small', 'Small control', 'type="text"').replace('class="form-control"', 'class="form-control form-control-sm"')}
  ${field(id + '-large', 'Large control', 'type="text"').replace('class="form-control"', 'class="form-control form-control-lg"')}
</div>`);
const choices = (id: string) => wrap(`<div class="vstack gap-3">
  ${check(id + '-updates', 'Receive a weekly summary')}
  <fieldset class="form-group"><legend>Billing schedule</legend>${check(id + '-monthly', 'Monthly', 'radio', `name="${id}-billing" value="monthly" checked`)}${check(id + '-yearly', 'Yearly', 'radio', `name="${id}-billing" value="yearly"`)}</fieldset>
  ${switchField(id + '-notices', 'Enable project notices')}
</div>`);
const floating = (id: string) => wrap(`<div class="vstack gap-3">
  <div class="form-floating"><label for="${id}-workspace">Workspace name</label><input class="form-control" id="${id}-workspace" name="workspace" placeholder="Workspace name" autocomplete="off"></div>
  <div><label class="form-label" for="${id}-path">Project path</label><div class="input-group"><span class="input-group-text" id="${id}-prefix">/projects/</span><input class="form-control" id="${id}-path" name="path" aria-describedby="${id}-prefix" value="demo"></div></div>
</div>`);
const layout = (id: string) => wrap(`<div class="row g-3"><div class="col-12 md:col-6">${field(id + '-first', 'First name', 'name="firstName" autocomplete="given-name"')}</div><div class="col-12 md:col-6">${field(id + '-last', 'Last name', 'name="lastName" autocomplete="family-name"')}</div></div>`);
const dark = (id: string) => wrap(`<div data-trm-theme="dark" dir="rtl" lang="ar" class="bg-body fg-body rounded-5 p-3 vstack gap-3"><div class="form-field"><label class="form-label" for="${id}-message">رسالة المشروع</label><textarea class="form-control" id="${id}-message" rows="3" aria-describedby="${id}-help"></textarea><p class="form-text mb-0" id="${id}-help">هذا مثال محلي ولا يتم إرسال الرسالة.</p></div>${switchField(id + '-notices', 'تفعيل إشعارات المشروع')}</div>`);
// Root-form-variables is the pinned shared group, not every component token map.
export const sharedFormTokens = documentedTokens('root').filter(t => /^--trm-(btn-input-|control-(checked-|active-|disabled-|transition-))/.test(t.name));
const representativeTokens = [...sharedFormTokens.filter(t => !/^--trm-btn-input-(xs|sm|lg)-/.test(t.name)), ...documentedTokens('forms').filter(t => ['--trm-control-border-radius', '--trm-control-placeholder-color', '--trm-form-text-color', '--trm-form-floating-height', '--trm-input-group-addon-bg'].includes(t.name))];
export const formsSass = `@use 'tremplin/scss/root' with (\n  $root-tokens: (--trm-btn-input-padding-x: .875rem)\n);\n@use 'tremplin/scss/forms/form-control' with (\n  $form-control-tokens: (--trm-control-border-radius: .75rem)\n);\n@use 'tremplin/scss';`;
export const formsDemoCss = `[data-docs-forms] { --trm-danger-fg: var(--trm-danger-fg-emphasis); }
[data-docs-forms] .form-control { --trm-control-placeholder-color: var(--trm-fg-2); }`;
export const formsDemoJavascript = `document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-docs-forms-preview]').forEach(form => {
    const status = form.querySelector('[data-docs-forms-status]')
    form.addEventListener('submit', event => {
      event.preventDefault()
      status.textContent = 'Valid locally. Nothing was sent or saved.'
    })
    form.addEventListener('reset', () => { status.textContent = 'No submission attempted.' })
    form.querySelector('[data-docs-forms-submit]').disabled = false
  })
  document.querySelectorAll('[data-docs-forms-values]').forEach(form => {
    const inspect = form.querySelector('[data-docs-forms-inspect]')
    form.addEventListener('submit', event => event.preventDefault())
    inspect.addEventListener('click', () => {
      const names = [...new Set(new FormData(form).keys())]
      form.querySelector('[data-docs-forms-status]').textContent = 'Included field names: ' + names.join(', ') + '. Disabled fields are omitted.'
    })
    inspect.disabled = false
  })
  document.querySelectorAll('[data-docs-forms-validation]').forEach(form => {
    const fields = [...form.querySelectorAll('input')]
    const summary = form.querySelector('[data-docs-forms-summary]')
    const status = form.querySelector('[data-docs-forms-status]')
    form.addEventListener('submit', event => {
      event.preventDefault()
      const invalid = fields.filter(field => !field.validity.valid)
      fields.forEach(field => {
        field.classList.toggle('is-invalid', !field.validity.valid)
        field.setAttribute('aria-invalid', String(!field.validity.valid))
      })
      summary.querySelectorAll('li').forEach(item => {
        const id = item.querySelector('a').getAttribute('href').slice(1)
        item.hidden = !invalid.some(field => field.id === id)
      })
      summary.hidden = invalid.length === 0
      status.textContent = invalid.length ? '' : 'Valid locally. Nothing was sent or saved.'
      if (invalid.length) summary.focus()
    })
    form.addEventListener('reset', () => {
      fields.forEach(field => { field.classList.remove('is-invalid'); field.removeAttribute('aria-invalid') })
      summary.hidden = true
      status.textContent = 'No submission attempted.'
    })
    form.querySelector('[data-docs-forms-submit]').disabled = false
  })
})`;
export const formsClasses = ['form-label', 'form-control', 'form-control-sm', 'form-control-lg', 'form-control-plaintext', 'form-control-color', 'form-control-caret', 'form-field', 'form-field-content', 'form-field-card', 'form-group', 'check', 'radio', 'switch', 'form-text', 'form-floating', 'input-group', 'input-group-text', 'valid-feedback', 'invalid-feedback', 'is-valid', 'is-invalid'];
export const formsAccessibility = 'Use native controls with visible labels, explicit names, instructions and programmatic help/error associations. Checkbox, radio and switch keep native keyboard state. Disabled and readonly differ; feedback and summary focus are application-owned. Forms has no standalone JavaScript plugin.';
export const formsExample = basicForm('forms-example');
export const formsDetails: ComponentDetail = authoredComponentDetail("forms", {
    variants: [
        { markup: controls('forms-controls') },
        { markup: stateForm('forms-state') },
        { markup: disabledForm('forms-disabled') },
        { markup: choices('forms-choice') },
        { markup: floating('forms-composition') },
        { markup: layout('forms-layout-demo') },
        { markup: validationForm('forms-validation') },
        { markup: dark('forms-rtl') }
    ],
    variables: representativeTokens,
    sass: formsSass
});
