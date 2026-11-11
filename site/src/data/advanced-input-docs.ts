import { authoredComponentDetail, componentNarrative } from '../libs/component-mdx';
import type { ComponentDetail } from './component-docs';
import { documentedTokens } from './documented-tokens';
export const advancedTopics = ['datepicker', 'otp-input', 'range', 'strength'] as const;
export type AdvancedTopic = typeof advancedTopics[number];
export const isAdvancedTopic = (name: string): name is AdvancedTopic => (advancedTopics as readonly string[]).includes(name);
export const advancedFormsTopic = (name: AdvancedTopic) => name === 'strength' ? 'password-strength' : name;
const escape = (s: string) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const dark = (markup: string) => `<div data-trm-theme="dark" dir="rtl" class="p-3 rounded-5 bg-body fg-body">${markup}</div>`;
const compact = 'style="--trm-otp-size: clamp(2rem, 6vw, 2.5rem); --trm-otp-gap: .25rem"';
export const otpInput = (id: string, label: string, length = 4, attrs = '', inputAttrs = '') => `<div class="form-field"><label class="form-label" for="${escape(id)}-code">${escape(label)}</label><div id="${escape(id)}" class="otp" data-trm-otp ${attrs}><input id="${escape(id)}-code" type="text" name="code" maxlength="${length}" autocomplete="one-time-code" ${inputAttrs}></div></div>`;
export function rangeInput(id: string, label: string, attrs = '', inputAttrs = '', settings: {
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    bubble?: boolean;
} = {}) {
    return `<div class="form-field"><label class="form-label" for="${escape(id)}">${escape(label)}</label><div id="${escape(id)}-range" class="form-range" data-trm-bubble="${settings.bubble ?? true}" ${attrs}><input id="${escape(id)}" class="form-range-input" name="volume" type="range" min="${settings.min ?? 0}" max="${settings.max ?? 100}" step="${settings.step ?? 5}" value="${settings.value ?? 40}" ${inputAttrs}></div></div>`;
}
export function strengthInput(id: string, label: string, value = '', attrs = '', settings: {
    bar?: boolean;
    inputAttrs?: string;
} = {}) {
    return `<div class="form-field"><label class="form-label" for="${escape(id)}">${escape(label)}</label><input id="${escape(id)}" class="form-control" name="password" type="password" autocomplete="new-password" aria-describedby="${escape(id)}-feedback" value="${escape(value)}" ${settings.inputAttrs ?? ''}><div id="${escape(id)}-strength" class="${settings.bar ? 'strength-bar' : 'strength'}" data-trm-strength data-trm-input="#${escape(id)}" aria-hidden="true" ${attrs}>${settings.bar ? '' : '<span class="strength-segment"></span>'.repeat(4)}</div><p id="${escape(id)}-feedback" class="strength-text" role="status" aria-live="polite"></p></div>`;
}
export const dateInput = (id: string, label: string, attrs = '') => `<div class="form-field"><label class="form-label" for="${escape(id)}">${escape(label)}</label><input id="${escape(id)}" type="text" class="form-control" name="deadline" data-trm-toggle="datepicker" data-trm-selected-dates='["2026-10-15"]' autocomplete="off" ${attrs}></div>`;
// Explicit application layout choice: closed, offscreen popups should not cause resize overflow.
export const advancedDemoCss = '.demo-calendar-contrast[data-vc-calendar-hidden] { display: none; }';
const inlineDate = (id: string, months = 1) => `<div class="table-responsive focus-ring" role="region" tabindex="0" aria-label="${months === 1 ? 'Inline date calendar' : 'Two-month calendar'}"><div id="${id}" data-trm-toggle="datepicker" data-trm-inline="true" data-demo-inline-date data-trm-selected-dates='["2026-10-15"]' data-trm-display-months-count="${months}"${months > 1 ? ' style="--trm-datepicker-min-width: 36rem"' : ''}></div></div><input id="${id}-value" type="hidden" name="selected-date" value="2026-10-15">`;
export const advancedClasses: Record<AdvancedTopic, string[]> = {
    datepicker: [],
    'otp-input': ['otp', 'otp-input', 'otp-rendered', 'otp-slots', 'otp-slot', 'otp-slot-filled', 'otp-slot-active', 'otp-connected', 'otp-separator', 'otp-sm', 'otp-lg'],
    range: ['form-range', 'form-range-input', 'form-range-bubble', 'form-range-ticks', 'form-range-tick', 'form-range-tick-label'],
    strength: ['strength', 'strength-segment', 'strength-text', 'strength-bar', 'active']
};
export const advancedAccessibility: Record<AdvancedTopic, string> = {
    datepicker: 'Name the native text input or button and offer a suitable text-entry/native-date alternative. Calendar Pro owns generated grid/button semantics. Typed edits do not automatically resync the adapter selection array; locale display is not an ISO submission guarantee. Keep approved sanitization, same-origin arrow assets and explicit demo contrast styling.',
    'otp-input': 'Label the one real text input, retain one-time-code autocomplete, and put errors/help on that input. Generated slots and separators are aria-hidden decoration. Visual masking does not secure or remove the real value. Runtime events use otpInput, not the frozen scanner filename suffix. Test physical RTL tapping and real-device autofill separately.',
    range: 'Label the native slider and retain native bounds, step and name. Bubble/tick markup is decorative. Use descriptive units or application-owned aria-valuetext when needed; a formatter alone changes only the bubble. The pinned fill and bubble position remain physical left-to-right even in RTL.',
    strength: 'Pair decorative segments or bar with readable sibling status text and a labelled password input. The plugin does not supply a numeric ARIA meter, authentication policy or breach check. Feedback/events change only when the level changes, not for every different score; the event redacts password text.'
};
export const advancedRuntimeEvent = (event: string) => event.replace('.trm.otp-input', '.trm.otpInput');
export const advancedEvents: Record<string, string> = {
    get 'complete.trm.otpInput'() { return authoredAdvancedEvent('otp-input', 'complete.trm.otpInput') },
    get 'input.trm.otpInput'() { return authoredAdvancedEvent('otp-input', 'input.trm.otpInput') },
    get 'changed.trm.range'() { return authoredAdvancedEvent('range', 'changed.trm.range') },
    get 'strengthChange.trm.strength'() { return authoredAdvancedEvent('strength', 'strengthChange.trm.strength') },
    get 'show.trm.datepicker'() { return authoredAdvancedEvent('datepicker', 'show.trm.datepicker') },
    get 'shown.trm.datepicker'() { return authoredAdvancedEvent('datepicker', 'shown.trm.datepicker') },
    get 'hide.trm.datepicker'() { return authoredAdvancedEvent('datepicker', 'hide.trm.datepicker') },
    get 'hidden.trm.datepicker'() { return authoredAdvancedEvent('datepicker', 'hidden.trm.datepicker') },
    get 'change.trm.datepicker'() { return authoredAdvancedEvent('datepicker', 'change.trm.datepicker') },
    get 'click.trm.datepicker'() { return authoredAdvancedEvent('datepicker', 'click.trm.datepicker') },
    get 'focusin.trm.datepicker'() { return authoredAdvancedEvent('datepicker', 'focusin.trm.datepicker') },
    get 'pointerdown.trm.datepicker'() { return authoredAdvancedEvent('datepicker', 'pointerdown.trm.datepicker') }
};
type OptionRow = {
    name: string;
    type: string;
    defaultValue: string;
    description: string;
};
const option = (name: string, type: string, defaultValue: string, description: string): OptionRow => ({ name, type, defaultValue, description });
export const advancedOptionRows: Record<AdvancedTopic, OptionRow[]> = {
    datepicker: [
        option('datepickerTheme', 'string | null', 'null', 'Explicit popup theme overrides the cached nearest theme ancestor; auto maps to Calendar Pro system.'),
        option('dateMin', 'DateAny | null', 'null', 'Forwarded date bound; use a supported date such as YYYY-MM-DD, not text-input min.'),
        option('dateMax', 'DateAny | null', 'null', 'Forwarded maximum date; not a server scheduling/validation policy.'),
        option('dateFormat', 'Intl.DateTimeFormatOptions | function | null', 'null', 'Formatting object/function for display. Default is locale date formatting, not ISO submission.'),
        option('displayElement', 'string | HTMLElement | boolean | null', 'null', 'Separate display; non-input triggers prefer a data-trm-datepicker-display child. false suppresses extra display, not input updates.'),
        option('displayMonthsCount', 'MonthsCount', '1', 'Supported months extension; more than one selects multiple calendar layout.'),
        option('firstWeekday', 'WeekDayID', '1', 'Monday by default; 0 is Sunday.'),
        option('inline', 'boolean', 'false', 'Always-visible inline mode; show/hide/toggle are no-ops. Calendar Pro replaces children in this pin; the shown application handler maintains a separate sibling hidden field instead.'),
        option('locale', 'string', "'default'", 'Calendar locale and display formatting locale; default uses the environment.'),
        option('positionElement', 'string | HTMLElement | null', 'null', 'Position relative to this element, otherwise an input form-adorn ancestor or the trigger.'),
        option('selectedDates', 'string[]', '[]', 'Initial selected date array; dates also choose the opening month/year.'),
        option('selectionMode', 'DateMode', "'single'", 'single, multiple or multiple-ranged. Single/nonempty and completed ranged clicks request hide after 100 ms.'),
        option('placement', 'PositionToInput', "'left'", 'Calendar Pro left/center/right/auto placement, not Floating UI placements.'),
        option('vcpOptions', 'Options', '{}', 'Spread first, then adapter-owned callbacks, sanitizer and months extension/config overwrite collisions. Other extension-only features are not enabled.')
    ],
    'otp-input': [
        option('groups', 'number[] | null', 'null', 'Decorative group lengths. The final configured size repeats for remaining groups; separators never enter the input value.'),
        option('length', 'number | null', 'null', 'Truthy configured length, otherwise valid maxlength or six. Use a positive sensible length; no integer/range validation is supplied.'),
        option('mask', 'boolean', 'false', 'Dots replace only decorative slot text. The real input stays text and still submits the value.'),
        option('separator', 'string', "'\u00b7'", 'Plain text between configured groups, not HTML.'),
        option('type', 'string', "'numeric'", 'numeric, alpha or alphanumeric use ASCII filters and matching inputmode/pattern; unknown strings fall back to numeric.')
    ],
    range: [option('bubble', 'boolean | null', 'false', 'Show a tooltip-shaped decorative output. A bare data-trm-bubble normalizes to enabled.'), option('formatter', '((value: number) => string) | null', 'null', 'Formats bubble text with textContent. In this pin tick labels use datalist option.label directly; they are not passed through formatter.')],
    strength: [
        option('input', 'string | HTMLInputElement | null', 'null', 'Selector/element, otherwise the first password input in the parent. Give separate meters separate parents or explicit input selectors.'),
        option('minLength', 'number', '8', 'Adds a length scoring point; does not enforce input minlength or reject a password.'),
        option('messages', 'Record<string,string>', '{ weak: Weak, fair: Fair, good: Good, strong: Strong }', 'Complete per-level text map. Nested option objects replace defaults rather than merging individual keys.'),
        option('weights', 'Record<string,number>', '{ minLength:1, extraLength:1, lowercase:1, uppercase:1, numbers:1, special:1, multipleSpecial:1, longPassword:1 }', 'Supply every key. A partial replacement can add undefined values and produce NaN; custom scoring bypasses this map.'),
        option('thresholds', 'number[]', '[2, 4, 6]', 'Inclusive weak/fair/good ceilings; above the third is strong, zero returns null. No length/order validation is supplied.'),
        option('scorer', '((password:string) => number) | null', 'null', 'Local custom function for nonempty text; empty text returns zero before calling it. Validate custom return values in your application.')
    ]
};
// Explicit browser-bundle demo setup, shown verbatim beside the examples.
export const advancedDemoJavascript = `import { Range, Strength } from 'tremplin'

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-demo-inline-date]').forEach(calendar => {
    // VCP replaces inline children; keep the successful field outside its render root.
    calendar.addEventListener('change.trm.datepicker', event => {
      document.getElementById(calendar.id + '-value').value = event.dates.join(',')
    })
  })
  document.querySelectorAll('[data-demo-percent-range]').forEach(wrapper => {
    // Deliberately replace any automatically created instance before configuring.
    Range.getInstance(wrapper)?.dispose()
    new Range(wrapper, { bubble: true, formatter: value => value + '%' })
  })
  document.querySelectorAll('[data-demo-custom-strength]').forEach(meter => {
    Strength.getInstance(meter)?.dispose()
    new Strength(meter, {
      scorer: password => password.length >= 12 ? 7 : 1,
      messages: { weak: 'Demo: under 12 characters', fair: 'Demo: fair', good: 'Demo: good', strong: 'Demo: 12 or more characters' }
    })
  })
  document.querySelectorAll('[data-demo-range-set]').forEach(button => {
    button.addEventListener('click', () => {
      const form = button.closest('form'), wrapper = form.querySelector('.form-range')
      wrapper.querySelector('input').value = '75'
      Range.getOrCreateInstance(wrapper).update()
      form.querySelector('[role="status"]').textContent = 'Demo value set to 75. Native submission is still explicit.'
    })
  })
})`;
export const advancedApiJavascript: Record<AdvancedTopic, string> = {
    datepicker: "import Datepicker from 'tremplin/datepicker'\n\nconst picker = Datepicker.getOrCreateInstance('#deadline')\nconst dates = picker.getSelectedDates() // copied ISO-date array\n// setSelectedDates([...]) updates display, but does not emit change.trm.datepicker.",
    'otp-input': "import OtpInput from 'tremplin/otp-input'\n\nconst otp = OtpInput.getOrCreateInstance('#otp-example')\n// The named native input submits the complete value; do not log codes.\n// Runtime events: input.trm.otpInput and complete.trm.otpInput.",
    range: "import Range from 'tremplin/range'\n\nconst range = Range.getOrCreateInstance('#volume-range')\n// After changing the native input value in application code:\nrange.update() // emits changed.trm.range on the native input, even if unchanged",
    strength: "import Strength from 'tremplin/strength'\n\nconst strength = Strength.getOrCreateInstance('#password-strength')\nconst level = strength.getStrength() // null, weak, fair, good or strong\n// Call evaluate() after an application-owned input.value change."
};
export const advancedExamples: Record<AdvancedTopic, string> = { datepicker: dateInput('deadline', 'Deadline'), 'otp-input': otpInput('otp-example', 'Verification code'), range: rangeInput('volume', 'Volume'), strength: strengthInput('password', 'Password') };
const rangeForm = (id: string) => `<form id="${id}-form" class="d-grid gap-4">${rangeInput(id, 'Submitted volume')}<button class="btn-outline theme-primary" type="button" data-demo-range-set>Set demo value to 75</button><p role="status">Demo value is 40. This page does not submit data.</p></form>`;
const staticStrength = ['weak', 'fair', 'good', 'strong'].map(level => `<div><p>${level}</p><div class="strength-bar" data-trm-strength="${level}" aria-hidden="true"></div></div>`).join('');
export const advancedDetails: Record<AdvancedTopic, ComponentDetail> = {
    datepicker: authoredComponentDetail("datepicker", {
    variants: [
        { markup: dateInput('guide-deadline', 'Deadline') },
        { markup: dateInput('guide-window', 'Deployment date', 'data-trm-date-min="2026-10-10" data-trm-date-max="2026-10-20"') },
        { markup: `<form id="inline-date-form">${inlineDate('inline-calendar')}</form>` },
        { markup: inlineDate('multiple-calendar', 2) },
        { markup: dark(dateInput('rtl-deadline', 'Review date')) },
        { markup: dateInput('multiple-dates', 'Meeting dates', `data-trm-selection-mode="multiple"`) + dateInput('ranged-dates', 'Leave dates', `data-trm-selection-mode="multiple-ranged"`) },
        { markup: `<button id="button-date" type="button" class="btn-outline theme-primary" data-trm-toggle="datepicker" data-trm-selected-dates='["2026-10-15"]'><span>Meeting date: </span><span data-trm-datepicker-display>Choose date</span></button>` },
        { markup: dateInput('formatted-date', 'Formatted date', `data-trm-locale="en-GB" data-trm-first-weekday="0" data-trm-datepicker-theme="dark" data-trm-date-format='{"year":"numeric","month":"short","day":"2-digit"}'`) }
    ], variables: documentedTokens('datepicker'),
    sass: "@use 'tremplin/scss/datepicker' with ($datepicker-tokens: (--trm-datepicker-border-radius: 1rem));"
}),
    'otp-input': authoredComponentDetail("otp-input", {
    variants: [
        { markup: otpInput('guide-otp', 'Verification code') },
        { markup: otpInput('authenticator', 'Authenticator code', 6, compact) },
        { markup: otpInput('masked-code', 'Security code', 4, 'data-trm-mask="true"', 'value="1234"') },
        { markup: otpInput('expired-code', 'Expired code', 4, '', 'aria-invalid="true" aria-describedby="otp-error"') + '<p id="otp-error" class="form-text">Request a new code.</p>' },
        { markup: otpInput('connected-code', 'Connected PIN', 4).replace('class="otp"', 'class="otp otp-connected"') + otpInput('grouped-code', 'Alphanumeric code', 6, `data-trm-type="alphanumeric" data-trm-groups="[3,3]" ${compact}`) + otpInput('alpha-code', 'Alphabetic code', 4, 'data-trm-type="alpha"') },
        { markup: otpInput('small-code', 'Small code').replace('class="otp"', 'class="otp otp-sm"') + otpInput('large-code', 'Large code').replace('class="otp"', 'class="otp otp-lg"') },
        { markup: otpInput('readonly-code', 'Readonly code', 4, '', 'readonly value="1234"') + otpInput('disabled-code', 'Unavailable code', 4, '', 'disabled') },
        { markup: dark(otpInput('rtl-code', 'Verification code')) }
    ], variables: documentedTokens('otp-input'),
    sass: "@use 'tremplin/scss/forms/otp-input' with ($otp-tokens: (--trm-otp-gap: .75rem));"
}),
    range: authoredComponentDetail("range", {
    variants: [
        { markup: rangeInput('range-volume', 'Volume') },
        { markup: rangeInput('range-rating', 'Rating', '', 'list="range-marks"') + '<datalist id="range-marks"><option value="0" label="Low"></option><option value="50" label="Middle"></option><option value="100" label="High"></option></datalist>' },
        { markup: rangeInput('range-disabled', 'Unavailable volume', '', 'disabled') },
        { markup: dark(rangeInput('rtl-volume', 'Volume')) },
        { markup: rangeInput('fractional-range', 'Rating from one to five', '', '', { min: 1, max: 5, step: .5, value: 2.5, bubble: false }) },
        { markup: rangeInput('themed-range', 'Approved volume').replace('class="form-range"', 'class="form-range theme-success"') },
        { markup: rangeInput('formatted-range', 'Percentage', 'data-demo-percent-range') },
        { markup: rangeForm('submitted-range') }
    ], variables: documentedTokens('range'),
    sass: "@use 'tremplin/scss/forms/form-range' with ($range-tokens: (--trm-range-track-height: .75rem));"
}),
    strength: authoredComponentDetail("strength", {
    variants: [
        { markup: strengthInput('strength-password', 'New password', 'LongExample123!!') },
        { markup: strengthInput('empty-password', 'Password') },
        { markup: strengthInput('bar-password', 'Bar feedback password', 'Example123!!', '', { bar: true }) },
        { markup: strengthInput('custom-password', 'Demo custom score', '', 'data-demo-custom-strength') },
        { markup: staticStrength },
        { markup: strengthInput('readonly-password', 'Readonly password', 'Example123!!', '', { inputAttrs: 'readonly' }) + strengthInput('disabled-password', 'Unavailable password', '', '', { inputAttrs: 'disabled' }) },
        { markup: dark(strengthInput('rtl-password', 'Password')) }
    ], variables: documentedTokens('strength'),
    sass: "@use 'tremplin/scss/forms/strength' with ($strength-tokens: (--trm-strength-gap: .5rem));"
})
};

function authoredAdvancedEvent(name: AdvancedTopic, event: string): string {
    const description = componentNarrative(name).events?.[event];
    if (!description) throw new Error('Missing authored lifecycle description: ' + event);
    return description;
}
