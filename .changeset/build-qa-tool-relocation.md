---
"tremplin": patch
---

Separate 45 audit, test, report, review and local-server tools from production
build tooling. Keep their commands and assertions intact under tests/tooling;
rename SRI generation and site copying to generate-sri.mjs and copy-site.mjs.
Preserve framework bytes, historical fixtures, release restrictions and pixel
settings through reversible path-only projections. Unimplemented upstream release
and deployment maintenance commands remain explicit rather than being copied or
silently treated as completed.
