---
"tremplin": minor
---

Adopt the audited Bootstrap 6 pixel breakpoints (0, 576, 768, 1024, 1280, 1536px) and container maxima (540, 720, 960, 1200, 1440px). Use 2xl as the canonical largest key and retain xxl class and Sass-helper aliases in the same rules, without adding another tier. Honor explicit custom xxl keys and legacy width overrides; accept quoted/numeric 2xl names through helpers. Keep spacing, gutters, the separate legacy cq scale, geometry, layer placement, and existing map-replacement behavior unchanged.

Migration: lg/xl/largest activation thresholds move upward, and xl/largest containers widen. Defaults are now absolute pixels rather than rem. To restore old behavior, override both breakpoints and container-widths using the documented previous maps. The legacy container-widths option name remains supported; this batch does not introduce the full upstream container-max-widths API. The user approved a 55 kB CSS gzip ceiling for default inclusion of both 2xl and xxl spellings.
