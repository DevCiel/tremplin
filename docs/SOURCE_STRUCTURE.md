# Source and distribution structure

## Documentation website restructuring

Website configuration now lives in `site/astro.config.ts`; the root config
delegates to it so existing startup commands remain usable. The shell is split
into functional components, documentation CSS is compiled from modular Sass,
authored fonts/SVGs live in `site/static/`, and four overviews plus all 116 guides use
a validated MDX collection: Getting started (11), Guides (7), Customize (11),
Layout (8), Content (5), Forms (17), Helpers (9), and Utilities (48).
Those bodies are authored under `site/src/content/docs/`, not duplicated in
TypeScript. Version-dependent commands and executable examples remain in typed
example modules. The structured-guide collection and `GuideContent.astro`
fallback renderer are removed; the catch-all route renders authored MDX only.
All 47 component detail routes now use authored MDX, including native/CSS
compositions, existing aliases and optional extensions. The specific component
route rejects a missing document and no longer contains a duplicate structured
body renderer.
Their prose is owned by MDX; shared executable examples and evaluated token/Sass
data remain live. All twenty core JavaScript plugin topics share generated
definitions, methods, event inventories and data attributes through shared
rendering components, with lifecycle descriptions authored in MDX. Source-
verified option tables and specialized examples remain live in typed modules. Accordion
keeps native details/summary behavior with no plugin API. Breadcrumb, List group
and Pagination preserve native navigation/input behavior; the application owns
result state. Button group,
Close button and Nav retain their native controls and disclosed Menu/Alert
integrations. Menu retains its Floating UI dependency; Tab's internal listener
names remain distinct from its dispatched lifecycle events. Toast keeps its
explicit application setup and shares one authored body with Toasts; Scrollspy
retains its actual scrolling/focus behavior and scanner caveats. Bottom Sheet
keeps its own examples/focus handler while sharing Drawer API data and event
descriptions. Tooltip and Popover retain distinct trigger policies, sanitization
and native-dialog top-layer handling. Navbar remains CSS-only with container-query
expansion and an explicit application Drawer focus handler. Nav Overflow keeps
its runtime event-name correction and Toggler keeps source-verified target
options without changing the generated API catalog. Carousel retains scroll-snap
controls, keyboard direction and a user-controlled autoplay example. Stepper
remains CSS-only ordered-list progress, not an automatic wizard controller.
Chips retains its explicit application submission handler; Combobox retains
Menu completion timing and both share existing source-verified option rows.
Datepicker, OTP Input, Range and Strength retain native field values, source-
verified options, event/listener distinctions and explicit application setup.
Calendar sanitization/CSP boundaries and existing calendar assets are unchanged.
Chip, Table and Forms retain native/CSS behavior and explicit application
handlers. Optional patterns remain separate from the core distribution, and
Command Palette retains its own extension API adapter. No component routes
remain on the structured renderer, and all 116 guides are migrated. Helpers
keeps its raw and published samples in `helpers-examples.ts`, including the
explicit stretched-link contrast wrapper/CSS. Its original module script is
emitted by `GuideScripts.astro` before pagination, unchanged.
Utilities retains raw/published samples and both contrast scripts in
`utilities-examples.ts`; all prose, option tables and topic metadata belong to
MDX. The Utilities overview now uses canonical prefixes and current options.

The 196 existing routes are preserved; a non-indexed custom 404 and a robots
endpoint are added. `npm run site:dev` prepares assets and starts the local site.
See [the website structure and remaining work](SITE_ARCHITECTURE.md). This batch
does not change framework modules, core downloads, notices, attribution files,
publication flags, or screenshot baselines. Earlier acceptance notes below are
historical checkpoints, not a claim of complete upstream website parity.

## Current acceptance follow-up

The read-only visual run found six stale documentation screenshots after the
reviewed content/package changes. Explicit user approval permits only the Install
and Datepicker light/dark/RTL baselines to advance. Other baselines, screenshot
tolerances, framework source, compiled core assets, frozen API records and package
version remain unchanged. This supersedes earlier statements that every screenshot
image is byte-identical during the branding checkpoint; those earlier checkpoints
remain historical evidence.

The release inventory checker now expects native browser modules, canonical
`js/dist/` declarations, the required calendar SVG, consumer API metadata and
consolidated notices. It rejects retired CommonJS/facade outputs and no longer
requires maintainer documentation or standalone products in the core archive.
The release-block check still runs first; successful inventory validation is not
publication permission. See [the release checklist](RELEASING.md).

