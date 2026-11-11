import { documentedTokens } from './documented-tokens';
export const nativeFormTopics = ['field', 'form-control', 'checkbox', 'radio', 'switch'] as const;
export type NativeFormTopic = typeof nativeFormTopics[number];
export const nativeFormDemoCss = `[data-native-forms-demo] { --trm-danger-fg: var(--trm-danger-fg-emphasis); --trm-success-fg: var(--trm-success-fg-emphasis); }
[data-native-forms-demo] .form-control { --trm-control-placeholder-color: var(--trm-fg-2); }
[data-native-forms-demo] .form-ghost::placeholder { color: var(--trm-fg-2); opacity: 1; }
[data-native-forms-demo] .form-control-plaintext:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
:is([dir="rtl"] [data-native-forms-demo], [data-native-forms-demo][dir="rtl"]) :is(select.form-control, .form-control-caret) { --trm-control-select-bg-position: left .75rem center; }`;
export const indeterminateDemoJavascript = `document.querySelectorAll('[data-native-indeterminate]').forEach(input => {
  input.indeterminate = true
})`;
// Source-derived defaults missing from the older generic documentation catalog.
// These are prose/table data, not a second implementation or a generator change.
const radioDefaults = [['size', '1.25rem'], ['margin-block', '.125rem'], ['bg', 'var(--trm-bg-body)'], ['border-color', 'var(--trm-border-color)'], ['checked-bg', 'var(--trm-control-checked-bg)'], ['checked-border-color', 'var(--trm-control-checked-border-color)'], ['disabled-bg', 'var(--trm-control-disabled-bg)'], ['disabled-opacity', 'var(--trm-control-disabled-opacity)']];
const switchDefaults = [['height', '1.25rem'], ['width', 'calc(var(--trm-switch-height) * 1.75)'], ['padding', '.0625rem'], ['margin-block', '.125rem'], ['transition-duration', 'var(--trm-control-transition-duration)'], ['transition-timing', 'var(--trm-control-transition-timing)'], ['bg', 'var(--trm-bg-3)'], ['border-width', 'var(--trm-border-width)'], ['border-color', 'var(--trm-border-color)'], ['indicator-bg', 'var(--trm-white)'], ['indicator-width', 'calc(var(--trm-switch-height) - calc(var(--trm-switch-padding) * 2) - var(--trm-switch-border-width) * 2)'], ['indicator-height', 'calc(var(--trm-switch-height) - calc(var(--trm-switch-padding) * 2) - var(--trm-switch-border-width) * 2)'], ['checked-bg', 'var(--trm-control-checked-bg)'], ['checked-border-color', 'var(--trm-switch-checked-bg)'], ['checked-indicator-bg', 'var(--trm-white)'], ['disabled-bg', 'var(--trm-control-disabled-bg)'], ['disabled-indicator-bg', 'var(--trm-fg-3)']];
export const nativeFormTokens = {
    field: [],
    'form-control': documentedTokens('forms').filter(t => ['form-control-tokens', 'form-text-tokens'].some(map => t.purpose.includes('$' + map + ';'))),
    checkbox: documentedTokens('forms').filter(t => t.name.startsWith('--trm-check-')),
    radio: radioDefaults.map(([name, value]) => ({ name: '--trm-radio-' + name, defaultValue: value!, purpose: 'Declared in $radio-tokens; configure before first Sass load.' })),
    switch: switchDefaults.map(([name, value]) => ({ name: '--trm-switch-' + name, defaultValue: value!, purpose: 'Declared in $switch-tokens; configure before first Sass load.' }))
};
export const nativeFormSass: Record<NativeFormTopic, string> = {
    field: "@use 'tremplin/scss/root' with ($root-tokens: (--trm-radius-7: .75rem));\n@use 'tremplin/scss/forms/form-field';",
    'form-control': `@use 'tremplin/scss/root' with (\n  $root-tokens: (\n    --trm-btn-input-compact-min-height: 2.125rem,\n    --trm-btn-input-compact-padding-y: .25rem,\n    --trm-btn-input-compact-padding-x: .625rem,\n    --trm-btn-input-compact-font-size: 1rem,\n    --trm-btn-input-compact-line-height: 1.5,\n    --trm-btn-input-compact-border-radius: .5rem\n  )\n);\n@use 'tremplin/scss/forms/form-control' with (\n  $form-control-tokens: (--trm-control-border-radius: .5rem, --trm-control-box-shadow: none),\n  $form-control-sizes: (compact: true)\n);`,
    checkbox: "@use 'tremplin/scss/forms/check' with ($check-tokens: (--trm-check-size: 1.375rem));",
    radio: "@use 'tremplin/scss/forms/radio' with ($radio-tokens: (--trm-radio-size: 1.375rem));",
    switch: "@use 'tremplin/scss/forms/switch' with ($switch-tokens: (--trm-switch-height: 1.375rem));"
};
