# Tremplin: Bootstrap 6 clone-first, legacy-free plan

## Current Tremplin branding and package follow-up, 10 November 2026

This section supersedes older naming, notice-file counts and byte-identity
requirements below. Public product identity is Tremplin. Eight local tooling
files and seven commands adopt Tremplin names; documentation links point to the
maintained Tremplin source. Public APIs, functionality, styles and source pin
are not replaced. Internal historical provenance remains accurate.

Duplicate `LICENSE.bootstrap` filenames are consolidated, with their complete
original license retained in `licenses/third-party-code.txt` and included in
root/distribution `THIRD_PARTY_NOTICES.txt`. All bundled dependency licenses and
documentation acknowledgements are included. This is branding and packaging,
not removal of attribution or a claim of independently authored reused code.

Root dist now contains 29 files; canonical `js/dist/` retains 140. Internal audit
metadata is excluded from the consumer archive; the two public API metadata
files remain. The only core-source change is the product homepage in the Sass
banner comment. Code bodies and frozen source/API evidence remain protected;
generated comment, map and integrity differences must be verified explicitly.

Qualification runs locally before any repository update. The source audit,
independent CSS assembly, package installation, type, unit, server, documentation
and relevant browser checks must pass. Full visual/manual release acceptance is
still separate. No push, commit, release or deployment is authorized.

## Current npm-stage and example-tool follow-up, 10 November 2026

This section supersedes the earlier local compiler/tool-count descriptions below.
All twenty pinned root build filenames are now implemented, including the restored
example screenshot and ZIP tools. Five required libraries remain as explicit
inventory extras. `metadata/npm-build-stages.json` records the exact reviewed
command/dependency changes, physical retirements and documentation-tool moves.

Production compilation uses separate npm Sass, PostCSS, Lightning CSS, Rolldown
and Terser stages, with independent source, security, graph, size and output gates.
The old production compiler and duplicate CSS-asset wrapper are removed. Private
documentation builders move under `site/build/`; safe cleanup and isolated preview
remain under `tests/tooling/`. Required same-origin assets and notices are retained
by SRI preparation. Historical fixtures, source/API baselines and workflows stay
unchanged. All 170 distributed files must remain byte-identical after qualification.

