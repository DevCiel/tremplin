# Adopting the strict Bootstrap 6-derived core

This checkout is an unreleased, intentionally breaking migration from the
retired Tremplin hybrid. There is no old-version runtime, archived documentation
site, or compatibility bundle. Do not infer compatibility from the unchanged
development package version.

## Use current contracts

- Start with [the installation quick start](../README.md#quick-start) and a
  locally built package; a public registry/CDN release is not assumed.
- Use [the component API](../metadata/api.json) and
  [public CSS/Sass contract](../metadata/public-api.json), not retired aliases.
- Load browser JavaScript with `type="module"`. The self-contained bundle and
  standard peer-dependent builds are different delivery choices, not a global
  dispatcher and its module wrapper.
- Use theme-driven buttons such as `btn-solid theme-primary` and the documented
  responsive prefixes, for example `md:col-6`.
- Use Menu instead of the retired Dropdown interface. Scrollspy remains a
  JavaScript plugin without a dedicated root Sass partial.
- Read actual component options before migrating: Collapse currently exposes
  `parent`, not the old constructor `toggle` setting. Datepicker uses
  `firstWeekday` and the documented calendar options, not the retired labels API.
- Optional extensions, React/Vue adapters and local CSS patterns stay separate
  from the default core. Do not assume an old root export still exists.

## Repository layout and validation

JavaScript stays in `src/js/`, Sass in `src/scss/`, and repository tooling lives
in `build/`. The root `dist/` output is tracked and must be rebuilt rather than
edited by hand. Package subpaths are defined in `package.json`.

The approved reference remains the fixed commit recorded in
[bootstrap6-reference.json](../metadata/bootstrap6-reference.json). Later upstream
changes must be reviewed against the security/accessibility patch registry and
strict API baseline before updating that pin. Current source verification does
not establish parity with a later moving main branch.

Run the checks in [CONTRIBUTING.md](../CONTRIBUTING.md), test your application's
keyboard/RTL/accessible-name behavior, and follow the
[manual accessibility matrix](ACCESSIBILITY_TESTING.md). The
[release process](RELEASING.md) remains separately gated. Changelog history and
regression fixtures are retained evidence, not supported old implementations.
