---
"tremplin": minor
---

Adopt the audited Bootstrap 6 layer order and module ownership across the full, grid, Reboot and utilities distributions. Keep global root tokens, transitions, breakpoint variables and property registration outside named layers, following the source exceptions. Place Tremplin-only extensions in custom. Preserve all existing selectors, declaration values/order, media conditions, spacing, breakpoints and importance flags.

Migration: ordinary application CSS now outranks layered normal framework styles. Later layers win normal declarations, while earlier layers win important declarations. Components with important state rules and legacy important helpers can therefore beat important utilities. Utility importance remains enabled by default; use per-family configuration when needed. Load root first for individual module imports, and declare layer order before any application layer blocks. Do not wrap the complete distribution in another layer.
