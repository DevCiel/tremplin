# Changelog

## Unreleased strict-core browser delivery

- All browser downloads now use Bootstrap 6-style ES modules. Load them with
  `type="module"`; the public `TremplinFramework` window global is removed.
- Standard builds externalize Floating UI and Vanilla Calendar Pro. Bundled
  builds include both; local dependency modules support same-origin import maps.
- Root/component entries retain shared ESM identity. Keep one module graph per
  document; do not combine independently built minified, bundled or optional entries.
- Installation examples, raw demos and documentation-owned runtimes use the new
  contract. Distribution licenses and third-party notices accompany the artifacts.
- The pinned framework source, approved patches, API baseline and CSS are unchanged.
  This is an unreleased migration, not authorization to publish.

## 0.8.0-beta.0

- Unreleased clone-first cleanup (5 November): removed the frozen hybrid implementation, compatibility exports/build pipeline, fallback-only fixtures, old API baselines, archived documentation routes and generated copies. Retained all 136 pinned Bootstrap 6-derived modules and approved SEC-001/A11Y-001 exceptions. Added the explicit strict API contract and no-legacy gate; duplicate-runtime tests now use current distributions. Earlier entries below record superseded migration stages, not current compatibility promises. The version is unchanged and publishing remains blocked pending fixture/documentation and release acceptance.