Example tools use the three maintained self-contained demos, not older retained
templates with obsolete markup. Screenshots preserve light/dark 1x/2x behavior;
local ZIPs include verified core assets, full notices and a dependency-free loopback
server for native modules. They write ignored artifacts only, not core dist, npm
release assets, documentation acceptance screenshots or deployed websites.
No commit, push, release, branch operation or deployment is approved by this batch.
See [current commands and structure](SOURCE_STRUCTURE.md#explicit-compilation-stages).

## Local maintenance follow-up, 10 November 2026

The default compiler cutover and production/QA separation are complete locally.
The seven remaining non-example maintenance filenames now have functional,
reviewed implementations. `metadata/core-maintenance-tools.json` records their
Git-verified references, exact dependency/command additions and safety adaptations.
There are 28 build files: all eighteen pinned non-example filenames plus ten
required Tremplin compilation/shared helpers. This is name coverage, not an
unqualified claim of identical upstream maintenance or deployment behavior.

Bundle checks share the existing 56/60/62 kB limits. The Sass checker remains
read-only and recognizes verified CSS side effects in import-only aggregation
modules. The HTML validator uses pinned rules against the built site; breakpoint
comparison text is escaped to remain valid HTML. Cache cleanup, version changes
and documentation preparation default to dry runs. Actual version application
is blocked by the current migration/release policy. Documentation staging creates
only unique local review copies and never resets Git, switches branches or deploys.

Core source, all 170 distribution files, source/API baselines, screenshot settings,
version and workflows must remain unchanged. Use the commands documented in
[Maintenance commands](SOURCE_STRUCTURE.md#maintenance-commands). Standalone
products and example archive/screenshot tools remain deferred. Full visual/manual
acceptance and a successful complete release qualification remain outstanding;
this update does not approve publishing or a repository push.

## Active delivery restructuring — local-only, 9 November 2026

This section supersedes older delivery/layout and outstanding-task descriptions
below; historical checkpoint measurements and their immutable evidence remain.
The fixed reference stays `9062790fdb2379593a2973416dc5a3bfb203e4e3`.
The user approved this work locally first, with no intermediate pushes, releases,
deployments, or creation of separate repositories.

### Target and explicit exceptions

- Keep maintained JavaScript at `src/js/` and Sass at `src/scss/`.
- Match the pinned 17 CSS and eight browser JavaScript download files, using
  Tremplin basenames. Emit individual modules/types under `js/dist/`.
- Follow the pinned build pipeline, not only its filenames. Separate project
  verification tooling from `build/`; defer example-only archive/screenshot work.
- Defer standalone examples, icon catalog, starters, themes, adapters and
  extensions from the core package. Preserve authored source before relocation
  or deletion; documentation demos and framework control assets are not optional
  product features merely because they contain an example or icon.
- Preserve original copyright/license notices and truthful upstream provenance.
  Public branding can change; existing derived code must not be represented as
  independently authored. Retain all six approved SEC-001/A11Y-001 patches.
- In particular, `dist/icons/datepicker-chevron.svg` is a required SEC-001 asset.
  It and distributed license notices are explicit additions outside the 25 core
  CSS/JS downloads, not unexplained distribution drift. Removing or relocating
  the mask without updating its references would break the approved CSP behavior.
- Preserve unprefixed public classes and the agreed `--trm-*`, `data-trm-*` and
  JavaScript namespaces. Required third-party namespaces remain unchanged.

### Ordered batches and current state

1. **Inventory/recovery and metadata (implemented):** record the upstream file
   inventory and Git blob identities; classify current build callers and package
   differences. Add the missing utility metadata generator and independent
   reference checks. A recovery ZIP of the clean pre-change HEAD is held outside
   the project. No existing optional or distribution files are deleted in this
   batch. `metadata/core-delivery-reference.json` records scope, not completion.
2. **Build pipeline (default compiler cutover implemented locally):** adapt the reference browser floors, banners, Sass/maps,
   prefixing, minification, plugin/declaration builds and utility/SRI metadata.
   Replace obsolete tools only together with every caller; relocate useful QA.
3. **Delivery/package switch (canonical entries, archive separation and physical output cleanup implemented):** produce the clean core download directories and
   `js/dist/`; remove old CommonJS/chunk/optional outputs and migrate exports,
   consumer fixtures, documentation imports and assets coherently. This is an
   explicitly reviewed breaking packaging transition, not a blind API-baseline
   or historical-hash refresh. Optional and internal outputs remain until their
   coordinated cleanup sub-batch.
4. **Core and documentation acceptance:** verify all 137 modules, then Getting
   started, Guides/Customize, Layout, Content, Forms, Components, Helpers and
   Utilities; correct repository links, setup instructions and public branding.
   Do not recreate already verified modules or add old compatibility aliases.
5. **Visual/CI/manual acceptance:** after interface changes settle, investigate
   the 93 documentation screenshot failures, review platform baselines and retain
   the 3% tolerance. Keep functional/security tests enabled. Complete real-device,
   screen-reader and forced-colors sign-offs; do not invent automated evidence.
6. **Local handoff first:** run a clean build, package consumers, source/API,
   types, browser/accessibility and documentation checks. Review the final diff
   before any later GitHub update. Keep the release block enabled throughout.

The latest remote run at `564508b` passed 1,048 unit tests, 431 browser checks and
1,018 documentation checks; 93 final documentation screenshots failed and 46
passed. Those are historical run results, not a claim that this new delivery
restructuring is verified or release-ready. The current bundled-JS ceiling is
62,000 gzip bytes, explicitly approved during the compiler preview; the
standard-JS ceiling remains 60,000. CSS adjustments remain
automatically authorized after checking for duplicate output.

Read-only progress: `node tests/tooling/audit-core-delivery.mjs --report`.
Strict proposed-delivery gate: add `--check`; it must fail until differences are
resolved. A diagnostic report exiting successfully is not delivery acceptance.

First-batch verification: the normal clean build recreates utility metadata for
124 configured families; it independently matches the pinned upstream metadata
after the declared branding transform. All 1,057 unit checks across 87 files
pass with one worker (the prior 1,048 plus nine new checks), and strict type
boundaries pass. All four independently checked production CSS outputs match
the pin plus approved patches, and the installed-tarball consumer passes. See
`artifacts/core-delivery-batch-1-report.json` for this bounded verification.
The 137 core modules, approved source patches, frozen API
baseline, package exports and existing CSS/JavaScript distribution bytes are
unchanged. The new metadata JSON is the only added distribution file. This is
not completion of the package switch, screenshot acceptance or the root quality
workflow. Existing extra distribution files and optional exports remain visible
as unresolved inventory differences; none are silently accepted or deleted.

### Compilation checkpoint — canonical modules and isolated preview

The normal build now emits 35 canonical ES modules, declarations and their maps
under `js/dist/` (140 files), without changing maintained source or active
package exports. New compiler tools cover browser floors, banners, individual
modules, declaration generation, Rolldown, PostCSS and Lightning CSS. Exact tool
versions come from the Git-verified pinned lockfile. The historical package
fixture remains intact; `metadata/core-delivery-tooling.json` records only the
reviewed dependency/command additions and two explicit command replacements.

The pinned repository has only 136 tracked `js/dist/` files: its newly added
`js/src/util/scroll-lock.ts` has no tracked outputs. The actual module builder
must include that module. Its four source-required files are explicitly recorded
in `sourceDerivedModuleOutputs`, with the original source Git blob. Do not delete
ScrollLock or ship broken Dialog/Drawer imports to imitate that stale omission.
The re-export-only `index.js` also retains the upstream empty-source map shape;
no executable positions are fabricated when Rolldown omits that map.

`npm run build:core-preview` exercises the replacement pipeline under ignored
`artifacts/core-delivery-preview/`: 17 CSS files, eight browser JS files, the
calendar mask and legal notices. Standard downloads keep Floating UI/Calendar
Pro external; bundles include them. All twenty exports remain. The ordinary
build generates this preview for reproducible checks, but active browser output
still uses the existing compiler until consumer/export migration is completed.

The initial preview measures 51,804 CSS, 37,113 standard-JS and 61,419 bundled-JS
gzip bytes. The latter initially exceeded the 61,000-byte cap; the user then
explicitly approved 62,000 bytes. This approval is recorded in the tooling
transition, and `budgetReady` is recalculated against the actual approved values.
Neither the budget approval nor compilation/functional qualification authorizes
the default package switch or publication. CSS remains within its existing cap.

Native preview smoke qualification passes all five output variants in Chromium,
Firefox and WebKit (15 cases): exports, module identity, buttons, native dialogs,
calendar month navigation/same-origin masks, and Tooltip sanitization under
enforced CSP. Ordinary workflows require zero violations; the deliberate handler
attack retains the existing inert-parser `script-src-attr` qualification, with
no live unsafe attributes or execution. This is not exhaustive WCAG, real-device,
visual or release acceptance. Run it with
`node tests/tooling/check-core-preview.mjs` after building.

Compiler-batch regression: all 1,070 unit checks across 88 files pass with one
worker, retaining every previous case and adding thirteen compiler contracts.
The clean build, strict type-boundary checks, four independent active-CSS checks
and installed-package consumer pass. The 32-case focused subset passes again
after budget approval; its cases overlap the full run and are not added to that
total. See `artifacts/core-delivery-batch-2-report.json` for this bounded evidence.
Native qualification also includes an enforced Trusted Types
plain-sink rejection in Chromium for every output variant. None of this reruns
or resolves the deferred documentation screenshot/manual acceptance gates.

Remaining cutover work includes coherent exports/consumer migration, removal
of old output formats, optional-product separation, SRI/maintenance tooling
consolidation, and the previously documented documentation/visual/manual gates.
No source security exception, frozen API baseline, release permission or remote
repository is changed by this compiler checkpoint.

### Canonical entry-point checkpoint — local, 9 November 2026

The package root and focused core imports now resolve to `js/dist/`, and explicit
`tremplin/js/dist/*.js` imports are exported. The obsolete top-level main/module/
types fields are removed. Existing short CSS aliases and optional
exports are deliberately not declared fully retired in this sub-batch; their
coordinated removal, internal-format cleanup and browser compiler switch remain.

The 82 redundant root/component generated facades were moved into recoverable
storage outside the project; a fresh snapshot ZIP also preserves the complete
pre-change working tree, including the earlier local batches. The ordinary build
no longer recreates them, and canonical module compilation rejects reintroduction.
Regeneration also retires 50 obsolete hashed chunks. Site preparation prunes the
corresponding 132 stale mirror files. No maintained framework source is deleted.

The frozen API baseline and 137 source modules are unchanged. A narrow reversible
projection accepts only the declared export targets/new canonical import path;
restoring the old export list must recreate the original whole public API digest.
No method, options, tokens, selectors, Sass signatures or unrelated package fields
may drift. Historical package fixtures remain unchanged and release stays blocked.

Installed-tarball checks pass for root, all twenty focused components and explicit
canonical paths, shared class/instance identity, Node 24 require(ESM) interop,
strict ESM/CommonJS-consumer type checks with skipLibCheck false and negative
probes, Sass customization and installed JS/CSS/SVG bundling without host-source
fallback. This is not a separate CommonJS framework distribution. Installation
documentation now reads declarations from exports["."].types rather than the
removed top-level field. Core browser runtime mixing is unsupported, matching
the one-build-per-document model; the canonical graph is not modified to invent
the previous private runtime guard's independent-build rejection guarantee.

Canonical JavaScript modules are also declared side-effectful in package
metadata. Installed, minified, tree-shaken consumers must preserve automatic
button registration for both `import 'tremplin'` and `import 'tremplin/button'`;
the regression executes both resulting bundles and checks two real clicks.
This is part of the narrow package projection, not a core source change.

Verification for this entry-point sub-batch passes the clean build, unchanged
137-module source audit, API projection, four production CSS checks, strict
type boundaries and installed-tarball consumers. The complete serial unit run
passes 1,075 checks in 89 files; final metadata/side-effect follow-ups are checked
again with the focused subset, rather than claimed as a second full unit run.
All 18 ESM distribution browser cases pass across Chromium, Firefox and WebKit.
The 196-page documentation build, 28 server/mirror checks and 15 Getting started
checks (including Axe) pass. Site preparation now mirrors canonical modules
under `/js/dist/` and enforces byte identity without deleting sibling site JS.
See `artifacts/core-delivery-batch-3-report.json` for scope and recovery paths.
The strict final-delivery audit still reports unresolved differences: optional
exports/products, extra distributions/internal formats and default-compiler
cutover remain pending, as do screenshot/manual acceptance and the full root
quality workflow. No files are committed, pushed, published or deployed.

### Core archive checkpoint — local, 9–10 November 2026

The core npm archive now removes precisely eight optional-product exports and
the React/Vue consumer peers. Maintained core source is packed through `src/js/`
and `src/scss/`, excluding extension subtrees. Adapters, integrations, runtime
guard source, starters, themes, examples, the standalone icon catalog and
maintainer docs are excluded. The required same-origin calendar SVG stays under
`dist/icons/`; the source asset and all optional authored work remain local.
The installed archive verifies every one of the 137 core source files and all
140 canonical module/declaration/map files, not only representative imports.

The archive also excludes local optional CSS/JS, old internal CJS/type trees
and the private build graph. Their physical local files are not yet deleted:
their current build/site callers will move coherently with the default compiler
switch. This checkpoint must not be described as a fully clean root `dist/`.
No optional repository/package is created or published. Historical source/API
catalogs retain optional source contracts for audit; they are not active exports.

`metadata/core-package-scope.json` declares this bounded breaking package change.
The original strict API digest, source modules, patches and documentation fixtures
remain unchanged; only the export-list projection changes in generated public
metadata. Package tests reject ten optional import paths, check optional-peer
absence, reject missing optional declarations in ESM/CommonJS consumers and
retain core class/instance identity, tree-shaken Data APIs, Sass, CSS and assets.
Getting started and integration guidance now distinguish the installable core
from retained experimental adapter sources. Broader experimental demo retirement
and final documentation acceptance remain pending, not silently certified.

Recovery before this batch: `C:/xampp/htdocs/tremplin-recovery/core-package-scope-1794247765.zip`.
See `artifacts/core-delivery-batch-4-report.json` for final scoped verification.

The complete serial suite passes **1,081 tests across 90 files**, retaining the
previous 1,075 and adding six archive-policy contracts. The final clean build,
installed-tarball checks, four production CSS checks, strict type boundaries,
196-page site build and 15 Getting started browser/Axe checks pass. The core
archive contains 344 files, with 17 verified shipped-asset integrity entries;
excluded local optional outputs are no longer advertised in that manifest.
All 165 core download/canonical-module files are byte-identical to the recovery
snapshot, and all 608 locked dependency versions remain unchanged. The diagnostic
delivery audit has no remaining packaging issues but still fails final delivery
acceptance on physical output/tooling differences. Full root/visual/manual
acceptance is not inferred, and the release block remains enabled.

The changed integrations page also passes its WCAG A/AA browser audit. Its first
run identified a low-contrast highlighted comment (3.04:1); moving that setup
instruction into ordinary prose retains the information and fixes the page
without changing global styling or weakening Axe. The initial failure log remains
at `artifacts/core-package-integrations.log`; the passing final rerun is recorded
separately. The complete unit run precedes this final prose-only relocation.

### Default compiler and physical output checkpoint — local, 10 November 2026

`npm run build` now uses the qualified Sass → PostCSS → Lightning CSS and
Rolldown → Terser pipeline. One implementation at `build/compile-core.mjs`
builds the public outputs and the isolated preview; the obsolete esbuild browser
builder and duplicate preview implementation are removed. Individual modules
and strict declarations still build under `js/dist/`. Compiler versions, source
pin, the 137 core modules, all six security/accessibility patches, namespaces and
frozen API/fixture baselines are unchanged. This is a compiler/delivery change,
not a new framework implementation or an authorship rewrite.

Root `dist/` has exactly **30 files**, down from 236: the pinned **17 CSS and
eight browser JS** download files, one required calendar SVG, three license/notice
files and the integrity manifest. The 206 obsolete generated files are physically
retired: no CJS/type trees, optional adapter/extension files, split browser chunks,
private dependency bundles or private graph remain there. Recovery includes the
entire pre-cutover worktree at
`C:/xampp/htdocs/tremplin-recovery/compiler-cutover-1794249373.zip`. Authored optional
source remains local. All 140 canonical module/type/map outputs are preserved.

Core build graphs move to `artifacts/core-build-graph.json`. Documentation-only
CSS/dependency modules move to `artifacts/documentation-assets/dist/`, generated
by site preparation rather than the core build. An exact eight-file allowlist
merges them into the documentation asset mirror without overwriting core files;
unknown/colliding/incomplete support is rejected. Site preparation removes 198
stale copies while retaining these legitimate demos. Existing documented demo
URLs remain available, but they are not core npm exports. The core archive now
contains 337 files and 13 verified shipped-asset integrity entries.

Every manifest build runs `build/check-core-output.mjs`, which rejects unexpected
or missing root downloads and obsolete outputs. Historical documentation hashes
are not refreshed: optional CSS is checked byte-for-byte at its relocated path;
core CSS is compared against a separately Git-verified and approved-patch source
assembly after the declared PostCSS stage. The production CSS gate independently
checks both expanded and minified ASTs for all four entries, without filtering
declarations. Package script changes are narrowly recorded in
`metadata/compiler-cutover.json`. Publication remains blocked.

Initial validation passes 94 overlapping focused contracts plus six new default
compiler contracts, 31 server/mirror checks, installed-tarball consumers, strict
type boundaries, the 196-page site build, 15 Getting started/Axe checks and 15
native browser qualification cases across Chromium/Firefox/WebKit. The complete
unit/browser results and reproducible-build follow-up are recorded separately
in `artifacts/core-delivery-batch-5-report.json`; this paragraph does not preempt
them or imply screenshot/manual release acceptance.

The read-only delivery audit has no CSS/JS/canonical-module inventory, packaging
or extra-distribution gaps. Its remaining 66 differences are nine missing and
57 extra build-tool filenames, not missing framework components. QA tooling
consolidation, remaining alias policy, broader documentation/experimental-demo
review, full root quality workflow and visual/manual acceptance remain open.
Nothing is committed, pushed, published or deployed during this checkpoint.

Regression follow-ups retain their original evidence. The first full unit run
passes 1,086 and fails one historical raw-Sass hash assertion. The fix preserves
that old hash by reconstructing the historical CLI serialization from the verified
reference, then independently checks the exact new prefixed bytes. It rejects
extra whitespace as well as changed declarations. Identical verified compilation
is cached for negative probes, while every source is revalidated on each call;
no timeout or baseline is relaxed. The complete rerun passes **1,087 tests in
91 files**. The earlier focused timeout and historical failure logs remain under
`artifacts/compiler-cutover-*`.

The first broad browser run finds retained HTML example import maps pointing at
the retired root vendor files and is stopped after preserving its diagnostics.
Only loader references are changed: three core pages use the self-contained
bundle, and the optional discovery page uses one private combined palette/core
runtime plus its private CSS. No example design/features are expanded, no authored
example is deleted, and no obsolete root output is restored. Four new loader
regressions pass in the final 23-check focused run; nineteen overlap the full
unit run, so that is not a second complete 1,091-test run. Initial browser logs
and traces remain in `artifacts/compiler-cutover-browser-initial/` and the separate
initial log; final three-engine results are recorded in the batch report.

Final browser verification passes **434 checks with four unchanged platform
skips** across Chromium, Firefox and WebKit. The subsequent clean build reproduces
all **170 tested output files byte-for-byte** (30 root distribution files and
140 canonical files). Final installed-package, declaration-boundary and 196-page
site/mirror checks pass against those regenerated bytes. Recovery comparison
also verifies 157 `src/` files, all 140 canonical files, both API documents,
frozen source/patch baselines, lockfile and TypeScript profiles unchanged (305
protected files). Example HTML changes are limited to the reviewed loader fixes.
No snapshot baseline or tolerance is changed. This completes the default
compiler/output sub-batch, not the remaining build-tool-layout, full root quality
workflow, broad documentation, pixel-image or manual accessibility gates.

### Build/QA tooling split checkpoint — local, 10 November 2026

Forty-five project-specific audit/test/report/review/server tools move from
`build/` to `tests/tooling/`; two production implementations are renamed to
`build/generate-sri.mjs` and `build/copy-site.mjs`. The old 47 paths are absent
and forwarding copies are rejected by the no-legacy gate. Production build/
asset routines and required shared helpers remain under `build/`, reducing its
file count from **66 to 21**. No authored framework module is removed or changed.

`metadata/build-tooling-relocation.json` records each move. Existing command
names, arguments, ordering, exports, dependency versions and release restrictions
stay unchanged. Relative imports and module-relative project roots are adjusted
to the real moved locations. Historical transition records and documentation
fixtures are not rewritten: reversible command/server-path projection preserves
the original package and whole-configuration comparisons, including workers,
ports, screenshot baselines, timeouts and tolerance. Reintroduction of any old
tool path fails the retirement check.

The first focused run exposes Vitest's HTTP rewrite of import.meta.url in its
DOM environment. The shared path projection now reads the project metadata from
the same project-root working directory as the existing filesystem tests; this
does not change framework code or test settings. Initial failures are retained
at `artifacts/build-tool-cleanup-focused.log`, and all 77 focused contracts pass
in the separate final run. The relocated tests do not depend on a local-only
migration report, so a clean checkout can reproduce them through normal builds.

A clean build leaves **485 protected files byte-identical**, including all
authored `src/` files, 170 framework outputs, API/patch baselines, lockfile,
TypeScript profiles, historical fixtures and screenshot expectations. SRI still
hashes every shipped runtime asset; exact core-tree validation rejects unwanted
outputs rather than relying on a package-projection helper inside production
SRI generation. Final package consumers, strict type boundaries, independently
verified expanded/minified CSS, the 196-page site/mirror build, 32 server/mirror
checks, 50 isolated reference cases, 18 three-engine ESM cases and 15 Getting
started/Axe cases pass. Complete unit results are recorded separately in
`artifacts/core-delivery-batch-6-report.json` rather than inferred in advance.

This checkpoint deliberately does not copy release/deployment workflows, install
unused tools, or add empty stubs to conceal inventory differences. The unchanged
upstream inventory still reports **17 differences**: seven unintroduced optional
maintenance tools and ten required Tremplin-specific production/shared helpers.
Core CSS/JS/canonical output inventories and packaging have zero gaps. Review of
the remaining maintenance commands, aliases, wider documentation, full root
quality workflow, pixel-image and manual accessibility acceptance remains open.

Recovery of the entire prior worktree is at
`C:/xampp/htdocs/tremplin-recovery/build-tool-cleanup-1794253157.zip`. All edits
remain local; nothing is committed, pushed, published or deployed.

The final complete serial unit run passes **1,096 tests across 92 files**,
including all previous 1,091 cases and five new relocation contracts. All 485
protected files remain byte-identical after the clean build, and the three
GitHub workflows remain byte-identical to recovery. The relocated release guard
still fails intentionally with its unreleased-migration explanation. This is not
a fresh 434-case browser or full documentation/screenshot/manual acceptance run;
the fresh browser scope is the 18 module and 15 Getting started cases above.
See `artifacts/core-delivery-batch-6-report.json` for exact scopes and failures.

## Current upstream update — 9 November 2026

The user-requested port targets `9062790fdb2379593a2973416dc5a3bfb203e4e3`.
It advances the former `3b7f323` reference by 13 commits and changes 12 core
files, including the added `util/scroll-lock.ts`. The inventory is now 137
modules: 102 Sass and 35 TypeScript, with 131 identity-adapted matches and the
same six approved patches. Every literal SEC-001/A11Y-001 edit is unchanged;
only the NavOverflow base/output digests require rebasing.

The reviewed public API delta is the additive `dialog-2xl` class. Multi-component
Data storage, native-dialog scroll ownership, Tooltip data handling and
NavOverflow sizing follow the new source. Existing historical checkpoints below
retain their original pins/counts. Publication and visual/manual acceptance
remain separate gates; this entry does not declare the full release complete.

Decision updated on 5 November 2026.

**Target: one Bootstrap 6-derived framework named Tremplin, with the complete pinned Bootstrap feature set and no maintained legacy implementation or compatibility layer.** Finish and verify that framework before expanding Tremplin-only features.

This supersedes the previous strict-core-plus-frozen-fallback strategy. Preserving old Tremplin APIs is no longer a release requirement. On 5 November, the legacy cleanup was implemented: 189 primary source/maintenance files and 4,073 generated/recovery copies were removed from the project. An external recovery ZIP retains the pre-removal source. All 136 pinned core modules and the approved source exceptions remain unchanged; publishing remains blocked.

### Implementation checkpoint: legacy removal

- Retired the frozen implementation, compatibility exports, old runtime owner, maintenance commands, obsolete API checkers/baselines, fallback-only tests, three archived documentation routes and all copied fallback assets.
- Added the explicit pin-bound strict API baseline, no-legacy gate and negative regression tests. Builds do not regenerate the baseline or legacy copies.
- Migrated duplicate-runtime coverage to current ESM/browser distributions and replaced published historical example links with current examples.
- Kept non-legacy optional extensions/adapters and useful root test/demo fixtures. Older hybrid-era assertions still need modernization; they are not a supported alternate framework or published example collection. Do not claim full release acceptance from this cleanup.
- See metadata/legacy-removal.json for exact retired targets and artifacts/legacy-removal-report.json for recovery and verification evidence. Detailed phases below remain the acceptance checklist, not a claim that every quality gate passes.

## 1. What “clone with the current project name” means

- Keep the project/product name **Tremplin**, package name `tremplin` and current project identity. Do not rename the product Bootstrap.
- Use the existing verified Bootstrap 6 reference: `twbs/bootstrap` revision `3b7f32318876bbd3c9cc14d3f891d744f39cd538`, package version `6.0.0-alpha.1`. This is the chosen pin, not a claim that a moving main branch is unchanged or currently latest.
- Preserve all **102 Sass modules and 34 TypeScript modules**, their public APIs, options, defaults, states, events, data APIs, keyboard/focus behavior and disposal contracts.
- Preserve module organization, import relationships, comment/section patterns and complete source coverage. The existing outer mapping `scss/* → src/scss/*` and `js/src/* → src/js/*` remains acceptable; there must be only one maintained implementation of each module.
- Public CSS class names remain unprefixed: no `trm-` class prefix. Keep the previously agreed identity substitutions: `--trm-*` CSS properties, `data-trm-*` hooks and `trm.*` event/instance keys. Third-party `--vc-*` properties retain their dependency-defined names.
- Preserve upstream copyright, source notices and `LICENSE.bootstrap`. Renaming the product does not remove attribution.
- Do not reproduce historical Bootstrap 5 APIs that the pinned Bootstrap 6 removed or replaced. Follow the pin's Menu, Dialog and Drawer patterns rather than introducing old aliases.
- “All features” means all features of that verified Bootstrap framework version, not a union of older Tremplin APIs, old Bootstrap versions and unrelated optional projects.

### Existing explicit exceptions

The previously approved `SEC-001` security fixes and `A11Y-001` NavOverflow clone-identity fix remain documented and enforced. Do not silently revert them while deleting legacy files, and do not add new behavioral differences under the label “branding.”

Current source verification is **130 exact identity-adapted modules plus six explicitly patched modules**, not 136 byte-identical copies. The patch registry must continue to reconstruct accepted source from the pristine pin. Any change to that exception policy requires a separate explicit decision.

## 2. Complete feature coverage to preserve

| System | Required coverage |
| --- | --- |
| Foundation and customization | Reboot, root/design tokens, colors and semantic theme roles, light/dark color modes, Sass configuration maps, functions, mixins, transitions, CSS layers and custom-property behavior |
| Layout | Containers, breakpoints, Flexbox grid and CSS Grid where provided/configured by the pin, container-query behavior, columns, gaps, gutters and responsive variants |
| Content | Typography/Prose, headings, lists, blockquotes, images and tables, including responsive behavior |
| Buttons and forms | Button variants/sizes/groups/close controls; fields, labels, form controls, checks, radios, switches, selects through the pinned form-control pattern, range, input groups, adornments, floating labels, help text, validation, chip inputs, combobox, OTP and strength feedback |
| Components | Every pinned component partial and plugin: accordion, alert, avatar, badge, breadcrumb, card, carousel, chip, datepicker, dialog, drawer, list group, menu, nav, navbar, nav overflow, pagination, placeholder, popover, progress, spinner, stepper, toast, tooltip and the remaining modules in Section 9 |
| Helpers and utilities | Every pinned helper and utility family, generation API, theme composition, responsive/state/print variants where actually configured, importance and reduced-motion behavior |
| JavaScript infrastructure | BaseComponent/DialogBase, DOM storage/events/manipulation/selectors, configuration, component functions, sanitizer, swipe, template factory, Floating UI integration, exports and declarative initialization |
| Interactions and accessibility | All supported options/methods/events; cancellation, disabled/active/open states, keyboard navigation, focus management/restoration, swipe, RTL, motion preferences and cleanup |
| Dependencies and delivery | Floating UI and Vanilla Calendar Pro integration; source/configurable Sass, full/Grid/Reboot/Utilities CSS, compiled JS/module/bundle outputs, declarations, individual entry points, source maps and integrity metadata |
| Documentation and examples | Getting started, guides, customization, layout, content, forms, components, helpers and utilities using real current classes/APIs and working examples |

The inventory in Section 9 is authoritative. A similar-looking demo or a matching filename is not proof that a feature is complete.

## 3. Remove legacy, not Bootstrap features

The cleanup covers all legacy-only implementation, delivery and maintenance surfaces. It must not delete a pinned module or an unrelated user asset merely because its name contains “legacy,” “compat,” or an old term.

| Surface | Planned action |
| --- | --- |
| `src/compat/legacy/` | Remove the complete old implementation after dependency/reference inventory |
| `dist/compat/legacy/` and copied equivalents | Remove generated legacy CSS/JS/types/themes and prevent their regeneration |
| `site/public/legacy/`, `site-dist/legacy/`, and copied legacy subtrees under `site/public/dist/` / `site-dist/dist/` | Remove archived runtime/example copies and their copy steps |
| `package.json` | Remove all `./compat/legacy*` exports, legacy side-effect entries, legacy scripts and fallback-dependent build/check stages |
| Legacy maintenance scripts | Retire `build-legacy.mjs`, `check-legacy.mjs`, `inventory-compat.mjs` and `preserve-legacy.mjs` once their callers are removed |
| Legacy metadata and baselines | Retire `metadata/compat-legacy-*` and old-contract-only baselines/checks; deliberately establish a strict Tremplin contract tied to the pin |
| Legacy tests and fixture imports | Port relevant assertions to strict APIs, then remove tests whose only purpose is preserving the discarded implementation |
| Old examples, themes and starters | Classify individually: migrate useful feature demonstrations; delete only confirmed obsolete/legacy-only files |
| Old documentation/version archives | Remove legacy-only guides/routes, old-version selector links and dead package/CDN instructions; remove `docs/LEGACY_COMPATIBILITY.md` after its references are replaced |
| `artifacts/legacy-recovery/` and other legacy-only caches | Resolve recovery/retention explicitly, then remove from the active project; never ship a hidden legacy fallback as a backup |

Before deletion, list exact files, inbound imports, export targets, script callers and generated copies. Validate resolved paths remain inside the intended project targets. A recovery copy, if retained, belongs at an explicitly selected non-shipped location, not as a second source implementation. Report what was removed and its recoverability when cleanup is implemented.

Keep the pristine pinned Bootstrap reference, source-policy registry, necessary licenses and useful verification evidence. Third-party tools' internal legacy-mode APIs, such as the qualified Playground audit runner, are not old Tremplin implementation files.

Tremplin-only extensions/adapters/icons are a separate classification: defer them from the initial clone's feature acceptance and default graph. Do not delete uniquely authored non-legacy work automatically. They may be reconsidered separately after the core milestone is green.

## 4. Ordered implementation

### Phase 1 — freeze scope and inventory the cleanup

Status: complete for the bounded cleanup inventory and recovery preparation; feature-level release acceptance remains separate.

1. Validate the pinned source inventory, allowed identity changes and approved exceptions.
2. Build a file-by-file feature checklist against all 136 modules and all required outputs.
3. Create a bounded legacy-removal manifest covering source, exports, scripts, metadata, tests, docs, assets, generated trees and recovery material.
4. Separate Bootstrap-required behavior from obsolete Tremplin-only contracts and non-legacy optional work.
5. Resolve recoverability before material deletion; do not assume this checkout has Git history.

Acceptance: every deletion candidate is classified, and every pinned feature has a retained implementation and verification owner. No broad directory deletion based only on a name match.

### Phase 2 — remove the legacy implementation coherently

Status: complete. The source/export/build/copy cleanup, installed-package checks and current-distribution runtime tests are verified in `artifacts/legacy-removal-report.json`. Retained root demo/test inputs still need modernization, but are not a supported fallback.

1. Remove legacy package exports, imports, build/copy steps, generated assets and maintenance callers together.
2. Remove the old fallback source and legacy-only metadata/scripts/docs/tests using the verified manifest.
3. Replace or remove old-version navigation and sample links; migrate useful examples to strict APIs.
4. Keep duplicate-runtime protection where useful for the current distribution, but remove tests and code branches that exist solely to mix strict and discarded legacy runtimes.
5. Add a no-legacy gate over maintained source imports, exports, build graphs, generated outputs and the packed tarball. Historical prose mentions are not runtime dependencies.

Acceptance: a clean build cannot recreate legacy files; no legacy package path resolves; no maintained module imports old code; source, site assets and the installed package contain no legacy implementation.

### Phase 3 — finish the complete Bootstrap-derived core

Review and verify coherent systems in this order:

1. Foundation/configuration and all Sass functions/mixins.
2. Layout, containers, breakpoints and grid behavior.
3. Content and typography.
4. Buttons and complete forms.
5. Every component partial and its JS behavior.
6. Helpers and every configured utility family.
7. DOM utilities, base classes, data APIs, dependency integrations and entry exports.

Use the pin's source and contracts rather than approximating behavior or adding compatibility aliases. Do not remove upstream features to simplify implementation, meet a size target or make tests pass.

Acceptance: all 136 modules remain accounted for, exact-plus-approved-patch verification passes, and feature-level coverage is complete.

### Phase 4 — replace obsolete tests and establish strict contracts

- Migrate obsolete Sass and documentation fixtures to actual pinned APIs. The seven foundation/layout suites are now migrated: 183 focused checks pass without skips. See [contract decisions and pinned limitations](SASS-FOUNDATION-MIGRATION.md). Utility/helper/content/customization and JavaScript fixture work remains. Replace retired API promises with pin-backed contracts and document why; do not port them to a fallback.
- Resolve the broader type-check configuration/API backlog. The last measured wider configuration has 57 diagnostics; the dedicated core typecheck passes. Do not disable strict checks merely to pass.
- Preserve the explicit strict API baseline and component metadata already established from real compiled/checker output. An intentional move away from old APIs is not an excuse to refresh that baseline or silently bless unexplained drift; prerelease contract review remains separate.
- Run the pinned JavaScript and configured Sass suites, strict CSS/source comparisons, security/CSP tests, browser interactions, package consumers, integrity and tree-shaking/isolation checks.
- Preserve applicable sanitizer, Trusted Types, srcset/link safety, focus, disposal, keyboard, RTL and reduced-motion assertions.
- Keep the implemented strict source/contract/no-legacy gates enforced; the old frozen-legacy preservation pipeline has been removed.
- Preserve the implemented separation of quality checks from publication permission: `check:release`, the release command and `prepublishOnly` remain blocked until explicit release review.

Acceptance: no legacy fixture dependency, no discovery failure, no unexplained type error, and no weakened security assertion.

### Phase 5 — build/package consistency

- Align the required package assets and module behavior to the reference, using Tremplin names.
- Keep one source implementation per component. Generated per-component files under `dist` are legitimate build outputs, not duplicate maintained sources.
- Retain Windows-compatible build orchestration only where output/API semantics remain correct. Review non-upstream packaging extras separately; do not confuse an extra compiled format with legacy source.
- Rebuild full, Grid, Reboot and Utilities CSS; JS module and bundled outputs; types; maps; integrity metadata and installed-package consumers.
- Ensure metadata, documentation and examples use the same strict exports, class names, options and event names.
- Automatic CSS-budget adjustments remain permitted as previously requested after checking for duplicate output. The separately approved JS ceiling stays 60,000 gzip bytes unless separately revised.

Acceptance: clean source checkout → clean build → installed package works, with no fallback, alias layer, stale declaration or copied legacy runtime.

### Phase 6 — documentation, visual and accessibility acceptance

- Finish the Bootstrap-like documentation using Tremplin branding and accurate current APIs. Do not present retired classes or extension-only features as core.
- Preserve upstream attribution and distinguish source-code notices from documentation attribution.
- Keep application/demo contrast customization explicit and copyable; it is not the framework default.
- Audit all active generated routes again after removing archives/extras; route totals may change intentionally and must be re-inventoried.
- Verify desktop/mobile geometry, light/dark, RTL, keyboard/focus, native state and dependency assets.
- Preserve the script-disabled Playground sandbox. Its parent-plus-inert-copy audit is explicitly qualified; it is not live in-sandbox Axe execution, pixel equivalence or manual certification.
- Review visual diffs before accepting snapshots. Complete manual accessibility and prerelease contract review.

Acceptance: current docs and examples work without legacy; no broken navigation; audited current route inventory; reviewed visual/manual results.

### Phase 7 — release readiness, not automatic publication

Declare the clone-first milestone complete only when every preceding acceptance gate passes. Removing a publication block, selecting a breaking prerelease version, publishing or deploying is a separate explicit release action. Retain the current Tremplin identity/version until that decision.

## 5. Target architecture

Current-only documentation cleanup, 9 November 2026: obsolete version-specific
migration pages, the superseded hybrid parity log and the old revision-specific
notice copy are retired. `docs/MIGRATION.md` is the single current adoption
guide. Maintainer overviews and `llms.txt` describe the strict core and native
ESM contract rather than old hybrid aliases or a classic global. Required
licenses, changelog history, approved source exceptions and regression fixtures
are retained; no source pin or public API is changed by this cleanup.

Repository-layout decision, 9 November 2026: keep `src/js/` and `src/scss/`
deliberately; these are not outstanding Bootstrap-root-layout migrations.
Use `build/` for all repository tooling and track the root `dist/` distribution.
The old tooling directory has no compatibility wrappers. Preview screenshots
live under `.github/assets/`, outside the npm package. Node/editor setup and
issue templates support repository maintenance without changing the pinned
framework, publishing a release, or deploying documentation.

- `src/scss/`: exactly the pinned Sass module set, adapted only by declared identity changes and approved exceptions.
- `src/js/`: exactly the pinned JS module set; no second maintained component tree or old core.
- `dist/`: regenerated Tremplin assets, with no `compat/legacy` subtree.
- `site/`: current strict documentation/examples, without old runtime copies or retired-version navigation.
- `tests/`: strict behavior, source, CSS, security, package and accessibility tests; no tests requiring discarded legacy code.
- `metadata/` and `build/`: strict reference/contracts/build/verification only, without a frozen-old-API maintenance pipeline.
- Non-legacy optional work stays separate and cannot redefine the initial clone's defaults or pull an old implementation into the build.

## 6. Current evidence versus pending work

Completed and verified checkpoints:

- The follow-up repository-wide [asset audit](ASSET-RETIREMENT-AUDIT.md) removes seven additional obsolete source/configuration/page files, 608 orphaned copied distribution files, standalone broken module copies and a stale trace cache. Current optional extensions/presets remain on strict tokens. Its exact 15-name CSS retirement and compiled-property inventory correction are recorded in `metadata/retired-css-contract.json`; this does not change pinned core source or JS/Sass APIs.
- Legacy source, compatibility exports, maintenance scripts, fallback-only fixtures, archived documentation routes and copied assets are removed. Recovery remains outside the project. The no-legacy gate prevents reintroduction.
- All 136 pinned core modules remain: 130 exact identity-adapted modules and six explicitly approved patched modules. No framework source or security policy changed during the foundation/layout test migration.
- The strict API baseline, current installed-package consumer, core type-check, build and production CSS gates passed after cleanup. The documentation build now has 189 pages, not the earlier 192 archived-inclusive count.
- The foundation/layout batch now passes 183 checks across seven suites, with no skips, using a separate hash-verified branded reference. The literal inventories point to the active pin rather than the earlier utility-development revision. See `artifacts/foundation-layout-unit.json` and [migration decisions](SASS-FOUNDATION-MIGRATION.md).
- Cleanup-specific verification passed 40 strict/security unit checks, 48 upstream Sass assertions, 33 production integration checks, six documentation checks in three engines and 11 server/guard checks. These are scoped results, not a full-release certification.

Historical evidence: earlier production upstream runs passed 1,373 JavaScript checks; pre-removal documentation work passed 192 generated-page checks, 93 preview/browser checks, 126 selected regressions and 21 focused units with the stated Playground qualification. Those earlier route totals are not current post-removal audits.

**Historical pending scope at the foundation checkpoint:** remaining hybrid-era assertions, remaining utility contracts, content/customization/documentation examples, JavaScript fixtures, the wider 57-diagnostic test compiler backlog, full current-route/visual/manual acceptance and prerelease approval. The foundation/layout checkpoint measured **430 passing and 174 failing checks out of 604, with no skips**, versus 355 passing / 243 failing before that batch. All seven migrated suites passed inside that run, with no newly failing assertions elsewhere. This is historical test-contract migration evidence, not 69 production framework bug fixes; later checkpoints below supersede its totals. The latest checkpoint and section 8 define current remaining work.

Current evidence is recorded in `artifacts/legacy-removal-report.json`, `artifacts/foundation-layout-unit.json`, `artifacts/foundation-layout-full-unit.json` and `artifacts/foundation-layout-migration-report.json`. Passing the focused batch does not make the complete quality or release gate green. Quality checks build before artifact-reading unit tests; reference preparation is explicit in CI.

After the follow-up asset retirement, `artifacts/asset-retirement-report.json` records 18 focused checks, 21 server/mirror safety checks, 33 production integration checks, 12 site checks and three performance checks passing. The full unit run records 436 passing / 174 failing checks (610 total), with no newly failing assertions; final starter markup is also checked in the focused rerun. The broad test compiler retains 57 diagnostics outside changed files. Six trace archives containing obsolete CSS were moved outside the project, with hashes preserved. This does not complete the remaining test/documentation or release acceptance work.

The focused Grid/gap follow-up passes **25/25 unit checks**, all three CSS Grid documentation Sass samples and **72/72 browser checks** across three engines. The full suite now reports **460 passing / 159 failing checks out of 619, with no skips or newly failing assertions**. All 183 foundation checks still pass inside that run. The broader test compiler retains the same 57 diagnostics, none in changed files. Core/API/no-legacy checks, four-output production CSS parity and the 189-page documentation build pass; no framework source, API baseline, approved exception, package version or release block changed. See `artifacts/grid-utilities-migration-report.json` and the [Grid/gap follow-up](SASS-FOUNDATION-MIGRATION.md#follow-up-focused-grid-and-gap-utility-contracts).

The helper follow-up passes **47/47 unit checks** and **109 browser checks across Chromium, Firefox and WebKit**, with two existing native forced-colors emulation skips for Firefox/WebKit. All ten helper Sass modules and their index match the verified pin, and all nine helper guide topics are updated. The final uncontended full suite records **491 passing / 142 failing checks out of 633, with no unit skips or newly failing assertions**, down from 159 failures. All 183 foundation and 25 Grid/gap checks still pass. Core/API/no-legacy checks, four-output CSS parity, the 189-page documentation build and unchanged 57-diagnostic test compiler backlog are recorded in `artifacts/helpers-migration-report.json`. The guides disclose the pinned primary-button contrast limitation and use a readable existing variant; no framework source, API baseline, approved exception, version or release-block setting changed. See the [helper decisions](SASS-FOUNDATION-MIGRATION.md#follow-up-helper-contracts-and-guides).

The Utility API follow-up passes **61/61 focused unit checks**, all eight API-guide Sass examples and **48/48 browser checks with no skips** across Chromium, Firefox and WebKit. The complete run now records **546 passing / 117 failing checks out of 663, with no unit skips or newly failing assertions**, down from 142 failures. All 183 foundation, 25 Grid/gap and 47 helper checks remain green. Source/API/no-legacy gates, core types, four-output CSS parity and the 189-page site build pass; the broader test compiler remains at 57 diagnostics with none in changed files. The API guide records the pin's variable-registration, attribute/state and reduced-motion limitations, with tested application alternatives; two wide API tables now opt into accessible keyboard scrolling. No framework source, production API baseline, approved exception, version or release-block setting changed. See `artifacts/utility-api-migration-report.json` and the [Utility API decisions](SASS-FOUNDATION-MIGRATION.md#follow-up-utility-api-contracts-and-documentation).

The remaining utility-family and topic-guide follow-up passes **119/119 focused checks** and **198/198 broad browser checks with no skips or flaky retries** across Chromium, Firefox and WebKit. All 47 topic guides are current, the completed API guide is preserved, and all 48 utility pages have responsive/light/dark accessibility and navigation coverage. Seven final alignment-example refinements pass another 21 targeted page checks; hashes verify that the other 41 pages and shared assets are unchanged. The complete suite now reports **632 passing / 40 failing checks out of 672, with no skips or newly failing assertions**, down from 117 failures. Earlier foundation (183), Grid/gap (25), helper (47) and Utility API (61) checks remain green. Source/API/no-legacy gates, core types, four-output production-CSS parity and the 189-page site build pass; the broader test compiler remains at 57 diagnostics outside changed files. Framework source, API baseline, exceptions, version and release-block settings remain unchanged. See `artifacts/utility-families-migration-report.json` and the [family/topic decisions](SASS-FOUNDATION-MIGRATION.md#follow-up-remaining-utility-families-and-all-utility-topic-guides).

The mixed CSS/metadata/documentation follow-up passes **83/83 focused checks** and **99/99 broad browser checks without skips or flaky retries** across Chromium, Firefox and WebKit. It updates all 24 layout/content/customization routes (23 upstream topics plus the existing CSS-variable cross-reference), comparing all 26 Sass samples and checking every live/HTML class and styled runtime token. The prior CSS Grid guide data is preserved. Three final table-page rechecks pass; hashes verify the other 23 pages and shared assets unchanged. The complete suite now records **688 passing / 10 failing checks out of 698, with no skips or newly failing assertions**, down from 40 failures. All previous migrated suites remain green. Source/API/no-legacy gates, core types, four-output CSS parity and the 189-page site build pass; the test compiler retains 57 existing diagnostics, none in changed files. Core source, strict API baseline, exceptions, version and release block are unchanged. See `artifacts/mixed-docs-migration-report.json` and the [mixed guide decisions](SASS-FOUNDATION-MIGRATION.md#follow-up-mixed-css-metadata-and-layoutcontentcustomization-guides).

The JavaScript fixture follow-up passes **49/49 focused checks**, **50/50 isolated reference checks** (including a stage constructor-identity guard), and **69/69 browser checks without skips or flaky retries** across Chromium, Firefox and WebKit. The 49 fixture cases include three separately identified local CommandPalette cases, not upstream parity claims. Native tests cover dialog routing/focus/scroll, tooltip Escape behavior, Toast transitions/interaction, Menu-backed Combobox and configured Toggler behavior; all eleven customization pages pass, including corrected method-return and distribution-format guidance. The complete unit suite is now green: **711 passing / 0 failing checks, with no skips**, compared with 688 passing / 10 failing before this batch. Every previous migrated suite remains green. Source/API/no-legacy gates, core types, four-output CSS parity and the 189-page site build pass. The broader test compiler is down from 57 to **53 diagnostics**, none in changed files; 52 arise from checking core sources under the broader profile and one is test-owned. Framework source, strict baseline, exceptions, version and release block remain unchanged. See `artifacts/js-fixtures-migration-report.json` and the [JavaScript fixture decisions](SASS-FOUNDATION-MIGRATION.md#follow-up-javascript-component-discovery-and-interaction-fixtures).

The test-compiler follow-up resolves the remaining **53 diagnostics to zero**, preserving `strict` and `noUncheckedIndexedAccess` in the test project. The unchanged pinned core profile now produces fresh declaration-only project-reference output before the harness is checked; all 42 producer-project files, all 134 test roots and 39 consumed generated declarations are verified. Three virtual indexed/null/API probes are still rejected with TS2322, and a Node timer remains valid only in the harness context. The known div fixture uses the correct HTMLElement query type. Full unit tests remain **711/711**, isolated reference checks **50/50**, and direct core tests **7/7**, all without skips. Source/API/no-legacy and pinned core types pass; no source, strict baseline, exception, version or release-block change is made. The full browser collection preflight identifies five stale Sass fixture imports and executes no tests; those are the next migration batch, not a browser-acceptance pass. See `artifacts/test-typecheck-alignment-report.json`, `artifacts/browser-acceptance-preflight.json` and the [compiler-boundary decisions](SASS-FOUNDATION-MIGRATION.md#follow-up-strict-test-compiler-project-boundary).

The browser-collection follow-up migrates the five stale Sass fixtures without changing core source. Full browser collection now succeeds with **396 cases across 19 files**; all wrappers remain included. All **120 focused checks pass without skips or flaky retries** across Chromium, Firefox and WebKit. The collection-time helper compares complete compiled fixture CSS with the independently verified approved pin, including separate Reboot/focused-entry stylesheet composition. Tests preserve canonical layout, breakpoint, spacing and cascade behavior and explicitly reject retired APIs and aliases. Strict test types remain at zero diagnostics, now including the new helper among 135 test roots; the indexed/null/API rejection probes remain intact. Source/API/no-legacy, pinned core types and all four production-CSS comparisons pass. No core, baseline, exception, version or release-block change is made.

A bounded default-browser assessment stops after 12 failures: **73 passed, 12 failed, one interrupted and 310 unstarted**. It executes only Chromium before the failure cap, not a complete three-engine acceptance run. Remaining observed work includes legacy expectations in layout-defaults, the published CSS Grid route being requested from the repository fixture server, and example accessibility/interaction contracts. The cap is supplied on the assessment command only, not installed as an acceptance bypass. Final regressions remain green: **711/711 full unit checks and 50/50 isolated reference checks**, without skips. See `artifacts/browser-collection-migration-report.json`, `artifacts/browser-layout-collection.json` and `artifacts/browser-acceptance-assessment.json` for this checkpoint. Earlier browser-preflight failures above are historical and superseded for collection only.

The remaining-browser follow-up migrates layout-defaults to canonical positive/negative contracts and independent fixture CSS parity. It fixes example contrast, Carousel target size, Calendar Pro keyboard selectors, the Drawer-backed responsive navbar and Menu-backed Combobox; the optional CommandPalette remains separate. The published CSS Grid assertion moves to its own site-server spec and remains required by root `check`. All **58 focused checks pass**, with two existing forced-colors emulation skips, and all **three relocated docs-page checks pass** across the three engines. Strict test types remain at zero diagnostics for 136 roots; source/API, all four production-CSS outputs, 21 server/guard checks and the 189-page local site build pass.

The subsequent default-browser run completes all **393 cases across 19 files: 389 passed, zero failed, four existing native forced-colors emulation skips, no flaky retries**. Chromium passes 131; Firefox and WebKit each pass 129 with two emulation skips. The diagnostic 12-failure cap never triggers; there are no interrupted or unstarted cases. The count changes from 396 to 393 only because the same three-engine published-page check now runs on the correct site server, where it passes. No browser wrapper is excluded and no timeout, Axe rule or visual baseline is relaxed. Core source, frozen API baseline, approved exceptions, version and release block remain unchanged. See `artifacts/browser-followup-migration-report.json`, the complete `artifacts/browser-followup-assessment.json`, and the [follow-up decisions](SASS-FOUNDATION-MIGRATION.md#follow-up-remaining-browser-layout-documentation-routing-and-example-contracts). Earlier bounded-assessment failures are historical and superseded by this runtime checkpoint, not proof of site-wide/manual/release completion.

Final unit verification records **711/711 passing with one worker**, and the isolated reference run passes **50/50**, both without skips. The first two-worker attempt recorded 710 passes and one unchanged Sass test timing out at 5000ms; that original report is preserved. No timeout, assertion or unit fixture is changed to obtain the complete serial pass. This does not certify default parallel CI timing stability. The remaining quality/release gates below are still required.

The package/performance/quality assessment verifies the installed npm tarball consumer and replaces the timing-only delegated Toggler benchmark with actual configured target mutations. All **three engine checks pass** at the unchanged 1000ms budget: approximately **168.8ms Chromium, 400ms Firefox and 232ms WebKit** for the first 500-target activation pass. Every target must activate and reset, with 500/1000 lifecycle events and no mutated triggers. These are local DOM microbenchmark measurements, not all-device rendering or input-latency guarantees.

The complete default site run reaches **all 644 cases across 41 files: 635 passed, nine failed, no skips or flaky retries**. Its 12-failure cap never triggers. All **189 generated-route WCAG audits pass**, retaining the existing explicit Playground inert-copy qualification; this does not certify widget interaction or manual accessibility. One failure is then corrected: close controls render a button-level SVG mask, not ::before text. The focused check verifies real image decoding, painted geometry, focus and Alert dismissal and passes. A separate nine-case follow-up confirms **eight remaining failures plus one passing live Datepicker/SVG control**. There is no invented new full-site 636/8 score; the entire 644-case suite has not been rerun after the close-test change.

Visual acceptance remains red. Both core gallery comparisons fail against the old baselines; the bounded documentation screenshot run reports **12 failures and 54 unstarted cases out of 66**. A Forms screenshot recheck also fails. All **68 baseline images remain byte-for-byte unchanged**, with snapshot updates explicitly disabled. The gallery still contains retired modifiers/tokens and the images show substantial typography/color/content differences; do not restore aliases or overwrite expectations to conceal these findings. Strict test types, source/API, all four production-CSS comparisons and the no-legacy gate pass. No framework/application source, frozen baseline, approved exception, version or release-block change is made. See `artifacts/quality-acceptance-report.json`, `artifacts/quality-visual-baseline-inputs.json` and the [quality assessment decisions](SASS-FOUNDATION-MIGRATION.md#follow-up-package-configured-performance-and-quality-acceptance-assessment). Earlier unit/browser results remain historical checkpoints; this batch does not rerun or certify the complete root quality workflow.

The documentation-contract fix resolves all eight observed failing scenarios without changing core. Forms/components Combobox now use the real Menu-backed trigger, search, focused options and submitted values; Navbar uses responsive native Drawer; Toggler examples configure their target class/attribute and stop claiming disclosure/focus behavior. Chip remains CSS-only, with removal tested on the actual Chips collection. Overlay checks wait for shown lifecycle completion rather than clicking during the pin's transition guard. Form heading/outline checks use the complete published guide, including its explicit contrast section, rather than raw pre-transformation data.

The independent inventory also uncovers and restores **seven genuinely missing canonical Guides routes**. The exact contract now requires **140 pinned product routes plus 56 explicitly classified local routes, 196 total**; it validates all 141 raw MDX Git blob hashes and explicitly excludes only the upstream noindex docs-renderer showcase. The new seven pages are clearly scoped Tremplin setup/adoption guides, not a claim of verbatim or exhaustive upstream historical prose. Foundational guides increase from 109 to 116. The route floor is not simply reduced to the old build count.

The complete default site run passes **663/663, with no skips, failure cap or flaky retries**, including all **196 generated-page accessibility audits** and the existing qualified Playground audit. All **36 focused Chromium/Firefox/WebKit checks pass**. Final wording/setup refinements affect only Toggler and Parcel: hashes preserve the other 194 HTML pages and all 138 shared render assets; six three-engine page rechecks and one final search check pass. These scoped rechecks overlap the broad runs and are not summed as distinct contracts. All saved visual baselines remain untouched; no visual acceptance or publication is claimed. Final unit/reference/type/source/API/package results and exact evidence are recorded in `artifacts/docs-contracts-migration-report.json`.

Final regressions pass **725/725 complete unit checks** with one worker and unchanged timeout limits, **50/50 isolated reference checks**, strict type boundaries for **139 test roots**, source/API, four-output production-CSS and installed-package consumer checks. All original 711 unit checks remain; fourteen focused guide/inventory/markup regressions are added. No skips, assertions, source exceptions or production API baselines are weakened or refreshed. This is still not full visual/manual or release acceptance.

## 7. Verification workflow

These commands use the current strict/no-legacy pipeline. The focused test command does not replace the full suite:

~~~powershell
npm.cmd run build
npm.cmd run check:production-css
npm.cmd run typecheck:tests
npm.cmd run test:typecheck-boundaries
npm.cmd run test:sass:foundation
npm.cmd run test:sass:grid-utilities
npm.cmd run test:sass:helpers
npm.cmd run test:sass:utility-api
npm.cmd run test:sass:utility-families
npm.cmd run test:sass:mixed-docs
npm.cmd run test:js:fixtures
npm.cmd run test:js:fixtures:reference
npm.cmd run check:bootstrap
npm.cmd run check:api
npm.cmd run check:no-legacy
npm.cmd run typecheck
npm.cmd run test:bootstrap-production
npm.cmd run test:package
npm.cmd run site:build
npm.cmd run test:site:grid-utilities
npm.cmd run test:site:helpers
npm.cmd run test:site:utility-api
npm.cmd run test:site:utility-families
npm.cmd run test:site:mixed-docs
npm.cmd run test:browser:js-fixtures
npm.cmd run test:browser -- --list
npm.cmd run test:browser:layout-collection
npm.cmd run test:browser -- tests/browser/layout-defaults.spec.ts tests/browser/accessibility.spec.ts
npm.cmd run test:site:grid-utilities -- css-grid-page.spec.ts
npm.cmd run test:browser -- tests/browser/performance.spec.ts
npm.cmd run test:site -- component-reference.spec.ts --grep "masked close controls"
npm.cmd test -- tests/documentation.test.ts tests/forms-docs.test.ts tests/site-contract-migration.test.ts --maxWorkers=1
npm.cmd run test:site:contracts
npm.cmd run test:visual -- --update-snapshots=none
npm.cmd run test:site -- --list
npm.cmd run test:site-visual -- --update-snapshots=none
~~~

The no-legacy gate is wired into root and site builds and has negative regression tests included with server checks. Old fallback-preservation commands are not acceptance requirements. Publication remains independently blocked.

The focused foundation tests require the separately prepared pinned reference stage. On a new checkout, run `npm.cmd run audit:bootstrap -- --fetch --stage --check`, then `npm.cmd run validate:bootstrap-stage`; an existing verified raw cache only needs `--stage --check`. CI prepares the fixed-commit reference before quality tests. Never generate expected source from the production tree or refresh it automatically after a failing assertion.

The mixed CSS/documentation batch additionally requires `check:production-css` after a build. It independently reconstructs the approved CSS assembly from the verified raw pin and existing literal patch registry. The new helper checks every assembled Sass file against the hash-verified pristine stage plus that registry, then compares complete compiled output without filtering declarations. The root quality command now runs this gate before unit tests, so CI/release checks do not depend on a pre-existing local assembly. No production API baseline or exception is refreshed.

## 8. Immediate next action

**Next: validate actual remote CI and complete the wider consumer-toolchain and manual release qualification.** The fresh local end-to-end chain and optional suites below now pass completely. Keep the core, API, approved patches, compiler profiles and accepted images fixed. Remote workflow execution/repository writes need a confirmed target and authorization; they have not been performed. Publishing remains blocked and must not be enabled automatically. See `artifacts/full-quality-follow-up.json` for the remaining gates.

### Completed: Fresh complete local quality pipeline (9 November 2026)

`npm.cmd run check` succeeds as one uninterrupted fresh run. It passes strict producer/test types, the complete rebuild, source/API and no-legacy gates, four-output independent CSS parity, **990 units in eighty files**, fifty reference fixture cases, installed-tarball consumption, 22 server cases, **416 native-browser cases** with the same four pre-existing non-Chromium forced-colors exclusions, two core visuals, the site build, **all 1,018 default-site cases**, and **all 139 documentation visuals**. No isolated reruns, test fixes, screenshot updates, timeout increases, rule exclusions or size-limit changes are needed in this batch.

After the root command completes, the optional documentation suite passes **321/321** as one fresh serial run across Chromium, Firefox and WebKit. Its one-worker configuration retains every existing assertion and time limit, including the heavier calendar and palette scans. The complete optional React/Vue/extension integration suite then passes **33/33**. Heavy suites do not overlap. These results replace the earlier phase's sequential-only qualification limitation; the older logs and phase reports remain historical evidence, not newly rewritten successes.

Before/after hashes prove all **543 protected source/metadata/license/profile/distribution files**, **141 accepted images**, **196 generated HTML routes** and **150 render assets** are byte-identical. The core remains 130 identity-adapted matches plus six existing approved patches, with no new exceptions or API changes. Strict type boundaries retain 179 test roots, the unchanged 42-file producer, 39 consumed declarations and zero diagnostics. The ESM delivery audit reports no differences; distribution/theme mirrors and the no-legacy gate pass. Framework and application styling remain unchanged.

Evidence and exact qualification limits are in `artifacts/full-quality-report.json`, `artifacts/full-quality-identities.json`, `artifacts/full-quality-before.json` and the three `full-quality-*.log` suite logs. No remote CI, publication, deployment or manual screen-reader/real-device certification is implied by this local success. Local Sites verification does not register or deploy a hosted Site.

### Completed implementation: Bootstrap 6-style ESM browser delivery (9 November 2026)

The Git-blob-verified pinned build configuration is authoritative: standard browser builds externalize Floating UI and Vanilla Calendar Pro, while bundle builds include both. All four public browser downloads now export ES modules, use `type="module"`, and create no implicit `TremplinFramework` window global. Local `dist/vendor/` modules support same-origin import maps. The unminified root, component and optional-extension entries retain one shared graph/instance cache; independent builds still reject a second runtime before duplicate data API registration. CJS facades remain a supported format of the same source, not a legacy implementation. No package export, frozen API, version or compiler profile changes.

Installation, Quickstart, JavaScript/package/customization guidance, raw examples, starter markup and browser fixtures use the new contract. Private documentation core/palette entries share a split ESM graph and explicitly own their existing inspection hook; native QA uses a separate test-owned ESM bridge. Neither reintroduces a public IIFE distribution. Full Tremplin, upstream and dependency license notices accompany the distribution. Standard and bundled minified JS measure 35,039 and 59,511 gzip bytes respectively, within the unchanged 60 kB limit; CSS remains 52,168 bytes within 56 kB.

Fresh checks pass 990 unit cases in eighty files, 22 server cases, strict type boundaries (179 roots, unchanged 42-file producer and 39 consumed declarations, zero diagnostics), installed-package consumption and all 33 optional integration scenarios. The tarball probe checks all twenty ESM/CJS classes, shared instances, native bundle exports without a global, local vendor/notices files, strict actual packed declarations and Sass/CSS/SVG consumption. All 136 core modules remain 130 identity-adapted matches plus six previously approved patches; no source exception is added. All four production CSS outputs, no-legacy, API, source and byte-identical site mirror gates pass.

Browser qualification is explicitly sequential. The complete native run passes 413, encounters three Firefox startup/load timeouts and retains four existing non-Chromium forced-colors exclusions; the three unchanged isolated cases pass, covering all 416 applicable scenarios. The targeted three-engine documentation run passes 307/321; eleven timing cases and three stale classic-script palette fixtures pass through serial rechecks after the fixture markup is corrected. The optional ESM documentation configuration now uses one worker; no assertion, WCAG tag, timeout or tolerance is weakened. The optional integration run initially exposes six further classic-script injection fixtures; native imports/import maps preserve both duplicate-owner orders, and its fresh complete 33-case rerun passes.

The first documentation visual run passes 124 and identifies fifteen intended content changes: installation and the explicit setup blocks for Datepicker, Range, Strength and Command Palette, in light/dark/RTL. Original images and initial diffs are retained. Widths remain identical; the first 91–94% of the component images and 42% of installation images are pixel-identical before the edited blocks. Only those fifteen baselines are accepted. An independent targeted recheck and fresh full **139-case no-update** run pass at unchanged 0.03 tolerance, as do both unchanged core visuals. All 188 protected source/API/CSS/profile inputs and the 196-route inventory remain unchanged; the common module script changes route HTML, not framework styling. The other 126 saved images are unchanged.

Exact evidence, retained initial failures, hashes and qualification limits are in `artifacts/esm-migration-report.json`, `artifacts/esm-migration-identities.json` and `artifacts/esm-visual-review.json`. The original development server remains PID 3052 on port 4321; Install, Utilities, the documentation ESM entry and notices return HTTP 200. Sites is used only for local preview/verification. No publication, deployment or remote CI execution is performed.

### Completed preflight: Complete suites and installed package (8 November 2026)

Restored the missing `LICENSE.bootstrap` from the Git-verified pin and enforced exact preservation in the source audit, metadata test and installed tarball. A targeted LF checkout rule preserves that byte identity on Windows. The three workflow definitions now use Node 24 because installed Astro/Vitest do not support their old Node 20 selection; the documentation workflow also prepares the required pinned reference before building. CONTRIBUTING describes the matching checkout workflow. These are local configuration changes, not a remote CI/deployment result.

The strengthened package probe installs the real tarball into a separate temporary consumer. All twenty ESM and CJS component classes match their root exports, bare package imports share instances, optional exports resolve separately, Sass customization works without optional core leakage, and installed JS/CSS/SVG compilation has no host-source fallback. Actual packed declarations pass strict NodeNext ESM/CJS consumption with library checking enabled and four expected-error probes. The package contains 577 files and the exact upstream notice; publishing remains blocked.

The full initial `npm run check` passes its 984 then-current unit cases, fifty isolated JS fixture cases, 21 server cases, 401/405 native-browser cases (four existing non-Chromium forced-colors exclusions), two core visuals, build/source/API/size/CSS gates and the site build. Its complete default-site suite then passes 1,014/1,018 and exposes four harness failures: an obsolete Navbar label selector, an unrelated first Form adorn wrapper, an old Palette option label and a mid-transition theme contrast scan. The repaired tests target the real component relationships/current text and assert a neutral link's final theme color before the unchanged WCAG audit. No production CSS or test timeout/tag/assertion is weakened.

Final verification passes all 990 unit cases in eighty files, strict type boundaries (177 roots; unchanged 42-file producer and 39 declarations), all fifty cases in the four affected site files, twelve Chrome/Firefox/WebKit repair cases and the full 139-case no-update docs visual suite at unchanged 0.03 tolerance. This establishes all 1,018 default-site scenarios through sequential evidence, not a fresh single clean 1,018-case run or a fresh monolithic `npm run check` success. One initial production-reference Menu timeout and a contended/aborted extra unit attempt remain recorded; unchanged rechecks and fresh full final runs pass without retries/timeouts being relaxed.

Both identity-adapted immutable upstream and actual production core pass 48 Sass tests and 1,373 Chromium reference tests. Final source/API, four-output CSS parity, no-legacy, type, mirror and installed-package gates pass. Root distributions are rebuilt but remain byte-identical; all 529 protected inputs, 196 generated HTML routes, 148 tracked render assets and 141 saved images are unchanged. No application/page source or screenshot baseline changes. Exact scope and evidence are in `artifacts/project-qualification-identities.json` and `artifacts/project-qualification-report.json`.

The Git-verified build audit confirms remaining `DIST-001`/`DIST-002`: pinned browser output is ESM, with external peers in the standard build and dependencies bundled in the bundle; current Tremplin browser downloads are classic self-contained IIFEs. These are explicitly unresolved delivery-contract differences, not hidden source exceptions. Next migration must also review banners/third-party notices, import maps/local assets, and size checks on the self-contained bundle after externalizing the standard file. Actual CI, wider consumer-toolchain and manual/native-device qualification remain pending. Sites is local QA only, the existing 4321 server is preserved, and no publication/deployment is performed.

### Completed: Homepage and installation reconciliation (8 November 2026)

The installation guide now preserves the immutable Bootstrap 6 Install/More packages/CDN/Download/AI hierarchy while documenting Tremplin's actual checkout. Its cached MDX blob is Git-hash verified against commit `3b7f32318876bbd3c9cc14d3f891d744f39cd538`; a live immutable raw URL fetch was unavailable, so this is not a fresh moving-main comparison. Local tarballs are the package-manager default. Both Floating UI and Vanilla Calendar Pro are included in package commands, focused component subpaths use their real default export, and registry/CDN instructions are explicitly conditional on verified publication. No RubyGems/Composer/NuGet package, hosted source archive, agent-skills package or public release is invented.

The browser examples retain the distribution's current classic IIFE contract, with one runtime owner and both dependencies bundled. This differs from the pinned Bootstrap 6 module/import-map CDN packaging and remains an explicit packaging-review item, not a core source modification. The complete copied starter uses canonical unprefixed button classes and coherent `dist/css`, `dist/js` and `dist/icons` paths. The shared Quickstart now describes the same files and uses a styled disclosure. Windows launcher and documentation-server startup instructions distinguish the framework checkout from a consumer application. The homepage retains Tremplin branding, uses the actual version and an honest development-preview label, and replaces an unverified registry install advertisement with a labelled checkout dependency command.

Acceptance passes eleven source/import/reference tests, strict TypeScript boundaries (175 roots, unchanged 42-file producer and 39 consumed declarations, zero diagnostics and all three rejected probes), a clean 51-case Chromium/Firefox/WebKit run, 23 retained Chrome Getting started/navigation/search/download/icon cases, eight route/inventory audit cases and the complete 139-case no-update documentation visual suite at unchanged 0.03 tolerance. Initial copy-feedback failures were changing-accessible-name test locators; stable action locators fix the harness without changing product behavior or removing assertions. Initial esbuild DOM-realm/output-loader test setup is corrected. PowerShell's warning-stream exit ambiguity is resolved by final browser/visual commands with explicit native exit codes. Earlier candidate and repeated confirmation counts are not added to final distinct coverage.

All fifteen final review captures are inspected, including light/dark/RTL main content, mobile/copy-focus states and five readable installation sections. Only isolated section crops hide the sticky header; page/mobile/test captures retain it. Six accepted expectations match independent captures exactly. The two old pending images are updated, four dark/RTL images are added, 135 other saved images remain identical and none are removed (141 total: 139 docs plus two core). The two originals are retained and hash-verified. No documentation screenshot remains pending in this run; the separate core visual suite is not freshly rerun here.

Only three of 196 route HTML files change: homepage, installation and shared Quickstart. The other 193 routes and all 148 tracked render assets remain byte-identical; Pagefind is content-derived and search is separately rechecked. All 529 protected inputs, core modules, approved exceptions, API baselines, root distributions, version/profile and release block remain unchanged. Source/API, all four CSS parity outputs, token, no-legacy and mirror gates pass. Root dist is not rebuilt. Exact before/after identities and evidence are in `artifacts/entry-docs-scope.json`, `artifacts/entry-docs-after.json` and `artifacts/entry-docs-report.json`.

Sites is used for local preview and browser verification only; no registration, publication or deployment is performed. The owned 4177 review server is stopped and the existing 4321 development server is preserved. This does not claim a fresh complete root/default-site/installed-package/isolated-reference/parallel-CI or manual assistive-technology/real-device/release certification. Remaining tasks are listed in `artifacts/entry-docs-follow-up.json`.

### Completed: Remaining Forms composition and validation guides (8 November 2026)

Input group, Floating labels, Form adorn, Layout and Validation now use the actual classes, maps, selectors and native/application behavior from immutable Bootstrap 6 commit `3b7f32318876bbd3c9cc14d3f891d744f39cd538`. All five cached MDX blobs are independently Git-hash verified. Their original descriptions/titles and the seventeen-topic Forms order remain unchanged. This is Tremplin-adapted, source-derived documentation, not verbatim prose parity with moving main.

Forty copied/live examples cover addons, textareas/selects/files, choices, multiple fields, real sibling and split Menus, ignore-edge rounding and group sizes; label-first floating focus/value/textarea/select/date/time/disabled/plaintext/always/grid cases; native label-wrapped ghost inputs with real start/end/sizing/focus/state behavior; canonical responsive grid/gutters/horizontal labels/offsets/inline layouts; and custom/native/server/composite/tooltip/scoped-success validation. All seven addon, fifteen floating and three adorn properties are source-verified, with approved-pin Sass-map/mixin output comparisons. Incorrect local-only capability claims, retired classes and invented adorn sizing names are removed. No new framework API or form plugin is introduced.

The shown/executed application handler prevents local submission, enables initially disabled buttons only after installation, updates summary links and explicit ARIA/classes while correcting errors, focuses recovery targets, handles reserved-code custom validity and clears state on reset. Native success styling is scoped away from the optional sibling. Values are not sent, persisted or logged. Decorative URL/domain punctuation has explicit LTR direction within RTL layouts. Copied application CSS strengthens text/placeholder/floating/tooltip contrast, restores plaintext focus, mirrors physical select carets, styles adorned disabled wrappers and reserves nonoverlapping tooltip space; core remains unchanged.

Final focused acceptance passes 89 unit checks (21 new), strict type boundaries for 173 roots with the unchanged 42-file producer/39 consumed declarations, zero diagnostics and all three rejected negative probes. A clean 99-case serial-worker Chromium/Firefox/WebKit run passes. After the final tooltip-spacing and Layout-prose edits, all 27 affected validation/Layout cases pass again; they overlap earlier cases and are not 27 additional distinct contracts or a fresh single full run on the last presentation delta. All 24 separate real-page geometry checks pass across engines, widths, themes and directions. Eleven retained Chrome regressions, eight route/inventory audits and fifteen no-update visuals pass at unchanged 0.03 tolerance. Exact scopes, earlier findings and final statistics are recorded in `artifacts/form-composition-report.json`; candidate counts are not added to final distinct coverage, and no WCAG rule, timeout or screenshot tolerance is relaxed.

All 67 final captures are reviewed: forty examples, fifteen light/dark/RTL main-content views, ten mobile/focus states, an open mobile menu and a focused mobile error summary. Fifteen new expectations match independent captures exactly. All 122 pre-existing images remain identical; none is replaced or removed (137 total: 135 docs plus two core). Homepage and installation remain the same two older pending expectations, not a newly measured whole-suite failure count.

Only five of 196 route HTML files change; 191 other pages and all 148 tracked render assets remain byte-identical. Pagefind, source maps, JSON and non-index HTML are outside that render-identity scope; search is separately rechecked. All 58 protected inputs, all 136 core modules, six approved exceptions, frozen API, root distributions and version/profile/release block remain unchanged. Source/API, four-output production CSS, token, no-legacy and mirror gates pass; root dist is not rebuilt. Exact identities are in `artifacts/form-composition-identities.json` and `artifacts/form-composition-render-inputs.json`.

The five-topic Forms follow-up backlog is closed; continue with homepage/install and complete quality/release reconciliation. Sites is used only for local preview/browser QA; owned temporary QA servers are stopped and the existing 4321 development server is preserved. Nothing is registered, published or deployed. No fresh complete root/default-site/installed-package/isolated-reference/parallel-CI run or real-device/native-platform/manual assistive-technology/release certification is claimed.

### Completed: Field, Form control, Checkbox, Radio and Switch documentation (8 November 2026)

Five guides now use the actual native-form composition from immutable Bootstrap 6 commit `3b7f32318876bbd3c9cc14d3f891d744f39cd538`. Each cached MDX blob is independently Git-hash verified. This is source-derived, Tremplin-adapted documentation, not verbatim prose parity with moving main. Original titles and search descriptions are retained, avoiding unrelated search-shell changes.

Thirty-one live examples cover grid-based Field, named fieldsets and stretched-label cards, native selects/textarea/multiple/type/file controls, sizing and disabled/readonly/plaintext states, focusable ghost composition, CSS-mask checks, explicit mixed state, mutually exclusive native radios and CSS Switch wrappers. Labels, IDs and descriptions are associated; style specimens use separate radio names. Checkbox's shown/executed property setup is application code, not a select-all controller. No new form plugin, backend, upload, persistence or framework API is introduced.

Token tables and compilable Sass samples reflect the real source, including all eight Radio and seventeen Switch defaults missing from the older generic catalog. Published-but-unused Checkbox radius/active tokens and the unemitted label map are explicitly qualified; the default-merged size map distinguishes null removal from false iteration, and a custom compact size supplies its six required root properties. Native browser/platform picker, keyboard, switch-hint and submission limits are not advertised as framework guarantees. Copied scoped application CSS supplies demo contrast, plaintext focus and RTL select/caret positioning without changing core.

Final acceptance passes 63 focused unit checks (20 new), strict type boundaries (171 roots; unchanged 42-file producer and 39 consumed declarations; zero diagnostics and all three rejected probes), 96 distinct Chromium/Firefox/WebKit contracts established through 81 matrix/interaction cases and fifteen final no-JavaScript cases, ten retained Chrome navigation/native interaction/search/copy/icon checks, eight route/inventory audits and fifteen no-update visual checks at unchanged 0.03 tolerance. The earlier 84-case candidate passed 83 but timed out in a combined no-JavaScript fixture. After splitting by route, the 96-case run passed 95 and identified the same Firefox property-evaluation stall with JavaScript disabled. Checking the identical mixed state through the native :indeterminate selector resolves the harness issue; all fifteen no-JavaScript cases then pass, overlapping fourteen earlier passes. This is not a fresh single clean 96-case run; all scenarios and the original timeout are retained. No WCAG tag, retry policy, assertion or image threshold is relaxed. Earlier candidate/recheck counts are not added to final distinct coverage.

All 56 captures are reviewed: 31 live examples, fifteen light/dark/RTL main-content views and ten mobile/focus states. Fifteen new expectations match independent captures byte-for-byte. All 107 older images remain unchanged; none is replaced or removed (122 total: 120 docs plus two core). Homepage and installation remain the same two pending older expectations, not a newly measured failure count. Five separate topic reviews remain: Input group, Floating labels, Form adorn, Layout and Validation.

Only the five native-form guide HTML pages change among 196 routes; the other 191 pages and all 148 tracked render assets are byte-identical. Pagefind, source maps, JSON and non-index HTML are outside that render-identity inventory; search is rechecked separately. All 55 protected inputs, all 136 core modules, the six approved exceptions, frozen API, root distributions, version/profile and release block remain unchanged. Source/API, four-output production CSS, tokens, no-legacy and mirror gates pass; root dist is not rebuilt. Evidence: `artifacts/native-forms-report.json`, `artifacts/native-forms-identities.json`, `artifacts/native-forms-render-inputs.json` and `artifacts/native-forms-follow-up.json`.

The Sites skill is used only for local preview/browser QA, without registration, publication or deployment. Owned temporary QA servers are stopped at handoff. This is not a fresh full root/default-site/installed-package/isolated-reference/parallel-CI run or real-device/native-platform/manual assistive-technology/release certification.

### Completed: Forms overview and component Forms guide (8 November 2026)

Both routes now share source-derived native examples, actual CSS classes and explicit application-only demo setup. The overview preserves the pinned reference's Overview, Disabled forms, Accessibility and CSS coverage, with additional readonly/submission semantics, validation recovery, all sixteen individual topic links, and the complete 39-property root-form-variables group. Its cached Bootstrap overview MDX is Git-hash verified against immutable commit `3b7f32318876bbd3c9cc14d3f891d744f39cd538`; this is adapted documentation, not verbatim prose parity with moving main. The existing search description stays unchanged to avoid unrelated shell changes.

Nine component examples and five overview examples cover labels/help, native text/select/textarea sizing, disabled fieldsets, readonly FormData, check/radio/switch keyboard behavior, label-first floating fields, named input-group addons, canonical md:col-6 layout, dark RTL and working validation/summary recovery. Unsupported form-select/form-check/form-switch/form-label-required/error-summary classes are removed from the Forms component catalog/examples. The guide reports forms plus Input group's actual components layer. There is no Forms JavaScript plugin. Representative control/root tokens and the compilable root/control map example do not invent a global Forms map.

The same copied/executed application handler prevents local submission, reports only successful field names, maintains explicit feedback/aria-invalid/summary focus and clears state on native reset. Demo action buttons start disabled until handlers are attached; no-JavaScript cases verify native controls remain usable without enabling submission. Scoped application CSS emphasizes error/placeholder text without changing core defaults. No values are sent, persisted or printed by the handler.

Final verification passes 40 focused checks (11 new), strict test boundaries (169 roots, unchanged 42-file producer/39 declarations, zero diagnostics and three rejected probes), a clean 54/54 serial-worker Chromium/Firefox/WebKit run, ten retained Chrome navigation/search/catalog/copy/icon/interaction checks, five route/inventory audits and six final no-update screenshots at unchanged 0.03 tolerance. No test rule, timeout or screenshot threshold is relaxed. Twenty-six captures cover all fourteen examples, six main-content views, two desktop error states and four mobile states. All six accepted expectations match separate reviewed captures byte-for-byte.

Only the old Forms component expectation changes, five default/dark/RTL views are added, 101 saved images remain identical and none are removed (107 total: 105 docs plus two core). Its old original is retained and hash-verified. Homepage and installation remain pending, carried forward from three rather than reported as newly measured failures. This does not mark the ten separate native-form topic pages complete; their exact follow-up inventory and evidence are in `artifacts/forms-overview-follow-up.json`.

The final build retains 196 routes: only `/components/forms/` and `/forms/overview/` change; 194 other pages and all 148 tracked render assets stay byte-identical. Pagefind, source maps, JSON and non-index HTML remain outside that identity scope; search is checked separately. All 55 protected inputs, all 136 core modules, approved exceptions, frozen APIs, version/profile and release block stay unchanged. Source/API, all four production CSS comparisons, token, no-legacy and site mirror gates pass. Root dist is not rebuilt. Evidence is in `artifacts/forms-overview-report.json`, `artifacts/forms-overview-identities.json` and `artifacts/forms-overview-render-inputs.json`.

Sites is used only for local documentation/preview/browser QA, without registration, publication or deployment; owned temporary servers are stopped. Complete root/full-default-site, installed-package, isolated-reference, parallel CI, real-device/native-platform and manual assistive-technology/release acceptance remain outside this focused batch. Follow-up native-form pages retain their previous content until deliberately migrated; browser accessibility on the overview is not proof that all linked topic prose is current.

### Completed: Bottom Sheet and Command Palette documentation (8 November 2026)

Bottom Sheet is now an explicit documentation alias/composition of native Drawer, with the shared Drawer import, implementation source, actual events and API link. Six real opening examples replace unsupported bottom-sheet size/handle classes and fabricated token maps. They cover content-height, body scrolling, static rejection, width/instant presentation and dark RTL. The drawer-sheet width fallback is distinguished from the Drawer Sass map, and drawer-fit-content is correctly described as an inset reset rather than a height preset. The first example's extra mobile height and the copied/executed shown-event initial-focus handler are disclosed application choices, not changed core defaults. The cached Drawer MDX blob is independently Git-hash verified against immutable commit `3b7f32318876bbd3c9cc14d3f891d744f39cd538`.

Command Palette remains an optional local JS/CSS extension with no upstream core counterpart. Five live examples use its real named optional import, actual token map, two defaults and seven event payload/timing descriptions. Group labels are excluded from the option tree while supplying generated group names; non-tabbable div options support active-descendant navigation. All guide instances opt out of global shortcuts so they do not fight documentation search. Copied/executed application code provides only transient preview feedback, a known-launcher show-gate focus policy and an open-state search shortcut guard. Separate disclosed application CSS supplies focus outlines and active-result contrast. None changes the optional implementation or promises native inertness, top-layer rendering, document-wide focus containment, snap points or automatic business actions.

Final verification passes 45 focused checks (10 new), strict test boundaries (167 roots, unchanged 42-file producer/39 declarations, zero diagnostics and three rejected probes), a fresh 51/51 serial-worker Chromium/Firefox/WebKit run, eight route/inventory audits and six final no-update screenshot checks at unchanged 0.03 tolerance. The broader retained Chrome selection covers 82 distinct cases: its run passed 81, then the existing compound loading/identity scenario passed after its stale Skeleton and Avatar selectors were corrected to already-authored semantics. This is reconciled coverage, not a fresh single clean 82/82 run. Earlier candidate failures and the final recheck remain recorded; no rules, assertions or timeout budgets are relaxed.

Twenty-two captures cover six main-content views, eleven open examples, four mobile states and the optional API page. All six accepted expectations match independently reviewed captures byte-for-byte. Four existing expectations change, two dark/RTL views are added, 96 other saved images remain identical and none are removed (102 total: 100 docs and two core). All four old originals are retained and hash-verified. Three other expectations remain pending, carried forward from seven rather than reported as a new full-suite failure count.

The final build retains 196 routes: only the two guides, optional API page and two catalogs change; 191 other pages and all 148 tracked render assets remain byte-identical. Pagefind, source maps, JSON and non-index HTML remain outside that stated asset identity scope; search is checked separately. All 41 protected inputs, all 136 core modules, approved exceptions, frozen API, version and release block are unchanged. Source/API, four-output production CSS, no-legacy and mirror gates pass. Root dist is not rebuilt. Evidence and identities are in `artifacts/sheet-command-report.json`, `artifacts/sheet-command-identities.json` and `artifacts/sheet-command-render-inputs.json`.

Sites is used only for local documentation/browser QA, without registration, publication or deployment; temporary QA servers are stopped. The retained 82-case selection excludes the unchanged Playground scenario. No complete root/full-default-site, installed-package, isolated-reference, parallel CI, real-device gesture, manual assistive-technology or release acceptance is inferred. Native modal guarantees belong to Drawer, not to the optional palette; palette background-focus and nested-overlay limits remain explicit evaluation work before shipping.

### Completed: Datepicker, OTP Input, Range and Strength documentation (8 November 2026)

All four component/Forms guides, their API pages and catalog entries now share source-verified examples, actual classes/tokens, correct initialization targets and complete option-default tables (14 Datepicker, five OTP, two Range and six Strength). Four cached Forms MDX blobs are Git-hash verified against Bootstrap commit `3b7f32318876bbd3c9cc14d3f891d744f39cd538`; this is not a moving-main or verbatim prose parity claim. Thirty-five component examples and eight Forms examples cover actual supported states. Datepicker's obsolete local class names are removed from the documentation catalog: the pinned Sass uses Calendar Pro data selectors. OTP event names are presented with the actual `otpInput` suffix without changing the frozen filename-derived scanner catalog. Range/Strength report their actual Forms layer and all four use complete generated token documentation.

The guides distinguish source behavior from application work. Datepicker text submission is locale formatted, manual edits do not resync selected-date arrays, API setters are silent, only the months extension is enabled, and Calendar Pro replaces inline children. The copied application handler therefore maintains sibling hidden ISO fields rather than pretending detached child inputs submit; a real inline click is verified. A disclosed demo-only hidden-popup display rule prevents stale desktop popup coordinates from causing mobile resize overflow. The two-month demo explicitly uses the supported 36rem minimum-width token inside a named/focusable scroll owner. No core CSS, sanitizer, CSP/Trusted Types rule or same-origin arrow is changed.

OTP retains one named native input and decorative slots, ASCII filtering, grouping, visual-only masking, native disabled/readonly and documented programmatic/disposal differences. The pin's RTL tap algorithm remains physical and is not advertised as fully direction-aware. Range documents native value/FormData, wrapper update ownership, unchanged-value notifications, bubble-only formatting versus literal datalist labels, snapshotted ticks and physical LTR fill/bubble in RTL. Strength covers segmented/single-bar/static/custom examples, level-only notifications and redacted payloads, no numeric ARIA meter, complete nested-map replacement and missing-weight/invalid-scorer risks. Examples use synthetic values, no requests or automatic submission, and explicitly shared displayed/executed application setup rather than a new framework plugin.

All 66 focused unit/reference/metadata checks pass, including 17 new contracts. Strict boundaries pass with 165 test roots, the unchanged 42-file producer/39 declarations, zero diagnostics and three rejected probes. All **123 distinct three-engine browser contracts** are covered: the complete page-split run passes 122, and the corrected formatted-paste case passes in Chromium, Firefox and WebKit (two overlap). Firefox discarded synthetic ClipboardEventInit data; the final fixture uses the existing project pattern and verifies the actual payload. This is not described as a fresh single 123/123 process run. Page splitting preserves every light/dark/LTR/RTL component/Forms desktop/mobile/open-calendar audit without increasing the 30-second limit or relaxing rules. Twenty-two retained Chrome checks and fifteen route/inventory audits pass. A retained Forms assertion was scoped to its original strength-feedback ID after a new bar example made the generic locator ambiguous.

Twelve final no-update screenshot checks pass at unchanged 0.03 tolerance; all twelve saved expectations match separate reviewed captures byte-for-byte. Datepicker's visual clock and preview locale are explicit harness settings, not changes to application defaults. Six old expectations change, six dark/RTL views are added, 88 other images remain identical and none are removed (100 total: 98 docs plus two core). Original copies remain hash-verified. Seven other expectations remain pending, reconciled from the previous thirteen rather than reported as newly measured failures. The final build keeps 196 routes: fourteen guide/API/example pages change, 182 other pages and all 148 tracked render assets remain byte-identical to the Chips/Combobox checkpoint. Thirty-five protected inputs and all 136 core modules are unchanged; source/API, four-output production CSS, no-legacy and mirror checks pass. Full evidence and earlier findings are in `artifacts/advanced-inputs-report.json`; release remains blocked and no publication/deployment occurs.

### Completed: Chips and Combobox documentation and visual contracts (8 November 2026)

Both component guides, their Forms guides, API pages and catalog entries now share source-verified classes, examples and accurate option/event descriptions. The immutable reference is Bootstrap 6 commit `3b7f32318876bbd3c9cc14d3f891d744f39cd538`, including hash-verified Forms MDX blobs; this is not a moving-main or verbatim prose parity claim. Each component has eleven live examples. Chips covers limits, duplicates, invalid descriptions, separators/blur, theme tokens, sanitized icons, an empty disabled input, explicit JSON submission and dark/RTL. Combobox covers actual button/Menu/listbox semantics, single/multiple identifiers, disabled/no-results states, preselection, accent normalization, groups/descriptions, native sizes and dark/RTL.

The guides explicitly preserve upstream limitations: no automatic Chips submission or live/ARIA selection model; generated versus authored dismiss-control differences; input disabling is not a complete keyboard/programmatic lock; clear bypasses remove vetoes; disposal does not restore generated DOM. Combobox uses real option focus, authored search markup and one generated hidden input, with comma-separated multiple values. Its notifications/promises do not await Menu completion, outside dismissal may occur through Menu, and search=false does not disable a supplied search listener. No fictitious getValue/setValue API or independent Combobox Sass token map is documented. Copyable focus/contrast CSS and the copied/executed Chips JSON handler are explicitly application-owned, not changes to pinned core defaults.

All 54 focused unit/reference/metadata checks pass, including nine new contracts. Strict type boundaries pass with 163 test roots, the unchanged 42-file producer and 39 declarations, zero diagnostics and three rejected negative probes. A fresh final scoped matrix passes 42/42 across Chromium, Firefox and WebKit: component/Forms desktop/mobile light/dark/LTR/RTL WCAG through 2.2, open Combobox accessibility, real keyboard focus, cancellation/clear behavior, limits/duplicates, literal text/sanitized icons, submission, normalization, disabled matches and event timing. The earlier 42-case candidate run is overlapping evidence, not 42 additional contracts. Nine final route/inventory checks and thirteen retained Chrome regressions pass. Final evidence, the exact retained-selector adjustment and limitations are recorded in `artifacts/choice-inputs-report.json`.

All 22 component examples, four Forms examples, five main-content views and four mobile states are inspected, with readable API/Sass and grouped-open details. The final no-update visual run passes 5/5 at the unchanged 0.03 tolerance, and all five expectations match separate reviewed captures byte-for-byte. Three existing expectations change and two dark/RTL views are added; 89 other images remain identical and none are removed (94 total: 92 documentation and two core). All three originals remain hash-verified. Thirteen other documentation expectations remain pending, reconciled from the preceding sixteen rather than presented as fresh failures.

The final build retains 196 routes. Only the two component guides, two Forms guides, two API detail pages, API index and standalone controls consumer change; 188 other pages and all 148 tracked render assets remain byte-identical to the local-pattern checkpoint. Source/API, four-output production CSS, no-legacy and site-mirror gates pass. Twenty-five protected inputs remain identical, including the two plugins and three related Sass modules. No core/optional distribution, approved exception, frozen API, version, dependency or release-block change is made. Sites is used only for local build/preview/browser QA; no publication or deployment is performed. Full root/release acceptance and manual assistive-technology testing remain separate work.

### Completed: local Status, Timeline, Divider, Empty State and Data Table guides (8 November 2026)

The five retained guides now explicitly identify Status, Timeline, Divider, Empty State and Data Table as optional local CSS extensions in the custom layer, not Bootstrap core components or plugins. The immutable Bootstrap 6 manifest at 3b7f32318876bbd3c9cc14d3f891d744f39cd538 has no matching component pages/root Sass modules; new contracts verify that boundary. The component catalog uses local-css-extension classification and actual class names. The guides alone now load the already-existing extension stylesheet after core; core routes remain opt-out and the existing CommandPalette opt-in is preserved. No core or extension source is changed, and both distributed optional CSS formats still match their unchanged local Sass assembly.

Thirty-five live examples (seven per guide) replace unsupported aliases, inert actions and ambiguous behavior claims. Status has readable state labels, one pre-existing polite live region, a separately initialized decorative dot and source-verified reduced-motion pulse behavior. Timeline preserves ordered-list/time semantics, logical marker geometry and chronological DOM order; the actual horizontal scrolling list is named and focusable. Divider separates hidden decoration from named structural boundaries, without pretending to be a draggable/focusable splitter. Empty State actions use real destinations or explicitly transient page-only creation; its copied handler updates status and focuses a surviving link without persistence or network writes. Data Table keeps captions/scoped headers, native search/sort/check controls, real sticky/scroll regions and an explanatory empty row. A shared copied/executed application handler performs only local sorting/filtering/selection, synchronizes one header's aria-sort, checkbox-derived table-active styling and status counts, and adds no grid roles or plugin. The existing documentation-only table-cell isolation is also applied here so actual core padding/borders show through prose styles.

All 57 focused unit/reference/metadata checks pass, including 21 new optional-source, Sass, class/token, raw-renderer and semantic contracts. Strict type boundaries pass with 161 test roots, the unchanged 42-file producer and 39 declarations, zero diagnostics and three rejected negative probes. A fresh final scoped matrix passes 78/78 across Chromium, Firefox and WebKit, without skips, flaky retries, relaxed assertions or increased timeout limits. It covers desktop/mobile light/dark/LTR/RTL WCAG A/AA through 2.2, real optional CSS loading/absence, CommandPalette preservation, native keyboard behavior, focus/status changes, reduced motion, logical geometry, sorting/filtering/empty recovery, checkbox state and sticky/native scrolling. The earlier 78/78 run is retained separately; it is not summed as extra distinct contracts. The final run also checks corrected singular selection text.

Thirteen retained Chrome copy/icon/search/render/semantic/example checks and seven scoped route checks (inventory, component index and five guides) pass. An additional 390px component-index audit passes WCAG and overflow checks with all five extension badges present; its first ad-hoc launch used an unsupported convenience-page context, then the required explicit context passed without any source or assertion change. All 35 live examples, eleven main-content views and six mobile states are reviewed, including full-resolution nested dark details. The final no-update visual check passes 11/11 at unchanged 0.03 tolerance; all eleven expectations match independently reviewed captures byte-for-byte. Seven existing images change, four dark views are added, 81 other images remain identical and none are removed (92 total: 90 documentation and two core). All seven originals remain hash-verified. **16 other documentation expectations remain pending**, reconciled from the preceding 23 rather than reported as newly measured failures.

The final build keeps 196 routes: only the five guide HTML pages and component index change; 190 pages and all 148 explicitly tracked render assets stay byte-identical to the Chip/Table checkpoint. Pagefind, maps, JSON and non-index HTML are outside that stated identity scope; search is checked separately. Source/API, four-output production CSS, no-legacy and site-mirror gates pass. Twenty protected inputs remain identical: the preceding thirteen plus both optional CSS distributions and five local Sass source files. Evidence, limitations and hashes are in artifacts/local-patterns-report.json, artifacts/local-patterns-render-inputs.json and artifacts/local-patterns-pending-images.json.

Sites is used only for local build/preview/browser QA; no registration, publication or deployment occurs. Core source, six approved exceptions, frozen API, version, strict-core-unreleased profile and release block remain unchanged; root dist is not rebuilt. This batch does not certify a fresh complete unit/root run, full default-site, installed-package, isolated-reference, parallel CI, real devices or manual assistive-technology/release acceptance. Next: Chips and Combobox final documentation/visual review, then remaining form/input, retained pattern and home/install visual contracts before release-gate reconciliation.

### Completed: Chip and Table documentation (8 November 2026)

Chip and Table documentation is now checked against immutable Bootstrap 6 commit 3b7f32318876bbd3c9cc14d3f891d744f39cd538. The retained Chip URL references upstream forms/chips rather than inventing a components/chip page; Table references content/tables and correctly labels its content CSS layer. Thirty-three live examples cover ten Chip and 23 Table views. This is pinned source/markup/behavior alignment, not verbatim prose parity with moving main.

Chip catalog claims now use actual chip-img, chip-icon and chip-dismiss classes; nonexistent size/avatar/group/remove aliases are removed from its documentation. The primitive supplies styling, not a standalone controller. Native filter buttons and the nested dismiss control use a shared, copyable application handler for aria-pressed/active synchronization, status updates and focus return. The explicit focus-ring helper restores visible native keyboard focus; native disabled remains distinct from CSS-only disabled. Static spans do not acquire control semantics. Existing disclosed contrast customization is retained, with no new Chip plugin or change to the editable Chips implementation.

Table examples cover themes on tables/rows/cells, row/column stripes, hover/active accents, borders, compact padding, group dividers, captions, vertical alignment, nested tables, card wrappers, five responsive prefixes, horizontal scrolling and always/container-responsive stacking. Correct theme-* and prefix:table-responsive names replace obsolete aliases. Source-verified guidance distinguishes viewport-based prefixed overflow from container-based stacking; inherited theme properties are not claimed to be reset by nested tables. Captions/scoped headers remain real; generated data-cell labels supplement them, with explicit matching table roles in stacked examples and manual assistive-technology limitations disclosed. There is no Table plugin, grid navigation, sorting or selection controller.

The initial native run retains 15 passes and 18 Table failures. These reveal real light-theme contrast and narrow Firefox nesting problems plus documentation prose rules overriding actual cell padding/borders. Table now opts into the existing disclosed contrast wrapper, the nested example has a named scroll region, and a Table-page-only revert-layer rule returns live cells to their framework padding/border/alignment layers. No core values or global docs.css are changed. The initial unit run retains two new-test mistakes: digit-leading CSS selector escaping and an application data attribute accidentally matching a retired-name substring. Those were corrected without weakening retained assertions. The first screenshot invocation also exposed a duplicate newly added Table-dark test; the existing test is preserved and the duplicate is removed.

Final focused unit/reference/metadata checks pass 45/45, including ten new pinned-doc, Sass, class/token, raw-renderer and semantic contracts. Strict boundaries pass with 159 test roots, the unchanged 42-file producer and 39 consumed declarations, zero diagnostics and three rejected negative probes. A fresh complete scoped browser matrix passes 33/33 across Chromium, Firefox and WebKit, with no skips, flaky retries, relaxed assertions or increased timeout limits. It retains desktop/mobile light/dark/LTR/RTL WCAG A/AA through 2.2, native activation/removal focus/status, disabled behavior, real sizes, container-only resizing, keyboard horizontal scrolling, viewport overflow, nesting, compact padding and card-border checks.

All nine retained Chrome copy/icon/search/semantic/example checks pass, including editable Chips removal and the standalone production controls consumer. Four route checks pass: generated inventory, component index and both affected guides. All 33 examples, five main-content views and four mobile states are reviewed. The final no-update screenshot check passes 5/5 at unchanged 0.03 tolerance; all five expectations match separate reviewed captures byte-for-byte. Three existing images change, two dark/RTL images are added, 83 other images remain identical and none are removed (88 total: 86 documentation and two core). All three original expectations remain hash-verified. **23 other documentation expectations remain pending**, explicitly reconciled from the preceding 26 rather than reported as fresh failures.

The final build keeps 196 routes: only Chip and Table guide HTML changes, 194 other pages and all 148 tracked render assets remain byte-identical to the adaptive-navigation checkpoint. Pagefind, maps, JSON and non-index HTML are excluded from the stated asset identity scope; search is checked separately. Source/API, four-output production CSS, no-legacy and site-mirror gates pass. Thirteen protected inputs are unchanged. Evidence and final hashes are in artifacts/chip-table-report.json, artifacts/chip-table-render-inputs.json and artifacts/chip-table-pending-images.json.

Sites is used only for local build, preview and browser QA; nothing is registered, published or deployed. Core source, approved six-module exceptions, frozen API, version, strict-core-unreleased profile and release block remain unchanged; root dist is not rebuilt. No fresh complete unit/root run, full default-site, installed-package, isolated-reference, parallel-CI, real-device or manual assistive-technology/release acceptance is inferred. Next: review remaining additional pattern/extension guides separately from upstream components, then reconcile pending form/site visual contracts and release gates.

### Completed: Navbar, NavOverflow and Toggler documentation (8 November 2026)

The three guides are now authored against immutable Bootstrap 6 commit 3b7f32318876bbd3c9cc14d3f891d744f39cd538, with 32 live examples (12 Navbar, 11 NavOverflow, nine Toggler). This is pinned markup, Sass and behavior alignment, not verbatim prose parity with moving main. Navbar uses native Drawer dialogs, container-driven expansion, real Navbar token maps and explicit application-owned focus wiring. An initial WebKit focus failure is retained: the documentation now shows the same small shown-event autofocus policy it runs; no core implementation or approved exception changes.

NavOverflow documents measured wrappers, kept items, real Menu integration, original-node relocation, approved descendant-ID remapping, ResizeObserver versus explicit update notifications and disposal limitations. Presentation uses the actual .trm.navoverflow event namespace without changing frozen scanner metadata. Toggler examples configure the actual target, preserve native disabled behavior and demonstrate multi-target, attribute, protected-id and null/no-op semantics. The guide and API restore the real attribute/value options and data-trm-attribute hook omitted by the frozen alias-type scanner; the frozen API remains unchanged.

All 63 focused unit/reference/metadata checks pass. Strict type boundaries pass with 157 roots, the unchanged 42-file producer and 39 consumed declarations, zero diagnostics and three rejected negative probes. Forty-eight distinct browser contracts have passing evidence across Chromium, Firefox and WebKit: the initial matrix passed 47/48; all 15 Navbar cases then passed after the documented application focus fix, and all 15 Toggler cases passed after the final options correction (29 overlapping earlier passes). This is not represented as a fresh single 48/48 run. No assertion, WCAG rule, timeout or visual tolerance is weakened; no skips or flaky retries occur in the successful follow-ups.

Final checks pass all 12 retained Chrome copy/icon/search/navigation/example cases and eight scoped route checks (inventory plus seven changed pages, including the standalone controls example). All 32 examples, eight main-content captures and three mobile states are reviewed. The final no-update screenshot comparison passes 8/8 at unchanged 0.03 tolerance. Seven saved images match independent reviewed captures byte-for-byte; Navbar RTL differs by ten edge pixels in an otherwise equal 765-by-10021 capture. Five existing images change, three are added, 78 other images stay identical and none are removed (86 total: 84 documentation and two core). Original copies of all five replaced expectations remain hash-verified. Only two formerly pending NavOverflow expectations are retired; the other three replaced images were already accepted and are re-reviewed. **26 other documentation expectations remain pending**, reconciled explicitly rather than reported as newly measured failures.

The final build retains 196 routes. Seven HTML pages change versus the loading checkpoint, 189 remain identical and all 148 explicitly tracked render assets remain byte-identical. The final Toggler options correction affects only its two already scoped guide/API pages; 194 other pages and all tracked assets stay identical. Pagefind, maps, JSON and non-index HTML are outside that asset identity claim; search is checked separately. Source/API, all four production CSS distributions, no-legacy and site-mirror gates pass; thirteen protected inputs are unchanged. See artifacts/adaptive-nav-report.json, artifacts/adaptive-nav-render-inputs.json and artifacts/adaptive-nav-pending-images.json.

Sites is used only for local build, preview and browser QA, without registration, publication or deployment. Core source, six approved exceptions, version, strict-core-unreleased profile and release block remain unchanged; root dist is not rebuilt. No fresh complete unit/root run, full default-site, installed-package, isolated-reference, parallel-CI or manual assistive-technology/release acceptance is claimed. Next: Chip and Table documentation, then the remaining additional patterns and site-contract reconciliation.

### Completed: Progress, Spinner, Placeholder/Skeleton and Avatar documentation (7 November 2026)

The four implementation guides and shared Placeholder route now use supported classes, real Sass maps and canonical markup from immutable Bootstrap 6 commit 3b7f32318876bbd3c9cc14d3f891d744f39cd538. This is pinned implementation/documentation alignment, not verbatim prose parity with moving main. Thirty-five live examples cover progress values/bounds, width/height, labels, themed backgrounds, individually named stacked segments, stripes, unknown completion, both spinner variants, shared small sizing, disabled loading controls, custom rotation, placeholder sizes/wave/pulse/busy regions, image/initial avatars, statuses, sizes, stacks, native links, dark presentation and RTL.

Progress semantics and segment widths belong on each progress wrapper in a stack. Animation does not update or announce values. Spinner uses separate border/grow token maps and spinner-sm, not variant-specific small aliases; reduced motion slows border/grow to 1.5s rather than stopping them, while custom rotation has no automatic reduction. Placeholder uses real opacity and wave token maps. Skeleton remains only a documentation route alias, never a new CSS class or plugin. Busy-region status text is separate from pending content, and loading completion is application-owned. Avatar uses avatar-stack, avatar-img and real status classes, without invented group/square/link/wrapper classes. Its physical margin-left/right geometry and row-reverse ordering are documented rather than promising automatic semantic mirroring. The new same-origin SVG illustration is original demo artwork. Existing disclosed application contrast wrappers remain unchanged, not core defaults.

Final affected unit/reference/metadata checks pass 25/25, including sixteen new immutable MDX, class/token, renderer, approved-pin Sass and semantic contracts. Strict boundaries pass with 155 roots, the unchanged 42-file producer and 39 declarations, zero diagnostics and all three rejected negative probes. No fresh complete unit/root run is claimed.

Sixty distinct browser contracts have passing evidence across Chromium, Firefox and WebKit: the initial full matrix passed 57/60, then all fifteen affected Spinner cases passed after an explicit accessible button label was added (twelve overlap). All other guide HTML and render assets remain identical across that correction. These are not described as a single fresh 60/60 run. The first spinner measurement error used a rotating transformed bounding box; the corrected test still requires .75em CSS width. The later missing button name was a real authored-markup defect: nested role=status text did not name the button, so aria-label was added without relaxing the name assertion. The tests retain desktop/mobile WCAG A/AA checks through 2.2, actual motion/geometry assertions, native disabled behavior and named identities/statuses. The placeholder completion check explicitly emulates application rendering, not nonexistent plugin behavior.

All seven final scoped route checks pass: the inventory, five affected guide pages and unchanged API index. Fifteen retained Chrome topic/alias/mobile/contrast/copy/icon/search checks pass. All 35 live examples, eight main-content captures, four mobile examples and a visible paused grow-spinner phase are reviewed. All eight final saved expectations match separate reviewed captures byte-for-byte; a final no-update comparison passes 8/8 at unchanged 0.03 tolerance. Six existing images change, two dark images are added, 75 other saved images remain identical and none are removed. There are 83 images total (81 documentation plus two core). Original copies remain hash-verified under test-results/loading-docs-visual-before. **28 other documentation expectations remain pending**, carried forward rather than freshly measured failures.

The final build retains 196 routes: only five guide HTML pages change versus the previous checkpoint, with 191 unchanged. All 147 existing tracked render assets remain identical; the original avatar SVG is the sole addition, bringing that explicit asset inventory to 148. Source parity, frozen API, all four production CSS distributions, no-legacy and site-mirror gates pass. All thirteen protected inputs are unchanged. See artifacts/loading-docs-report.json and artifacts/loading-docs-render-inputs.json for scoped evidence, retained failures and final input hashes. Sites is used only for local build/preview/browser QA; no registration, publication or deployment occurs. Core source, approved six-module exceptions, version, strict-core-unreleased profile and release block remain unchanged. Full default-site, installed-package, isolated-reference, parallel CI and manual assistive-technology/release acceptance are not inferred. Next: audit Navbar, NavOverflow and Toggler documentation comprehensively before reviewing the remaining additional patterns.

### Completed: Dialog, Drawer, Tooltip and Popover documentation (7 November 2026)

The four overlay guides now use canonical markup, actual token maps and supported behavior from immutable Bootstrap 6 commit 3b7f32318876bbd3c9cc14d3f891d744f39cd538. This is documentation/catalog alignment with the pinned implementation, not verbatim prose parity with moving main. Thirty-six live examples cover native named Dialog/Drawer panels, deliberate initial focus, cancelable starts, transitions, static rejection, dialog swaps, responsive Drawer presentation, core sheet classes, physical/responsive tip placement, named disabled wrappers, sanitized HTML, dark presentation and RTL.

Dialog distinguishes native showModal from non-modal show, root scroll locking from backdrop handling, cancel notifications from the hide gate, and data-API focus return from application-owned programmatic policy. Drawer documents its actual modal condition (backdrop || !scroll), root-owned configuration and lg:drawer behavior; unsupported size and bottom-sheet aliases are removed from authored examples/catalog claims. The existing disclosed demo contrast wrapper remains an application choice, not a changed core default. Tooltip/Popover explain explicit documentation initialization versus lazy core hooks, Floating UI, generated descriptions and sanitization. Default click Popover does not dismiss outside; an explicit focus trigger provides that policy. Nested tips consume the first Escape without closing their parent Dialog. Internal Drawer resize handling is not presented as a dispatched lifecycle event.

Final verification passes 25 affected unit/reference/metadata checks, strict types with 153 roots, the unchanged 42-file producer and 39 declarations, zero diagnostics and all three rejected negative probes. This batch does not claim a fresh complete unit run. Sixty distinct browser contracts pass through 20 Chromium and 40 Firefox/WebKit cases on unchanged final inputs, including light/dark, initial LTR/RTL, desktop/mobile WCAG A/AA checks through 2.2 and live cancellation/focus/dismissal behavior. All 12 retained Chrome overlay, topic, Drawer contrast, copy/icon and search regressions pass. The scoped route run passes 27 checks: one inventory check, all 22 API pages and four affected guides; it is not a fresh full-site route audit.

All 36 examples, eight main-content captures and four open mobile overlays are visually reviewed. All eight saved expectations match separate reviewed captures byte-for-byte, and an independent no-update run passes 8/8 at the unchanged 0.03 tolerance. Exactly six existing expectations change, two dark expectations are added, 73 other images remain identical and none are removed. Total inventory is 81 images (79 docs plus two core). Six original images remain recoverable and hash-verified under test-results/overlay-docs-visual-before. There are **34 other documentation expectations pending**, carried forward from the previous inventory, not newly measured failures.

The build retains all 196 routes: nine guide/API/index pages change, 187 remain identical and all 147 explicitly tracked render assets remain byte-identical. The no-legacy and site-mirror gates pass. Source parity, frozen API and all four production CSS checks pass; all 13 protected inputs remain unchanged. See artifacts/overlay-docs-report.json and artifacts/overlay-docs-render-inputs.json for precise inputs and scopes. Sites is used only for local build/preview/browser QA, with no registration/publication/deployment. The strict-core-unreleased profile, version, six approved exceptions and release block remain unchanged. Full root quality, installed-package, isolated-reference, parallel CI and manual assistive-technology/release acceptance are not inferred.

### Completed: Menu, Tab, Toast and Scrollspy documentation (7 November 2026)

These guides now author canonical markup, real token maps and supported behavior against immutable Bootstrap 6 commit 3b7f32318876bbd3c9cc14d3f891d744f39cd538. Menu distinguishes static presentation from initialized toggles, covers native disabled destinations, descriptions, scrolling, real submenus, auto-close policies, responsive placement, native forms and selected/translucent presentation. It no longer claims typeahead or automatically supplied application-menu roles. Escape remains available with autoClose=false.

Tab explicitly authors unique IDs, controls/labels, initial selection and focusable panels. Tabs, pills, vertical, underline/disabled, list-backed, instant and dark RTL examples follow the actual implementation. Both arrow axes navigate in DOM order, including RTL; missing IDs/controls/panel tabindex are not invented by the plugin. Cancellation, immediate outgoing removal and entering-pane completion are distinguished.

Toast remains opt-in. The working live example initializes one instance and calls show from clearly labeled documentation-only application wiring; a copyable module version is provided. Persistent, themed, linked, stacked, translucent/instant, contained-placement and dark RTL examples use empty named close masks. Dismissal retains nodes and does not restore focus. The guide and API explain autohide/delay, pause/reschedule behavior, live-region responsibilities and the absence of a show-toggle attribute. The Toasts topic route shares the same implementation.

Scrollspy replaces hidden/dummy demonstrations with visible named focusable regions and real scoped fragment links. Examples cover deepest/bottom activation, smooth hash/focus settling, nested parents, List group, pixel offsets, dark RTL and refresh. It manages active classes, not aria-current. Its table documents reused Nav tokens, not an invented Scrollspy Sass partial/map. Scanner-cataloged internal DOM listeners in Tab/Toast/Scrollspy are explicitly distinguished from dispatched plugin events without changing frozen metadata.

Sixteen new source contracts verify four immutable MDX Git blobs, actual classes/tokens/catalogs, raw renderer identity, approved-pin Sass and native relationships/targets. The complete serial unit run passes 800/800, retaining all previous 784. Browser review subsequently catches low-contrast hard-coded List group active colors; two copyable examples explicitly compose supported active background/foreground/border tokens from body/inverse roles, with disclosure and no core CSS changes. The final affected source/reference/metadata rerun passes 25/25. The 800-case run predates that final example-token composition; it is not represented as a fresh complete final-source run. Final validation results and any post-review overlap are recorded in artifacts/interaction-docs-report.json.

Browser verification keeps WCAG A/AA rules including 2.2, scenario assertions, timeouts and screenshot tolerance. Toast timing uses a frozen browser clock so boundary assertions do not race wall-clock execution. Initial Chromium failures and corrective evidence remain in artifacts rather than being suppressed. Final matrices, route coverage, retained Chrome regressions, event-description follow-ups and reviewed screenshot acceptance are reported with their exact scopes in the batch report.

All work uses Sites only for local build/preview/browser QA. The pinned core, six approved patches, frozen API baseline, root distributions, package version and release block remain unchanged; no registration/publication/deployment occurs. Full default functional-site, installed-package, isolated-reference, parallel CI, manual screen-reader/live-announcement and complete root/release acceptance are not inferred. Continue with Dialog, Drawer, Tooltip and Popover documentation.

Final verification covers **60 distinct three-engine browser contracts** through the initial 56 passes and 12 passing control rechecks (eight overlap), plus 15 overlapping final Scrollspy geometry/desktop/mobile cases. The four initial control failures were harness issues: resume paused timers before Axe and explicitly focus the WebKit checkbox before testing Escape. Separately, the retained real-motion Chrome test found a genuine example-coordinate bug: position-relative on the Scrollspy root gave root/section offsetTop different coordinate systems. Removing that example-only class fixes the original test; stronger scrollTop and destination-visibility assertions pass in all engines. The final source/reference/metadata check passes 25/25; strict boundaries pass with 151 roots, the unchanged 42-file producer and 39 declarations, zero diagnostics and three rejected negative probes. The earlier 800-case unit run predates these final example/presentation changes, not a fresh final-source complete run.

All 197 route/inventory checks pass, with seven post-label and one post-geometry page rechecks overlapping existing coverage. The final retained Chrome suite passes 11/11, including the original real-motion interaction, alias/mobile, source links, copy/icons and search. All 34 live examples, eight main-content views and three event tables are inspected. Six saved images match separately reviewed candidates byte-for-byte; the final two Scrollspy saved images are inspected directly instead of claiming identity with their separate captures. A final no-update run passes 8/8 at unchanged tolerance. Exactly six original expectations change and two dark images are added; 71 other saved images are identical and none removed. Total inventory is 79 images (77 docs plus two core), with **40 other documentation expectations pending**, not newly measured failures. Old copies remain hash-verified in test-results/interaction-docs-visual-before.

The final build retains 196 routes: ten guide/API pages change relative to the previous checkpoint, 186 remain identical, and all 147 tracked render assets remain byte-identical. The final text/geometry follow-ups affect only seven already scoped pages, with 189 other pages and all assets unchanged. See artifacts/interaction-docs-final-render-inputs.json and artifacts/interaction-docs-report.json. Temporary QA servers are stopped; release remains blocked.

### Completed: Breadcrumb, List group, Pagination and Collapse documentation (7 November 2026)

These guides now author the immutable Bootstrap 6 pin directly. Breadcrumb uses explicit breadcrumb-link and decorative breadcrumb-divider elements, authored aria-hidden and one current item. Text/SVG, dimensions, wrapping and dark RTL use real tokens; directional masks do not automatically mirror. Its complete mask URL remains readable in a scoped fixed-column variables table, preserving the previous Close button table output.

List group covers static/flush/actions/numbered content, native labeled checkboxes/radios, unavailable destinations and actual theme classes. Responsive sm:list-group-horizontal uses a contains-inline ancestor and container queries, not a viewport alias. Pagination retains page-item/page-link wrappers, explicit current state and unavailable boundaries, actual sizes/alignment and named decorative glyphs. Its query URLs demonstrate destinations only: the application supplies data/current state. No nonexistent gap token or automatic controller is documented. Existing disclosed demo-contrast wrappers/CSS remain application-level choices.

Collapse now documents only show state and CSS-owned transitions, padding on inner content, authored initial state, horizontal/multiple targets, first-level parent coordination and independently retained nested state. Cancelable show/hide starts are distinguished from completion notifications. Constructor auto-toggle, collapsing/collapsed class synchronization, native Accordion behavior and automatic focus restoration are not invented. Catalog semantics and generated footer/event descriptions match these contracts; frozen API metadata is not regenerated.

Sixteen new unit contracts independently Git-blob verify all four MDX references and check actual classes/tokens/catalogs, renderer identity without alias translation, approved-pin Sass output and target/native semantics. Focused checks pass 25/25; the full serial suite passes 784/784, retaining the previous 768 with no skips or timeout changes. All four production CSS distributions match the approved pin. Final strict boundaries pass for 149 test roots, the unchanged 42-file producer and 39 consumed declarations, with zero diagnostics and all three negative probes rejected. Source/API parity remains 130 exact branded modules plus six approved patches, 20 core plugins and 18 exports. Evidence is recorded in artifacts/collection-disclosure-report.json.

The initial serial three-engine run passes 59/60; one new Breadcrumb test incorrectly expects Windows WebKit Tab to visit native links. Both Tab and Alt-Tab also skip links in a plain framework-free anchor/anchor/button reproduction. Chromium/Firefox retain the link-to-link Tab assertion; Windows WebKit checks the next native button and explicit link focus followed by real Enter navigation. All three corrected cases pass, overlapping two earlier passes rather than increasing the 60 distinct contracts. No scenario is skipped, tabindex mutated, timeout/tolerance raised or WCAG rule removed. Full Safari keyboard-access/manual certification remains unproven. Sixteen retained Chrome interaction/reference/contrast/copy/icon/search checks and all 197 route checks pass; Playground retains its qualified inert-copy audit.

All 29 live example views and eight full-length main-content captures are visually inspected. Five existing expectations change, three missing dark/RTL images are added, 69 previous saved images are unchanged and none removed. Saved candidates match reviewed image hashes; a separate no-update run passes 8/8 at unchanged 0.03 tolerance. Old copies remain hash-verified in test-results/collection-disclosure-visual-before. The inventory now holds 77 images (75 documentation plus two core), with 46 other documentation expectations pending, not freshly measured failures.

Relative to the previous checkpoint, seven of 196 generated index routes change (four guides, the component index, Collapse API and API index); 189 are identical. All 147 tracked root/recursive CSS/JS/CJS/SVG/font/bitmap assets remain byte-identical. Pagefind, maps, JSON and non-index HTML are outside that stated identity scope; search is separately checked. See artifacts/collection-disclosure-render-inputs.json, artifacts/collection-disclosure-before.json and artifacts/collection-disclosure-report.json. Core source, six approved exceptions, frozen API baseline, version and release block stay unchanged; root dist is not rebuilt. Sites is used only for local build/preview/browser QA with no registration/publication/deployment. Full default functional-site, installed-package, isolated-reference, parallel-CI, manual and root/release acceptance are not certified.

### Completed: Button group, Close button, Nav and native Accordion (7 November 2026)

These four guides now author actual pinned classes/tokens directly, without renderer alias translation. Button group covers structural styles/dividers, group sizing, native checkbox/radio selection, wrapping toolbars with a named input, nested Menu behavior, vertical groups, links and dark RTL. It correctly configures button tokens rather than inventing a group token map. Close button uses empty named SVG-masked native controls, native disabled state and an explicit Alert dismissal example; CSS alone supplies no action or focus restoration. Nav separates ordinary navigation from ARIA tab widgets and demonstrates list/current/disabled semantics, tabs appearance, pills/vertical pills, underline, fill/justify, responsive utilities, Menu integration and dark RTL. CSS-only footers now identify the Menu/Alert dependencies of interactive examples.

Accordion's old Collapse-driven hybrid is replaced with native details/summary, decorative chevrons and unique name groups. Exclusive, compact, flush, gapped, independent, nested and dark RTL examples use actual open/name semantics and supported tokens. The guide explains native toggle/open and application-level expand-all grouping rather than inventing an Accordion plugin. Its catalog removes obsolete accordion-button/accordion-collapse/Collapse state classes. The existing compound browser case checks native exclusivity, retaining its Breadcrumb/List group/Pagination assertions. The existing Sass contract compiles all three additional guides and keeps the original explicit Nav override assertion.

Four raw MDX files are independently Git-blob verified; sixteen new unit contracts verify canonical classes/tokens/catalogs, renderer identity, approved-pin Sass output and native semantics. The focused batch passes **25/25** and the complete serial suite passes **768/768**, retaining all previous 752, without skips or timeout changes. Final strict type boundaries pass for **147 test roots**, the unchanged 42-file producer and 39 consumed declarations, with zero diagnostics and all three negative probes rejected. Source/API verification retains 130 exact branded modules plus six approved patches, zero extra core modules, 20 plugins and 18 exports. All four production CSS outputs match the approved pin; core CSS/JS remains unchanged.

The complete focused browser matrix passes **60/60** serially across Chromium, Firefox and WebKit, including light/dark, LTR/RTL, desktop/mobile, unchanged WCAG A/AA rules including 2.2, native input state/sizes, loadable close masks/cancelable Alert dismissal, narrow-screen Menu positioning/focus/Escape and native Accordion events/exclusive/independent/nested state. Fifteen existing Chrome topic/mobile/mask/catalog/compound/copy/search regressions and all **197 route checks** pass, including inventory and all 196 page audits. Playground retains its documented render-equivalent inert-copy qualification, not in-sandbox or manual assistive-technology certification.

Manual review inspects all **31 live-example views**, two mobile open menus and eight full-length main-content captures. It catches a Close button token-table layout problem: the complete SVG URL squeezed the other columns. A guide-only fixed-column/wrapping correction preserves the full value and does not alter framework CSS. Hashes prove only that one HTML page changes afterward: the other **195 HTML pages and all 147 tracked render assets** remain unchanged. All **12 affected Close button browser cases** and its route audit pass again, with explicit column-layout checks; these overlap the earlier matrices and are not counted as 72 browser or 198 route contracts. Two search/API/icon cases pass against the final rebuilt index. Full unit input data/core is unchanged by the scoped Astro presentation fix.

Only **two existing Accordion images** are deliberately updated, with old copies retained and hash-verified; **six new images** add missing Button group/Close button/Nav default and RTL/dark coverage. All 66 original documentation screenshot cases remain and six are added. All eight saved images exactly match reviewed candidates; the separate no-update comparison passes **8/8** at the unchanged 0.03 tolerance. The other **66 pre-existing saved images** remain unchanged, with no removals. There are now 74 saved images overall (72 docs and two core gallery), with **51 other documentation expectations still pending**, not a fresh failure count. Screenshot scope is the full main-content element, not complete shell/manual certification.

The build retains 196 routes: these four guides and the component index change relative to the preceding checkpoint; **191 other pages and all 147 explicitly tracked CSS/JS/CJS/SVG/font/bitmap assets** remain byte-identical. Pagefind, source maps, JSON and non-index HTML remain outside that stated asset-identity scope. See artifacts/navigation-disclosure-render-inputs.json, artifacts/navigation-disclosure-before.json and artifacts/navigation-disclosure-report.json for exact input, recovery and validation evidence. Core source, approved exceptions, frozen API baseline, version and release block remain unchanged; root dist is not rebuilt. The Sites skill is used only for local build/preview/browser QA, with no registration, publication or deployment. Complete default functional-site, isolated-reference, installed-package, parallel CI, manual and full root/release acceptance are not newly certified.

### Completed: Button, Alert, Badge and Card documentation (7 November 2026)

These four guides now author pinned structural variants, theme classes, layouts and token maps directly. Button distinguishes pressed-state JavaScript from native checkbox buttons, disabled actions and navigation links; its JavaScript sample targets an actual introductory toggle. Alert uses an empty named masked close button, explains cancelable close and after-removal closed events, and explicitly documents data-trm-dismiss="alert" instead of falsely requiring manual initialization. The generated Alert API page receives the same presentation correction without changing frozen scanner metadata. Focus restoration remains application-managed. Badge supplies static label/count context, and Card uses body flex gaps, real optional regions and container-based joined Flexbox groups. Card title/text names are upstream-documented structural hooks, not invented typography rules.

Navbar metadata now identifies CSS-only layout and attributes responsive modal behavior to Drawer JavaScript. Toggler is a class/attribute primitive with no fixed styling class, automatic disclosure ARIA, Escape or focus policy. Its catalog has an empty class array; the schema requires precisely that for Toggler while retaining a nonempty class array for every other component. The existing metadata test is corrected to enforce this distinction, not bypassed.

The new source contracts independently hash-check all four pinned MDX references, validate authored classes/tokens and copyable Sass, and prove that these four pages reach the renderer without class-alias translation. Existing explicit demo-contrast CSS remains disclosed for Button, Alert and Badge; this is application-level customization, not a core-default change. Other pages still require canonical-authoring review. No source exception, core/API baseline, runtime policy or screenshot tolerance changes are part of this batch.

The first complete unit run retains its **751 passes / one failure** in artifacts/foundation-docs-full-unit.json. The unchanged component-reference contract correctly required the JavaScript target in the introductory example, whereas the first revision only supplied that toggle in a later variant. A real, named introductory toggle fixes the source example; the assertion and all existing cases remain. Focused verification passes 20/20 after the correction. Screenshot review also catches and corrects contradictory Alert event-order prose before any replacement image is accepted. These are documentation defects, not reasons to change the frozen core/API baseline.

The complete serial unit rerun passes **752/752**, retaining all previous 737 tests and adding fifteen source/markup/catalog/Sass contracts, without skips or changed timeout limits. Final strict type boundaries pass for **145 test roots**, the unchanged 42-file producer and 39 consumed declarations, with zero diagnostics and all three indexed/null/API negative probes rejected. Source/API verification retains 130 exact branded modules plus six approved patches, zero extra core modules, 20 plugins and 18 exports. All four production CSS outputs match the verified pin plus approved patches. These gates do not certify complete root, visual or release acceptance.

The final **60-case native matrix passes serially**, twenty cases each in Chromium, Firefox and WebKit, with zero failures, skips or flaky retries. It covers all four guides in light/dark and LTR/RTL, desktop/mobile layout and unweakened WCAG A/AA rules including 2.2, actual default/variant Button toggles, native checkbox/disabled behavior, Alert cancellation/removal/instant mode and its API-page explanation, Card container resizing/image ratio and Navbar/Toggler metadata presentation. Twelve original Chrome contrast/copy/icon/search/compound-interaction checks also pass. The complete route audit passes **197/197**, comprising the independent inventory and all **196 generated-page audits**. Playground retains the established render-equivalent inert-copy qualification, not in-sandbox Axe or manual assistive-technology certification.

All 25 authored live-example views are inspected, with the revised introductory Button control reviewed again in final light/dark main-content captures. Nine full-length main-content screenshot contracts are reviewed; six final candidates are byte-identical to reviewed versions and the changed Button light/dark and Alert images are inspected again. Only those **nine expectations** are updated, with old expected copies preserved and hash-verified against the before inventory. The separate no-update comparison passes **9/9** at the unchanged 0.03 tolerance. The other **59 saved images** remain unchanged, with no additions/removals: six previously approved gallery/Stepper/Carousel images and **53 other documentation expectations**. Those 53 remain pending, not a fresh failure count. Navbar/Toggler image acceptance covers the reviewed metadata/presentation changes, not exhaustive authored-example or upstream prose parity.

The final build retains 196 routes. Compared with the preceding Stepper/Carousel checkpoint, 52 HTML pages change, including shared component-template whitespace and relevant catalog/API content; 144 are byte-identical. All **147 tracked CSS/JS/CJS/SVG/font/bitmap render assets** remain unchanged, including root docs.css. The inventory explicitly excludes Pagefind, source maps, JSON and non-index HTML; search checks cover the rebuilt index separately. See artifacts/foundation-docs-render-inputs.json and artifacts/foundation-docs-report.json for exact scope, recovery and final validation. Core source, six approved exceptions, frozen API baseline, package version and release block remain unchanged. The Sites workflow is local source preparation/build/preview/QA only; nothing is registered, published or deployed. Complete default functional-site, isolated-reference, installed-package and full root/release suites are not newly rerun in this batch.

### Completed: Stepper and Carousel documentation (7 November 2026)

Stepper now uses actual stepper-item children, active for completed/current items, one aria-current=step per list, visible state text, default vertical layout, container-based sm:stepper-horizontal and the real stepper-overflow wrapper. Grouped descriptions no longer occupy unintended grid cells. The Sass example configures existing size/gap tokens, not invented indicator/accent names. No wizard controller or disabled-step plugin is claimed.

Carousel examples now have named native buttons, actual masked icons and owning target IDs; real scroll-snap, indicators, fade, multiple items/peek and user-started autoplay are demonstrated. The play/pause example starts paused and has a compact, non-stretched icon control. Guidance distinguishes initialization for active tracking, automatic page-load autoplay and actual pause/interaction policy. Unused old previous/next class names and obsolete Stepper catalog entries are removed from those two metadata records. The new source checks validate authored classes/tokens directly, hash-check the two raw MDX references, and compare copyable Sass with the approved pin; these pages do not depend on the documentation alias normalizer.

Visual review additionally found mirrored technical text and a copy icon overlapping the start of an RTL code block. Shared documentation-only CSS now isolates pre/code/kbd and code frames as LTR; component and document direction remain RTL. Browser checks verify both the code/copy geometry and component direction. No framework style or default is changed.

The final **30-case native matrix passes serially** across Chromium, Firefox and WebKit, including all light/dark and LTR/RTL combinations, desktop/mobile geometry, counters/tracks, container resizing, scroll overflow, keyboard navigation, masks, indicators, fade and a real six-second autoplay cycle with pause. WCAG A/AA rules, including the new focused 2.2 checks, are not weakened. An earlier final parallel run had two Firefox browser/Axe timeouts; its failure report remains. The complete serial rerun uses unchanged assertions and timeouts. Parallel Firefox/CI stability is not certified.

All thirteen authored live-example renders, dark RTL mobile examples and the four affected full-page visual contracts were reviewed; the stretched play control and technical-text direction issues were fixed before acceptance. Three previously reviewed light/dark images are byte-identical after the final direction fix; the corrected RTL Stepper image is reviewed again. Only the **four Stepper/Carousel documentation images** are deliberately updated, with old expected copies retained in test-results/progress-media-visual-final-before. Their separate no-update comparison passes **4/4**. The earlier two approved gallery images remain unchanged in this batch. All other **62 documentation expectations remain untouched and unreviewed**; this is not a fresh assertion that they all fail on the current build, and not permission to update them wholesale.

Five existing compound interaction/copy-icon tests pass. The complete generated-route audit passes **197/197**, comprising the independent route inventory and all **196 page audits**. Playground retains its established render-equivalent inert-preview qualification, not in-sandbox or manual assistive-technology certification. The complete default functional site suite, isolated reference suite and package consumer are not rerun in this batch; do not present earlier counts as fresh results.

Final regressions pass **737/737 unit tests**, retaining all previous 728 plus nine direct source/markup/direction contracts, with one worker, no skips and unchanged timeouts. Strict test boundaries pass for **143 test roots**, the unchanged 42-file core producer and 39 consumed declarations, with zero diagnostics and all three negative probes rejected. Source/API verification retains 130 exact branded modules plus six approved patches, zero extra core modules, 20 plugins and 18 exports. All four production CSS outputs match the verified pin plus approved patches. Two existing search/API/icon-catalog checks pass against the regenerated index.

The site is rebuilt locally. Four generated HTML pages change (the two component pages and Carousel API/index metadata); 192 other HTML pages are unchanged. The old 138-asset hash inventory is a runtime/distribution subset, not an exhaustive render inventory: it omitted root docs.css, fonts, icons and themes. This batch explicitly records all 196 index pages and **147 CSS/JS/CJS/SVG/font/bitmap inputs**, including root documentation CSS, in artifacts/progress-media-render-inputs.json. Pagefind indexes, source maps, JSON and non-index HTML are outside that stated asset-identity scope. Generated-route/search/copy checks and source/style hash evidence are distinct qualifications.

See artifacts/progress-media-report.json for final validation and historical failure evidence. The verified core, approved six-module source exceptions, frozen API baseline, package version and release block must remain unchanged. No framework build, compatibility layer, publication or deployment is authorized by this documentation work.

### Remaining acceptance

Continue module-by-module source, prose and visual review; this is not word-for-word or exhaustive upstream documentation parity. The earlier 66-image mismatch run and 38/47 literal-selector scan are historical diagnostics, not current pass counts or automatic unsupported-class verdicts. The neutral Combobox wrapper needs no CSS rule. Keep screenshot tolerances, Axe rules, all existing cases and compiler strictness. Complete root quality, parallel CI stability, real-device gestures, native forced-colors platforms, screen-reader checks and prerelease approval remain pending.

Legacy runtime cleanup is complete. Nothing is published.

## 9. Complete pinned core inventory

The mapping below preserves every pinned core module. Current verification is 130 exact identity-adapted modules plus six explicitly approved patched modules. The legacy-free cleanup must preserve this complete inventory; generated distributions are not additional maintained implementations.

### JavaScript / root (23)

| Upstream module | Production target |
| --- | --- |
| `js/src/alert.ts` | `src/js/alert.ts` |
| `js/src/base-component.ts` | `src/js/base-component.ts` |
| `js/src/button.ts` | `src/js/button.ts` |
| `js/src/carousel.ts` | `src/js/carousel.ts` |
| `js/src/chips.ts` | `src/js/chips.ts` |
| `js/src/collapse.ts` | `src/js/collapse.ts` |
| `js/src/combobox.ts` | `src/js/combobox.ts` |
| `js/src/datepicker.ts` | `src/js/datepicker.ts` |
| `js/src/dialog-base.ts` | `src/js/dialog-base.ts` |
| `js/src/dialog.ts` | `src/js/dialog.ts` |
| `js/src/drawer.ts` | `src/js/drawer.ts` |
| `js/src/index.ts` | `src/js/index.ts` |
| `js/src/menu.ts` | `src/js/menu.ts` |
| `js/src/nav-overflow.ts` | `src/js/nav-overflow.ts` |
| `js/src/otp-input.ts` | `src/js/otp-input.ts` |
| `js/src/popover.ts` | `src/js/popover.ts` |
| `js/src/range.ts` | `src/js/range.ts` |
| `js/src/scrollspy.ts` | `src/js/scrollspy.ts` |
| `js/src/strength.ts` | `src/js/strength.ts` |
| `js/src/tab.ts` | `src/js/tab.ts` |
| `js/src/toast.ts` | `src/js/toast.ts` |
| `js/src/toggler.ts` | `src/js/toggler.ts` |
| `js/src/tooltip.ts` | `src/js/tooltip.ts` |

### JavaScript / dom (4)

| Upstream module | Production target |
| --- | --- |
| `js/src/dom/data.ts` | `src/js/dom/data.ts` |
| `js/src/dom/event-handler.ts` | `src/js/dom/event-handler.ts` |
| `js/src/dom/manipulator.ts` | `src/js/dom/manipulator.ts` |
| `js/src/dom/selector-engine.ts` | `src/js/dom/selector-engine.ts` |

### JavaScript / util (8)

| Upstream module | Production target |
| --- | --- |
| `js/src/util/component-functions.ts` | `src/js/util/component-functions.ts` |
| `js/src/util/config.ts` | `src/js/util/config.ts` |
| `js/src/util/floating-ui.ts` | `src/js/util/floating-ui.ts` |
| `js/src/util/index.ts` | `src/js/util/index.ts` |
| `js/src/util/scroll-lock.ts` | `src/js/util/scroll-lock.ts` |
| `js/src/util/sanitizer.ts` | `src/js/util/sanitizer.ts` |
| `js/src/util/swipe.ts` | `src/js/util/swipe.ts` |
| `js/src/util/template-factory.ts` | `src/js/util/template-factory.ts` |

### Sass / root (36)

| Upstream module | Production target |
| --- | --- |
| `scss/_accordion.scss` | `src/scss/_accordion.scss` |
| `scss/_alert.scss` | `src/scss/_alert.scss` |
| `scss/_avatar.scss` | `src/scss/_avatar.scss` |
| `scss/_badge.scss` | `src/scss/_badge.scss` |
| `scss/_banner.scss` | `src/scss/_banner.scss` |
| `scss/_breadcrumb.scss` | `src/scss/_breadcrumb.scss` |
| `scss/_card.scss` | `src/scss/_card.scss` |
| `scss/_carousel.scss` | `src/scss/_carousel.scss` |
| `scss/_chip.scss` | `src/scss/_chip.scss` |
| `scss/_colors.scss` | `src/scss/_colors.scss` |
| `scss/_config.scss` | `src/scss/_config.scss` |
| `scss/_datepicker.scss` | `src/scss/_datepicker.scss` |
| `scss/_dialog.scss` | `src/scss/_dialog.scss` |
| `scss/_drawer.scss` | `src/scss/_drawer.scss` |
| `scss/_functions.scss` | `src/scss/_functions.scss` |
| `scss/_list-group.scss` | `src/scss/_list-group.scss` |
| `scss/_menu.scss` | `src/scss/_menu.scss` |
| `scss/_nav-overflow.scss` | `src/scss/_nav-overflow.scss` |
| `scss/_nav.scss` | `src/scss/_nav.scss` |
| `scss/_navbar.scss` | `src/scss/_navbar.scss` |
| `scss/_pagination.scss` | `src/scss/_pagination.scss` |
| `scss/_placeholder.scss` | `src/scss/_placeholder.scss` |
| `scss/_popover.scss` | `src/scss/_popover.scss` |
| `scss/_progress.scss` | `src/scss/_progress.scss` |
| `scss/_root.scss` | `src/scss/_root.scss` |
| `scss/_spinner.scss` | `src/scss/_spinner.scss` |
| `scss/_stepper.scss` | `src/scss/_stepper.scss` |
| `scss/_theme.scss` | `src/scss/_theme.scss` |
| `scss/_toasts.scss` | `src/scss/_toasts.scss` |
| `scss/_tooltip.scss` | `src/scss/_tooltip.scss` |
| `scss/_transitions.scss` | `src/scss/_transitions.scss` |
| `scss/_utilities.scss` | `src/scss/_utilities.scss` |
| `scss/bootstrap-grid.scss` | `src/scss/tremplin-grid.scss` |
| `scss/bootstrap-reboot.scss` | `src/scss/tremplin-reboot.scss` |
| `scss/bootstrap-utilities.scss` | `src/scss/tremplin-utilities.scss` |
| `scss/bootstrap.scss` | `src/scss/tremplin.scss` |

### Sass / buttons (4)

| Upstream module | Production target |
| --- | --- |
| `scss/buttons/_button-group.scss` | `src/scss/buttons/_button-group.scss` |
| `scss/buttons/_button.scss` | `src/scss/buttons/_button.scss` |
| `scss/buttons/_close.scss` | `src/scss/buttons/_close.scss` |
| `scss/buttons/index.scss` | `src/scss/buttons/index.scss` |

### Sass / content (7)

| Upstream module | Production target |
| --- | --- |
| `scss/content/_blockquote.scss` | `src/scss/content/_blockquote.scss` |
| `scss/content/_images.scss` | `src/scss/content/_images.scss` |
| `scss/content/_lists.scss` | `src/scss/content/_lists.scss` |
| `scss/content/_prose.scss` | `src/scss/content/_prose.scss` |
| `scss/content/_reboot.scss` | `src/scss/content/_reboot.scss` |
| `scss/content/_tables.scss` | `src/scss/content/_tables.scss` |
| `scss/content/index.scss` | `src/scss/content/index.scss` |

### Sass / forms (17)

| Upstream module | Production target |
| --- | --- |
| `scss/forms/_check.scss` | `src/scss/forms/_check.scss` |
| `scss/forms/_chip-input.scss` | `src/scss/forms/_chip-input.scss` |
| `scss/forms/_combobox.scss` | `src/scss/forms/_combobox.scss` |
| `scss/forms/_floating-labels.scss` | `src/scss/forms/_floating-labels.scss` |
| `scss/forms/_form-adorn.scss` | `src/scss/forms/_form-adorn.scss` |
| `scss/forms/_form-control.scss` | `src/scss/forms/_form-control.scss` |
| `scss/forms/_form-field.scss` | `src/scss/forms/_form-field.scss` |
| `scss/forms/_form-range.scss` | `src/scss/forms/_form-range.scss` |
| `scss/forms/_form-text.scss` | `src/scss/forms/_form-text.scss` |
| `scss/forms/_input-group.scss` | `src/scss/forms/_input-group.scss` |
| `scss/forms/_labels.scss` | `src/scss/forms/_labels.scss` |
| `scss/forms/_otp-input.scss` | `src/scss/forms/_otp-input.scss` |
| `scss/forms/_radio.scss` | `src/scss/forms/_radio.scss` |
| `scss/forms/_strength.scss` | `src/scss/forms/_strength.scss` |
| `scss/forms/_switch.scss` | `src/scss/forms/_switch.scss` |
| `scss/forms/_validation.scss` | `src/scss/forms/_validation.scss` |
| `scss/forms/index.scss` | `src/scss/forms/index.scss` |

### Sass / helpers (11)

| Upstream module | Production target |
| --- | --- |
| `scss/helpers/_focus-ring.scss` | `src/scss/helpers/_focus-ring.scss` |
| `scss/helpers/_hover-lift.scss` | `src/scss/helpers/_hover-lift.scss` |
| `scss/helpers/_icon-link.scss` | `src/scss/helpers/_icon-link.scss` |
| `scss/helpers/_position.scss` | `src/scss/helpers/_position.scss` |
| `scss/helpers/_stacks.scss` | `src/scss/helpers/_stacks.scss` |
| `scss/helpers/_stretched-link.scss` | `src/scss/helpers/_stretched-link.scss` |
| `scss/helpers/_text-truncation.scss` | `src/scss/helpers/_text-truncation.scss` |
| `scss/helpers/_theme-colors.scss` | `src/scss/helpers/_theme-colors.scss` |
| `scss/helpers/_visually-hidden.scss` | `src/scss/helpers/_visually-hidden.scss` |
| `scss/helpers/_vr.scss` | `src/scss/helpers/_vr.scss` |
| `scss/helpers/index.scss` | `src/scss/helpers/index.scss` |

### Sass / layout (4)

| Upstream module | Production target |
| --- | --- |
| `scss/layout/_breakpoints.scss` | `src/scss/layout/_breakpoints.scss` |
| `scss/layout/_containers.scss` | `src/scss/layout/_containers.scss` |
| `scss/layout/_grid.scss` | `src/scss/layout/_grid.scss` |
| `scss/layout/index.scss` | `src/scss/layout/index.scss` |

### Sass / mixins (22)

| Upstream module | Production target |
| --- | --- |
| `scss/mixins/_backdrop.scss` | `src/scss/mixins/_backdrop.scss` |
| `scss/mixins/_border-radius.scss` | `src/scss/mixins/_border-radius.scss` |
| `scss/mixins/_box-shadow.scss` | `src/scss/mixins/_box-shadow.scss` |
| `scss/mixins/_color-mode.scss` | `src/scss/mixins/_color-mode.scss` |
| `scss/mixins/_color-scheme.scss` | `src/scss/mixins/_color-scheme.scss` |
| `scss/mixins/_deprecate.scss` | `src/scss/mixins/_deprecate.scss` |
| `scss/mixins/_dialog-shared.scss` | `src/scss/mixins/_dialog-shared.scss` |
| `scss/mixins/_focus-ring.scss` | `src/scss/mixins/_focus-ring.scss` |
| `scss/mixins/_form-validation.scss` | `src/scss/mixins/_form-validation.scss` |
| `scss/mixins/_gradients.scss` | `src/scss/mixins/_gradients.scss` |
| `scss/mixins/_grid.scss` | `src/scss/mixins/_grid.scss` |
| `scss/mixins/_image.scss` | `src/scss/mixins/_image.scss` |
| `scss/mixins/_lists.scss` | `src/scss/mixins/_lists.scss` |
| `scss/mixins/_mask-icon.scss` | `src/scss/mixins/_mask-icon.scss` |
| `scss/mixins/_reset-text.scss` | `src/scss/mixins/_reset-text.scss` |
| `scss/mixins/_resize.scss` | `src/scss/mixins/_resize.scss` |
| `scss/mixins/_text-truncate.scss` | `src/scss/mixins/_text-truncate.scss` |
| `scss/mixins/_tokens.scss` | `src/scss/mixins/_tokens.scss` |
| `scss/mixins/_transition.scss` | `src/scss/mixins/_transition.scss` |
| `scss/mixins/_utilities.scss` | `src/scss/mixins/_utilities.scss` |
| `scss/mixins/_visually-hidden.scss` | `src/scss/mixins/_visually-hidden.scss` |
| `scss/mixins/index.scss` | `src/scss/mixins/index.scss` |

### Sass / utilities (1)

| Upstream module | Production target |
| --- | --- |
| `scss/utilities/_api.scss` | `src/scss/utilities/_api.scss` |

