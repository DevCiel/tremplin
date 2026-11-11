# Localization and bidirectionality

Use the current component guide and source types for locale and direction
behavior; the former custom Datepicker labels API is not part of the strict core.

```ts
import { Datepicker } from 'tremplin'

new Datepicker('#departure', {
  locale: 'fr-FR',
  firstWeekday: 1
})
```

The Datepicker options are defined by
[the current source](../src/js/datepicker.ts) and [API metadata](../metadata/api.json).
Additional calendar options pass through `vcpOptions` and must match the installed
Vanilla Calendar Pro version. Do not use the retired `firstDayOfWeek` or
`DatepickerOptions.labels` examples.

Set `dir="rtl"` on the document or an appropriate region. Test each interactive
component with its actual nearest direction, keyboard model and accessible
labels; logical CSS alone does not certify keyboard or screen-reader behavior.

Applications own translations for their content, validation and accessible
names. See [the RTL guide source](../site/src/content/docs/getting-started/rtl.mdx) and
[manual accessibility matrix](ACCESSIBILITY_TESTING.md).
