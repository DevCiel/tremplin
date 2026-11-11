# Strict API contract

The build/QA split changes tool paths only. Forty-five QA tools move under
`tests/tooling/`, with SRI/site-copy production filenames aligned under `build/`.
`metadata/build-tooling-relocation.json` and its reversible path projection keep
the historical package/Playwright fixtures intact. Command names, flags, ordering,
package exports, dependencies, framework output bytes and release restrictions
do not change. Restoring old forwarding tools is rejected by the no-legacy gate.

The current canonical-entry transition changes only package delivery targets:
root/focused imports use `js/dist/`, explicit `./js/dist/*` imports are available,
and obsolete root main/module/types fields are removed. The original strict
baseline remains immutable. `metadata/core-entrypoint-transition.json` and the
reversible projection in `tests/tooling/lib/entrypoint-transition.mjs` require the exact
declared export shape and reconstruct the original complete public API digest.
Unrelated class, method, CSS, Sass or release changes still fail. The subsequent
`metadata/core-package-scope.json` projection removes precisely eight optional
exports and React/Vue consumer peers, and narrows the archive to core sources and
outputs. Authored optional sources and their historical metadata contracts stay
local; that catalog does not imply an installable optional export. Canonical-only
alias cleanup and physical internal-output retirement remain coordinated steps.

The reviewed upstream update to `9062790` adds only `dialog-2xl` to the public
CSS class inventory. Component APIs, package exports, Sass symbols and CSS
property names remain unchanged. The strict baseline records this explicit
additive delta and its previous commit; historical documentation hashes are
preserved through the exact reviewed transition record, not refreshed in place.

Tremplin's unreleased default framework follows the pinned Bootstrap 6 core. The approved clone-first migration intentionally replaces the earlier hybrid contract; no old implementation, compatibility export or frozen documentation version is maintained.

`metadata/strict-api-baseline.json` is the explicit initial contract for this migration. It records the upstream commit, component/export inventory and SHA-256 fingerprints of both generated API documents (parsed JSON, serialized with `JSON.stringify`, so formatting-only changes do not invalidate the contract). The old hybrid baselines are retired, not silently overwritten or claimed compatible. Source parity still independently verifies all 137 modules and the six approved SEC-001/A11Y-001 exceptions.

The strict contract covers package export targets, JavaScript and type exports, component options/methods/events/data attributes, CSS selectors/properties and configurable Sass APIs. Optional adapters and extensions are recorded separately from core component inventory and remain outside the default graph.

Run `npm run build:api` to generate current metadata, then `npm run check:api` to compare it with the committed strict baseline. Builds never refresh that baseline. Old `--snapshot` shortcuts are disabled. Any contract change requires an explained, explicit review of the pin, branding, source exceptions and baseline diff; do not refresh it merely to make a failure pass.

`npm run check:no-legacy` verifies retired source/build paths, package exports, imports, generated graphs and copied site assets. Installed-tarball tests also reject retired files and require old package paths to fail resolution.

This is an unreleased breaking migration, not a v1 stability promise. The existing package version is unchanged and `tremplinMigration.releaseBlocked` remains true. `check:release` and `prepublishOnly` continue to block publishing until all fixture, documentation, security, accessibility and visual acceptance work is reviewed. Ordinary quality checks no longer invoke the intentional publishing block.

The user-requested follow-up asset audit explicitly retires 15 obsolete optional fallback globals and corrects the property catalog to include already-generated core declarations. Its exact bounded CSS-only inventory change, prior/current fingerprints and backup are in `metadata/retired-css-contract.json`; see [the audit decisions](ASSET-RETIREMENT-AUDIT.md). JavaScript/Sass contracts, exports and core selectors remain unchanged. This recorded migration is not a general permission to refresh baselines.
