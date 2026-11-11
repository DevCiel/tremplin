# Contributing to Tremplin

## Development

Use Node.js 24 for repository development and CI. The installed Astro and Vitest
development tools no longer support Node.js 20; this toolchain requirement is
separate from consuming the framework's compiled browser assets.

Use the Node.js major in `.nvmrc` and the formatting settings in `.editorconfig`.
Repository tooling lives under `build/`; keep framework JavaScript and Sass at
`src/js/` and `src/scss/`. Rebuild and include the tracked `dist/` output for
source changes. Do not hand-edit compiled files or introduce a parallel tooling
tree. Preview images and issue templates live under `.github/` and are not npm
package contents.

```bash
npm install
npm run audit:bootstrap -- --fetch --stage --check
npx playwright install chromium firefox webkit
npm run check
```

Public CSS classes must remain concise and unprefixed. Framework custom properties, data attributes, and event namespaces use `trm`. Every behavior change needs unit tests, browser coverage, accessibility checks, documentation, and a Changeset.

Use `npm run test:visual:update` only after reviewing an intentional visual change. Never accept new screenshots merely to silence a failure.

Browser suites own separate loopback test servers: interaction/CSP tests use
4173, framework visuals use 4174, site behavior uses 4175, and documentation
visuals use 4176. They fail on occupied ports instead of reusing an unrelated
server. Keep the development site on 4321. Windows behavior suites use two
workers and screenshot suites use one to limit browser and socket pressure.
Each suite also writes to its own `test-results/` subdirectory so one run does
not clear another suite's traces or screenshots.
Run `npm run test:server` to verify root isolation, occupied-port rejection,
shutdown/restart, and recovery from malformed or aborted requests. This check
also runs as part of `npm run check`.

## Pull requests

Keep changes focused, describe user-visible effects, include accessibility considerations, and record breaking changes explicitly. Maintainers may request API changes while Tremplin remains pre-1.0.