Install-page table scroll regions are keyboard focusable and named. Browser
regressions check focus and accessibility in every engine, and arrow-key movement
where native horizontal overflow exists. The documentation's font/layout
stylesheet and framework implementation are not changed by this correction.

Delivery restructuring is in progress locally. Root and focused core package
exports now use canonical `js/dist/` modules and types; old root main/module/types
fields and 82 generated root/component facades are retired. Eight optional-product
exports and React/Vue consumer peers are removed; the npm archive now excludes
standalone products, optional sources/outputs and internal CJS/type graphs.
Authored sources remain local. The default compiler now uses the qualified
Sass/PostCSS/Lightning CSS and Rolldown/Terser pipeline. Root dist contains exactly
29 files: the 25 core CSS/JS files and four required asset/notice/integrity files.
Obsolete CJS/type/adapter/extension/vendor/chunk outputs and the old browser
builder are physically retired. Project-specific QA tools are now consolidated
under `tests/tooling/`; required production tools and shared helpers remain in
`build/`. The production compiler now uses explicit npm stages, and all twenty
pinned build filenames, including example tools, are present. See
[the migration plan](BOOTSTRAP6-MIGRATION-PLAN.md) and
`metadata/core-delivery-reference.json`. The read-only inventory command is
`node tests/tooling/audit-core-delivery.mjs --report`; `--check` remains failing
while layout differences exist. Core CSS builds now also produce source-derived
`dist/css/tremplin-utilities.metadata.json`.

The compilation batch also generates `js/dist/` from the 35 core modules,
including source-required ScrollLock outputs, with declarations and maps. These
are generated files, not a second maintained implementation. The replacement
CSS/Rolldown/Terser pipeline now builds the public downloads as well as the
separate `artifacts/core-delivery-preview/` qualification copy; package entry
points use canonical modules. The 61,419-byte bundle
preview now fits the explicitly user-approved 62,000-byte cap; no budget was
raised automatically and this does not grant release approval.

## Current build/QA split

### Tremplin branding and notices

The active helpers are `build/lib/tremplin-core.mjs` and
`build/lib/tremplin-security.mjs`; use `npm run check:tremplin` and
`npm run audit:tremplin`. Related stage and integration commands also use
`tremplin`. `metadata/tremplin-tooling-rename.json` records eight exact moves and
seven command renames. Historical provenance records keep their original names.

The consumer archive includes only `metadata/api.json` and
`metadata/public-api.json`, not internal audit policies. Complete reused-code and
dependency licenses are consolidated in root and distribution
`THIRD_PARTY_NOTICES.txt`. The exact verified reused-code license is maintained at
`licenses/third-party-code.txt`; duplicate `LICENSE.bootstrap` filenames are
retired, not their contents. Documentation credits are included in the same
notices, linked from the website footer. Copyright and source provenance remain
truthful; product branding does not imply independent authorship of reused code.

Public documentation links to Tremplin's maintained source. The only core-source
branding change in this batch is the Sass banner homepage comment. Implementation
bodies, declarations, API baselines and the approved six source patches are
unchanged. Banner comments and their maps/integrity records are regenerated.
`metadata/tremplin-branding.json` records the 29-file root distribution inventory
and package scope. The 140 canonical `js/dist/` files remain available.
All work remains local and publication stays blocked.

There are 25 production/shared files in `build/`: all twenty pinned build names
and five required library helpers. Forty-five
project-specific audit/test/report/review/server tools move to `tests/tooling/`.
SRI generation and site-copy implementations are renamed to `generate-sri.mjs`
and `copy-site.mjs`; they are real moved implementations, not compatibility
wrappers. `metadata/build-tooling-relocation.json` records all 47 moves and the
path-only command projection. Generated framework files and authored `src/`
remain byte-identical after a clean build. Release and screenshot settings stay
unchanged; historical fixtures/transition records retain their original bytes.

The two optional example tools have been restored. Name coverage does not mean
literal script parity: version changes, cache cleanup and documentation preparation
retain their safety adaptations. The five remaining extras are libraries for source
verification, approved security patches, license notices, documentation runtime
ownership and safe asset mirrors. They are functional helpers, not legacy versions.
The independent inventory reports these five differences instead of waiving them.
Historical relocation/cutover/maintenance records remain unchanged; their current
successor is `metadata/npm-build-stages.json`.

### Explicit compilation stages

