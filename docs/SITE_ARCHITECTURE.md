# Documentation-site architecture

This local migration addresses the website before the separate notices and
attribution review. It uses the organization of the upstream `site/` at pinned
commit `9062790fdb2379593a2973416dc5a3bfb203e4e3` as a reference, not as a claim
that every upstream website file or feature has been copied.

## Current structure

```text
tremplin/
├── astro.config.mjs                 Root CLI entry; delegates to site config
├── site/
│   ├── astro.config.ts              Website configuration
│   ├── postcss.config.cjs
│   ├── tsconfig.json                Strict website types; DOM core boundary retained
│   ├── .prettierrc.json
│   ├── build/
│   │   ├── assets.mjs               Documentation Sass/static asset preparation
│   │   ├── documentation-assets.mjs Private example CSS/dependencies
│   │   ├── runtime.mjs              Documentation-owned browser module graph
│   │   └── examples.mjs             Existing example-tool support
│   ├── data/
│   │   ├── navigation.json          Navigation icon metadata
│   │   └── examples.json            Existing example catalog
│   ├── static/                     Authored fonts and SVG assets
│   ├── public/                     Served assets, generated mirrors, existing licenses
│   └── src/
│       ├── components/
│       │   ├── header/Header.astro
│       │   ├── footer/Footer.astro
│       │   ├── shortcodes/Code.astro
│       │   ├── component/          Header, examples, tokens, prose and live API tables
│       │   ├── DocsSidebar.astro
│       │   ├── GuideHeader.astro / GuidePagination.astro / GuideScripts.astro
│       │   ├── PageMeta.astro
│       │   ├── Scripts.astro
│       │   └── TableOfContents.astro
│       ├── content.config.ts       One validated authored MDX collection
│       ├── content/docs/           Four overviews, all 116 guides, all 47 component pages
│       ├── data/                   Shared executable guide/component examples
│       ├── env.d.ts
│       ├── layouts/DocsLayout.astro
│       ├── libs/                   Asset integration, route and navigation helpers
│       ├── pages/                  Existing routes, custom 404, robots endpoint
│       ├── scss/                   Documentation entry point and ordered partials
│       └── types/window.d.ts       Website-owned globals, not public framework globals
└── site-dist/                      Generated static website, still ignored in Git
```

## Source ownership

- `site/src/scss/docs.scss` is the documentation stylesheet entry point. Its ten
  partials preserve the original cascade. `site/public/docs.css` is generated,
  not a second maintained stylesheet. Its established served URL is unchanged.
- `site/static/` owns the two font files and two SVG assets. Preparation copies
  their bytes to the existing public URLs. Public copies remain available to
  existing consumers; no license or notice file is moved or rewritten.
- `DocsLayout.astro` composes the shell. Page-specific demo CSS belongs to
  `PageMeta.astro`; shared search, navigation, outline and clipboard behavior
  belongs to `Scripts.astro`. Optional Command Palette still has one runtime graph.
- Four MDX overviews and all 116 Getting started/Guides/Customize/Layout/Content/Forms/Helpers/Utilities guides now live under
  `content/docs/`, not duplicated under `pages/` or in TypeScript prose objects.
  The catch-all page renders them through Astro's content API. The obsolete
  structured-guide collection and `GuideContent.astro` renderer are removed.
- Metadata for migrated groups comes from the same authored MDX files. Sidebar,
  search fallback, overview cards and pagination read current metadata per render,
  rather than retaining stale module-initialized titles during development.
- `installation-examples.ts` and `getting-started-examples.ts` own reusable
  samples, versioned commands, package metadata and fresh integrity interpolation.
  The former full-prose `installation-guide.ts` is retired, not left as an alias.
  `getting-started-guides.ts` now projects navigation metadata only; MDX guide
  records intentionally have `source: 'mdx'` and no duplicated section bodies.
- `workflow-guides.ts` and `customize-guides.ts` are also metadata-only projections.
  Their former prose is authored in `content/docs/guides/` and
  `content/docs/customize/`. `workflow-examples.ts` retains shared consumer
  markup and commands interpolated from the actual package version;
  `customize-examples.ts` retains the tested CSS/Sass samples. Historical
  prose snapshots are test-only references, never production data imports.
- `layout-guides.ts` and `content-guides.ts` now project metadata from their MDX
  files too. Their executable CSS/Sass snippets and live HTML examples are owned
  by `layout-examples.ts` and `content-examples.ts`; prose is not duplicated there.
- Forms also uses a metadata-only projection. `forms-examples.ts` owns live HTML
  and code samples; matching shared Sass, CSS and JavaScript samples refer to
  the existing executable modules rather than freezing separate copies.
  `GuideScripts.astro` preserves the original module script position before
  pagination and resolves the same documentation-owned ESM runtime URL.
- Helpers uses a metadata-only projection too. `helpers-examples.ts` retains
  its raw/published executable samples and the explicit stretched-link contrast
  script, emitted unchanged by `GuideScripts.astro` before pagination. No helper
  runtime plugin or core CSS override is introduced by this migration.
- Utilities also projects metadata from MDX. Its 47 non-API topic records are
  read from validated frontmatter; overview rendering reads fresh metadata.
  `utilities-examples.ts` retains executable samples and both contrast scripts.
  The overview's old infix class examples and obsolete Sass option are corrected.
- All 47 component routes now render authored MDX through the specific Components
  route, not the generic guide catch-all. Component prose is owned by MDX
  frontmatter/body; small shared rendering components retain executable examples,
  evaluated token defaults, Sass samples and existing keyboard/table semantics.
  All twenty core JavaScript plugin topics use shared API shortcodes
  that read the existing generated API metadata; MDX owns lifecycle explanations.
  Accordion documents its native details/summary behavior without a plugin API.
  Breadcrumb, List group and Pagination keep native navigation/input semantics,
  without inventing plugins or a result-data controller.
  Button group, Close button and Nav retain their CSS/native behavior and
  explicitly disclosed Menu/Alert integrations.
  Menu retains its Floating UI dependency and Tab distinguishes dispatched
  lifecycle events from internal listener names in the generated inventory.
  Toast retains explicit application setup and shares its authored body with
  the existing Toasts alias. Scrollspy retains native-scroll and focus behavior.
  Bottom Sheet keeps its own narrative/examples and application focus handler,
  sharing Drawer API data and event descriptions rather than inventing a plugin.
  Tooltip and Popover keep their distinct lazy initialization/trigger policies,
  sanitization requirements and native-dialog top-layer behavior.
  Navbar retains CSS/container-query behavior and an explicit application Drawer
  focus handler. Nav Overflow projects runtime event keys without changing the
  generated catalog; Toggler retains its source-verified target option table.
  Carousel retains its shared API, scroll-snap controls and paused motion example.
  Stepper retains native ordered-list presentation and application-owned progress.
  Chips retains explicit application serialization and Combobox keeps distinct
  Menu completion timing; both share existing source-verified option rows.
  Datepicker, OTP Input, Range and Strength retain native values, source-verified
  options, event/listener distinctions, security boundaries and explicit setup.
  Chip/Table/Forms retain native/CSS semantics and explicitly copied application
  behavior. Optional patterns retain separate CSS boundaries; Command Palette
  is an optional extension API, not a twenty-first core plugin. The component
  route has no structured fallback and rejects a missing authored document.
- The route registry rejects collisions and invalid paths. Existing guide order,
  pagination, URLs, markup and copyable examples remain unchanged.
- `404.html` is excluded from Pagefind and marked `noindex`. `robots.txt` allows
  crawling; it does not advertise a nonexistent sitemap.

## Local commands

From the project root, with dependencies and framework assets already built:

```shell
npm run site:dev
```

Open `http://127.0.0.1:4321/` and keep the terminal running. Existing
`npx astro dev --host 127.0.0.1 --port 4321` usage also works after preparation.
The asset integration prepares styles on startup and watches authored Sass and
static assets during development. For a production website build, use
`npm run site:build`; use `npm run build:site` when core assets need rebuilding too.

The root CLI and `--config site/astro.config.ts` share one configuration. No
dependency additions, framework export changes, releases or deployments are part
of this migration.

## Deliberately remaining work

1. All 116 guide bodies and 47 component detail routes are migrated. Complete
   broader website/release qualification and manual accessibility review before
   claiming readiness. Keep shared executable examples in typed data.
2. Decide which additional reference-table and MDX shortcodes the content needs;
   do not create empty placeholder directories solely to resemble upstream.
3. Add an accurately generated `llms-full.txt` endpoint and update its related
   documentation together. The existing `llms.txt` remains unchanged in this batch.
4. Consider further metadata consolidation where it removes duplication. JSON is
   retained rather than adding a YAML dependency solely for filename parity.

There are no restored version archives, upstream advertisements, external service
credentials, or claimed package publications. Tremplin's unversioned current
documentation remains intentional. Notices and other attribution references are
deferred for a separate review, as requested.

## Verification policy

Keep the original CSS reference hash and compare complete normalized CSS output
after Sass compilation. Do not loosen screenshot tolerances or update baseline
images for a structure-only change. All 196 existing page bodies should remain
structurally identical, excluding scripts and insignificant formatting whitespace.
Framework sources, compiled distribution, notices, font/icon licenses and visual
baselines are protected independently from the website reorganization.

### Local verification, 2026-11-10

- Website build: 197 HTML pages, including the new 404; Pagefind indexes the 196
  existing documentation pages and excludes the 404.
- Existing page bodies: 196 preserved, zero added/removed/changed, after removing
  scripts and insignificant formatting whitespace for the structural comparison.
- Documentation CSS: normalized output unchanged after the Sass source split.
- Protected source/output/notice/license/snapshot inputs: all 332 byte-identical
  to this batch's starting state. No screenshot baseline was updated.
- Cross-browser style/interaction suite: 126 passed on the final full run.
- Homepage/installation light, dark and RTL screenshots: six passed.
- New architecture browser checks: three passed, covering migrated overviews,
  accessible non-indexed 404, crawler response and static assets.
- Strict website TypeScript and the existing DOM-core/test type boundaries pass.
- The full unit run passed 1,121 of 1,122 tests; one existing upstream-transition
  audit exceeded its unchanged five-second timeout. That entire two-test file
  subsequently passed in isolation. This is not recorded as one all-green full
  suite run. No timeout, screenshot tolerance or historical hash was relaxed.
- The source-reference audit, no-legacy gate and site asset mirror checks pass.

All changes remain local; no commit, push, publication or deployment was made.

## Getting started MDX authoring

The directory contains the existing overview plus `install`, `ai`, `approach`,
`css-variables`, `javascript`, `browsers-devices`, `accessibility`, `download`,
`contents`, `bundlers` and `rtl` as separately authored `.mdx` files.

These eleven guides use JSON-compatible YAML frontmatter with `title`,
`description`, `group`, `lead` and a contiguous zero-based `order`. This is parsed
by Astro and the small metadata-only reader without adding a second YAML package.
The MDX files themselves are the sole source of those metadata values and prose.
Existing section IDs and HTML wrappers are retained to preserve deep links and
appearance; introducing a different heading/anchor system is not part of this move.

Use the shared `Code`, `PackageManagers` and `ReleaseAssets` components for
copyable commands and dynamic download data. `Html` accepts only trusted,
repository-authored live examples, not user or network input. It has the same
trusted-source boundary as the previous renderer's `set:html` examples.

