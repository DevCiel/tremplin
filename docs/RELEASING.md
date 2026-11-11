# Tremplin release process

This checklist is the release gate for public beta packages. Run it from a clean checkout with the supported Node.js version.

## Prepare

1. Add a Changeset for every user-visible package change.
2. Confirm the package version is represented in `CHANGELOG.md` and `metadata/components.json`.
3. Update migration guidance for removed, renamed, or behavior-changing public APIs.
4. Review both generated API compatibility reports and the registry described in `API_STABILITY.md`. Intentional breaking changes require maintainer approval, their scheduled removal release, and a migration note.

## Validate

```bash
npm install
npx playwright install --with-deps chromium firefox webkit
npm run check
npm run check:release
```

Quality checks must pass TypeScript, unit tests, production build, the strict API contract and no-legacy gate, installed-tarball, three-browser accessibility and behavior, visual regression, documentation build, and documentation-site tests. The separate release check validates release metadata and remains deliberately blocked during the clone-first migration. The release command and prepublish hook both enforce it; passing quality checks alone never authorizes publication.

Perform the manual assistive-technology matrix in `docs/ACCESSIBILITY_TESTING.md` for release candidates and stable releases. Verify keyboard-only use, reduced motion, forced colors, zoom, LTR, and RTL for changed interactive components.

## Inspect the package

```bash
npm pack --dry-run
```

Confirm the core archive contains compiled CSS and browser JavaScript, canonical
`js/dist/` modules and declarations, core Sass/TypeScript sources, the two public
API metadata files, complete license notices, and the changelog. Verify every
published package export and required peer from an installed tarball.

Only `metadata/api.json` and `metadata/public-api.json` belong in the consumer
archive; maintenance/audit policies stay in the repository. Standalone icon sets,
themes, starters, adapters, optional extensions and private documentation assets
are excluded from the core package. The required same-origin calendar SVG at
`dist/icons/datepicker-chevron.svg` is a functional core dependency, not the
standalone icon product. Preserve `LICENSE` and `THIRD_PARTY_NOTICES.txt`, including
their distribution copies, with redistributed assets.

The archive must not contain credentials, local configuration, screenshots, test
output, internal build graphs, obsolete compatibility Sass files or retired
CommonJS/facade outputs. The current inventories and branding follow-up are
documented in [Source structure](SOURCE_STRUCTURE.md).

## Publish

Release and documentation-deployment workflows are manual-only. Pushing to
`main`, merging a version pull request, or committing `dist/` does not publish
or deploy anything. The strict-core publication block must remain until the
acceptance gates pass and maintainers explicitly approve a release.

After that approval, follow the Changesets version process and manually run the
Release workflow from the approved commit with npm provenance enabled. The
workflow still enforces package release checks. Documentation deployment is a
separate manual workflow. Do not use a floating package version, disable
provenance, or remove release checks to bypass an unfinished gate.

After publication, install the exact version in a new project, verify the CDN integrity entry, open the documentation examples, and create a GitHub release using the matching changelog section.

## Local audit checkpoint — 2026-11-11

This checkpoint verifies the current working tree after the authored-documentation
migration. It is not a clean-checkout CI result or release approval. Publication
remains blocked by `tremplinMigration.releaseBlocked`; `npm run check:release`
was run and correctly rejected publication. That guard was not changed.

Verified locally with Node.js 24.21.0:

- Core type-check, complete production build, strict API/source contracts,
  production CSS parity, output inventory, no-legacy and size checks passed.
- The complete unit invocation passed 1,407 tests in 118 files using two workers.
  The three new Customize overview regression cases passed separately, retaining
  default assertion timeouts. Independent reference fixtures passed 50 tests;
  server/tooling checks passed 32 tests. Test type-boundary checks passed.
- The generated-site crawl passed 197 checks: route inventory and all 196 pages
  in Chromium, including the script-disabled Playground preview audit. HTML
  validation passed all 197 HTML files. After the overview repair, twelve
  Customize page audits passed again.
- Core browser behavior/accessibility passed 434 cases across Chromium, Firefox
  and WebKit, with four existing platform-specific skips unchanged. All 141
  screenshot checks passed: two core gallery and 139 documentation comparisons.
  No screenshot baseline, tolerance, rule or existing timeout was relaxed.
- The installed tarball passed consumer compilation, declarations with
  `skipLibCheck: false`, all twenty core plugin identities, public imports,
  optional-product exclusion and integrity/notice checks. It contained 316 files.
  The read-only release inventory check found all 21 required assets and thirteen
  required integrity entries. This inventory result does not override the block.
- The dependency audit reported zero known advisories at this checkpoint; this
  is not a guarantee that the dependency tree is vulnerability-free.
- Search, responsive navigation/outline and current-version navigation passed
  three targeted workflow checks. The repaired overview passed three browser
  cases covering copy, links, themes, directions and desktop/mobile geometry.

The audit found one documentation defect: `/customize/` advertised retired Sass
options and root helper aliases. It now shares the maintained `customize/sass#2`
recipe and accurately describes explicit module imports. Compilation and browser
regressions cover the actual copied source. Framework code and distribution bytes
were not changed. The scope report protects 382 inputs and all 141 baselines;
the only changed generated page is `/customize/`.

