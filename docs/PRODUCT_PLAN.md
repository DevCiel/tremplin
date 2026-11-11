# Tremplin product plan

Tremplin is Devciel's unreleased Bootstrap 6-derived frontend framework. The
current objective is clone-first and legacy-free: preserve the pinned upstream
core under Tremplin's identity, with only the explicitly approved security and
accessibility exceptions. It is not a second hybrid implementation.

## Current architecture

- `src/js/`: the pinned TypeScript core, DOM helpers and utilities.
- `src/scss/`: the pinned Sass core, with optional extensions isolated.
- `build/`: build, source-audit, package and verification tools.
- `dist/`: tracked CSS, ESM/CJS, declarations, maps, assets and notices.
- `site/`: Astro documentation and Pagefind search.
- `metadata/`: the pinned reference, strict API contract and approved patches.

Public CSS classes are unprefixed. Framework properties, data hooks and events
retain Tremplin's namespace. The core pin is recorded in
[bootstrap6-reference.json](../metadata/bootstrap6-reference.json), not a moving
branch. The complete inventory and acceptance gates are in the
[Bootstrap 6 migration plan](BOOTSTRAP6-MIGRATION-PLAN.md).

## Remaining acceptance work

1. Confirm the full GitHub CI pipeline on the current commit.
2. Review and qualify later upstream changes before changing the approved pin.
3. Complete the installed-package consumer-toolchain matrix and starter checks.
4. Obtain the [manual accessibility sign-off](ACCESSIBILITY_TESTING.md).
5. Review release metadata and the prerelease contract before authorizing any
   publication or documentation deployment.

Old milestone schedules and version-specific compatibility promises are retired.
Current quality checks do not grant release approval. See
[feature status](FEATURES.md), the [strict API policy](API_STABILITY.md), and the
[release process](RELEASING.md).
