---
"tremplin": minor
---

Add Bootstrap 6-style semantic foreground/emphasis/contrast, background/subtle/muted, neutral surface/boundary, and subtle-border utilities with private alpha composition. Add configurable role maps, neutral token maps, role-opacity keys, and public reference helpers. Preserve the flat theme-color map, existing text/border palette references, legacy component tokens, and default semantic background colors. Use --trm-color-* for new per-color roles to avoid token collisions, recompute references at explicit theme boundaries, and provide forced-color overrides.

Move semantic bg-* output into the configurable utility map, update three guides and regressions, and include the additions by default under the user-approved 46 kB CSS gzip ceiling. JavaScript's ceiling is unchanged. This is role-structure compatibility with the local palette, not exact Bootstrap color-ramp or component/theme-reset parity.