Keep technical token strings inside JSX expressions where needed. MDX typography
otherwise changes straight quotes and double hyphens, interprets wildcard class
names as emphasis, and can auto-link an already-linked URL. Regression cases
cover these differences; neither global Markdown formatting nor screenshot
tolerances was changed to hide them.

Before-migration source text and structured expectations are retained only under
`tests/fixtures/mdx-migration/`, never imported by the production website. Tests
use these as independent prose/hierarchy references and the real typed sample
modules as executable inputs. `metadata/getting-started-mdx.json` records the
narrow source transition without refreshing the earlier immutable branding
records. Historical text snapshots use `.ts.txt` so they are not compiled as
active TypeScript. Edit/source links and maintainer links now point to real MDX.

The temporary rendering-comparison route was removed after verification; it is
not a public route or a retained second implementation. The local identity report
at `artifacts/getting-started-mdx-identities.json` compares all existing page bodies
and 475 protected source, distribution, license, package and snapshot inputs.
Only edit/source URLs are normalized for the eleven migrated pages. All content,
roles, heading IDs, classes, ordinary links and pagination remain compared.

### Getting started migration verification, 2026-11-10

- All eleven guides render from authored MDX. The four prior MDX overviews and
  105 remaining structured guides retain their existing routing.
- Production website build and Pagefind succeed: 197 HTML pages, 196 indexed.
- Focused unit/documentation checks: 75 passed across seven files.
- Getting started/entry/architecture browser checks: 108 passed across Chromium,
  Firefox and WebKit, including all eleven guides, light/dark and LTR/RTL entry
  states, package-manager keyboard/copy behavior and copied starter execution.
- Homepage/installation screenshot checks: six passed; no baseline updates.
- Strict website TypeScript, DOM-core/test boundaries, source-reference audit,
  no-legacy gate and site-asset mirror checks pass.
- Final identity comparison: all 196 pre-existing page bodies match, apart from
  the intentionally updated edit/source URLs; all 475 protected inputs match.
- README, interaction and localization links now point to the new authored
  sources. Temporary comparison routes are absent from both source and output.

This is focused verification of the migration, not a claim that the monolithic
`npm run check` or manual assistive-technology qualification was rerun. Notices,
copyright/license contents, framework source/output, package dependencies and
publication flags remain unchanged. Nothing was committed, pushed or deployed.

## Guides and Customize MDX authoring

Seven Guides pages and eleven Customize pages now have authored MDX bodies in
`site/src/content/docs/guides/` and `site/src/content/docs/customize/`. Together
with Getting started, this makes 29 migrated guides and four MDX overviews.
The other 87 structured guides remain scheduled for later batches.

Frontmatter owns titles, descriptions, groups, leads and order. Metadata-only
TypeScript projections and the shared `GuideIndex` component keep navigation,
pagination and overview lists aligned with those files. Version-dependent commands
stay executable in `workflow-examples.ts`; tested customization samples stay in
`customize-examples.ts`. Existing route URLs, heading IDs, copy controls, tables,
callouts and technical strings are preserved. The Sass guide explicitly protects
its literal `...` from prose typography.

Independent pre-migration source and structured expectations are test fixtures,
not a second production prose source. `metadata/guides-customize-mdx.json` guards
the new authored files and those original references without refreshing earlier
immutable migration records. Source/edit and maintainer links now target MDX.

### Guides and Customize verification, 2026-11-10

- Production website and Pagefind build: 197 HTML pages, 196 indexed.
- Focused unit/documentation checks: 94 passed across seven files, retaining
  executable Sass and consumer-sample validation.
- Browser checks: 78 passed across Chromium, Firefox and WebKit, covering the
  migrated guides, accessibility, dark/mobile reflow, navigation and interactions.
- Homepage/installation light, dark and RTL screenshots: six passed with unchanged
  baselines and tolerances.
- Strict website TypeScript, DOM-core/test type boundaries, source-reference
  audit, no-legacy gate and site asset mirror checks pass.
- Identity comparison: all 196 pre-existing page bodies match after normalizing
  only the migrated pages' intentional edit/source-link changes. All 492 protected
  source, distribution, license, package, earlier-migration and snapshot inputs
  remain byte-identical to this batch's starting state. The local report is
  `artifacts/guides-customize-mdx-identities.json`.

This is focused migration verification, not a rerun of the monolithic
`npm run check` or manual assistive-technology qualification. Framework core,
notices/licenses, dependencies and publication flags are unchanged in this batch.
Nothing was committed, pushed, published or deployed. Layout and Content are next.

## Layout and Content MDX authoring

The next thirteen guides now have authored MDX bodies, preserving the same
frontmatter and rendering conventions as the earlier groups:

```text
site/src/content/docs/
├── layout/
│   ├── breakpoints.mdx
│   ├── containers.mdx
│   ├── grid.mdx
│   ├── columns.mdx
│   ├── gutters.mdx
│   ├── utilities.mdx
│   ├── z-index.mdx
│   └── css-grid.mdx
└── content/
    ├── reboot.mdx
    ├── typography.mdx
    ├── images.mdx
    ├── tables.mdx
    └── prose.mdx
```

This makes 42 migrated guides and four authored overviews. The other 74
structured guides remain for subsequent batches. The former Layout and Content
TypeScript prose modules now project metadata only. `layout-examples.ts` and
`content-examples.ts` own executable CSS/Sass snippets and trusted live HTML,
not duplicate page prose. Frontmatter remains the metadata source for fresh
sidebar, search and pagination entries. Existing URLs, heading IDs, table
scroll regions, copy controls and examples are unchanged.

`metadata/layout-content-mdx.json` records the thirteen new authored files,
sample ownership and navigation-group transition. Original prose and the earlier
group registry are preserved as test-only fixtures. Previous migration policies
are not refreshed; their historical registry comparison uses the verified
pre-transition snapshot. No additional package or global Markdown formatting
change is needed.

### Layout and Content verification, 2026-11-10

- Production website and Pagefind build: 197 HTML pages, 196 indexed.
- Final focused unit/documentation run: 162 passed across eleven files, including
  all documented Sass samples and existing Grid/content contracts. An earlier
  concurrent run exceeded the unchanged five-second timeout for a Grid sample
  compilation; the final complete focused run passed without competing browser
  work. No timeout or assertion was relaxed.
- Browser checks: 75 passed across Chromium, Firefox and WebKit. These retain
  accessibility and dark/mobile checks for all thirteen guides, responsive
  Flexbox and CSS Grid demonstrations, LTR/RTL offsets, images, stacked tables,
  active/hover cell layers and prose exclusion behavior.
- Homepage/installation light, dark and RTL screenshots: six passed with
  unchanged baselines and tolerances.
- Strict website TypeScript, DOM-core/test type boundaries, source-reference
  audit, no-legacy gate and site asset mirror checks pass.
- Identity comparison: all 196 existing page bodies match after normalizing only
  intentional MDX edit/source links. All 516 protected source, distribution,
  license, package, earlier-migration and snapshot inputs remain byte-identical.
  The local report is `artifacts/layout-content-mdx-identities.json`.

The monolithic `npm run check` and manual assistive-technology qualification were
not rerun. Framework core, notices/licenses, dependencies and publication flags
remain unchanged in this batch. Nothing was committed, pushed, published or
deployed. Forms and Components are the next migration group.

## Forms MDX authoring

All seventeen Forms bodies are authored under `site/src/content/docs/forms/`:
`overview`, `field`, `form-control`, `checkbox`, `radio`, `switch`, `range`,
`input-group`, `floating-labels`, `form-adorn`, `chips`, `combobox`, `datepicker`,
`otp-input`, `password-strength`, `layout` and `validation`.

This brings guide migration to 59 authored guides and four overviews. Helpers
and Utilities account for the 57 remaining structured guides. Component detail
pages still have their separate renderer: their MDX authoring migration is the
next batch, not completed by this Forms change.

`forms-guides.ts` now supplies metadata only. The former Forms prose exports and
unreferenced private builders have been removed from the five shared topic
modules. Those modules still own executable component examples, Sass/token maps,
topics and application handlers needed by current component pages. They are not
obsolete just because their former Forms prose moved. The now-unused
`strict-control-guides.ts` shim was physically removed; its original source is
recoverable from the test-only pre-migration snapshot.

`forms-examples.ts` supplies live HTML and copyable samples. Shared CSS, Sass and
JavaScript samples reference their actual exported values, including the same
handlers executed by the previews. Explicit Chips/Datepicker contrast wrappers
are applied once, not reapplied to MDX metadata by the old structured renderer.
`GuideScripts.astro` emits the same scripts at their original location before
pagination, including the documentation ESM import rewrite. No default framework
behavior, application submission policy, runtime global or public API changed.

Authored MDX retains technical punctuation through JSX string literals, the same
section IDs, bordered/keyboard-scrollable tables and copy controls. Source links
now point to the actual Forms MDX files. Independent pre-migration prose and
structured expectations remain test-only; tests combine those expectations with
the maintained executable sample modules rather than silently testing empty
metadata sections.

Eight source-derived token tables use `GuideTable.astro` and `forms-tables.ts`,
which retain the original shared/native/composition token-map expressions and
embedded-SVG presentation rules. Static explanatory tables stay authored in MDX;
evaluated token defaults are not frozen into copied rows. Tests consume the same
live rows while comparing their current values with independent original data.

`metadata/forms-mdx.json` records the narrow transition and removal. Earlier
migration/branding policies remain unchanged and resolve their original inputs
through verified historical snapshots. The comparison report additionally hashes
scripts for every existing page, not just markup with scripts excluded.

### Next batch: component-page authoring

The current `pages/components/[slug].astro` renderer remains in place. Migrate
its routes separately rather than treating a thin MDX wrapper around that entire
renderer as completed authoring. First inventory core topics, shared-implementation
routes and optional patterns without dropping any supported URL. Then separate
authored introductions, variant guidance and usage prose from reusable example,
token-table and API-table shortcodes.

Keep generated API methods/options and evaluated Sass/token data connected to
their real sources; do not freeze those technical tables into MDX snapshots.
Preserve optional-extension loading, application demo handlers, accessibility
descriptions, aliases, source links and component pagination. Capture the same
body/script identities and protected inputs before changing that renderer, and
verify component interactions and light/dark/LTR/RTL screenshots independently.
No component renderer cutover is included in this Forms batch.

### Forms verification, 2026-11-10

- Production website and Pagefind build: 197 HTML pages, 196 indexed.
- Final focused unit/documentation run: 247 passed across seventeen files,
  retaining native/composite/enhanced control, Sass, token, source and API checks.
- Full focused browser run: 111 passed across Chromium, Firefox and WebKit.
  An initial run exposed Firefox's missing synthetic clipboard payload in an
  existing OTP test. The test now uses the same explicit clipboard-data property
  as the existing component-level test, focuses the input and verifies the actual
  payload. Value/slot assertions remain intact; no core or timeout was changed.
- After connecting the eight live token tables, all 24 affected guide/browser
  combinations passed again across the three engines. Their rendered bodies and
  scripts still match the versions exercised by the full focused browser run.
- Homepage/installation light, dark and RTL screenshots: six passed on the final
  build with unchanged baselines and tolerances.
- Strict website TypeScript, DOM-core/test type boundaries, source-reference
  audit, no-legacy gate and site asset mirror checks pass.
- Final identity comparison: all 196 page bodies and all 196 sets of scripts
  match; only intentional authored-source/edit links are normalized. All 534
  protected framework/output/license/package/earlier-migration/snapshot inputs
  remain byte-identical. Report: `artifacts/forms-mdx-identities.json`.