- Added approved security exception SEC-001 across sanitizer, TemplateFactory, Chips and NavOverflow: private per-factory Trusted Types policy, sanitized sink tokens, per-candidate srcset checks and explicit new-window rel protection. Retained the string sanitizer API and strict CSP controls; no permissive default policy. Source checks report 132 exact modules plus four reproducible patches and reject unrelated changes. Datepicker fixture/dependency security migration and other acceptance work remain pending; publishing stays blocked.
- Unreleased strict cutover: replaced all 102 Sass and 34 TypeScript core modules with the pinned Bootstrap 6-derived sources. Retained original notices, 0.8 baselines and the frozen fallback. Added upstream-production and CSS parity checks, checker-based API discovery, explicit extension CSS exports, a shared CJS module graph and migration differences report. Applied the user-approved 60 kB JavaScript gzip ceiling for the bundled calendar dependency. Publishing remains blocked; old fixtures/docs and broader acceptance are still pending.
- Ported optional Command Palette behavior/styles and React/Vue lifecycle adapters to the unchanged strict Bootstrap 6 candidate. Added isolated ESM/declaration/consumer builds and real cross-browser integration checks. Kept public declaration signatures and package targets intact. Fixed split-ESM guard ordering with live pre-registration assertions; the active default remains hybrid and the frozen fallback stays unchanged.
- Added an explicit frozen 0.8 legacy alternative under `compat/legacy`, with separate CSS/Sass, ESM/CommonJS, declarations, themes, adapters and optional extensions. Preserved 169 source/metadata/license inputs and a 197-input local recovery archive; mapped 1,521 captured contract entries without changing the existing API baselines. Added document-scoped browser runtime guards, independent package-consumer checks, and source/output isolation checks. The default remains the existing hybrid implementation pending strict-core promotion.
- Aligned the default 0–12 spacing scale and CSS Grid gap fallback with Bootstrap main 2871f2a55ccf18af64045b8fc37529391b285900. Added independent canonical negative margins while retaining legacy inverted-positive names. Numbered margin/padding/gap/child-spacing/gutter values change; base Flexbox gutters remain 1.5rem/0. Added migration examples and cross-bundle regressions; CSS gzip ceiling is user-approved at 56 kB.
- Aligned default viewport/shared-container-query breakpoints and container maximum widths with Bootstrap main 2871f2a55ccf18af64045b8fc37529391b285900. Canonical 2xl classes and legacy xxl names share rules at 1536px; helpers resolve quoted/numeric names, explicit custom keys win, and old width-map spellings remain valid. Documented changed thresholds/widths, pixel units, and restoration maps. Spacing, gutters, legacy cq queries, geometry, and layer ownership remain unchanged. Raised CSS to the user-approved 55 kB limit to retain compatibility names.
- Adopted Bootstrap 6's eleven-layer order and audited per-module layer placement across all four CSS distributions, with Tremplin extensions in custom. Root/transition rules and global property registrations remain unlayered as upstream does. Preserved selectors, values, declaration order, query conditions, spacing, breakpoint and importance defaults; normal application overrides and important-layer reversal now follow the explicit layer contract. Added structural/import/API and three-engine cascade regressions plus migration guidance. CSS remains under the approved 50 kB ceiling.
- Aligned hidden-element precedence with layered Bootstrap 6 Reboot and added selected layout utilities plus configured breakpoint variables to the grid-only bundle against main 2871f2a55ccf18af64045b8fc37529391b285900. Shared CSS-free utility generators preserve full-bundle family overrides; added responsive auto margins and negative-axis margins to both bundles. Corrected the upstream CSS Grid default in the guide and documented the standalone reset requirement. The approved CSS ceiling is now 50 kB gzip; global spacing/default geometry and full cascade-layer migration remain separate work.
- Added canonical CSS Grid columns/rows/gap controls, legacy fallback handling, public make-container/make-grid-columns factories, and grid-row-columns/gutters/container-padding-x configuration against Bootstrap main 2871f2a55ccf18af64045b8fc37529391b285900. Default class generation uses the new configuration while retaining alias ordering, local geometry/gap, legacy offsets, and old mixin signatures. The canonical containers entry forwards the shared CSS-free factory without moving CQ output. Migration: the default explicit 1fr row can redistribute fixed-height space; grid-template-rows: none restores automatic rows. Expanded token precedence/nesting/gap/RTL/generator tests and guides; raised CSS to the user-approved 49 kB ceiling.
- Added Bootstrap 6-style container-responsive g-col/g-start classes and the public make-cssgrid generator against main 2871f2a55ccf18af64045b8fc37529391b285900. Grid now establishes inline-size containment; exact modern class matches opt into auto placement while ordinary legacy children retain full-span defaults. Guarded one-column start generation and documented shorthand start resets, mixed-model limits, and custom-generator scopes. Migration: legacy cq children now query the nearest grid and intrinsic sizing can change; an application container-type override can restore an outer ancestor. Kept existing span selector values, local geometry/tokens/gap and cascade priority. Raised CSS to the user-approved 48 kB ceiling for default inclusion and expanded CSS Grid examples and regressions.
- Added Bootstrap 6-style responsive containers and Flexbox grid prefix aliases against main 25e322a54e610d0843b8ab887f8cfbabb0489c2b. Containers remain fluid until their tier and then progress through later configured maximums; col/auto/offset/row-cols/gutter/order prefixes share declarations with retained legacy names in full and grid-only CSS. Kept local values, logical geometry, generation switches, cascade priority, legacy full-row offsets, and span/cq-span semantics. Expanded layout guides and unit/browser regressions within the unchanged approved 47 kB CSS limit. CSS Grid g-col/g-start and automatic containment remain separate work.
- Added Bootstrap 6 breakpoint-next/min/max functions, viewport up/down/between/only ranges, container down/between/only ranges, and down-loop/alias APIs against main e0bbab74ad1f97f29baddeed9bb0381cb34348ea. Followed inclusive-lower/exclusive-upper and terminal-loop semantics; retained local breakpoint scales, existing media-up output/signature and old unknown-name guards. Expanded Breakpoints/Stacks guides and range, fractional-container, named/nearest, RTL, physical-width, relative-unit, selector, metadata, and Sass-example regressions. Default CSS output and the approved 47 kB ceiling are unchanged.
- Added Bootstrap 6-style module-owned hover-lift tokens and shared transition/shadow switch handling in full and utilities-only CSS against main e0bbab74ad1f97f29baddeed9bb0381cb34348ea. Migration: default lift is now -.25rem with .2s ease and the local large shadow; dedicated --trm-hover-lift-* tokens replace shared fast/small overrides. Reduced motion retains the raised state without animation rather than removing translation. Updated the guide, Sass examples, metadata, and keyboard/motion regressions; kept the existing helper cascade priority and local shadow geometry/palette. Raised the CSS gzip ceiling to the user-approved 47 kB for default inclusion.
- Added theme/runtime focus controls, scoped icon-link token maps and hover/focus motion, configurable stretched-link pseudo-elements/layers, and token-driven vertical rules against Bootstrap main e0bbab74ad1f97f29baddeed9bb0381cb34348ea. Kept legacy focus geometry/mixin signatures, direct SVG support, and current helper cascade priority; made the helpers available in utilities-only CSS. Migration: vr now uses opaque boundary color instead of currentColor at .25 opacity; use its border-color/width tokens for customization. Expanded four guides and helper regressions.
- Added Bootstrap 6-style container-aware vstack/hstack helpers, stack-container, viewport-responsive sticky prefixes, and public upward container/breakpoint Sass primitives. Kept existing stack/cluster spacing and wrapping, local breakpoint values, logical edges, and base position importance unchanged; exposed the helpers in the utilities-only build. Expanded Stacks/Position guides and selector, named-container, geometry, and scroll regressions within the approved 46 kB CSS limit.
- Added role-map-generated theme helpers and initial-value theme resets, coordinated contrast/subtle/muted/border utilities, contextual normal/hover link colors, utilities-only theme helpers, a configurable gradient token/bg-gradient utility, and horizontal/vertical three-color mixins. Fixed suffixless null property-map default generation while retaining named null removals and existing gradient signatures/switch defaults. Theme-context consumers now use the newer role values; standalone legacy palette shortcuts and root component tokens remain unchanged. Updated guides and regressions within the existing approved 46 kB CSS ceiling.
- Added Bootstrap 6-style semantic foreground/emphasis/contrast, background/subtle/muted, neutral, and subtle-border roles with non-inheriting alpha composition. Added configurable role/token/opacity maps and public reference helpers while preserving legacy flat colors/component tokens. Recomputed role references at explicit theme boundaries, added system-color overrides, moved bg-* into configurable output, expanded three guides/tests, and applied the user-approved 46 kB CSS gzip ceiling.
- Added Bootstrap 6 grid track-count/subgrid, full-track placement, auto-flow, row-gap, and column-gap utilities with both responsive naming styles. Moved gap-* into the configurable utility map, preserving its local scale and default behavior while enabling family overrides/removals. Expanded both guides with native Grid/Flexbox examples, subgrid, reading-order cautions, layout-helper boundaries, and tested Sass customizations. Included the families by default within the user-approved 43 kB CSS gzip ceiling; JavaScript's ceiling is unchanged.
- Added mapped logical borders, removal/width/opacity controls, numeric/named/directional radii, and configurable shadow size/color/opacity composition with non-inheriting local variables. Preserved local small/base shadow appearance, radius defaults, and legacy component shadow tokens; the user-approved utility migration makes .shadow consume literal Sass map expressions instead of --trm-shadow. Expanded four guides and tests, and raised the CSS gzip ceiling to the approved 42 kB.
- Added Bootstrap 6 intrinsic, minimum, maximum, and dynamic-viewport sizing values while preserving logical axes, the shared local sizing scale, and existing width responsiveness. Added max-w/max-h names alongside mw/mh through the same configurable families, including state/query flags and removal behavior. Expanded Width/Height guides and verified flex shrinking, RTL/vertical writing, viewport resizing, and custom builds. Raised the CSS gzip ceiling to the user-approved 40 kB.
- Completed Bootstrap 6 display-value coverage, including inline-grid, table boxes, contents, and flow-root, with existing responsive/print aliases. Added native balanced/pretty wrapping, long-token breaking, and explicit text selection while retaining the legacy white-space contract. Updated guides and configuration/browser regressions within the existing 39 kB CSS budget; intrinsic sizing and broader token gaps remain separate work.
- Added Bootstrap 6-style underline offset, semantic color, opacity, and thickness utilities with hover states, a non-inheriting composition color, currentcolor fallback, and customization coverage. Retained Tremplin's existing runtime palette and documented the remaining foreground-role token differences. Expanded the Text decoration guide with examples and keyboard-state customization. Included the families by default within the user-approved 39 kB CSS gzip ceiling.
- Added Bootstrap 6-style attr-starts/attr-includes utility selectors with safe pattern serialization and child/query scoping. Enabled deduplicated global non-inheriting registrations for assigned utility composition variables, preserving referenced theme-token inheritance and omitting disabled definitions. Documented the attribute-state limitation and global registration effects; default compiled CSS and size budget are unchanged.
- Added Bootstrap 6 colon-prefix utility aliases while retaining existing viewport, print, and boolean-state names. Added explicit state lists and compound responsive/print/dark states, OS-driven dark utility generation, digit-safe breakpoint prefix helpers, contains-inline/contains-size utilities, and reduced-motion protection for compound animation variants. Updated documentation and tests; raised the CSS gzip budget to the approved 37 kB.
- Added the missing Bootstrap 6 utility families for color schemes, z-index, Grid item alignment, child spacing, font families, link color opacity, child dividers, and motion. Kept Tremplin tokens and existing responsive/state names, added reduced-motion cancellation and configurable motion keyframe emission, documented actual support, and raised the CSS gzip ceiling to the approved 35 kB.
- Extended the utility generator with property/value lists and maps, class defaults, local variables, child selectors, per-family importance, and disabled definitions. Preserved byte-identical default CSS and existing responsive/state/print names; added Sass error reporting, regression tests, and browser checks for custom builds.
- Added all 48 Utilities topic guides and a categorized index, distinguishing actual generated selectors from application-CSS fallbacks. Corrected Utility API claims about map overrides, removals, responsive/state/print support, and importance; pinned the reference topic inventory and added selector/Sass/browser checks.
- Added all nine Helpers guides with local examples and Bootstrap 6 references. Exposed visually-hidden-focusable, added keyboard-focus and reduced-motion behavior to hover lift, and aligned both sticky-top definitions with the configured sticky layer; documented remaining naming and token differences.
- Covered all 29 Bootstrap 6 component topic routes while preserving existing component URLs. Added Button group, Close button, and Nav guides; linked Placeholder/Toasts aliases to existing implementations; corrected source paths, instance targets, and named/default individual imports. Empty close controls now render a default glyph, reference tables are keyboard-accessible, the documentation layer badge respects dark-mode contrast, and extension navigation remains separate.
- Added all seventeen Forms topic guides with source-backed local examples, keyboard/accessibility checks, and a no-network validation demo. Corrected grouped-input reflow, adorned-field layout/focus, floating-label contrast, and valid feedback for required/pattern-constrained fields; documented unsupported upstream options rather than advertising false parity.
- Added Reboot, Typography, Images, Tables, and Prose documentation with Bootstrap 6 references and local examples. Corrected table active-row/cell precedence and added a limited not-prose spacing opt-out, with isolated framework rendering and accessibility tests.
- Added all eight Bootstrap 6 Layout documentation topics with source-backed local examples and explicit compatibility gaps. Fixed responsive zero-offset resets, automatic row column widths, and custom Sass column counts in CSS Grid defaults; covered Sass output, RTL offsets, and container-query behavior with tests.
- Matched documentation copy, sidebar, and edit-link icons to Bootstrap's SVG shapes with local MIT-licensed assets, 16px icons, 24px copy controls, copied-state feedback, and clipboard-error recovery.
- Matched documentation to Bootstrap 6's measured Geist/Geist Mono typography, 1440px centered layout, light-weight heading scale, compact sidebar and page outline, and light/dark highlighted code panels. Fonts are self-hosted with license notices and covered by responsive typography and contrast checks.
- Completed the Getting started overview and eleven guides with Bootstrap 6 references, step-by-step local installation and Vite setup, version-pinned publication examples, AI context, runtime tokens, accessibility and browser limitations, RTL guidance, verified downloads, and tested HTML and keyboard examples.
- Isolated all four Playwright suite ports, disabled server reuse, limited Windows worker counts, and added test-server connection cleanup, keep-alive tuning, clear bind errors, and lifecycle regression checks to the release pipeline.
- Corrected documentation brand-link accessible names on desktop and mobile, updated theme test selectors, and refreshed reviewed documentation baselines for the requested site redesign.
- Added enforced CSP browser coverage with Trusted Types negative controls, sanitized and element-backed overlays, and Datepicker keyboard interaction. Replaced raw HTML insertion in Datepicker and element-backed TemplateFactory content with DOM operations.
- Redesigned the documentation interface around a Bootstrap 6-style responsive shell with centered shortcut-enabled search, collapsible icon navigation, wider content, generated page outlines, layer/edit toolbars, package-manager tabs, mobile navigation, enhanced preview/code panels, a release-focused marketing homepage, a complete project footer, and WCAG and visual-regression coverage.
- Added Trusted Types-aware sanitized template insertion, safe `srcset` validation, hardened new-window links, reference-counted nested native-dialog ownership, topmost-only overlay dismissal, disposal cleanup, and cross-browser nested-overlay tests.
- Added the v0.9 release-candidate API freeze gate for package exports, JavaScript modules, component classes, CSS custom properties, and public Sass entry points and symbols, together with an enforceable deprecation registry and policy.

