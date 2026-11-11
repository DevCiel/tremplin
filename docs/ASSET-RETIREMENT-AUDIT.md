# Follow-up legacy asset audit

This audit implements the request to remove unrelated legacy CSS, Sass and JavaScript before the next feature-migration batch. It is broader than the earlier bounded `compat/legacy` removal.

## Removed

- The unused `src/runtime/hybrid.ts` owner and three obsolete `tsup*.config.ts` entry configurations. The supported build is `build/build-strict-js.mjs`; the `tsup` dependency remains necessary for independent reference validation.
- The obsolete moving-main Sass audit script, superseded by the hash-verified fixed-pin core/source/CSS checks.
- The private extension palette shim that detected hybrid `$colors` configuration. Status and Timeline now derive defaults from the current semantic palette; their own configurable color maps remain supported.
- The old `docs/index.html` landing page and its inline legacy styling/scripts. The runtime performance test now has a minimal current fixture, and the repository test server no longer depends on that retired page. Astro remains the documentation website.
- Two unsupported standalone ESM copies at `/js/tremplin.js`, which had relative imports without their sibling chunks.
- **304 orphaned files in each of the two copied distribution trees: 608 obsolete copied files in total**, including hybrid chunks, maps and old declarations. The generated integration cache was recreated from current sources, and an old transient Playwright trace cache containing copied CSS was removed.

The exact inventory and recovery archive are recorded in `artifacts/asset-retirement-report.json`. Original source and generated copies were preserved outside the project before removal.

Archive inspection additionally found six old browser trace ZIPs containing legacy CSS snapshots. They were moved outside the project with SHA-256 hashes preserved, not destroyed. Their recovery locations are included in the report. Screenshots and non-executable failure descriptions remain available as historical evidence.

## Retained and corrected

All 136 pinned Bootstrap-derived modules and approved SEC-001/A11Y-001 exceptions remain unchanged. Bootstrap's own compatibility behavior, including Tooltip original-title support and breakpoint-loop aliases, is part of the pin and is not obsolete Tremplin code.

Required third-party dependencies, their assets and hash-verified reference snapshots remain. Current optional extensions, adapters, icons and Ocean/Forest presets also remain. Preset CSS, theme examples, generated token documentation and optional styles now use current semantic variables instead of hybrid fallback globals. The private `_palette.scss` implementation is removed rather than kept as a compatibility shim.

The four shipped HTML/Vite/React/Vue starters retain their existing behavior and now use current button/foreground classes rather than retired aliases. Starter markup classes are checked against the actual compiled core inventory. Homepage accessibility coverage was relocated from the deleted standalone HTML to the real Astro homepage; server and performance coverage remain active.

Useful root example/test fixtures and older documentation recipe strings are still inputs to the already-recorded migration backlog. They do not provide an alternate CSS/JS framework. Historical non-executable audit reports and screenshots are retained; searching for the word “legacy” alone is not grounds to delete upstream behavior or regression coverage.

## Explicit contract record

`metadata/retired-css-contract.json` records the exact retirement of **15 obsolete or unresolved global CSS names** formerly referenced by optional fallback branches. No JavaScript/component API, package export, core selector, Sass entrypoint/function/mixin or maintained core implementation changes in this audit.

The source-only CSS-property inventory had also missed dynamically generated core properties. It now includes compiled declarations. All newly catalogued names are proven already declared by the unchanged core stylesheet; they are not new runtime features. In particular, `--trm-secondary-base` and `--trm-secondary-contrast` are legitimate current roles and are retained. The controlled baseline change and pre-change backup hashes are recorded explicitly, not auto-refreshed after a test failure.

## Prevention and safety

Site asset preparation now mirrors the current distribution and theme asset trees, pruning obsolete files and empty directories only inside named generated destinations. It rejects symlinks and unknown destinations. The built `/themes/index.html` page is owned by Astro, not the theme-copy operation; the current HTML route is explicitly protected. Tests cover idempotence, orphan maps/chunks, path boundaries, linked inputs/parents and route ownership.

`check:no-legacy` now detects retired hybrid runtime signatures, obsolete build files and removed fallback variables in maintained source and generated outputs. `check:site-assets` additionally requires current filenames and byte-for-byte equality for copied assets. The integration builder validates and clears only its exact pin-specific cache before rebuilding, so removed optional sources cannot accumulate there.

No website was published, no snapshots were accepted, no version changed and no release block was removed. Existing full-suite and broader type/visual/manual acceptance work remains separate.