This is focused verification, not a rerun of the monolithic `npm run check` or
manual assistive-technology qualification. Framework core, compiled distribution,
notices/licenses, dependencies and publication flags are unchanged in this batch.
Nothing was committed, pushed, published or deployed. Components is still pending.

## Presentation-component MDX authoring

The first component batch migrates seven of 47 existing routes: `avatar`,
`badge`, `card`, `placeholder`, `progress`, `skeleton` and `spinner`. Forty
component routes still use the structured body renderer. The 59 previously
migrated guides and four overviews remain unchanged; Helpers/Utilities still
account for 57 structured guides.

```text
site/src/
├── content/docs/components/
│   ├── avatar.mdx
│   ├── badge.mdx
│   ├── card.mdx
│   ├── placeholder.mdx
│   ├── progress.mdx
│   ├── skeleton.mdx
│   └── spinner.mdx
├── components/component/
│   ├── Header.astro
│   ├── Example.astro
│   ├── Code.astro
│   ├── Variants.astro
│   ├── Tokens.astro
│   ├── Keyboard.astro
│   ├── Guidelines.astro
│   ├── Classes.astro
│   └── Contrast.astro
└── libs/component-mdx.ts
```

Each MDX file authors its section composition, headings, shared instructional
paragraphs and JavaScript/CSS classification. JSON-compatible frontmatter owns
the title, description, introduction, variant descriptions, keyboard guidance and
usage notes. These records are read per render, not copied into another maintained
prose catalog. The old narrative literals for the six implementation topics have
been removed from their TypeScript definitions.

`authoredComponentDetail()` preserves the existing typed detail shape through
fresh narrative getters. Executable HTML builders, evaluated Sass/token data and
Sass customization examples remain in their original modules. A variant-count
mismatch fails explicitly rather than silently hiding samples. Existing component
index, sidebar, search and pagination consumers read current authored titles.

Placeholder retains its own title and URL but references the single Skeleton
narrative and implementation. There is no second sample set, copied guidance,
framework class or JavaScript plugin for that alias.

The specific Components route renders these seven MDX documents; the generic
guide catch-all explicitly excludes component document IDs. A registry check
rejects missing or unexpected component MDX routes. The remaining 40 bodies,
including their generated API tables, optional extension resources and demo
handlers, retain the existing renderer. The shared header preserves their current
markup. On migrated pages only the first edit link changes to the real MDX file;
the framework-source reference remains unchanged.

`metadata/component-presentation-mdx.json` guards the new authored files and the
small source transition. Original render/data inputs and structured expectations
are immutable test fixtures. Previous migration and branding records are not
refreshed; their original inputs resolve through the verified historical adapter.

Next migrate Button and Alert with live API-option/method/event shortcodes before
extending the pattern to the remaining interactive components. This batch does
not claim that all component pages or all website content have been migrated.

### Presentation-component verification, 2026-11-10

- Final focused unit/documentation run: 162 passed across twelve files, including
  earlier MDX migrations, immutable source records, live technical data and
  per-render title/narrative updates. Variant-count mismatches fail explicitly.
- Final focused browser run: 45 passed across Chromium, Firefox and WebKit.
  Twenty-one page/engine cases cover all seven MDX pages in light/dark, LTR/RTL
  and desktop/mobile states, including real example-copy behavior. Twenty-four
  existing behavior checks retain Button/Alert, Card geometry, native loading
  patterns, reduced-motion behavior and Avatar semantics/geometry coverage.
- Initial new-test failures were test-selection/ordering issues: embedded example
  headings are not documentation headings, and a closed CSS-disclosure copy
  button is not the visible example-copy control. Read-only page audits now run
  at the page origin before the copy action moves focus/scroll. All accessibility
  rules, assertions, viewports and timeouts remain enabled and unchanged.
- Production website/Pagefind build: 197 HTML pages, 196 indexed. Strict website
  types, DOM-core/test boundaries, core-reference audit, no-legacy and site-asset
  mirror checks pass. The monolithic `npm run check` was not rerun.
- Homepage/installation light/dark/RTL screenshots: all six existing checks pass
  without changing their baselines or tolerances.
- Twenty-one independently captured before/after component screenshots have
  pixel-identical content below the 64px global header. Nineteen full pages also
  match exactly. The strict raw full-page diagnostic was not wholly byte-identical:
  Card/light and Skeleton/dark differ only in 12 and 37 header-search pixels,
  respectively, with a maximum channel difference of 2/255. Those differences
  were reviewed; no before image was replaced, no tolerance added and no migrated
  component content excluded. Report:
  `artifacts/component-presentation-visual/pixel-review.json`.
- All 196 existing page bodies and script sets match the pre-migration state,
  apart from the seven intentional edit links. All 564 protected inputs match.
  Report: `artifacts/component-presentation-mdx-identities.json`.

Framework source/output, notices/licenses, dependencies, release flags and
publication state are unchanged in this batch. Manual assistive-technology
qualification was not rerun. Nothing was committed, pushed, published or deployed.
Forty component pages remain; Button and Alert are next.

## Action-component MDX authoring

Button and Alert now have authored bodies in
`site/src/content/docs/components/button.mdx` and `alert.mdx`. This brings the
total to nine of 47 component routes; 38 retain the structured body renderer.
The 59 authored guides, four overviews and 57 remaining Helpers/Utilities guides
are unchanged. Earlier checkpoint counts above describe their original batches.

```text
site/src/
├── content/docs/components/
│   ├── alert.mdx
│   └── button.mdx
├── components/component/
│   ├── ApiOptions.astro
│   ├── ApiMethods.astro
│   ├── ApiEvents.astro
│   └── ApiAttributes.astro
└── data/component-api.ts
```

The API shortcodes read `metadata/api.json` at render time. Options, common and
component methods, event names and Button data attributes remain generated data,
not independent MDX copies. Lifecycle descriptions and Alert's explicit dismiss
instructions are authored in MDX. Missing generated definitions or missing prose
for a newly generated lifecycle event fail explicitly. Executable HTML, token
tables, Sass examples, data API loading and existing demo handlers remain live.
No configuration options or lifecycle events were invented to fill empty tables.

`metadata/component-actions-mdx.json` records the transition and protects the
previous presentation policy unchanged. Original pre-action source snapshots and
expectations remain test-only evidence, never runtime data imports. Earlier
migration guards resolve those snapshots rather than refreshing historical hashes.

### Action-component verification, 2026-11-10

- Production website/Pagefind build passed: 197 HTML pages, 196 indexed,
  11,607 indexed words. No-legacy and site-asset mirror checks passed.
- Focused unit/documentation tests: 169 passed across thirteen files.
- Strict website type-check and test type-boundary checks passed.
- Browser checks: 18 passed across Chromium, Firefox and WebKit. The six
  page/engine cases exercise both pages in light/dark, LTR/RTL and desktop/mobile
  states, source links, current API tables and example copy behavior. Twelve
  existing behavior cases cover Button, Alert, Card and Navbar/Toggler regressions.
- All six existing homepage/Install screenshot tests passed, with no baseline
  or tolerance updates.
- All six independent full-page Button/Alert comparisons are pixel-identical
  in light, dark and RTL modes, including the global header. Report:
  `artifacts/component-actions-visual/pixel-review.json`.
- All 196 existing page bodies and script sets match their captured starting
  state, apart from intentional edit-link normalization. All 584 protected
  source/output/license/package/snapshot inputs match. Report:
  `artifacts/component-actions-mdx-identities.json`.
- The pinned core audit passed unchanged: 131 exact branded modules and six
  approved patched modules; no new core extras or production modifications.

Framework sources, distribution files, notices/licenses, dependencies and release
flags remain untouched in this batch. No commit, push, publication or deployment
was made. The full monolithic check/release qualification was not rerun.

Next migrate Collapse and the native Accordion documentation as a disclosure
batch, keeping their different JavaScript/native behavior explicit. Capture
before-state evidence before extending the shared API adapters to another topic.

## Disclosure-component MDX authoring

Accordion and Collapse now have authored documentation at
`site/src/content/docs/components/accordion.mdx` and `collapse.mdx`. Eleven of
47 component routes are migrated; 36 retain their structured bodies. Earlier
checkpoint counts describe their original batches. The 59 authored guides,
four overviews and 57 remaining Helpers/Utilities guides are unchanged.

The two disclosure components deliberately retain different behavior:

- Collapse uses the generated JavaScript API. The existing API shortcodes now
  project its parent option, promise-returning methods, lifecycle names and data
  attributes directly from `metadata/api.json`. MDX owns event explanations,
  keyboard guidance and usage prose. Cancelable start events remain distinct
  from completion notifications; original event order is preserved.
- Accordion uses native `details`, `summary`, `name`, `open` and `toggle`.
  Its page advertises no Accordion plugin or Collapse dependency. Native
  exclusive, independent and nested groups retain their existing examples.

`collection-disclosure-docs.ts` and `navigation-disclosure-docs.ts` retain their
executable markup and evaluated Sass/token data. Their migrated prose now comes
from fresh MDX metadata getters. The old inline Accordion behavior explanation
and Collapse lifecycle-description map are removed from the shared renderer.
No framework styles, JavaScript behavior or application handlers were changed.

`metadata/component-disclosure-mdx.json` records this transition and protects
the earlier action policy unchanged. Pre-disclosure source snapshots are used
only by migration tests; production imports no historical source. The older
guards resolve those snapshots without refreshing their original policy hashes.

### Disclosure-component verification, 2026-11-10

- Production website/Pagefind build passed: 197 HTML pages, 196 indexed and
  11,607 indexed words. No-legacy and site-asset mirror checks passed.
- Focused unit/documentation checks: 208 passed across sixteen files, including
  the existing collection/navigation Sass and canonical-markup checks.
- Strict website type-check and final test type-boundary checks passed.
- Eighteen browser cases passed across Chromium, Firefox and WebKit. These
  cover Accordion/Collapse and the existing Button/Alert API projections in
  light/dark, LTR/RTL and desktop/mobile states, source links, copy controls and
  automated accessibility checks. Existing behavior cases retain Collapse
  cancellation, completion, horizontal/multiple targets and nested coordination,
  plus native Accordion exclusive/independent/nested state and toggle events.
- Three additional browser cases passed with every page script blocked,
  confirming Accordion's native keyboard toggling, exclusivity and independent
  panels without a framework JavaScript dependency.
- All six existing homepage/Install screenshot tests passed with unchanged
  baselines and tolerances.
- Six independent before/after full-page Collapse/Accordion screenshots are
  pixel-identical in light, dark and RTL modes, including the global header.
  Report: `artifacts/component-disclosure-visual/pixel-review.json`.
- All 196 existing page bodies and script sets match the captured starting
  state, apart from intentional edit-link normalization. All 593 protected
  inputs match. Report: `artifacts/component-disclosure-mdx-identities.json`.
- The pinned core audit passed unchanged: 131 exact branded modules and six
  approved patched modules; no new core extras or production modifications.

Framework source, generated framework distribution, dependencies, licenses,
notices and release flags are unchanged. Nothing was committed, pushed,
published or deployed. Full monolithic/release qualification was not rerun.

Next migrate Breadcrumb, List group and Pagination documentation, preserving
native navigation/input semantics and keeping application result state separate
from framework CSS. Thirty-six component pages and the 57 Helpers/Utilities
guides remain; this checkpoint does not claim complete website migration.

## Collection-component MDX authoring