- Added a Bootstrap-style TypeScript component kernel with normalized data configuration, runtime option validation, namespaced events, selector helpers, lifecycle-safe instance storage, and transition scheduling.
- Added Bootstrap 6-style `dom`, `util`, root component, and extension source layers; delegated events; robust target selection; Promise-returning lifecycle methods; shared DialogBase behavior; and Floating UI positioning.
- Consolidated JavaScript component implementations into Bootstrap 6-style root `src/js/*.ts` modules and removed the duplicate `src/js/components` facade layer while preserving package subpaths.
- Moved `BaseComponent` to the JavaScript root, added Bootstrap-style utility index, sanitizer, swipe, and template factory modules, integrated them with Carousel, Tooltip, and Popover, and removed the transitional `src/js/core` directory.
- Removed the non-Bootstrap overlay-manager utility, moved overlay behavior into its owning components, and published Command Palette as the optional `tremplin/extensions/command-palette` entry instead of including it in the core bundle.
- Aligned the DOM event, configuration, instance-storage, selector, and BaseComponent contracts with Bootstrap 6; moved declarative data APIs into their owning components; and replaced the central `Tremplin.init()` dispatcher with an export-only main entry.
- Added typed Chips, NavOverflow, OtpInput, Range, and Strength plugins with declarative initialization and individual package builds.
- Raised the complete CSS and browser JavaScript gzip ceilings to 33 kB and 37.5 kB for the strict Bootstrap 6 implementations, complete catalog variants, adaptive behavior, Trusted Types, and nested-overlay safety; component entry points remain independently importable.
- Added the stateful Button plugin, Collapse accordion coordination, complete Tab lifecycle events, and focus-aware Toast autohide behavior.
- Added generated Button API documentation, JavaScript contract coverage, and release-readiness validation for package metadata, required artifacts, integrity hashes, and npm contents.
- Reorganized Sass around Bootstrap 6-style `buttons`, `content`, `forms`, `helpers`, `layout`, `mixins`, and `utilities` layers, with separate config, color, and theme modules and full/minified distribution bundles.
- Matched the Bootstrap 6 core Sass manifest exactly, moved Tremplin-only styles into `extensions`, and removed the obsolete `_maps.scss` and `_variables.scss` compatibility entries.
- Replaced the legacy Dropdown API and styles with Bootstrap 6's toggle-based Menu model, and aligned Scrollspy with its IntersectionObserver-driven, JavaScript-only model.
- Added Bootstrap 6 Menu parity for responsive placements, alternate references, containers, static display, custom Floating UI configuration, form-safe autoclose, transition-aware events, and click/hover submenus.
- Replaced the compact Menu implementation with Bootstrap 6's complete source pattern, including hover-intent safe triangles, nested submenu cleanup, portaled keyboard context, exact fallback placements, touch handling, and visibility-aware navigation.
- Removed the earlier Menu-only `keyboard`, `typeahead`, `wrap`, `focusFirst()`, and `focusLast()` extensions so the local Menu contract matches Bootstrap 6 exactly; `MenuOptions` remains a package-level alias for `Partial<MenuConfig>`.
- Replaced the compact Tooltip implementation with Bootstrap 6's complete Floating UI lifecycle, delegated triggers, responsive placement, delays, dynamic content, sanitization, focus-safe hover behavior, Escape dismissal, and configuration contract.
- Replaced the standalone Popover implementation with Bootstrap 6's Tooltip-derived component, including inherited configuration and lifecycle behavior; removed the non-Bootstrap `dismissible` option.
- Aligned TemplateFactory and Sanitizer with Bootstrap 6, including Config-based validation, element content handling, custom sanitizer hooks, the expanded HTML allowlist, and a dedicated safe inline-icon allowlist.
- Replaced the compact Carousel and Swipe implementations with Bootstrap 6's scroll-snap, IntersectionObserver, autoplay, end-mode, play/pause, per-slide timing, reduced-motion, RTL, pointer, and touch behavior; aligned the Carousel Sass and retained `CarouselOptions` and `SwipeOptions` as compatibility aliases.
- Replaced the compact Collapse implementation with Bootstrap 6's transition-safe lifecycle, first-level accordion coordination, shared multi-target trigger handling, nested-panel protection, CSS-owned block/inline-size animation, and ARIA initialization; removed the obsolete constructor `toggle` option while retaining `CollapseOptions` as an alias for `Partial<CollapseConfig>`.
- Replaced the compact Tab implementation and navigation Sass with Bootstrap 6's ARIA initialization, roving keyboard focus, disabled-tab filtering, menu integration, transition-aware lifecycle, stale-activation protection, and complete tabs, pills, underline, fill, justified, and animated pane styles.
- Aligned Alert, Button, Toast, and Scrollspy with Bootstrap 6: transition-aware alert destruction, ARIA-synchronized buttons, interaction-safe toast autohide, theme-driven button variants, and activation-line Scrollspy with bottom sentinels, resize rebuilding, smooth-scroll settlement, special-ID handling, and menu-parent activation.
- Exported Sass variables, functions, and mixins through the primary configurable module.
- Added lifecycle-safe React hooks and Vue directives as optional peer integrations.
- Added localized Datepicker interface labels and direction-aware calendar navigation.
- Added clean npm-tarball installation and Sass/JavaScript consumer verification to the release gate.
- Expanded the icon sprite to 32 symbols and added dashboard and authentication examples.
- Added customization, integration, localization, and archived v0.7 documentation.
- Added Bootstrap-style documentation pages for the complete component manifest, with live examples, copyable markup, accessibility guidance, class references, source-generated JavaScript APIs, grouped navigation, and previous/next links.
- Expanded the Button, Alert, Badge, and Card guides with production variants, state examples, CSS-variable references, Sass customization, keyboard behavior, usage guidance, dark-mode and RTL examples, and visual-regression baselines.
- Expanded the Forms, Navbar, Menu, and Collapse guides with native-control patterns, responsive disclosure, Floating UI and submenu behavior, accordion and horizontal states, verified variables, keyboard guidance, dark-mode and RTL examples, and visual-regression baselines.
- Expanded the Dialog, Drawer, Tooltip, and Popover guides with shared overlay lifecycle guidance, modal and non-modal patterns, directional and sheet layouts, Floating UI placement, sanitization guidance, live dismissal coverage, dark-mode and RTL examples, and visual-regression baselines.
- Expanded the Carousel, Tab, Toast, and Scrollspy guides with controls, autoplay, navigation variants, notification patterns, smooth and nested section tracking, verified interaction coverage, dark-mode and RTL examples, and visual-regression baselines.
- Expanded Accordion, Breadcrumb, List Group, and Pagination with configurable Sass token maps, Bootstrap-style variants and states, deep usage guides, WCAG and interaction coverage, dark-mode and RTL examples, and visual-regression baselines.
- Expanded Progress, Spinner, Placeholder/Skeleton, and Avatar with configurable Sass token maps, Bootstrap-style variants, accessible state guidance, dark-mode and RTL examples, browser checks, and visual-regression baselines.
- Expanded Table, Chip, Stepper, and Status with configurable Sass token maps, responsive and semantic variants, accessibility guidance, dark-mode and RTL examples, browser checks, and visual-regression baselines; moved Data Table presentation into the Tremplin extension layer.
- Expanded Timeline, Divider, Empty State, and Data Table extensions with configurable Sass token maps, logical-direction variants, semantic examples, accessibility guidance, dark-mode and RTL coverage, browser checks, and visual-regression baselines.
- Expanded Chips, Combobox, Datepicker, and OTP Input with configurable Sass token maps, hardened declarative and keyboard behavior, complete accessibility guidance, dark-mode and RTL examples, browser checks, and visual-regression baselines.
- Expanded Range, Strength, Toggler, and Nav Overflow with configurable Sass tokens, native output and meter semantics, generic hidden-target synchronization, adaptive disclosure keyboard behavior, deep guides, browser checks, and visual-regression baselines.
- Completed deep-guide coverage for all 42 catalog components by expanding Bottom Sheet and the optional Command Palette extension with configurable Sass tokens, safe-area and size variants, labelled command groups, disabled-result handling, live browser checks, dark/RTL examples, and visual baselines.
- Added documentation contract tests that verify every published component CSS variable against the Sass source.
- Added Collapse, Tab, and Spinner to the documentation manifest and a compatibility test requiring every generated JavaScript component to have a component guide.
- Added dedicated installation, download, package-content, bundler, JavaScript, browser, accessibility, RTL, Sass, CSS-variable, color-mode, breakpoint, container, grid, form, and utility reference pages with grouped navigation and searchable examples.
- Published versioned CSS and JavaScript downloads from the documentation site with byte counts and SHA-384 values sourced from the generated integrity manifest.