`css-compile` runs the real Sass CLI; `css-prefix` applies the qualified PostCSS
configuration and portable source maps; `css-minify` uses Lightning CSS; `css-docs`
generates the 124-family utility metadata. `js-compile-standalone` and
`js-compile-bundle` run Rolldown, followed by separate Terser minification commands.
Canonical modules and declarations retain their existing commands. Required SVG
assets and distribution notices are consolidated into `generate-sri.mjs`, with
`--assets-only` for partial CSS builds. Full SRI generation precedes independent
inventory/graph checks. `build/compile-core.mjs` and `build/build-css-assets.mjs`
are physically removed, not retained as wrappers.

The safe distribution cleanup is under `tests/tooling/clean-distribution.mjs`.
Documentation-only builders now live at `site/build/documentation-assets.mjs` and
`site/build/runtime.mjs`. The isolated QA preview lives under `tests/tooling/` and
runs the same CLI stages into the fixed `artifacts/core-delivery-preview/` target.
It cannot redirect or replace active downloads. Compilation is not a public API
or publication approval change.

### Optional example tools

`npm run screenshots` creates light/dark 480x300 and 960x600 thumbnails for the
three maintained self-contained demos in `site/data/examples.json`. Use
`-- --only interactions` to select a demo, or `-- --dry-run` to inspect the plan.
The tool owns an ephemeral loopback server, closes it afterward and writes only
`artifacts/examples/screenshots/`; it never replaces test screenshot baselines.
Screenshot generation and the example-tool regression suite require installed
Chromium (`npx playwright install chromium`). CI already installs all three browser
engines before running tests; no browser installation is performed by these tools.

`npm run release-zip-examples` produces
`artifacts/examples/tremplin-0.8.0-beta.0-examples.zip`. Despite the upstream-style
command name, it only creates a local archive. The ZIP retains all thirty core
distribution files, notices, the three demo HTML files and their declared local
stylesheet. Unzip, run `node serve.mjs` using Node 24, then open the displayed
loopback URL. ES modules require HTTP. No npm installation or remote dependency
is needed. `-- --dry-run` and `-- --only interactions` also work here.

Older demos with retired markup and the private optional discovery graph are not
silently added to this archive. Restoring the tools does not publish standalone
products, expand the core npm archive, deploy anything or change release approval.
The three selected demos now use current layout/button/form/typography classes.
Packaging checks every class against core/local CSS, with only two explicitly
reviewed carousel behavior hooks allowed without style rules. Two pages choose
readable application-level primary colors; the pinned framework defaults are
unchanged. The selected demos pass existing Axe and keyboard checks in all three
browser engines without exclusions or weaker assertions.

## Maintenance commands

Use Node 24 as described in the README. These commands are optional maintainer
checks; they do not change the default compiler, CI workflow or release policy.

| Command | Behavior |
| --- | --- |
| `npm run bundlewatch` | Read-only level-9 gzip table for the three core downloads. |
| `npm run bundlewatch:fix` | Dry-run proposals; `-- --write` can raise CSS only. JavaScript requires separate approval. |
| `npm run check:unused-imports` | Read-only Sass import check, including verified CSS side effects in aggregation modules. |
| `npm run validate:html` | Validate built `site-dist/**/*.html` with the pinned rules, including duplicate-ID errors. Empty matches fail. |
| `npm run clean:astro` | Show cache targets. `-- --apply` deletes only validated Astro cache directories, not source or distribution. |
| `npm run change-version -- OLD NEW` | Show four explicit version-marker changes. `--apply` is refused while the release block is active. |
| `npm run docs:prep` | Read-only built-docs inventory. `-- --prepare` stages a unique verified copy under `artifacts/docs-review/`. |

`build/docs-prep.sh` invokes the same cross-platform documentation-review helper.
It never resets Git, changes branches, removes a docs branch, commits, pushes or
deploys. Prepared reviews are local artifacts, not published websites. The version
tool similarly runs no npm lifecycle or Git commands; future authorized application
backs up the four files and leaves dependency versions, history, source/API baselines
and copyright untouched. A release still requires rebuilding and explicit review.

`.bundlewatch.config.json` is the shared budget source for the compiler and QA
gate: CSS 56,000, standard JavaScript 60,000 and bundled JavaScript 62,000 gzip
bytes. This maintenance batch does not raise any cap. HTML validation adds the
exact pinned `html-validate@11.17.0` development dependency; it is not a browser
runtime dependency and does not replace Axe, CSP, keyboard or visual acceptance.

