import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'

const root = process.cwd()
const files = (directory: string) => readdirSync(join(root, directory), { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .sort()

describe('Bootstrap 6-level source structure', () => {
  test('matches the Bootstrap 6 core JavaScript manifest', () => {
    expect(files('src/js')).toEqual([
      'alert.ts', 'base-component.ts', 'button.ts', 'carousel.ts', 'chips.ts', 'collapse.ts',
      'combobox.ts', 'datepicker.ts', 'dialog-base.ts', 'dialog.ts', 'drawer.ts', 'index.ts',
      'menu.ts', 'nav-overflow.ts', 'otp-input.ts', 'popover.ts', 'range.ts', 'scrollspy.ts',
      'strength.ts', 'tab.ts', 'toast.ts', 'toggler.ts', 'tooltip.ts'
    ].sort())
    expect(files('src/js/extensions')).toEqual(['command-palette.ts', 'floating.ts'])
  })

  test('keeps component Sass in focused public partials', () => {
    for (const name of ['accordion', 'alert', 'avatar', 'badge', 'banner', 'card', 'carousel', 'chip', 'datepicker', 'dialog', 'drawer', 'menu', 'nav-overflow', 'navbar', 'placeholder', 'popover', 'spinner', 'stepper', 'toasts', 'tooltip', 'transitions']) {
      expect(existsSync(join(root, `src/scss/_${name}.scss`)), name).toBe(true)
    }
  })

  test('provides Bootstrap 6-style cascade-layer directories', () => {
    for (const path of [
      'src/scss/buttons/index.scss',
      'src/scss/buttons/_button.scss',
      'src/scss/buttons/_button-group.scss',
      'src/scss/buttons/_close.scss',
      'src/scss/content/index.scss',
      'src/scss/content/_blockquote.scss',
      'src/scss/content/_images.scss',
      'src/scss/content/_lists.scss',
      'src/scss/content/_prose.scss',
      'src/scss/content/_reboot.scss',
      'src/scss/content/_tables.scss',
      'src/scss/forms/index.scss',
      'src/scss/forms/_check.scss',
      'src/scss/forms/_chip-input.scss',
      'src/scss/forms/_form-adorn.scss',
      'src/scss/forms/_form-control.scss',
      'src/scss/forms/_floating-labels.scss',
      'src/scss/forms/_input-group.scss',
      'src/scss/forms/_otp-input.scss',
      'src/scss/forms/_strength.scss',
      'src/scss/helpers/index.scss',
      'src/scss/helpers/_visually-hidden.scss',
      'src/scss/helpers/_hover-lift.scss',
      'src/scss/layout/index.scss',
      'src/scss/layout/_breakpoints.scss',
      'src/scss/layout/_containers.scss',
      'src/scss/layout/_grid.scss',
      'src/scss/mixins/index.scss',
      'src/scss/mixins/_focus-ring.scss',
      'src/scss/utilities/_api.scss'
    ]) expect(existsSync(join(root, path)), path).toBe(true)
  })

  test('exposes the Bootstrap 6 configuration modules', () => {
    for (const name of ['colors', 'config', 'functions', 'root', 'theme', 'utilities']) {
      expect(existsSync(join(root, `src/scss/_${name}.scss`)), name).toBe(true)
    }
  })

  test('matches the Bootstrap 6 core Sass manifest exactly', () => {
    expect(files('src/scss')).toEqual([
      '_accordion.scss', '_alert.scss', '_avatar.scss', '_badge.scss', '_banner.scss', '_breadcrumb.scss',
      '_card.scss', '_carousel.scss', '_chip.scss', '_colors.scss', '_config.scss', '_datepicker.scss',
      '_dialog.scss', '_drawer.scss', '_functions.scss', '_list-group.scss', '_menu.scss', '_nav-overflow.scss',
      '_nav.scss', '_navbar.scss', '_pagination.scss', '_placeholder.scss', '_popover.scss', '_progress.scss',
      '_root.scss', '_spinner.scss', '_stepper.scss', '_theme.scss', '_toasts.scss', '_tooltip.scss',
      '_transitions.scss', '_utilities.scss', 'tremplin-grid.scss', 'tremplin-reboot.scss',
      'tremplin-utilities.scss', 'tremplin.scss'
    ].sort())

    const manifests: Record<string, string[]> = {
      buttons: ['_button-group.scss', '_button.scss', '_close.scss', 'index.scss'],
      content: ['_blockquote.scss', '_images.scss', '_lists.scss', '_prose.scss', '_reboot.scss', '_tables.scss', 'index.scss'],
      forms: ['_check.scss', '_chip-input.scss', '_combobox.scss', '_floating-labels.scss', '_form-adorn.scss', '_form-control.scss', '_form-field.scss', '_form-range.scss', '_form-text.scss', '_input-group.scss', '_labels.scss', '_otp-input.scss', '_radio.scss', '_strength.scss', '_switch.scss', '_validation.scss', 'index.scss'],
      helpers: ['_focus-ring.scss', '_hover-lift.scss', '_icon-link.scss', '_position.scss', '_stacks.scss', '_stretched-link.scss', '_text-truncation.scss', '_theme-colors.scss', '_visually-hidden.scss', '_vr.scss', 'index.scss'],
      layout: ['_breakpoints.scss', '_containers.scss', '_grid.scss', 'index.scss'],
      mixins: ['_backdrop.scss', '_border-radius.scss', '_box-shadow.scss', '_color-mode.scss', '_color-scheme.scss', '_deprecate.scss', '_dialog-shared.scss', '_focus-ring.scss', '_form-validation.scss', '_gradients.scss', '_grid.scss', '_image.scss', '_lists.scss', '_mask-icon.scss', '_reset-text.scss', '_resize.scss', '_text-truncate.scss', '_tokens.scss', '_transition.scss', '_utilities.scss', '_visually-hidden.scss', 'index.scss'],
      utilities: ['_api.scss']
    }
    for (const [directory, expected] of Object.entries(manifests)) {
      expect(files(`src/scss/${directory}`), directory).toEqual(expected.sort())
    }
  })

  test('isolates Tremplin-only Sass in the extensions layer', () => {
    expect(files('src/scss/extensions')).toEqual([
      '_code.scss', '_command-palette.scss', '_data-table.scss', '_divider.scss', '_empty-state.scss',
      '_error-summary.scss', '_loading-overlay.scss', '_print.scss', '_ratio.scss',
      '_status.scss', '_timeline.scss', 'index.scss'
    ].sort())
    // Optional presentation remains; the hybrid palette shim is retired.
    expect(existsSync(join(root, 'src/scss/extensions/_palette.scss'))).toBe(false)
    expect(existsSync(join(root, 'src/scss/_palette.scss'))).toBe(false)
    expect(existsSync(join(root, 'src/scss/_maps.scss'))).toBe(false)
    expect(existsSync(join(root, 'src/scss/_variables.scss'))).toBe(false)
  })

  test('aggregates layer modules without changing public class names', () => {
    const entry = readFileSync(join(root, 'src/scss/tremplin.scss'), 'utf8')
    const forms = readFileSync(join(root, 'src/scss/forms/index.scss'), 'utf8')
    expect(entry).toContain('@forward "content"')
    expect(entry).toContain('@forward "layout"')
    expect(entry).toContain('@forward "buttons"')
    expect(entry).toContain('@forward "dialog"')
    expect(entry).not.toMatch(/@(use|forward) ["']extensions/)
    expect(forms).toContain('@forward "form-control"')
    expect(`${entry}\n${forms}`).not.toMatch(/\.trm-/)
  })
})