## 0.7.0-beta.0

- Added source-generated metadata and documentation pages for every TypeScript component option, method, lifecycle event, and data hook.
- Added a frozen API compatibility baseline that blocks removed or changed public contracts.
- Added swipe-to-dismiss bottom sheets, responsive drawer sizes, and navbar auto-close and Escape behavior.
- Added zero-build HTML, Vite, React, and Vue starter projects.
- Expanded the SVG sprite and added a searchable, accessible icon catalog.
- Added three-browser initialization performance coverage, v0.6 migration guidance, and a manual screen-reader validation matrix.

## 0.6.0-beta.0

- Expanded browser and axe coverage to Chromium, Firefox, and WebKit, including responsive navbar and bottom-sheet keyboard behavior.
- Added reviewed LTR and RTL screenshot baselines for core components.
- Added forced-colors tokens and fixed native WebKit button styling that reduced navigation contrast.
- Added an accessible bottom-sheet pattern using the Drawer lifecycle and unprefixed component classes.
- Added a minified global browser bundle with SHA-384 metadata and enforced CSS/JavaScript gzip budgets.
- Added a real v0.5 documentation archive route plus security, contribution, and governance policies.

## 0.5.0-alpha.0

- Added an Astro and MDX documentation site with responsive navigation, theme switching, version selection, and Pagefind search.
- Added a sandboxed live markup playground and an indexed examples gallery.
- Added a zero-configuration Vite starter, an SVG icon sprite with CSS helpers, and Ocean and Forest theme presets.
- Added SHA-384 integrity metadata for CDN assets and exposed icons and themes through package exports.
- Added Changesets, GitHub Actions CI and npm release workflows, and site-level Playwright and axe coverage.

