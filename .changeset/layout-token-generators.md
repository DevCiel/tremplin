---
"tremplin": minor
---

Add Bootstrap 6-style canonical CSS Grid columns/rows/gap controls and public make-container/make-grid-columns factories against main 2871f2a55ccf18af64045b8fc37529391b285900. Retain legacy grid-column/gap tokens as fallbacks, local minmax tracks and 1rem gap, logical geometry, default aliases, and old mixin contracts. Each grid owns its canonical defaults. New grid-row-columns and gutters configuration controls both default naming styles and public generator output; container-padding-x defaults to grid-gutter-x but can be configured independently.

The new prefix-only Flexbox factory uses viewport ranges and excludes full-row offsets; the compatibility bundle keeps existing grouped aliases and offsets. Its gutter argument remains unused as in upstream: class values use the gutters map and row defaults come from make-row. make-container lives in the existing CSS-free grid-mixins module and is forwarded from the canonical containers module so legacy CQ output order is retained. Standalone factory namespace controls do not imply a complete whole-bundle variable-namespace rewrite.

Migration: grids now have one explicit 1fr row, which can redistribute free space in fixed-height layouts. Override grid-template-rows: none for old automatic-row behavior. Canonical token values belong on the grid itself; nested grids redeclare defaults, while inherited legacy fallback values remain supported. Gutters is a whole-map replacement, independent of spacing utilities. The user approved a 49 kB CSS gzip ceiling for default inclusion.