Breadcrumb, List group and Pagination now have authored documentation at
`site/src/content/docs/components/breadcrumb.mdx`, `list-group.mdx` and
`pagination.mdx`. Fourteen of 47 component routes are migrated; 33 retain
structured bodies. Earlier checkpoint counts describe their original batches.
The 59 authored guides, four overviews and 57 remaining Helpers/Utilities guides
are unchanged.

MDX owns titles, leads, variant explanations, keyboard guidance, usage prose
and the CSS/native-behavior explanations. `collection-disclosure-docs.ts` still
owns executable markup, evaluated tokens and Sass examples for all four of its
topics, including the already migrated Collapse. Fresh getters project current
metadata; contrast-wrapped detail projections are created per render. List group
and Pagination retain the explicitly disclosed application-level contrast CSS.

None of the three topics gains a JavaScript plugin or generated API table:
Breadcrumb retains real navigation links and decorative dividers; List group
retains native checkboxes/radios and unavailable controls; Pagination retains
real destinations without fetching results or managing application page state.
The existing Windows WebKit native-link keyboard caveat remains documented in
its behavior test, without adding artificial tab stops.

`metadata/component-collection-mdx.json` protects the earlier disclosure policy
unchanged and records this source transition. Pre-collection snapshots are
test-only evidence, never production imports. Earlier policies keep their
original hashes. The historical audit chain now validates each policy once
within a synchronous audit context, then discards the context; independent
audits still see subsequent edits. Regression tests cover nested reuse and
cleanup after failure. No timeout, assertion or screenshot tolerance was loosened.

### Collection-component verification, 2026-11-10

- Production website/Pagefind build passed: 197 HTML pages, 196 indexed and
  11,607 indexed words. No-legacy and site-asset mirror checks passed.
- Focused unit/documentation checks: 217 passed across eighteen files, including
  Sass/canonical-markup validation and the new synchronous audit-context tests.
  A final six-file audit/component regression run also passed (39 tests) after
  formatting the audit helpers. Historical policy hashes remain unchanged.
- Strict website type-check and final test type-boundary checks passed.
- Thirty browser cases passed across Chromium, Firefox and WebKit: nine
  authored-page/engine cases cover light/dark, LTR/RTL and desktop/mobile states,
  source links, example copy controls and automated accessibility checks; nine
  additional cases exercise native navigation/inputs with every page script
  blocked. Twelve existing behavior cases cover Breadcrumb masks/keyboard
  navigation, List group container queries/inputs/disabled controls, Pagination
  sizes/destinations and Collapse cancellation/coordination.
- All six existing homepage/Install screenshot tests passed with unchanged
  baselines and tolerances.
- Nine independent before/after comparisons have pixel-identical component
  content below the unchanged 64px global header; seven whole pages match too.
  The two remaining differences are confined to header-text pixels: 24 pixels
  with a maximum channel delta of 1/255, and 12 pixels with a maximum delta of
  2/255. No before image was replaced and no content tolerance was added.
  Report: `artifacts/component-collection-visual/pixel-review.json`.
- All 196 existing page bodies and script sets match the captured starting
  state, apart from intentional edit-link normalization. All 598 protected
  inputs match. Report: `artifacts/component-collection-mdx-identities.json`.
- The pinned core audit passed unchanged: 131 exact branded modules and six
  approved patched modules, with no new core extras or production modifications.

Framework source, framework distribution, dependencies, notices/licenses and
release flags are unchanged. Nothing was committed, pushed, published or
deployed. Full monolithic/release qualification was not rerun.

Next migrate Button group, Close button and Nav documentation, preserving their
CSS/native behavior and explicitly disclosed Menu/Alert integration. Thirty-three
component pages and the 57 Helpers/Utilities guides remain; this is not a claim
of complete website migration.

## Navigation-component MDX authoring

Button group, Close button and Nav now have authored documentation at
`site/src/content/docs/components/button-group.mdx`, `close-button.mdx` and
`nav.mdx`. Seventeen of 47 component routes are migrated; 30 retain structured
bodies. Earlier checkpoint counts describe their original batches. The 59
authored guides, four overviews and 57 remaining Helpers/Utilities guides are
unchanged.

MDX owns titles, leads, variant explanations, keyboard guidance, usage prose and
CSS/native-behavior explanations. `navigation-disclosure-docs.ts` retains live
executable examples, evaluated token defaults and Sass samples for its four
topics, including native Accordion. `component-reference.ts` now projects the
three former extra intro strings through fresh MDX narrative getters. Sidebar,
search, overview and page consumers use current metadata; prose is not duplicated
in the old renderer or TypeScript detail records.

The existing behavior boundaries remain explicit:

- Button group CSS supplies joining, sizing and layout, not an editor, roving
  focus or a group-selection plugin. Checkboxes and radios remain native;
  the nested Menu example requires Menu JavaScript.
- The Close button is an empty, named native button with a CSS mask. It has no
  action on its own. The dismissible example uses Alert JavaScript, with focus
  recovery left to application code; native disabled is preserved.
- Nav links use ordinary navigation semantics and `aria-current`, not tab roles.
  The Menu example requires Menu JavaScript; dynamic panel switching belongs to
  the separate Tab plugin.

No invented plugin API tables or group token map were added. Close button's
fixed-layout token table is preserved; Button group still has no independent
CSS-variable table. Existing core runtime loading and integration examples are
unchanged.

`metadata/component-navigation-mdx.json` protects the earlier collection policy
unchanged and records this transition. Historical source snapshots remain
test-only evidence. Prior audit guards resolve the new source transition without
refreshing historical hashes. Filename comparisons sort the completed filenames,
including the `.mdx` suffix, so `button-group.mdx` and `button.mdx` are compared
in filesystem order. No timeout or screenshot tolerance was changed.

### Navigation-component verification, 2026-11-10

- Production website/Pagefind build passed: 197 HTML pages, 196 indexed and
  11,607 indexed words. No-legacy and site-asset mirror checks passed.
- Focused unit/documentation checks: 225 passed across nineteen files, including
  Sass/canonical-markup checks, metadata freshness and earlier migration guards.
- Strict website type-check and test type-boundary checks passed.
- Thirty browser cases passed across Chromium, Firefox and WebKit. Nine authored
  page/engine cases cover light/dark, LTR/RTL, desktop/mobile, source links,
  token-table layout, example copy controls and automated accessibility checks.
  Nine script-blocked cases confirm native input/navigation behavior and that
  Menu opening/Alert dismissal require their disclosed plugins. Twelve existing
  behavior cases cover group sizing/native selection, close masks/disabled and
  cancelable Alert dismissal, Menu focus/Escape/positioning and native Accordion.
- All six existing homepage/Install screenshot tests passed with unchanged
  baselines and tolerances.
- Nine independent before/after comparisons have pixel-identical component
  content below the unchanged 64px global header; five whole pages match too.
  The four remaining differences are confined to header-text pixels: 24, 22,
  24 and 13 pixels, with maximum channel deltas of 1, 2, 1 and 2 out of 255.
  No before image was replaced and no content tolerance was added.
  Report: `artifacts/component-navigation-visual/pixel-review.json`.
- All 196 existing page bodies and script sets match the captured starting
  state, apart from intentional edit-link normalization. All 602 protected
  inputs match. Report: `artifacts/component-navigation-mdx-identities.json`.
- The pinned core audit passed unchanged: 131 exact branded modules and six
  approved patched modules, with no new core extras or production modifications.

Framework source, framework distribution, dependencies, notices/licenses and
release flags are unchanged. Nothing was committed, pushed, published or
deployed. Full monolithic/release qualification was not rerun.

Next migrate Menu and Tab documentation, retaining their actual option defaults,
event semantics, dependencies and keyboard behavior. Thirty component pages and
the 57 Helpers/Utilities guides remain; this checkpoint is not complete website
migration or release approval.

## Menu and Tab MDX authoring

Menu and Tab now have authored documentation at
`site/src/content/docs/components/menu.mdx` and `tab.mdx`. Nineteen of 47
component routes are migrated; 28 retain structured bodies. Earlier checkpoint
counts describe their original batches. The 59 authored guides, four overviews
and 57 remaining Helpers/Utilities guides are unchanged.

MDX owns leads, variant explanations, keyboard guidance, usage prose and event
descriptions. `selection-feedback-docs.ts` retains executable examples, evaluated
tokens and Sass samples for Menu/Tab and the unchanged Toast/Scrollspy pages.
Fresh metadata getters feed existing detail and navigation consumers.

The shared API adapter now accepts Menu and Tab alongside Alert, Button and
Collapse. Options, methods, event names, data attributes and import/instance
samples still come from generated metadata. The existing table shape and order
are retained: this migration does not invent option defaults or configuration
entries absent from the generated inventory. Existing default-behavior guidance
remains in the authored prose.

Menu keeps its Floating UI dependency, cancellation gates, click policies,
logical submenu keys and focus return. Tab keeps cancellation/event ordering,
disabled-trigger skipping, roving focus and DOM-order arrows, including in RTL.
Its `click`, `keydown` and `load` names remain explicitly described as internal
listeners, not dispatched plugin lifecycle events. All generated event names
remain visible in their existing order. New undescribed events fail explicitly.

The eight Menu/Tab lifecycle descriptions are removed from the shared renderer;
Toast and Scrollspy descriptions and their application/runtime wiring remain
unchanged. `metadata/component-interaction-mdx.json` records the transition and
protects the earlier navigation policy unchanged. Pre-interaction snapshots are
test-only evidence, never production imports. Earlier policy hashes, timeouts,
screenshot baselines and tolerances are not refreshed.

### Menu/Tab verification, 2026-11-10

- Production website/Pagefind build passed: 197 HTML pages, 196 indexed and
  11,607 indexed words. No-legacy and site-asset mirror checks passed.
- Focused unit/documentation checks: 248 passed across twenty-one files,
  including selection Sass/canonical-markup checks, live API projections,
  metadata freshness and earlier migration guards.
- Strict website type-check and test type-boundary checks passed.
- Eighteen browser cases passed across Chromium, Firefox and WebKit. Six
  authored-page/engine cases cover light/dark, LTR/RTL, desktop/mobile, source
  links, API tables, example copy controls and automated accessibility checks.
  Six script-blocked cases confirm Menu opening and Tab activation require
  their plugins. Six existing behavior cases cover Menu cancellation, enabled
  item navigation, submenu direction, auto-close policies, form content and
  placement, plus Tab relationships, cancellation/event order, disabled skips
  and DOM-order arrows in RTL.
- All six existing homepage/Install screenshot tests passed with unchanged
  baselines and tolerances.
- Six independent before/after comparisons have pixel-identical component
  content below the unchanged 64px global header; four whole pages match too.
  The two remaining differences are confined to header text: 13 and 22 pixels,
  both with a maximum channel delta of 2/255. No before image was replaced and
  no content tolerance was added. Report:
  `artifacts/component-interaction-visual/pixel-review.json`.
- All 196 existing page bodies and script sets match the captured starting
  state, apart from intentional edit-link normalization. All 606 protected
  inputs match. Report: `artifacts/component-interaction-mdx-identities.json`.
- The pinned core audit passed unchanged: 131 exact branded modules and six
  approved patched modules, with no new core extras or production modifications.

Framework source, framework distribution, dependencies, notices/licenses and
release flags are unchanged. Nothing was committed, pushed, published or
deployed. Full monolithic/release qualification was not rerun.

Next migrate Toast and Scrollspy documentation, retaining explicit Toast
initialization/application wiring and Scrollspy's actual scrolling/focus/event
behavior. Twenty-eight component pages and the 57 Helpers/Utilities guides
remain; this checkpoint is not complete website migration or release approval.