## 0.4.0-alpha.2

- Added a typed ARIA combobox with filtering, active-descendant tracking, keyboard and pointer selection, and disabled-option handling.
- Added a command palette with search, command events, Ctrl/Command+K, focus trapping, overlay coordination, and focus restoration.
- Added real Chrome Playwright tests and axe WCAG A/AA scans for documentation, examples, and open overlay states.
- Corrected progress-bar naming, danger-text contrast, and scroll-region keyboard access found by the accessibility gate.
- Added standalone bundles, metadata, documentation, and a discovery-components example.

## 0.4.0-alpha.1

- Added carousel controls, indicators, cycling, keyboard navigation, pause behavior, and pointer swipes.
- Added ARIA menu roving focus, typeahead, disabled-item handling, and nested submenu navigation.
- Added scrollspy activation with active-link and `aria-current` synchronization.
- Added a localized, bounded datepicker with complete calendar keyboard navigation.
- Added standalone bundles, data APIs, CSS, metadata, tests, documentation, and an advanced interaction example.

## 0.4.0-alpha.0

- Added a shared overlay manager with stack-aware Escape handling and scroll locking.
- Added safe rich-content sanitization and viewport-aware floating positioning.
- Added typed drawer, dropdown, toggler, tooltip, and popover plugins with data APIs and individual bundles.
- Migrated Dialog scroll locking and Escape coordination to the shared overlay manager.
- Added keyboard, focus, ARIA, dismissal, lifecycle, and sanitization tests.
- Added interaction documentation, metadata, styles, and a runnable example.

