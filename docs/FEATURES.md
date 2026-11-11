# Current feature status

This describes the unreleased strict core, not the removed prototype versions or
a claim of parity with Bootstrap's latest moving main branch.

| Area | Current implementation | Acceptance boundary |
| --- | --- | --- |
| Sass core | 102 pinned modules covering configuration, content, layout, forms, components, helpers and utilities | Source/CSS gates verify the fixed pin and approved exceptions |
| JavaScript core | 20 plugins across 35 pinned TypeScript modules | Component, security, type and browser checks remain required |
| Distribution | CSS, native ESM, CJS, declarations, source maps, vendor modules, SVG and notices | Root dist is tracked and rebuilt; integrity and installed-package checks apply |
| Documentation | Astro site, generated API guides and Pagefind search | No retired documentation versions are served |
| Optional ecosystem | Separate extensions, adapters, starters, icons and themes | Not part of the default core; broader consumer qualification is incomplete |
| Accessibility | Automated browser, keyboard and accessibility coverage | Manual screen-reader/device sign-off is still required |
| Release | Explicitly blocked development preview | No verified public npm/CDN release or automatic deployment is implied |

The source audit records 131 identity-adapted matches and six explicitly approved
patched modules. It does not describe all 137 files as unmodified copies.

Use [metadata/api.json](../metadata/api.json) for actual plugins and methods,
[metadata/public-api.json](../metadata/public-api.json) for exported CSS/Sass and
package surfaces, and the [migration plan](BOOTSTRAP6-MIGRATION-PLAN.md) for
acceptance evidence. The default core does not include optional extensions or
promise the old hybrid aliases, dispatchers or classic-script global.
