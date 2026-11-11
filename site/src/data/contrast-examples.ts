// Explicit, opt-in application CSS for these documentation demos. This is not
// a core default, a compatibility alias, or a change to the pinned source.
export const contrastComponentNames = new Set(['alert', 'avatar', 'badge', 'button', 'chip', 'chips', 'datepicker', 'drawer', 'list-group', 'pagination', 'progress', 'table'])
export const contrastGuideSlugs = new Set(['helpers/stretched-link', 'utilities/background', 'utilities/theme', 'forms/datepicker', 'forms/chips'])
export const demoContrastCss = `.demo-contrast {
  --trm-primary-bg: var(--trm-blue-700);
  --trm-success-bg: var(--trm-green-700);
  --trm-danger-bg: var(--trm-red-700);
  --trm-primary-fg: var(--trm-primary-fg-emphasis);
  --trm-success-fg: var(--trm-success-fg-emphasis);
  --trm-danger-fg: var(--trm-danger-fg-emphasis);
  --trm-info-fg: var(--trm-info-fg-emphasis);
  --trm-warning-fg: var(--trm-warning-fg-emphasis);
  --trm-link-color: var(--trm-primary-fg-emphasis);
  --trm-link-hover-color: var(--trm-primary-fg-emphasis);
}
.demo-contrast [data-trm-theme][dir] {
  color: var(--trm-fg-body);
  background-color: var(--trm-bg-body);
}
/* Calendar Pro appends input popups to body, outside the wrapper. Its styles
   option carries this explicit class to both popup and inline calendars. */
.demo-calendar-contrast[data-vc="calendar"] {
  --trm-datepicker-day-selected-bg: var(--trm-blue-700);
  --trm-datepicker-day-disabled-color: var(--trm-fg-2);
}
.demo-calendar-contrast [data-vc-date-month="prev"] [data-vc-date-btn],
.demo-calendar-contrast [data-vc-date-month="next"] [data-vc-date-btn] {
  opacity: .8;
}`

export function contrastExample(markup: string): string {
  const calendarOptions = `data-trm-vcp-options='{"styles":{"calendar":"vc demo-calendar-contrast"}}'`
  const aliases: Record<string, string> = {
    'btn-primary': 'btn-solid theme-primary', 'btn-outline-primary': 'btn-outline theme-primary',
    ...Object.fromEntries(['primary', 'success', 'danger', 'warning', 'info'].map(color => [`alert-${color}`, `theme-${color}`]))
  }
  const example = markup
    .replace(/class="([^"]*)"/g, (_match, classes: string) => {
      const badge = classes.split(/\s+/).includes('badge')
      return `class="${classes.split(/\s+/).map(name => aliases[name] ?? (badge && /^(?:text-)?bg-(primary|success|danger)$/.test(name) ? name.replace(/^(?:text-)?bg-/, 'theme-') : name)).join(' ')}"`
    })
    .replaceAll('data-trm-toggle="datepicker"', `data-trm-toggle="datepicker" ${calendarOptions}`)
  return `<div class="demo-contrast">\n${example}\n</div>`
}
