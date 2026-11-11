# Assistive-technology validation

Automated axe testing runs in Chromium, Firefox, and WebKit. It covers documentation, examples, closed and open overlays, keyboard workflows, forced colors, and responsive disclosure patterns.

Before v1.0, maintainers must record manual results for:

| Platform | Screen reader | Required workflows | Status |
|---|---|---|---|
| Windows | NVDA with Firefox and Chrome | Navigation, forms, dialog, drawer, combobox, datepicker | Pending manual sign-off |
| macOS and iOS | VoiceOver with Safari | Navigation, rotor, forms, overlays, swipe gestures | Pending manual sign-off |
| Android | TalkBack with Chrome | Navigation, forms, drawer, bottom sheet, combobox | Pending manual sign-off |

Each record must include versions, input method, component markup, expected announcement, observed announcement, severity, and a linked issue when behavior differs.

## Manual sign-off procedure

Automated browser, Axe and screenshot results are supporting evidence, not a
screen-reader sign-off. Do not infer spoken output from ARIA attributes or mark
a platform passed without using the named assistive technology on that platform.

1. Record the exact framework version, source revision, operating system,
   browser and screen-reader versions. Identify the tested page, markup and
   component configuration, including any explicit demo accessibility CSS.
2. Use keyboard-only navigation before pointer or touch input. Check visible
   focus, reachable controls, labels/help/error associations, overlay entry and
   return focus, dismissal, and keyboard access to real scroll containers.
3. Run the platform's screen-reader workflows from the matrix above. Record
   actual announcements and reading order, including changed state, validation
   feedback, navigation menus and date selection. Compare them with the
   documented behavior, not an assumed capability from another framework.
4. Repeat relevant workflows in light/dark mode and LTR/RTL, with reduced
   motion, and at real browser zoom of 200% and 400%. A narrow automated viewport
   is useful reflow evidence but is not proof of real browser-zoom behavior.
   Check Windows forced colors using the actual platform setting as well.
5. File reproducible failures with severity and an issue reference. Mark
   untested workflows **Not run**; keep the platform's sign-off pending until
   its required workflows have an observed result and maintainer review.

### Result record

Copy this record into the maintainer's review evidence for each workflow:

```text
Reviewer and test date/time/timezone:
Framework version and source revision:
Operating system and version:
Browser and version:
Screen reader and version:
Input method (keyboard/touch/other):
Page, component, markup and configuration:
Theme, direction, motion, zoom and forced-colors settings:
Steps to reproduce:
Expected behavior / announcement:
Observed behavior / announcement (record actual spoken output):
Result (Pass / Fail / Not run):
Severity and linked issue, if applicable:
Supporting automated evidence:
Maintainer review and remaining limitations:
```

Keep the matrix's pending statuses until real results are recorded. Completing
this template or passing automated checks does not lift the publication block.