## Earlier tooling-root relocation (historical)

The project deliberately keeps `src/js/` and `src/scss/`. Tooling first moved into
`build/`, following Bootstrap's root tooling convention. This is a location-only
migration: npm command names, source APIs, public package paths, and the pinned
137-module framework contract are unchanged. References in npm scripts,
Playwright servers, tests, and tooling reports used `build/` at that checkpoint;
the current split above supersedes those QA paths.

Historical baseline fixtures and retirement inventories retain their original
paths and hashes as evidence. The no-legacy guard checks retired tool names at
both their historical and relocated locations; there is no compatibility wrapper
under `scripts/`. The root `dist/` distribution is tracked and rebuilt normally.

For the strict-core source cutover and complete per-module inventory, see [the Bootstrap 6 migration plan](BOOTSTRAP6-MIGRATION-PLAN.md). All 137 production modules are verified: 131 exact matches plus six explicitly approved patched modules. All six include SEC-001 security edits; NavOverflow additionally includes the separately approved A11Y-001 clone-identity fix. The core tree is unchanged. Older mapping notes below are historical; release, documentation and broader acceptance remain pending.

The target is **one Bootstrap-derived Tremplin framework with no legacy implementation or compatibility exports**. The obsolete fallback and its build/test/copy pipeline have been removed. All 137 pinned core modules are retained; optional non-legacy work remains isolated and deferred from the initial clone milestone.

There is no compatibility source or distribution directory. Canonical core entry points and declarations live under `js/dist/`; internal `dist/cjs` and `dist/types` graphs are removed. Documentation runtime guards are private tooling, not a canonical core guarantee that independently compiled builds can be mixed safely. Optional CSS and dependency modules used by demos are built under `artifacts/documentation-assets/dist/` and merged into the documentation mirror through an exact eight-file allowlist. They never enter root dist or the core archive. The compilation graph is private at `artifacts/core-build-graph.json`. Optional CSS and adapter/extension exports are not provided by the core package. `metadata/core-package-scope.json` records the archive policy. Source-contract metadata still catalogs preserved optional sources for auditing, not as active exports. See [the strict API contract](API_STABILITY.md) and `metadata/legacy-removal.json` for cleanup scope.

The follow-up [asset audit](ASSET-RETIREMENT-AUDIT.md) also removes the unused hybrid runtime, obsolete `tsup*.config.ts` files, old standalone documentation page and private palette shim. The supported compiler uses the explicit npm stages above; optional documentation styles read current semantic tokens. Site preparation prunes obsolete generated copies and checks current asset bytes rather than accumulating chunks from earlier builds.

## Browser delivery contract

All public browser downloads are ES modules, matching the pinned Bootstrap 6 build.
Load them with `type="module"`; none creates `window.TremplinFramework`.

| Artifact | Dependency resolution |
| --- | --- |
| `dist/js/tremplin.js` | Single-file core ES module; external Floating UI and Vanilla Calendar Pro. |
| `dist/js/tremplin.min.js` | Single-file minified core ES module; the same two peers remain external. |
| `dist/js/tremplin.bundle(.min).js` | Self-contained core ES module including both peers. |
| `artifacts/documentation-assets/dist/vendor/*.js` | Private dependency modules for documentation import-map demos, not core downloads. |

Use one graph per document. The package root and focused core imports share
canonical classes/instances under `js/dist/`. Browser downloads are independent
alternatives and must not be mixed with that graph. Core CJS facades are retired;
Node 24 require(ESM) interop does not advertise a separate CommonJS build.
Keep `dist/LICENSE` and `dist/THIRD_PARTY_NOTICES.txt`
with redistributed assets.

Documentation-only core/palette entries under `site/src/` share one ESM graph.
The documentation app explicitly owns its inspection hook; test fixtures have a
separate QA-owned module bridge. Neither is a public classic/global distribution.
The Install guide and raw examples document native modules and local import maps.

## Source mapping notes

Tremplin follows the pinned Bootstrap 6 source/module patterns with declared Tremplin identity substitutions and approved exceptions. Outer build/repository wrappers may differ; the goal is not a separately approximated implementation.