## Toast and Scrollspy MDX authoring

Toast and Scrollspy now have authored documentation at
`site/src/content/docs/components/toast.mdx` and `scrollspy.mdx`. The existing
`toasts.mdx` route imports the canonical Toast body rather than maintaining a
second narrative. This batch migrates two implementations and three existing
documentation routes, bringing the total to 22 of 47; 25 retain structured
bodies. Earlier counts describe their original checkpoints. The 59 authored
guides, four overviews and 57 remaining Helpers/Utilities guides are unchanged.

MDX owns leads, variant explanations, keyboard/usage guidance and event
descriptions. `selection-feedback-docs.ts` retains shared executable samples,
evaluated token defaults, Sass examples and `toastDemoJavascript`. Its four
topics now project prose from MDX. The shared API adapter adds the two canonical
names, not a duplicate Toasts implementation; options, methods, event names and
imports remain generated data.

Toast still shows the explicit application setup, including the documentation-only
`data-docs-toast-show` hook. Its inline page handler remains unchanged after page
pagination, including on the alias route. Dismissal hides without removing the
node or restoring focus automatically. The authored attribute explanation still
warns that there is no automatic show-toggle attribute, despite the scanner's
inventory entry. Only one canonical Toast narrative owns variant/event guidance;
alias metadata contains its title, description and implementation mapping.

Scrollspy still documents its reused Nav variables, real scrolling roots,
activation notifications, optional smooth hash/focus behavior and explicit
refresh. Its `data-trm-toggle` scanner entry remains visible but explicitly is
not an initialization hook. Internal Toast focus/mouse listeners and Scrollspy
click/resize/scroll listeners remain distinguished from dispatched notifications.
No dedicated Scrollspy Sass partial or token map was invented.

The remaining feedback descriptions and special prose are removed from the
structured renderer. `metadata/component-feedback-mdx.json` records this
transition and protects the previous interaction policy unchanged. Before-state
snapshots are test-only evidence, never production imports. Earlier hashes,
timeouts, screenshot baselines and tolerances are not refreshed.

### Toast/Scrollspy verification, 2026-11-10

- Production website/Pagefind build passed: 197 HTML pages, 196 indexed and
  11,607 indexed words. No-legacy and site-asset mirror checks passed.
- Focused unit/documentation checks: 257 passed across twenty-two files,
  including feedback Sass/canonical-markup checks, alias sharing, live API
  projections, metadata freshness and earlier migration guards.
- Strict website type-check and final test type-boundary checks passed.
- Final browser run: 45 passed across Chromium, Firefox and WebKit. Nine
  content/API/source/copy cases and eighteen independent theme cases cover
  all three routes in all eight light/dark, LTR/RTL and desktop/mobile states.
  Nine script-blocked cases verify plugin boundaries, three alias cases verify
  explicit show/cancellation/non-removing dismissal, and six existing cases
  retain Toast autohide/hover/focus behavior and Scrollspy roots, smooth
  hash/focus, nested activation, refresh and passive-focus behavior.
- The first combined Firefox Scrollspy case exceeded the existing 30-second
  limit. Content/copy and per-theme accessibility checks were separated into
  bounded cases; every original state/assertion and the timeout limit remain.
  The final full 45-case run passed without retries or increased timeouts.
- All six existing homepage/Install screenshot tests passed with unchanged
  baselines and tolerances.
- Nine independent before/after comparisons have pixel-identical component
  content below the unchanged 64px global header; six whole pages match too.
  The three remaining differences are confined to header text: 13, 12 and 13
  pixels, each with maximum channel delta 2/255. No before image was replaced
  and no content tolerance was added. Report:
  `artifacts/component-feedback-visual/pixel-review.json`.
- All 196 existing page bodies and script sets match the captured starting
  state, apart from intentional edit-link normalization. All 609 protected
  inputs match. Report: `artifacts/component-feedback-mdx-identities.json`.
- The pinned core audit passed unchanged: 131 exact branded modules and six
  approved patched modules, with no new core extras or production modifications.

Framework source, framework distribution, dependencies, notices/licenses and
release flags are unchanged. Nothing was committed, pushed, published or
deployed. Full monolithic/release qualification was not rerun.

Next migrate Dialog and Drawer documentation, preserving native dialog behavior,
focus/scroll policy, lifecycle cancellation and existing sheet compositions.
Twenty-five component routes and the 57 Helpers/Utilities guides remain; this
checkpoint is not complete website migration or release approval.

## Dialog, Drawer and Bottom Sheet MDX authoring

Dialog and Drawer now have authored documentation at
`site/src/content/docs/components/dialog.mdx` and `drawer.mdx`. The existing
`bottom-sheet.mdx` composition is migrated alongside them. This brings the total
to 25 of 47 component routes; 22 retain structured bodies. Earlier counts refer
to their original checkpoints. The 59 authored guides, four overviews and 57
remaining Helpers/Utilities guides are unchanged.

MDX owns leads, variant explanations, keyboard/usage guidance and canonical
event descriptions. `overlay-component-docs.ts` and `sheet-command-docs.ts`
retain executable markup, evaluated token defaults and Sass examples. Bottom
Sheet's displayed intro is projected through its own MDX metadata; its focus
handler remains a live shared application sample.

The API adapter adds Dialog and Drawer as canonical plugins. Bottom Sheet is an
explicit Drawer composition: it shares the same generated definition, options,
methods and event prose, while preserving its own examples and `#actions`
selector. It does not add a BottomSheet plugin or duplicate Drawer event
descriptions. Its named, copyable initial-focus handler and original executable
script position after pagination are unchanged. Drawer retains the disclosed
demo contrast CSS; Dialog and Bottom Sheet do not acquire that customization.

Dialog's cancel notification remains distinct from the cancelable hide gate.
Static rejection/hidePrevented and Drawer's internal resize listener retain
their existing descriptions. Native `dialog` markup, modal/inert behavior,
scroll locking, data-API focus return and explicit programmatic focus policy
remain unchanged. Options retain the generated table format and existing prose;
this batch does not invent missing defaults or configuration entries.

`metadata/component-overlay-mdx.json` records the transition and protects the
previous feedback policy unchanged. The first migrations of the overlay/sheet
data modules now resolve through pre-overlay snapshots in historical audits,
after older migrations' source adapters. Earlier evidence and hashes are not
refreshed. The MDX renderer's automatic apostrophe substitution was corrected
with an explicit literal so Bottom Sheet's rendered text stays identical.
The older sheet copy/execution test now follows the MDX shortcode plus unchanged
page handler; neither assertion is dropped.

### Dialog/Drawer/Bottom Sheet verification, 2026-11-10

- Production website/Pagefind build passed: 197 HTML pages, 196 indexed pages
  and 11,607 indexed words. No-legacy and site-asset mirror checks passed.
- Focused unit/documentation checks passed: 292 tests across twenty-five files.
  Strict website type-check and final test type-boundary checks also passed.
- Browser checks passed across Chromium, Firefox and WebKit: 51 main cases,
  plus three focused nested-tooltip cases. These retain content/API/source/copy
  checks, all eight theme/direction/viewport states per route, script-blocked
  plugin boundaries, lifecycle vetoes, native modality, scrolling, focus return,
  sheet examples and disposal. The extra cases retain tooltip sanitization and
  Escape ordering inside Dialog. Timeouts and assertions were not relaxed.
- All six existing homepage/Install screenshot tests passed without updating
  baselines or tolerances.
- All nine independent before/after comparisons have pixel-identical component
  content below the unchanged 64px global header. Seven whole pages match;
  Dialog RTL and Bottom Sheet dark differ only in 22 and 13 header text pixels,
  respectively, with maximum channel delta 2/255. Before images were not
  replaced. Report: `artifacts/component-overlay-visual/pixel-review.json`.
- All 196 existing page bodies and script sets match the captured starting
  state after intentional edit-link normalization. All 613 protected inputs
  match. Report: `artifacts/component-overlay-mdx-identities.json`.
- The pinned core audit passed unchanged: 131 exact branded modules and six
  approved patched modules, with no core extras or production modifications.

Framework source, framework distribution, dependencies, notices/licenses and
release flags are unchanged in this batch. Nothing was committed, pushed,
published or deployed. Full monolithic/release qualification was not rerun.

Next migrate Tooltip and Popover documentation, preserving Floating UI behavior,
sanitization, trigger semantics and native-dialog top-layer handling. Twenty-two
component routes and 57 Helpers/Utilities guides remain; this checkpoint is not
complete website migration or release approval.

## Tooltip and Popover MDX authoring

Tooltip and Popover now have authored bodies at
`site/src/content/docs/components/tooltip.mdx` and `popover.mdx`. This brings
the current total to 27 of 47 component routes; 20 retain structured bodies.
Earlier counts refer to their original checkpoints. The 59 authored guides,
four overviews and 57 remaining Helpers/Utilities guides are unchanged.

MDX owns leads, variant explanations, keyboard/usage guidance and each plugin's
event descriptions. `overlay-component-docs.ts` keeps executable examples,
evaluated token defaults and Sass samples live through the shared narrative
adapter. Both routes use the existing generated API through shared shortcodes;
the API adapter now supports eleven canonical plugin names. The original
lazy-initialization paragraph is preserved, rather than implying that loading
the bundle alone guarantees first-interaction initialization. Existing site
initialization and all page scripts remain in their original positions.

Tooltip retains hover/focus triggers, supplemental descriptions and Escape
without focus movement. Popover retains default click behavior, separately
authored focus dismissal and no promise of a focus trap or automatic expanded
state. Both keep Floating UI positioning, responsive placement, named disabled
wrappers, sanitized HTML examples and explicit local theme containers. Neither
route gains demo contrast CSS or changes core security configuration. Generated
tips retain native-dialog top-layer placement and first-Escape handling.

The remaining inline tooltip/popover event-description map and unreachable
structured-renderer introduction branch are removed after their prose moves
into MDX. `metadata/component-floating-mdx.json` preserves the previous overlay
policy unchanged and records pre-migration source/expectation snapshots.
Earlier guards resolve transitioned files through these historical snapshots,
without refreshing any prior evidence or source hashes.

### Tooltip/Popover verification, 2026-11-10

- Production website/Pagefind build passed, preserving 197 HTML pages and
  196 indexed pages. No-legacy and site-asset mirror checks passed.
- Focused unit/documentation checks passed: 300 tests across twenty-six files.
  The final documentation/ownership recheck passed another 41 tests across four
  of those files. Strict website type-check and test type-boundary checks passed.
- All 30 browser cases passed across Chromium, Firefox and WebKit. Six
  content/API/source/copy cases and twelve theme cases cover both routes in
  all eight light/dark, LTR/RTL and desktop/mobile states. Six script-blocked
  cases retain plugin boundaries; six existing interaction cases retain first
  focus, lifecycle cancellation, sanitized HTML, native-dialog Escape ordering,
  click versus focus dismissal, mobile geometry and generated-output cleanup.
- All six existing homepage/Install screenshot tests passed, with unchanged
  baselines, tolerances and timeouts.
- All six independent before/after comparisons have pixel-identical component
  content below the unchanged 64px global header. Three whole pages match;
  Tooltip light, Popover dark and Popover RTL differ only in 12, 13 and 22
  header-text pixels, respectively, with maximum channel delta 2/255. No before
  image was replaced. Report:
  `artifacts/component-floating-visual/pixel-review.json`.
