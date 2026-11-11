import { authoredComponentDetail, componentNarrative } from '../libs/component-mdx';
import type { ComponentDetail } from './component-docs';
import { documentedTokens } from './documented-tokens';
export type ChoiceTopic = 'chips' | 'combobox';
type Choice = {
    value: string;
    label: string;
    disabled?: boolean;
    selected?: boolean;
    description?: string;
    group?: string;
};
type ComboSettings = {
    search?: boolean;
    normalize?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'lg';
    placeholder?: string;
    name?: string | null;
};
type ChipSettings = {
    values?: string[];
    inputAttrs?: string;
    invalid?: boolean;
};
const escape = (s: string) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const dark = (markup: string) => `<div data-trm-theme="dark" dir="rtl" class="p-3 rounded-5 bg-body fg-body">${markup}</div>`;
const dismissIcon = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="m4 4 8 8m0-8-8 8"/></svg>';
const caret = '<svg class="combobox-caret" width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="currentColor" aria-hidden="true" focusable="false"><path d="m1 6 4 4 4-4"/></svg>';
const check = '<svg class="menu-item-check" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="m2 7 4 5 8-8"/></svg>';
// Explicit documentation/application choices, not a patch to pinned Chip/Menu CSS.
export const choiceDemoCss = `[data-trm-chips] > .chip:focus-visible {
  outline: var(--trm-focus-ring-width) solid var(--trm-focus-ring-color);
  outline-offset: 2px;
}
.combobox-placeholder, .combobox-no-results { color: var(--trm-fg-2); }`;
export function choiceChipInput(id: string, label: string, attrs = '', settings: ChipSettings = {}): string {
    const values = settings.values ?? ['Design'], key = escape(id);
    return `<div class="form-field"><label class="form-label" for="${key}-input">${escape(label)}</label><div id="${key}" class="chip-input" data-trm-chips ${attrs}>${values.map(value => `<span class="chip" data-trm-chip-value="${escape(value)}">${escape(value)}<button class="chip-dismiss" type="button" aria-label="Remove ${escape(value)}">${dismissIcon}</button></span>`).join('')}<input id="${key}-input" class="form-ghost" type="text" placeholder="Type a value and press Enter" aria-describedby="${key}-help${settings.invalid ? ' ' + key + '-error' : ''}"${settings.invalid ? ' aria-invalid="true"' : ''} ${settings.inputAttrs ?? ''}></div><p class="form-text" id="${key}-help">Enter adds text; Backspace on an empty input first selects a chip.</p>${settings.invalid ? `<p class="form-text" id="${key}-error">These reviewers need application validation.</p>` : ''}</div>`;
}
export function choiceComboboxExample(id: string, label: string, choices: Choice[], multiple = false, settings: ComboSettings = {}): string {
    const key = escape(id), placeholder = settings.placeholder ?? 'Choose a value', search = settings.search ?? true;
    let currentGroup: string | undefined;
    const items = choices.map(choice => {
        let prefix = '';
        if (choice.group !== currentGroup) {
            if (currentGroup)
                prefix += '</div>';
            currentGroup = choice.group;
            if (currentGroup)
                prefix += `<div role="group" aria-label="${escape(currentGroup)}"><div class="menu-header" aria-hidden="true">${escape(currentGroup)}</div>`;
        }
        return prefix + `<button class="menu-item${choice.selected ? ' selected' : ''}" type="button" role="option" aria-selected="${choice.selected ? 'true' : 'false'}" data-trm-value="${escape(choice.value)}"${choice.disabled ? ' disabled aria-disabled="true"' : ''}>${choice.description ? `<span class="menu-item-content"><span>${escape(choice.label)}</span><small class="menu-item-description">${escape(choice.description)}</small></span>` : escape(choice.label)}${check}</button>`;
    }).join('\n') + (currentGroup ? '</div>' : '');
    return `<div class="form-field"><span class="form-label" id="${key}-label">${escape(label)}</span>
  <button class="form-control${settings.size ? ' form-control-' + settings.size : ''} combobox-toggle" type="button" id="${key}" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="${key}-options" aria-labelledby="${key}-label ${key}-value" data-trm-toggle="combobox" data-trm-search="${search}"${settings.name === null ? '' : ` data-trm-name="${escape(settings.name ?? id)}"`} data-trm-placeholder="${escape(placeholder)}"${multiple ? ' data-trm-multiple="true"' : ''}${settings.normalize ? ' data-trm-search-normalize="true"' : ''}${settings.disabled ? ' disabled' : ''}><span class="combobox-value" id="${key}-value">${escape(placeholder)}</span>${caret}</button>
  <div class="menu" id="${key}-menu">${search ? `<div class="combobox-search"><input class="form-control combobox-search-input" type="search" aria-label="Search ${escape(label)}" placeholder="Search" autocomplete="off"></div>` : ''}<div role="listbox" id="${key}-options" aria-labelledby="${key}-label"${multiple ? ' aria-multiselectable="true"' : ''}>${items}</div><div class="combobox-no-results d-none" role="status">No matching values</div></div></div>`;
}
export const choiceCityChoices: Choice[] = [{ value: 'par', label: 'Paris' }, { value: 'lon', label: 'London' }, { value: 'lis', label: 'Lisbon' }];
export const choiceClasses: Record<ChoiceTopic, string[]> = {
    chips: ['chip-input', 'form-ghost', 'chip', 'chip-dismiss', 'active', 'disabled'],
    combobox: ['combobox-toggle', 'combobox-value', 'combobox-placeholder', 'combobox-caret', 'combobox-search', 'combobox-search-input', 'combobox-no-results', 'menu', 'menu-item', 'menu-item-content', 'menu-item-description', 'menu-item-check', 'menu-header', 'selected', 'show']
};
export const choiceAccessibility: Record<ChoiceTopic, string> = {
    chips: 'Label the native ghost input and explain chip keyboard selection. Generated dismiss buttons are named Remove and leave the tab order; authored controls retain their own labels/order. CSS active is not aria-selected, and core supplies no live announcements or submitted value array. These guides disclose explicit focus/contrast CSS and an application-owned JSON submission example.',
    combobox: 'Use a named native button, adjacent Menu, authored listbox/options, labelled search and native disabled options. Options receive real focus; no aria-activedescendant input model or remote fetching is supplied. The generated named hidden input submits one value or a comma-separated string. Combobox notifications do not await Menu completion.'
};
export const choiceEvents: Record<string, string> = {
    get 'add.trm.chips'() { return authoredChoiceEvent('chips', 'add.trm.chips') },
    get 'remove.trm.chips'() { return authoredChoiceEvent('chips', 'remove.trm.chips') },
    get 'change.trm.chips'() { return authoredChoiceEvent('chips', 'change.trm.chips') },
    get 'select.trm.chips'() { return authoredChoiceEvent('chips', 'select.trm.chips') },
    get 'show.trm.combobox'() { return authoredChoiceEvent('combobox', 'show.trm.combobox') },
    get 'shown.trm.combobox'() { return authoredChoiceEvent('combobox', 'shown.trm.combobox') },
    get 'hide.trm.combobox'() { return authoredChoiceEvent('combobox', 'hide.trm.combobox') },
    get 'hidden.trm.combobox'() { return authoredChoiceEvent('combobox', 'hidden.trm.combobox') },
    get 'change.trm.combobox'() { return authoredChoiceEvent('combobox', 'change.trm.combobox') }
};
export const choiceOptionRows: Record<ChoiceTopic, Array<{
    name: string;
    type: string;
    defaultValue: string;
    description: string;
}>> = {
    chips: [
        { name: 'separator', type: 'string | null', defaultValue: "','", description: 'Split typed/pasted text. null disables splitting; Enter still adds a value.' },
        { name: 'allowDuplicates', type: 'boolean', defaultValue: 'false', description: 'Exact case-sensitive duplicates are rejected by default.' },
        { name: 'maxChips', type: 'number | null', defaultValue: 'null', description: 'Maximum includes existing initialized chips; null is unlimited.' },
        { name: 'placeholder', type: 'string', defaultValue: "''", description: 'Placeholder only for an input the plugin creates. Author a placeholder on a supplied input.' },
        { name: 'dismissible', type: 'boolean', defaultValue: 'true', description: 'Adds missing dismiss buttons; false does not disable keyboard removal or remove authored controls.' },
        { name: 'dismissIcon', type: 'string', defaultValue: 'SVG close icon', description: 'Icon HTML is passed through the approved icon sanitizer/Trusted Types sink; never disable that boundary.' },
        { name: 'createOnBlur', type: 'boolean', defaultValue: 'true', description: 'Attempts creation on input blur, except when focus moves into a chip.' }
    ],
    combobox: [
        { name: 'boundary', type: 'string | Element', defaultValue: 'clippingParents', description: 'Forwarded to Menu/Floating UI.' },
        { name: 'multiple', type: 'boolean', defaultValue: 'false', description: 'Toggle selections and keep the Menu open; display a count above one selection.' },
        { name: 'name', type: 'string | null', defaultValue: 'null', description: 'Creates a separate hidden input before the trigger. null creates none.' },
        { name: 'offset', type: 'FloatingOffsetOption', defaultValue: '[0, 2]', description: 'Forwarded to Menu; supports the actual array/string/function type.' },
        { name: 'placeholder', type: 'string', defaultValue: "''", description: 'Text when no items are selected; blank does not erase arbitrary authored display text.' },
        { name: 'placement', type: 'string', defaultValue: 'bottom-start', description: 'Menu placement, using the source direction/positioning behavior.' },
        { name: 'search', type: 'boolean', defaultValue: 'false', description: 'Documented search flag. This pin binds a pre-authored search input whenever it exists; it does not generate one or use this flag as a listener gate.' },
        { name: 'searchNormalize', type: 'boolean', defaultValue: 'false', description: 'NFD normalization removes combining marks for accent-insensitive local text matching.' }
    ]
};
export const chipsSubmissionJavascript = `document.querySelectorAll('[data-demo-chip-form]').forEach(form => {
  const collection = form.querySelector('[data-trm-chips]')
  collection.addEventListener('change.trm.chips', event => {
    form.querySelector('input[type="hidden"]').value = JSON.stringify(event.values)
    form.querySelector('[role="status"]').textContent = 'Current values: ' + (event.values.join(', ') || 'none') + '. Hidden JSON updated.'
  })
})`;
const submittedChips = (id: string) => `<form id="${id}-form" data-demo-chip-form>${choiceChipInput(id, 'Submitted project tags')}<input type="hidden" name="project-tags" value="[&quot;Design&quot;]"><p role="status">Current values: Design. Hidden JSON is ready.</p></form>`;
export const choiceExamples: Record<ChoiceTopic, string> = { chips: choiceChipInput('tags', 'Project tags'), combobox: choiceComboboxExample('city', 'City', choiceCityChoices) };
export const choiceApiJavascript: Record<ChoiceTopic, string> = {
    chips: "import Chips from 'tremplin/chips'\n\n// Use the matching guide markup; getOrCreateInstance does not reconfigure it.\nconst chips = Chips.getOrCreateInstance('#tags')\nconst values = chips.getValues() // copied array; serialize deliberately",
    combobox: "import Combobox from 'tremplin/combobox'\n\n// Use the matching button + adjacent Menu from the guide.\nconst combo = Combobox.getOrCreateInstance('#city')\ncombo.show() // Observe shown.trm.menu for settled Menu completion."
};
export const choiceDetails: Record<ChoiceTopic, ComponentDetail> = {
    chips: authoredComponentDetail("chips", {
    variants: [
        { markup: choiceChipInput('skills', 'Skills', 'data-trm-max-chips="5"') },
        { markup: choiceChipInput('technologies', 'Technology', 'data-trm-max-chips="3"') },
        { markup: choiceChipInput('duplicate-tags', 'Repeated tags', 'data-trm-allow-duplicates="true"') },
        { markup: choiceChipInput('reviewers', 'Reviewers', '', { invalid: true }) },
        { markup: choiceChipInput('literal-tags', 'Literal tags', 'data-trm-separator="null" data-trm-create-on-blur="false" data-trm-dismissible="false"', { values: [] }) },
        { markup: choiceChipInput('themed-tags', 'Approved tags', 'style="--trm-chip-input-gap: .75rem"').replace('class="chip-input"', 'class="chip-input theme-success"') },
        { markup: choiceChipInput('custom-icon-tags', 'Custom icon tags', `data-trm-dismiss-icon="${escape(dismissIcon)}"`, { values: [] }) },
        { markup: choiceChipInput('disabled-tags', 'Unavailable tags', '', { values: [], inputAttrs: 'disabled' }) },
        { markup: submittedChips('submitted-tags') },
        { markup: dark(choiceChipInput('rtl-tags', 'Tags')) }
    ], variables: documentedTokens('chips'),
    sass: "@use 'tremplin/scss/chip' with ($chip-tokens: (--trm-chip-height: 2rem));\n@use 'tremplin/scss/forms/chip-input' with ($chip-input-tokens: (--trm-chip-input-gap: .5rem));"
}),
    combobox: authoredComponentDetail("combobox", {
    variants: [
        { markup: choiceComboboxExample('guide-city', 'City', choiceCityChoices) },
        { markup: choiceComboboxExample('guide-offices', 'Offices', choiceCityChoices, true) },
        { markup: choiceComboboxExample('guide-plan', 'Plan', [{ value: 'starter', label: 'Starter' }, { value: 'enterprise', label: 'Enterprise - contact sales', disabled: true }]) },
        { markup: choiceComboboxExample('guide-country', 'Destination', choiceCityChoices) },
        { markup: choiceComboboxExample('selected-city', 'Preselected city', choiceCityChoices.map(c => ({ ...c, selected: c.value === 'lon' })), false, { search: false }) },
        { markup: choiceComboboxExample('normalized-city', 'Accent city', [{ value: 'sao', label: 'São Paulo' }, { value: 'mun', label: 'München' }, { value: 'par', label: 'Paris' }], false, { normalize: true }) },
        { markup: choiceComboboxExample('grouped-plan', 'Grouped plan', [{ value: 'basic', label: 'Basic', description: 'For small teams', group: 'Personal' }, { value: 'pro', label: 'Professional', description: 'For growing teams', group: 'Business' }, { value: 'enterprise', label: 'Enterprise', description: 'Managed access', group: 'Business' }]) },
        { markup: choiceComboboxExample('small-city', 'Small city', choiceCityChoices, false, { size: 'sm', search: false }) + choiceComboboxExample('large-city', 'Large city', choiceCityChoices, false, { size: 'lg', search: false }) },
        { markup: choiceComboboxExample('disabled-city', 'Unavailable city', choiceCityChoices, false, { disabled: true }) },
        { markup: dark(choiceComboboxExample('guide-rtl-project', 'Project', [{ value: 'web', label: 'Website redesign' }, { value: 'mobile', label: 'Mobile application' }])) }
    ], variables: documentedTokens('combobox'),
    sass: "@use 'tremplin/scss/forms/combobox';\n@use 'tremplin/scss/menu' with ($menu-tokens: (--trm-menu-padding-x: .5rem));"
})
};

function authoredChoiceEvent(name: ChoiceTopic, event: string): string {
    const description = componentNarrative(name).events?.[event];
    if (!description) throw new Error('Missing authored lifecycle description: ' + event);
    return description;
}
