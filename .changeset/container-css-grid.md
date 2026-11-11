---
"tremplin": minor
---

Add Bootstrap 6-style CSS Grid spans/start lines and the public make-cssgrid($columns, $breakpoints) generator against main 2871f2a55ccf18af64045b8fc37529391b285900. g-col-1 through the configured count use literal auto/span placement; g-start-1 through count-minus-one set start lines. Responsive prefixes use shared container-query breakpoints rather than viewport or legacy cq scales. Guard one-column generators against Sass's descending 1-through-0 loop.

The grid class now establishes inline-size containment. Exact recognized modern-item classes opt into auto placement even below their responsive threshold; unrelated and legacy children retain the existing full-span fallback. Preserve legacy viewport/cq selector values, local minmax track geometry/gap/tokens, generation switches, and cascade priority. Full and grid-only CSS include the additions. The user approved a 48 kB CSS gzip ceiling for default inclusion.

Migration: legacy cq children now measure the nearest grid rather than a more distant wrapper, and inline-size containment affects intrinsic sizing. An application container-type: normal override can restore outer-query behavior but also changes modern query scope. Do not mix span-* with g-col/g-start on one item; use modern base-span fallbacks. g-col shorthands reset earlier starts, so repeat starts at the same responsive tier when needed. Additional generators do not extend the standard grid's exact reset list; configure shared maps for the standard grid or supply a separate project layout. Full upstream rows/tokens/geometry, other generators, and cascade-layer parity remain separate work.