- All 196 existing page bodies and script sets match the captured starting
  state after intentional edit-link normalization. All 619 protected inputs
  match. Report: `artifacts/component-floating-mdx-identities.json`.
- The pinned core audit passed unchanged: 131 exact branded modules and six
  approved patched modules, with no core extras or production modifications.

Framework source, framework distribution, dependencies, notices/licenses and
release flags are unchanged in this batch. Nothing was committed, pushed,
published or deployed. Full monolithic/release qualification was not rerun.

Next migrate Navbar, Nav Overflow and Toggler documentation while preserving
CSS/native navigation, responsive Drawer integration, overflow identity and
target-owned toggle configuration. Twenty component routes and 57
Helpers/Utilities guides remain; this checkpoint is not complete website
migration or release approval.

## Navbar, Nav Overflow and Toggler MDX authoring

Navbar, Nav Overflow and Toggler now have authored bodies at
`site/src/content/docs/components/navbar.mdx`, `nav-overflow.mdx` and
`toggler.mdx`. The current total is 30 of 47 component routes; 17 retain
structured bodies. Earlier counts refer to their original checkpoints.
The 59 authored guides, four overviews and 57 remaining Helpers/Utilities
guides are unchanged.

MDX owns leads, variant explanations, keyboard/usage guidance and canonical
event descriptions. `adaptive-navigation-docs.ts` retains executable examples,
evaluated token defaults, Sass samples, source-verified Toggler option rows and
the Navbar application focus handler. Typed details and intro adapters read
fresh MDX metadata. `strictControlIntros` shares the Nav Overflow lead rather
than retaining a second prose copy. Existing API-reference pages read the same
fresh adaptive event prose through the original exported map's getters.

Navbar remains CSS/container-query navigation, not a new JavaScript plugin.
Its copyable application focus handler remains byte-identical and executes in
the original position after component pagination. The existing balanced Navbar
token columns remain. Responsive modal behavior belongs to Drawer, including
the authored initial focus and visible-opener return policy.

The shared API adapter now supports thirteen canonical plugins. Nav Overflow
maps filename-derived `.trm.nav-overflow` catalog keys to actual
`.trm.navoverflow` display keys without changing generated metadata. Authored
prose still distinguishes synchronous explicit update/overflow notifications
from the internal resize listener. Its Menu integration, cloned identities,
relocated live nodes and approved accessibility/security patches are unchanged.

Toggler keeps the target selector and explicit `instance.toggle()` sample,
cancelable start, synchronous no-op notifications and lack of disclosure/focus
policy. The small `TogglerOptions.astro` shortcode renders existing source-
verified rows; MDX explains the scanner omission rather than changing the
generated empty option list or inventing defaults. Attribute guidance continues
to distinguish target configuration from launcher hooks. Neither navigation
page acquires unrelated demo contrast CSS.

Retired inline rendering branches for these migrated pages are removed from
the structured component route. `metadata/component-adaptive-mdx.json` records
the change and pre-migration evidence, protecting the previous floating policy
unchanged. Historical adapters preserve earlier source records, including the
first migrations of the adaptive and strict-control data modules. No previous
policy or captured starting evidence is refreshed.

### Navbar/Nav Overflow/Toggler verification, 2026-11-10

- Production website/Pagefind build passed: 197 HTML pages, 196 indexed pages
  and 11,607 indexed words. No-legacy and site-asset mirror checks passed.
- Focused unit/documentation checks passed: 325 tests across twenty-eight files.
  The final documentation/ownership recheck passed another 45 tests across four
  of those files. Strict website type-check and test type-boundary checks passed.
- All 48 browser cases passed across Chromium, Firefox and WebKit: nine
  content/API/source/copy cases, eighteen theme cases covering all eight
  theme/direction/viewport states per route, nine script-blocked cases and twelve
  existing interaction cases. These retain container-width expansion, Drawer
  modality/focus/Escape, explicit update versus ResizeObserver notifications,
  Menu keyboard entry, relocated live state, clone-reference remapping, target
  vetoes, multi-target mutations, disabled fieldsets and no-op notifications.
- All six existing homepage/Install screenshot tests passed, with unchanged
  baselines, tolerances and timeouts.
- All nine independent before/after comparisons have pixel-identical component
  content below the unchanged 64px global header. Eight whole pages match;
  Navbar light differs only in 12 header-text pixels, with maximum channel
  delta 2/255. No before image was replaced. Report:
  `artifacts/component-adaptive-visual/pixel-review.json`.
- All 196 existing page bodies and script sets match the captured starting
  state after intentional edit-link normalization. All 623 protected inputs
  match. Report: `artifacts/component-adaptive-mdx-identities.json`.
- The pinned core audit passed unchanged: 131 exact branded modules and six
  approved patched modules, with no core extras or production modifications.

Framework source, framework distribution, dependencies, notices/licenses and
release flags are unchanged in this batch. Nothing was committed, pushed,
published or deployed. Full monolithic/release qualification was not rerun.

Next migrate Carousel and Stepper documentation, preserving existing media
controls, accessibility guidance and the distinction between plugin behavior
and native/application-owned state. Seventeen component routes and 57
Helpers/Utilities guides remain; this checkpoint is not complete website
migration or release approval.

## Carousel and Stepper MDX authoring

Carousel and Stepper now have authored bodies at
`site/src/content/docs/components/carousel.mdx` and `stepper.mdx`. The current
total is 32 of 47 component routes; 15 retain structured bodies. Earlier counts
refer to their original checkpoints. The 59 authored guides, four overviews
and 57 remaining Helpers/Utilities guides are unchanged.

MDX owns leads, variant explanations, keyboard/usage guidance and the existing
Carousel event explanations. `progress-media-docs.ts` retains executable
examples, evaluated token defaults and copyable Sass samples through the shared
narrative adapter. The component route itself is unchanged; its existing MDX
selection handles these pages without extra branches or replacement scripts.

Carousel uses the shared API renderer, bringing canonical API adapters to
fourteen. Generated definitions, option types, methods, event inventory,
attributes, individual import and `#demo-carousel` selector remain live and
unchanged. The previous conservative event explanations are retained; this
ownership migration does not reclassify catalog listener keys or claim they
are all dispatched lifecycle notifications.

Carousel examples retain native scroll-snap geometry, named masked-icon
controls, indicators, fade and multi-item variants, document-direction keyboard
handling and explicit paused motion. The play/pause example still begins with
autoplay disabled; it does not acquire a silent startup timer. Active tracking
and keyboard behavior still require initialization as documented. Existing
native scrolling remains distinct from plugin-owned active state.

Stepper remains CSS presentation with an ordered list, active completed/current
items, one authored `aria-current="step"`, visible status text, container-based
horizontal layout and a focusable overflow region. It has no new plugin,
automatic validation, roving focus or wizard transition controller. Inverse
theme composition and larger Carousel indicator targets remain explicit
example choices; neither page gains unrelated demo contrast CSS.

`metadata/component-media-mdx.json` records the change and pre-migration
evidence, protecting the preceding adaptive policy unchanged. Earlier audits
resolve transitioned inputs through historical snapshots, including the first
migration of the progress/media module. Previous evidence is not refreshed.

### Carousel/Stepper verification, 2026-11-11

- Production website/Pagefind build passed, preserving 197 HTML pages and
  196 indexed pages. No-legacy and site-asset mirror checks passed.
- Focused unit/documentation checks passed: 342 tests across thirty files.
  The final documentation/ownership recheck passed another 41 tests across four
  of those files. Strict website type-check and test type-boundary checks passed.
- All 54 browser cases passed across Chromium, Firefox and WebKit: six
  content/API/source/copy cases, twelve theme cases covering all eight
  theme/direction/viewport states per route, six script-boundary cases and
  thirty existing media/progress cases. These retain Stepper counters, current
  status, container-based layout and focusable overflow, plus Carousel masked
  controls, real scrolling, directional arrows, indicators, fade, multi-item
  geometry and the real six-second Play/Pause cycle. Script-blocked checks retain
  native CSS/scroll behavior without implying plugin-owned active tracking or
  an automatic wizard controller.
- All six existing homepage/Install screenshot tests passed, with unchanged
  baselines, tolerances and timeouts.
- All six independent before/after comparisons have pixel-identical component
  content below the unchanged 64px global header. Five whole pages match;
  Stepper RTL differs only in 22 header-text pixels, with maximum channel delta
  2/255. No before image was replaced. Report:
  `artifacts/component-media-visual/pixel-review.json`.
- All 196 existing page bodies and script sets match the captured starting
  state after intentional edit-link normalization. All 631 protected inputs
  match. Report: `artifacts/component-media-mdx-identities.json`.
- The pinned core audit passed unchanged: 131 exact branded modules and six
  approved patched modules, with no core extras or production modifications.

Framework source, framework distribution, dependencies, notices/licenses and
release flags are unchanged in this batch. Nothing was committed, pushed,
published or deployed. Full monolithic/release qualification was not rerun.

Next migrate Chips and Combobox documentation, preserving selection, keyboard
and focus behavior, source-verified option defaults, sanitization and explicit
application submission boundaries. Fifteen component routes and 57
Helpers/Utilities guides remain; this checkpoint is not complete website
migration or release approval.

## Chips and Combobox MDX authoring

Chips and Combobox now have authored bodies at
`site/src/content/docs/components/chips.mdx` and `combobox.mdx`. The current
total is 34 of 47 component routes; 13 retain structured bodies. Earlier counts
refer to their original checkpoints. The 59 authored guides, four overviews
and 57 remaining Helpers/Utilities guides are unchanged.

MDX owns leads, variant explanations, keyboard/usage guidance and lifecycle
explanations. The typed choice module retains escaped executable examples,
evaluated Sass/token data, source-verified option rows, specialized module
samples, demo CSS and the Chips submission handler. The option table is rendered
by the small `ChoiceOptions.astro` shortcode; it does not copy or invent defaults
in the generated catalog. The shared API adapter now supports sixteen canonical
plugins and retains the original specialized choice-widget JavaScript samples.

`choiceEvents` retains its existing exported keys as fresh MDX-backed getters,
so API-reference pages share canonical event prose rather than a second copy.
The Chips intro shim also reads the authored narrative. Obsolete choice-widget
branches are removed from the structured component renderer while other
application option tables and plugin branches remain unchanged.

Both pages preserve the explicit copyable accessibility CSS. Chips additionally
retains its separate, disclosed demo contrast customization; Combobox does not
acquire it. Chips still has no automatic submitted array or live announcements.
Its copyable JSON/status application handler remains byte-identical and executes
in the original script position after pagination. The literal apostrophe in
the submission callout is authored explicitly to avoid typography substitution.

Chips retains case-sensitive duplicates, limits, real focus/selection, physical
RTL arrow order, remove vetoes and the distinct clear path. Approved icon
sanitization and duplicate-order behavior are unchanged. Combobox retains the
adjacent Menu, authored search/listbox/options, real option focus, local filtering,
normalization, disabled matching and comma-separated multiple submission. Its
shown/hidden notifications remain distinct from settled Menu transitions, and
change remains a post-mutation notification rather than an undo gate.

`metadata/component-choice-mdx.json` records current inputs and pre-migration
evidence, protecting the media policy unchanged. The earlier Forms audit now
resolves the transitioned choice module through its pre-choice snapshot, after
the existing presentation adapter. Historical Forms policy/evidence is not
refreshed. The older submission copy/execution test follows the named MDX Code
shortcode and shared renderer while retaining its original executable-script
assertion; it is not removed or reduced to a prose-only check.