Documentation interaction follow-up completed locally on 2026-11-11:

- The complete default `npm run test:site` invocation finished successfully.
  `test-results/site/.last-run.json` records `passed` with no failed tests.
  This is the full documentation interaction suite, not only the page crawl.
- The initial server startup was blocked by an occupied port before tests ran;
  the normal invocation was restarted after the port became free. No process
  was killed and no server configuration or test setting was relaxed.
- The follow-up scope report confirms all 382 protected inputs, 141 screenshot
  baselines and 196 generated page bodies are unchanged. No implementation fix
  was needed. The publication block remains enabled.

Still required before a release can be considered:

1. Validate the final candidate from a clean checkout in CI. This local working
   tree contains existing uncommitted work and was not committed or pushed.
2. Record the manual assistive-technology/device matrix and review the prerelease
   contract. Automated checks do not replace these approvals.
3. Explicit maintainer approval is required before changing the publication block
   or invoking publishing/deployment workflows. Neither was authorized here.

AI delivery follow-up and the separately deferred notices/reference review remain
separate work. Required attribution and all release safety gates stay intact.

## Fresh-install rehearsal — 2026-11-11

An isolated local candidate was prepared from 1,520 present tracked and
non-ignored untracked files, including current uncommitted changes and the
tracked distribution. Deleted files, dependencies, reference caches, generated
site output and test results were not copied. This is a working-tree snapshot,
not a Git checkout of an approved commit and not a remote CI result.

The following passed in that snapshot with fresh lockfile-installed dependencies
and a freshly fetched, verified and staged pinned reference:

- `npm ci` and `npm run audit:tremplin -- --fetch --stage --check`.
- `npm run typecheck`, `npm run build`, `npm run test:typecheck-boundaries`
  and `npm run check:production-css`.
- `npm run site:build` and `npm run validate:html`: 197 HTML files, zero errors;
  search indexed 196 pages and distribution mirrors passed verification.
- `npm run test:package`: the built tarball installed and passed consumer checks.
- `npm run test:server`: 32 tests passed.
- Toolchain and Customize overview regression tests: seven tests passed in two
  files using `npx vitest run tests/toolchain.test.ts
  tests/customize-overview.test.ts --maxWorkers=2`.

The isolated rebuild reproduced all 29 `dist/` files and 140 `js/dist/` files
byte-for-byte. Before recording this checkpoint, all 1,520 original snapshot
inputs were unchanged. Evidence is retained locally under
`artifacts/clean-candidate-20261111-manifest.json` and
`artifacts/clean-candidate-20261111-identities.json`; the candidate itself is
under `artifacts/clean-candidate-20261111/` and is not staged for upload.

The full unit/browser/visual/site suites were not repeated in this snapshot;
their earlier local results remain separate evidence. npm reported two install
script approval warnings (`@parcel/watcher` and `esbuild`); no approval policy was
changed, and the build and consumer checks above still passed. This rehearsal
does not replace the complete clean-checkout CI gate. Testing the final candidate
in GitHub requires an explicitly approved commit/push, which was not performed.
Manual assistive-technology/device sign-off and release approval remain pending.

## Repository installation command update — 2026-11-11

At the maintainer's request, current repository setup commands now use
`npm install` across the homepage, authored guides, executable samples, README,
contributor instructions and all three workflows. The workflows immediately
reject changes to `package.json` or `package-lock.json` before further steps.
Unlike the previous clean-install command, this does not itself clear an existing
dependency directory; use a fresh checkout for final CI validation.

Consumer tarball instructions and the unpublished-package warning remain intact.
Historical fixtures and earlier audit records are unchanged. Four active-source
hashes in the two MDX inventories were updated for the reviewed command edits;
tests explicitly account for the changed samples without rewriting old fixtures.

Local checks passed: 47 affected unit cases, strict type boundaries, site build,
197-file HTML validation, 17 entry/installation browser cases and six existing
visual comparisons. No screenshot baseline or tolerance was changed. All 197
generated HTML pages were checked for the retired command and none contained it.
Core source, distribution, package manifests and publication guards are unchanged.
This update was not committed, pushed or deployed.

## Homepage and Install presentation update — 2026-11-11

Reviewed the homepage and Install references at https://getbootstrap.com/ and
https://getbootstrap.com/docs/6.0/getting-started/install/. Applied their visual
direction locally: a full-width pastel hero, compact headline and action row,
Install spacing, light code panels with header copy controls, and a compact
information callout. Tremplin branding, accurate unpublished-package instructions,
existing font families and functional documentation links remain intact.

Local validation passed: 47 affected unit cases, strict type boundaries, site
build, 197-file HTML validation, 24 browser cases and six visual comparisons.
Only the homepage and Install light/dark/RTL screenshot baselines were refreshed
for this requested redesign; comparison tolerances were unchanged. Desktop,
mobile, dark and RTL presentations were reviewed, including a mobile badge
clipping regression. Core source, distribution, package manifests and release
guards remain unchanged. This update was not committed, pushed or deployed.