## 0.3.0-alpha.0

- Added display typography, prose, lists, blockquotes, responsive media, figures, code, and print refinements.
- Added advanced native form controls, floating labels, accessible validation and error summaries, OTP, password-strength, and combobox foundations.
- Added accordions, avatars, list groups, navbar and dropdown foundations, chips, status, dividers, empty states, steppers, timelines, and data-table patterns.
- Added a versioned component metadata manifest with accessibility contracts and unprefixed-class enforcement.
- Added a component guide, example screen, and expanded CSS contract tests.

## 0.2.0-alpha.0

- Added configurable Sass utility generation with responsive, state, dark-theme, print, and negative-spacing variants.
- Added responsive row counts, orders, gutters, CSS Grid spans, and element-based container-query helpers.
- Added CSS contract tests that prevent prefixed public class selectors.

## 0.1.0-alpha.0

- Established Tremplin branding, MIT license, API prefixes, browser policy, and product roadmap.
- Added token-driven light, dark, and automatic themes.
- Added reboot, typography, responsive containers, flex/CSS grids, utilities, forms, and core CSS components.
- Added typed alert, collapse, dialog, tab, and toast plugins with data and programmatic APIs.
- Added distributable CSS/JS builds, declarations, tests, documentation landing page, and component example.
- Adopted concise, unprefixed public classes such as `.container`, `.row`, `.btn`, and `.card`; retained namespaced variables and JavaScript hooks.