### Chips/Combobox verification, 2026-11-11

- Production website/Pagefind build passed: 197 HTML pages, 196 indexed pages
  and 11,607 indexed words. No-legacy and site-asset mirror checks passed.
- Focused unit/documentation checks passed: 360 tests across thirty-two files.
  The final documentation/ownership recheck passed another 42 tests across four
  of those files. Strict website type-check and test type-boundary checks passed.
- All 42 browser cases passed across Chromium, Firefox and WebKit: six
  content/API/source/copy cases, twelve theme cases covering all eight
  theme/direction/viewport states per component route, six script-boundary cases
  and eighteen existing interaction cases. These retain chip selection/focus,
  physical RTL order, limits, duplicates, copied arrays, cancellation, clear and
  JSON submission, plus Combobox real option focus, filtering, preselection,
  disabled/no-results states, comma-separated multiple values and the
  distinction between immediate widget notifications and Menu completion.
- All six existing homepage/Install screenshot tests passed, with unchanged
  baselines, tolerances and timeouts.
- All six independent before/after comparisons have pixel-identical component
  content below the unchanged 64px global header. Five whole pages match;
  Chips dark differs only in 13 header-text pixels, with maximum channel delta
  2/255. No before image was replaced. Report:
  `artifacts/component-choice-visual/pixel-review.json`.
- All 196 existing page bodies and script sets match the captured starting
  state after intentional edit-link normalization. All 632 protected inputs
  match. Report: `artifacts/component-choice-mdx-identities.json`.
- The pinned core audit passed unchanged: 131 exact branded modules and six
  approved patched modules, with no core extras or production modifications.

Framework source, framework distribution, dependencies, notices/licenses and
release flags are unchanged in this batch. Nothing was committed, pushed,
published or deployed. Full monolithic/release qualification was not rerun.

Next migrate Datepicker, OTP Input, Range and Strength documentation, preserving
native form values, enhanced input behavior, source-verified options, explicit
application setup and the existing calendar/CSP boundaries. Thirteen component
routes and 57 Helpers/Utilities guides remain; this checkpoint is not complete
website migration or release approval.

## Datepicker, OTP Input, Range and Strength MDX authoring

The four enhanced input routes now have authored bodies at
`site/src/content/docs/components/datepicker.mdx`, `otp-input.mdx`, `range.mdx`
and `strength.mdx`. The current total is 38 of 47 component routes; nine retain
structured bodies. Earlier counts refer to their original checkpoints. The
59 authored guides, four overviews and 57 remaining Helpers/Utilities guides
are unchanged.

MDX owns leads, variant explanations, keyboard/usage guidance, event prose and
the existing listener/runtime-casing disclosures. Typed data keeps escaped
executable examples, evaluated Sass/token data, source-verified option rows,
specialized module samples, calendar layout CSS and the copied demo module.
`AdvancedOptions.astro` renders the existing option rows, without changing the
generated catalog or inventing defaults.

The shared API renderer now covers all twenty core JavaScript plugin topics;
the optional Command Palette is not included in that count. OTP event display
maps the frozen `.trm.otp-input` inventory to the real `.trm.otpInput` keys.
The three Datepicker internal listener entries remain explicitly distinguished
from dispatched lifecycle notifications. The original `advancedEvents` export
now reads fresh canonical MDX explanations so API-reference pages share prose.
Specialized widget import/usage samples and native value ownership remain.

Datepicker retains its explicit layout CSS, disclosed contrast customization,
Calendar Pro integration, mandatory HTML sanitizer and same-origin arrow asset.
Inline successful fields stay outside the calendar render root; the existing
application handler maintains them after calendar clicks. Typed input edits,
programmatic selected dates and displayed locale text are still distinct.
No CSP, Trusted Types policy, dependency, calendar asset or core option changes
are part of the migration.

OTP remains one labelled native field plus decorative generated slots; masking
does not remove or secure its value. Native readonly/disabled and documented
physical RTL limitations remain. Range keeps native bounds/step/submission and
separate decorative bubble/tick behavior. Strength remains advisory feedback,
with level-change notifications and redacted password payloads, not a numeric
ARIA meter, validation controller or authentication policy.

The displayed demo module is unchanged for Datepicker, Range and Strength, and
executes through the same private module remapping in its original position
after pagination. OTP does not acquire that application module. Retired inline
branches are removed from the structured renderer. Earlier copy/execution tests
now follow the MDX Code shortcode and unchanged module script; the prior choice
CSS and runtime-name checks follow their real current owners rather than stale
root-renderer literals.

`metadata/component-advanced-mdx.json` records current inputs and pre-migration
evidence, protecting the preceding choice policy unchanged. The Forms audit
resolves this transitioned input module through its pre-advanced snapshot after
earlier adapters. No prior policy or captured starting evidence is refreshed.

### Enhanced input verification, 2026-11-11

- Production website/Pagefind build passed, preserving 197 HTML pages and
  196 indexed pages. No-legacy and site-asset mirror checks passed.
- Focused unit/documentation checks passed: 400 tests across thirty-six files,
  including calendar behavior/security tests and the earlier MDX migration
  audits. The final documentation/ownership recheck passed another 49 tests
  across four of those files. Strict website type-check and final test
  type-boundary checks passed.
- All 81 browser cases passed across Chromium, Firefox and WebKit: twelve
  content/API/source/copy cases, thirty accessibility cases covering all eight
  theme/direction/viewport states per component route, twelve script-boundary
  cases and twenty-seven existing interaction cases. Datepicker accessibility
  is split by direction to keep cases bounded; all states/assertions and the
  existing timeout remain. Tests retain calendar selection/copies, typed/API
  distinctions, inline successful fields, cancellation, bounds and real scroll
  owners; OTP filtering, completion, native state and disposal; Range keyboard,
  formatter, update notifications and FormData; and Strength level changes,
  redacted payloads, custom scoring and advisory DOM.
- All six existing homepage/Install screenshot tests passed, with unchanged
  baselines, tolerances and timeouts.
- All twelve independent before/after comparisons have pixel-identical
  component content below the unchanged 64px global header. Eleven whole pages
  match; Strength light differs only in 12 header-text pixels, with maximum
  channel delta 2/255. No before image was replaced. Report:
  `artifacts/component-advanced-visual/pixel-review.json`.
- All 196 existing page bodies and script sets match the captured starting
  state after intentional edit-link normalization. All 636 protected inputs
  match. Report: `artifacts/component-advanced-mdx-identities.json`.
- The pinned core audit passed unchanged: 131 exact branded modules and six
  approved patched modules, with no core extras or production modifications.

Framework source, framework distribution, dependencies, notices/licenses and
release flags are unchanged in this batch. Nothing was committed, pushed,
published or deployed. Full monolithic/release qualification was not rerun.

Next migrate Chip, Table and Data Table documentation, preserving native/CSS
semantics, disclosed application handlers and the optional Data Table boundary.
Nine component routes and 57 Helpers/Utilities guides remain; this checkpoint
is not complete website migration or release approval.

## Complete component MDX authoring

All 47 existing component detail routes now have authored MDX documents. The
final nine are Chip, Table, Forms, Command Palette, Data Table, Divider, Empty
State, Status and Timeline. Earlier counts refer to their original checkpoints.
The 59 authored guides, four overviews and 57 remaining Helpers/Utilities guides
are unchanged. This completes component body ownership, not the whole website
or release qualification.

The specific component route now requires an authored document and renders it
directly. The duplicate structured body renderer, inline narrative maps and
unused data imports are removed. Route validation, header behavior, pagination
and the complete original script footer remain. No framework source,
distribution, optional runtime or dependency is rewritten by this cleanup.

MDX owns each remaining lead, variant explanation, keyboard/usage guidance and
disclosure. Typed modules retain escaped executable examples, evaluated tokens,
Sass recipes and application scripts. Responsive Table examples still expand
their live breakpoint generator; only their narrative moves to metadata.
`Style.astro` emits the existing documentation-only table cell isolation CSS in
the original body position. Chip and Table retain their disclosed contrast CSS.
Forms retains native validation, disabled/readonly semantics, locally disabled
action buttons until setup, explicit summary recovery and reset behavior.

Status, Timeline, Divider, Empty State and Data Table continue to opt into
optional styling. Their CSS does not become a core plugin or data service.
Copied application handlers retain transient status updates, local creation,
sorting/filtering, native checkbox state and deliberate focus movement without
network requests or persistence. Timeline and Divider retain native list,
scrolling and separator semantics rather than invented keyboard controllers.

Command Palette uses a separate extension API adapter; the twenty-name core
adapter list remains unchanged. Its specialized import/sample, source-verified
option rows and CustomEvent.detail semantics remain live. `paletteEvents` now
reads canonical MDX prose. The palette still uses the one optional documentation
runtime, explicit setup/focus policy and docs-shortcut guard; no native modal,
inertness or global focus protection is newly promised.

The Chip, Forms, local-pattern and Palette application scripts are displayed
through named Code shortcodes and execute from their unchanged shared sources
after pagination. Existing copy/execution tests follow those current owners
while retaining their executable-script assertions. Explicit apostrophes and
technical strings prevent Markdown typography from changing existing text.

`metadata/component-completion-mdx.json` records the final transition and
pre-migration evidence, protecting the earlier enhanced-input policy unchanged.
The Forms, overlay and earliest branding adapters resolve newly transitioned
modules through pre-completion snapshots after their earlier history adapters.
No earlier policy or captured starting evidence is refreshed.

### Component completion verification, 2026-11-11

- Production website/Pagefind build passed: 197 HTML pages and 196 indexed
  pages. No-legacy and site-asset mirror checks passed.
- Focused unit/documentation checks passed: 465 tests across forty files.
  The final focused ownership/history recheck passed 48 tests across five files.
  Strict website types and test type-boundary checks passed.
- The 201-case browser selection covers Chromium, Firefox and WebKit. Its 174
  JavaScript-enabled content/API/copy, interaction and accessibility cases
  passed. The initial script-download blocking harness incorrectly allowed
  inline application handlers to execute; its five affected cases per engine
  failed. All 27 no-JavaScript cases then passed in a separate targeted run
  using browser contexts with JavaScript disabled. No assertion, timeout or
  accessibility rule was removed. These are combined verification results,
  not a claim that the initial 201-case invocation was green.
- All six existing homepage/Install screenshot tests passed, without baseline,
  tolerance or timeout changes.
- All 27 independent light/dark/RTL before/after comparisons have pixel-identical
  component content below the unchanged 64px global header. Nineteen entire
  screenshots match; eight differ only in 10–37 header-text pixels, with maximum
  channel delta 2/255. No before image was replaced. Report:
  `artifacts/component-completion-visual/pixel-review.json`.
- All 196 page bodies and script sets match the captured starting state after
  intentional edit-link normalization; all 642 protected inputs match. Report:
  `artifacts/component-completion-mdx-identities.json`.
- The pinned core audit passed unchanged: 131 exact branded modules and six
  approved patched modules, with no core extras or production modifications.

The branding byte-history test now groups its repeated nested validation inside
one existing synchronous audit context. This avoids rechecking the same policies
for every source in one audit; results are discarded afterward, preserving later
edit detection and every hash/assertion. Its five-second timeout is unchanged.

Framework source, distribution, dependencies, notices/licenses and release flags
are unchanged in this batch. Nothing was committed, pushed, published or deployed.
Full monolithic/release qualification was not rerun. Next migrate the 57 remaining
Helpers/Utilities guides; all 47 component detail bodies are now authored MDX.