```text
tremplin/
├─ dist/
│  ├─ css/                 compiled full, grid, reboot, and utility bundles
│  └─ js/                  ESM/CJS modules, declarations, and browser bundles
├─ src/
│  ├─ js/
│  │  ├─ *.ts              one root TypeScript module per core component
│  │  ├─ dom/              Bootstrap-style DOM data, events, and selectors
│  │  ├─ util/             configuration, actions, and positioning utilities
│  │  ├─ extensions/       Tremplin-only JavaScript components
│  │  └─ index.ts          data API and complete JavaScript entry
│  └─ scss/
│     ├─ buttons/          button, button-group, and close-button styles
│     ├─ content/          reboot, prose, lists, blockquotes, images, tables
│     ├─ extensions/       Tremplin-only components and optional presentation
│     ├─ forms/            granular form partials and folder entry module
│     ├─ helpers/          focus, positioning, stacks, links, accessibility
│     ├─ layout/           breakpoints, grid, and containers
│     ├─ mixins/           reusable Sass behavior and folder entry module
│     ├─ utilities/        utilities API entry
│     ├─ _config.scss      configurable framework defaults
│     ├─ _colors.scss      base semantic palette
│     ├─ _theme.scss       theme color map
│     ├─ _*.scss           root component and foundation partials
│     └─ tremplin.scss     complete configurable entry
├─ examples/
├─ icons/
├─ metadata/
├─ site/
├─ starters/
└─ tests/
```

## Bootstrap 6 comparison

Optional migration infrastructure lives outside the core tree:
`src/adapters/types.ts` defines the structural lifecycle contract,
`src/integrations/core-bindings.ts` binds Command Palette to the selected core,
and `src/runtime/` owns distribution-level mixing guards. These are not Bootstrap
core utilities. The generated strict composition is isolated under
`artifacts/bootstrap6-integrations/<commit>/`; it verifies all 137 pinned core
hashes and emits a separate optional stylesheet rather than changing core source.

| Bootstrap convention | Tremplin equivalent |
|---|---|
| `scss/buttons/` | `src/scss/buttons/` |
| `scss/content/` | `src/scss/content/` |
| `scss/forms/` and `forms/index.scss` | `src/scss/forms/` and `forms/index.scss` |
| `scss/helpers/` and `helpers/index.scss` | `src/scss/helpers/` and `helpers/index.scss` |
| `scss/layout/` | `src/scss/layout/` |
| `scss/mixins/` and `mixins/index.scss` | `src/scss/mixins/` and `mixins/index.scss` |
| `scss/utilities/_api.scss` | `src/scss/utilities/_api.scss` |
| `scss/_config.scss`, `_colors.scss`, `_theme.scss` | `src/scss/_config.scss`, `_colors.scss`, `_theme.scss` |
| Root component partials | Matching root Tremplin component partials |
| `js/src/*.ts` | `src/js/*.ts` root component entry points |
| `js/src/dom`, `js/src/util` | `src/js/dom`, `src/js/util` typed infrastructure |
| `dist/css/bootstrap*.css` | `dist/css/tremplin*.css` |
| `dist/js/bootstrap.bundle*.js` | `dist/js/tremplin.bundle*.js` |

This mapping targets Bootstrap 6.0.0-alpha.1. The core Sass manifest matches Bootstrap 6, with brand-renamed `tremplin*.scss` distribution entries. Tremplin-only Sass is isolated under `extensions/`; it never adds files to Bootstrap-compatible core directories. The legacy `_maps.scss` and `_variables.scss` entries have been removed in favor of `_config.scss`, `_colors.scss`, and `_theme.scss`. Menu lives in the core `_menu.scss` partial, and Scrollspy remains JavaScript-only with no `_scrollspy.scss` presentation partial.

The JavaScript tree now exposes Bootstrap 6-style TypeScript `dom`, `util`, root-component, generated distribution, and test layers. `base-component.ts` is at the root, while `util/index.ts`, `sanitizer.ts`, `swipe.ts`, and `template-factory.ts` provide the shared runtime services used by components. The main `index.ts` is export-only, and every component owns its data API registration. Overlay lifecycle behavior remains inside its owning components rather than a non-Bootstrap shared manager. Tremplin uses Floating UI, uses Vanilla Calendar Pro through the pinned Datepicker wrapper, and isolates CommandPalette under `extensions`; the extension is published separately and excluded from the main JavaScript entry. The duplicate beta-era `src/js/components` layer and transitional `src/js/core` layer have been removed; compiled component package subpaths remain compatible. Public CSS classes remain unprefixed; only framework-owned tokens, data hooks, and lifecycle events use the `trm` namespace.
