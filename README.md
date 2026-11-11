# Tremplin

**Build faster. Launch further.**

[Documentation](#documentation) · [Quick start](#quick-start) · [Report a bug](https://github.com/DevCiel/tremplin/issues) · [Contributing](CONTRIBUTING.md)

Tremplin is a modern, accessible, token-first frontend framework created and maintained by Devciel. It combines configurable Sass, runtime CSS variables, a responsive layout system, reusable components, utilities, and framework-agnostic TypeScript plugins.

> Development preview: `0.8.0-beta.0` is not published. Registry/CDN installation and release approval remain blocked. A GitHub source upload is not a package release.

## Contents

- [Quick start](#quick-start)
- [What's included](#whats-included)
- [Development status](#development-status)
- [Install in an application](#install)
- [Customize with Sass](#customize-with-sass)
- [Documentation](#documentation)
- [Develop and test](#develop)
- [Contributing and support](#contributing-and-support)
- [Versioning](#versioning)
- [Browser policy](#browser-policy)
- [License](#license)

## Quick start

### Install in your application

After verified npm publication, install the package like any other frontend framework:

```bash
npm i tremplin
```

Or select the planned version explicitly:

```bash
npm i tremplin@0.8.0-beta.0
```

These are registry templates, not a claim that this development preview is
published. Until publication is verified, use the [local package](#install).

### Develop the framework and documentation

Use Node.js 24 for this checkout, matching CI, and run:

This workflow is for developing Tremplin itself. `npm install` installs the
development dependencies using `package-lock.json`; it does not install Tremplin
into another application or publish a package. GitHub Actions uses the same
command and rejects unexpected manifest or lockfile changes before building.

```bash
git clone https://github.com/DevCiel/tremplin.git
cd tremplin
npm install
npm run audit:tremplin -- --fetch --stage --check
npm run build:site
npm exec astro dev -- --host 127.0.0.1 --port 4321
```

Open <http://127.0.0.1:4321/>. Keep the terminal running. The reference command fetches and verifies the pinned upstream source and prepares the reference tests; it does not replace the production source.

To create an unpublished local package after building:

```bash
npm pack
```

Copy the resulting `tremplin-0.8.0-beta.0.tgz` into a separate application's `vendor/` directory, then follow [Install](#install). `npm pack` creates a local archive; it does not publish it.

## What's included

```text
tremplin/
  src/js/       TypeScript component core, DOM and utility modules
  src/scss/     Configurable Sass core and isolated optional extensions
  js/dist/      Canonical core ES modules, declarations and maps
  src/adapters/ Optional React and Vue adapters
  build/        Production compilation, SRI, site-copy and required shared helpers
  site/         Astro documentation website
  docs/         Maintainer guides, migration plans and acceptance policies
  tests/        Unit, browser, accessibility and visual tests
    tooling/    Project-specific audits, review/report tools and local QA servers
  starters/     HTML, Vite, React and Vue starter projects
  icons/        Tremplin icon assets
  themes/       Optional theme assets
  dist/         Core CSS/browser JavaScript, maps, required assets and notices (tracked)
```

The project keeps its maintained source under src/js and src/scss, with explicit npm build stages and source verification. See the [source structure](docs/SOURCE_STRUCTURE.md).

By project choice, JavaScript stays under `src/js/` and Sass under `src/scss/`.
Production tools use the root `build/` directory. Project-specific audits,
verification, report/review scripts and local QA servers live in `tests/tooling/`.
SRI generation and site copying use `build/generate-sri.mjs` and
`build/copy-site.mjs`; existing npm command names and arguments are unchanged.
There is no duplicate `scripts/` tree or forwarding wrapper at a retired path.
Repository previews are kept outside the root and npm package:
[Install preview](.github/assets/docs-install-preview.png) ·
[Buttons preview](.github/assets/docs-button-preview.png).

This repository tracks its root `dist/` distribution. Rebuild it
with `npm run build` after source changes and include the updated distribution
in the same commit. Do not hand-edit compiled files. Source maps, integrity
metadata, bundled dependencies, types and license notices accompany the assets.
Tracking these files does not publish an npm package, create a release, or deploy
the documentation. Dependencies, temporary artifacts and generated website
copies remain ignored.

## Development status

Tremplin is a development preview with 102 Sass modules and 35 TypeScript modules. Public APIs, source contracts and security fixes are verified by automated checks. Optional extensions and adapters remain separate from core.

The old fallback, compatibility exports and archive routes have been removed. Publishing remains blocked pending complete acceptance and release review. See [source structure and maintainer guidance](docs/SOURCE_STRUCTURE.md) and [security scope](SECURITY.md).

Public classes are concise and unprefixed:

```html
<div class="container">
  <div class="grid">
    <div class="md:col-6">
      <button class="btn-solid theme-primary">Launch</button>
    </div>
  </div>
</div>
```

Tremplin-specific CSS variables and JavaScript hooks remain namespaced as `--trm-*` and `data-trm-*`.

### Developer references

Use [current migration guidance](docs/MIGRATION.md) and the source-derived references below. Retired version-specific guides and compatibility promises are not part of the current framework.

See [the product plan](docs/PRODUCT_PLAN.md) for the complete parity roadmap.

Public package, JavaScript, CSS, and Sass contracts are protected by the [API stability and deprecation policy](docs/API_STABILITY.md).
See [the layout guide](docs/LAYOUT.md) for grid, container-query, and utility APIs.
See [the component guide](docs/COMPONENTS.md) for content, forms, validation, and CSS components.
See [the interaction guide](docs/INTERACTIONS.md) for data APIs, TypeScript APIs, lifecycle events, overlays, and safe content.
See [the customization guide](docs/CUSTOMIZATION.md), [integration guide](docs/INTEGRATIONS.md), and [localization guide](docs/LOCALIZATION.md) for v0.8 capabilities.
See [the source structure](docs/SOURCE_STRUCTURE.md) for the module and distribution layout.

Build the searchable documentation with `npm run build:site`, then run its browser and accessibility suite with `npm run test:site`.

## Install

### Available now: local package

Build and pack this checkout using Quick start, then run the following command
in a separate application's directory:

```bash
npm install ./vendor/tremplin-0.8.0-beta.0.tgz @floating-ui/dom vanilla-calendar-pro
```

### After verified npm publication only

If the maintainers secure and publish under the npm name `tremplin`, the consumer
command will be `npm i tremplin`. To select a specific published release, use
`npm i tremplin@<published-version>`, replacing the placeholder with a verified
release number. `npm i` is shorthand for `npm install`.

These are future registry instructions, not commands to use for this unpublished
preview. GitHub repository ownership does not establish ownership of an npm name;
do not assume an existing similarly named package belongs to DevCiel. Until
publication is confirmed, use the local tarball above. Use `npm install` for repository
development and CI even after publishing.

### Use the installed package

```ts
import 'tremplin/css'
import { Dialog } from 'tremplin'

Dialog.getOrCreateInstance('#welcome-dialog').show()
```

Importing Tremplin registers each component's declarative data API automatically.

This checkout is unreleased. Build and pack it locally before copying the tarball
into a separate application; registry and CDN publication remain blocked.

All browser JavaScript downloads use native ES modules:

```html
<link rel="stylesheet" href="./dist/css/tremplin.min.css">
<script type="module" src="./dist/js/tremplin.bundle.min.js"></script>
```

The bundle includes Floating UI and Vanilla Calendar Pro. The standard
`tremplin.js` / `tremplin.min.js` builds leave those dependencies external; use a
bundler or the local import map in the [Install guide](site/src/content/docs/getting-started/install.mdx).
No public build creates `window.TremplinFramework`. Import the named exports you
need. The package root, focused core imports and explicit `tremplin/js/dist/*.js`
imports share one canonical module graph. Browser downloads are alternative
graphs: use one build per document rather than mixing them with package modules.
Core CommonJS facades and old main/module/types fields are retired; Node 24
`require(ESM)` interop is not a separate CommonJS distribution. Optional adapters,
extensions, starters, themes and the icon catalog are not shipped by the core npm
archive; their authored sources remain in this repository for later separation.
React and Vue are development dependencies, not core consumer peers. Required
calendar assets and license notices remain included. The default compiler now
emits only 17 CSS and 8 browser JavaScript files, plus required assets/notices and
integrity metadata. Old optional/internal CJS/type/chunk outputs have been removed.
Documentation-only CSS/dependency builds live under ignored artifacts, not core
dist; canonical individual modules and declarations remain under `js/dist/`.
Preserve `dist/LICENSE`,
`dist/THIRD_PARTY_NOTICES.txt` when redistributing.

## Customize with Sass

```scss
@use 'tremplin/scss' with ($primary: #6d4aff, $enable-rounded: true);
```

## Documentation

Browse the local website using [Quick start](#quick-start), or read the [installation guide source](site/src/content/docs/getting-started/install.mdx), [source structure](docs/SOURCE_STRUCTURE.md), and [migration plan](docs/BOOTSTRAP6-MIGRATION-PLAN.md) on GitHub. No public documentation deployment is assumed by this README.

## Develop

After installing dependencies and preparing the pinned reference as described above:

```bash
npx playwright install --with-deps chromium firefox webkit
npm run check
```

`check` verifies the core, rebuilds the distribution (including `dist/integrity.json`), then type-checks the tests and prepares the documentation ESM assets before running unit tests and the remaining checks. Historical documentation scope hashes are tracked test fixtures, not prerequisites hidden in local artifacts. CI still rebuilds `dist/` rather than trusting the checked-in output; historical local artifacts are not needed.

CI runs on pushes and pull requests. Release and documentation-deployment workflows are manual-only; pushing code does not automatically publish a package or deploy the site.

Maintainers should also follow the [beta release checklist](docs/RELEASING.md) before publishing.

## Contributing and support

Optional local maintenance commands and their dry-run/apply safeguards are
documented in [Maintenance commands](docs/SOURCE_STRUCTURE.md#maintenance-commands).
They do not grant release or deployment approval.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes. For a reproducible bug or feature request, search the [issues](https://github.com/DevCiel/tremplin/issues) before opening a new one. Follow [SECURITY.md](SECURITY.md) for security reports; do not disclose vulnerabilities in public issues.

## Versioning

Package changes are recorded with Changesets. The current development version is `0.8.0-beta.0`; the [changelog](CHANGELOG.md), [API policy](docs/API_STABILITY.md), and [release checklist](docs/RELEASING.md) describe the project contract. Do not assume a GitHub commit, tag, or successful CI run grants release approval.

## Browser policy

Latest two major Chrome, Edge, Firefox, and Safari releases, plus current iOS Safari and Android Chrome. Internet Explorer is not supported.

## License

Tremplin’s original contributions are licensed under [MIT](LICENSE), copyright Devciel. Reused code and dependencies retain their original copyright and license terms in [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt). Keep these notices with redistributed builds.