## Authored Helpers guides

All nine Helpers guides now live under `site/src/content/docs/helpers/`: Focus
ring, Hover lift, Icon link, Position, Stacks, Stretched link, Text truncation,
Vertical rule and Visually hidden. The current totals are 68 authored guides,
four overviews and 47 authored component detail pages. The 48 Utilities guides
remain on the validated structured collection. Earlier counts above describe
their original checkpoints, not the current remaining scope.

`helpers-guides.ts` is now a metadata-only projection. The maintained group
order includes Helpers, so sidebar/search metadata is read fresh from MDX per
render. Every section ID, heading, paragraph and executable example retains its
original position. Source/edit links intentionally point at each authored guide.
No helper index page or new route is invented.

`helpers-examples.ts` retains both raw and published executable samples, not
duplicate prose. The published stretched-link samples retain the explicit
contrast disclosure, copied CSS and `demo-contrast` wrapper. Its unchanged module
script now comes from `helpersRuntimeScripts` through `GuideScripts.astro`, in
the same position before pagination. This is still a disclosed application demo
customization, not a change to the core helper or an invented JavaScript plugin.

The existing helper Sass compilation tests now discover the actual raw examples
from their new owner; changing the prose registry to metadata-only must not
silently remove those tests. Browser navigation tests use immutable original
headings/counts and the current authored source URLs. Separate migration checks
cover every raw/published sample, script bytes, authored prose and section IDs,
metadata freshness and the remaining Utilities boundary.

`metadata/helpers-mdx.json` records the new sources, pre-migration snapshots and
the unchanged preceding component policy. Historical Forms and documentation
branding audits resolve changed shared files through the verified pre-Helpers
snapshots after their existing adapters. No earlier policy, baseline or captured
starting evidence is refreshed. Framework source, distribution, dependencies,
licenses/notices and release flags are outside this batch.

### Helpers verification, 2026-11-11

- Production website/Pagefind build passed, preserving 197 HTML pages, 196
  indexed pages and 11,607 indexed words. No-legacy and asset-mirror checks passed.
- Focused unit/documentation and Sass checks passed: 176 tests across twelve
  files, including the original helper module/sample compilation checks. A final
  contrast/MDX/history recheck passed 41 tests across four files; the contrast
  test follows authored Helpers/Forms disclosures and their live sample owners
  rather than obsolete structured section bodies. Every wrapper/CSS assertion
  remains; copied HTML is checked too. Strict website types and final test
  type-boundary checks passed.
- Existing helper browser suites passed 109 cases across Chromium, Firefox and
  WebKit, with the two existing non-Chromium forced-colors skips unchanged.
  These retain real focus geometry, SVG hooks, reduced motion, container versus
  viewport behavior, sticky scrolling, physical writing-mode edges, stretched
  link hit areas, skip-link activation and utilities-only entry checks.
- All 81 additional authored-Helpers browser cases passed: 54 cases covering
  copy behavior, source text and all eight theme/direction/viewport states per
  page, plus 27 no-JavaScript cases. Automated WCAG A/AA checks include 2.2.
  No baseline, timeout, screenshot tolerance or accessibility rule is relaxed.
- All six existing homepage/Install screenshot tests passed unchanged.
- All 27 independent light/dark/RTL comparisons have pixel-identical page
  content below the unchanged 64px global header. Twenty-three entire pages
  match; four differ only in 12–24 header-text pixels with maximum channel
  delta 2/255. No before image is replaced. Report:
  `artifacts/helpers-visual/pixel-review.json`.
- All 196 page bodies and script sets match the captured starting state after
  intentional edit/source-link normalization. All 660 protected inputs match.
  Report: `artifacts/helpers-mdx-identities.json`.
- The pinned core audit passed unchanged: 131 exact branded modules and six
  approved patched modules, with no core extras or production modifications.

This is local documentation work only. Nothing was committed, pushed, published
or deployed. Full monolithic/release qualification and manual assistive-
technology review were not rerun. Next migrate the 48 Utilities guides in
independently verified groups, preserving their live generator/API examples.

## Completed Utilities authoring

All 48 Utilities guides now live under `site/src/content/docs/utilities/`. Together
with the previous groups, all 116 guide bodies, four overviews and 47 component
detail routes use the authored MDX collection. No structured guide bodies remain.
Older counts above describe their original checkpoints.

`utilities-guides.ts` now projects guide metadata and 47 non-API topic records
from the authored files. Topic categories, classes, notes and flags are validated
frontmatter; overview rendering reads their current values instead of freezing a
TypeScript prose catalog. `utilities-examples.ts` owns every raw/published HTML,
CSS and Sass sample plus the unchanged Background/Theme contrast scripts. Both
scripts still execute before pagination through `GuideScripts.astro`. No utility
selector, generator option, runtime flag or core source is changed by this move.

All original section IDs, text, steps, table cells, examples and code labels remain
in their prior order. Utility API tables keep their code-cell semantics, accessible
names and explicit focusable scrolling regions. The existing compilation/API tests
read maintained samples through a test-only original-hierarchy contract, so the
metadata-only registry cannot silently remove Sass test discovery. That contract
and captured evidence are not website imports.

The obsolete `GuideContent.astro` renderer, structured-guide collection/schema,
conditional catch-all rendering and runtime contrast remapping are removed. The
authored-only route registry retains invalid/duplicate path rejection. The old
renderer is recoverable from the verified `utilities-source-6.before.txt` fixture;
no user data or framework files were deleted.

The Utilities overview is the one intentional page-body change. Its obsolete
infix class examples now use canonical colon prefixes; the button uses the
documented inverse solid variant, unsupported default state/print aliases are
removed, and the nonexistent container-breakpoints option is no longer advertised.
All 48 topic links and the original hierarchy remain.

`metadata/utilities-mdx.json` records every current source, removed renderer and
pre-migration snapshot, retaining the preceding Helpers policy unchanged.
Historical shared-source adapters preserve the earlier Forms, Helpers and component
audits without refreshing their evidence. The new source snapshot preserves the
original trailing blank line and its captured hash. Framework source/distribution,
dependencies, notices/licenses, release flags and previous screenshot baselines are
outside this batch.

### Utilities build, source and visual verification, 2026-11-11

- Production website/Pagefind build passed, preserving 197 HTML pages and 196
  indexed pages. No-legacy and site-asset mirror checks passed.
- Focused documentation/history checks passed: 216 tests across fourteen files.
  Utility documentation, API and Grid/gap Sass checks passed another 101 tests
  across three files, compiling the maintained examples against the independent
  pin. A final ownership/history/contrast recheck passed 76 tests across five of
  those files. Website types and final test type-boundary checks passed.
- All six existing homepage/Install screenshot tests passed without baseline,
  tolerance or timeout changes.
- All 30 selected independent before/after light/dark/RTL comparisons have
  pixel-identical detail-page content below the unchanged 64px header. Twenty-six
  entire screenshots match; four differ only in 12–13 header-text pixels, with
  maximum channel delta 2/255. No before image was replaced. Report:
  `artifacts/utilities-visual/pixel-review.json`.
- All 195 page bodies outside the intentionally corrected Utilities overview
  match the captured starting state after source-link normalization. All 196
  script sets match, including Background/Theme contrast setup. All 669 protected
  inputs match. Report: `artifacts/utilities-mdx-identities.json`.
- The core audit passed unchanged: 131 exact branded modules and six approved
  patched modules, with no core extras or production modifications.

These are local documentation results, not publication or release approval. No
commit, push, deployment or publication was performed. Full monolithic/release
qualification and manual assistive-technology review remain separate work.

### Utilities browser verification, 2026-11-11

The 246-case selection covers Chromium, Firefox and WebKit: every authored
Utilities guide's content, navigation, copy behavior and desktop/mobile contrast;
selected RTL light/dark pages; no-JavaScript content and native table focus;
overview links/canonical snippets; and real custom generator, selector, values,
state, print, OS-dark, logical spacing and reduced-motion behavior.

The initial invocation passed 240 cases. Six test-harness cases failed: the native
Options selector matched both the named section and the actual scroll region,
and an older API navigation check still read the metadata-only registry's empty
section array. The selector now explicitly selects the table region, matching
the existing scrolling check; the API test reads the immutable original hierarchy
with maintained samples, like the other migrated tests. All six cases passed with
`--last-failed` after these corrections, with all assertions and timeouts retained.
These are combined verification results, not a claim that the initial invocation
was green. No runtime, CSS or page-content change was needed for these fixes.

The body migration is complete. Next perform broader full-site/release
qualification, manual accessibility review and the remaining AI delivery work;
the separate notices/reference review remains deferred. This does not authorize
removing required attribution or publishing/deploying the package or website.

## Post-migration readiness audit — 2026-11-11

The first broader local checkpoint passed the full generated-site crawl (197
checks), complete HTML validation (197 files), full unit invocation (1,407 cases),
independent reference fixtures (50), server/tooling checks (32), installed-tarball
qualification, core/browser contracts (434 passes, four existing skips), all 141
visual checks and the strict build/type/size/source/output gates. The dependency
audit reported zero known advisories. All results describe the local working tree,
not remote CI, a public deployment or manual accessibility certification.

The audit also inspected copied examples, which Axe cannot validate as Sass. The
Customize overview still advertised unsupported border-radius/grid-gutter options
and main-entry helper aliases. It now displays the existing maintained Sass guide
recipe through the shared Code shortcode and explains explicit owner-module
imports and `sass:map` access. No core aliases or convenience APIs were restored.
Three regression tests verify the source owner, real compiled spacing/focus rules
and rejection of the replaced API. Shared full-entry compilation happens during
fixture setup rather than inside the default-timeout assertion case. Default
timeouts and every style assertion remain. Three browser cases verify copied
bytes, working local links, light/dark, LTR/RTL and desktop/mobile states; twelve
Customize page audits were rerun after the repair. Search, responsive navigation
and version-navigation workflow checks also passed.

`artifacts/readiness-audit-post-utilities.mjs` captures a separate, non-overwriting
starting inventory for this checkpoint. Its final report preserves all 382
protected inputs and all 141 screenshot baselines; only the intentionally repaired
`site-dist/customize/index.html` differs among the 196 generated page bodies.
The core rebuild reproduced the existing distribution bytes. Earlier migration
evidence and policies were not refreshed.

The complete default site interaction suite has not been run in this checkpoint;
the generated-page audit is deliberately not reported as that suite. Clean-checkout
CI, manual assistive-technology/device sign-off and prerelease contract approval
also remain. `check:release` was invoked and correctly failed at its explicit
publication block, which remains unchanged. Nothing was committed, pushed,
published or deployed. See `docs/RELEASING.md` for the command-by-command checkpoint
and remaining approval gates.

## Full documentation interaction follow-up — 2026-11-11

The subsequent complete default `npm run test:site` run finished successfully;
its saved Playwright result reports `passed` with no failed tests. This closes
the local interaction-suite gap noted in the preceding checkpoint. An initial
port collision prevented server startup before tests ran; the normal invocation
was restarted once the port was free, without changing server or test settings.

The separate `artifacts/site-interactions-identities.json` scope report confirms
all 382 protected inputs, 141 screenshot baselines and 196 generated page bodies
remain unchanged. No implementation repair or baseline update was needed.
These staged local results do not establish a clean-checkout CI result or manual
accessibility certification. Clean-checkout validation, manual device and
assistive-technology review, and explicit release approval remain outstanding.
Publication remains blocked; nothing was committed, pushed, published or deployed.
