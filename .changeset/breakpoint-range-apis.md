---
"tremplin": minor
---

Add Bootstrap 6-style breakpoint-next/min/max functions, media-breakpoint-up/down/between/only mixins, container-breakpoint-down/between/only mixins, and loop-breakpoints-down plus its loop-breakpoints alias. Follow main revision e0bbab74ad1f97f29baddeed9bb0381cb34348ea: inclusive lower/exclusive upper ranges, unchanged positive maxima rather than epsilon subtraction, named containers, map-order iteration, and terminal null/empty next-prefix values.

Retain Tremplin's breakpoint scales, generated class names, legacy media-up signature/min-width output, and pre-existing unknown-name errors for breakpoint-prefix and container-breakpoint-up. breakpoint-prefix additionally accepts null for terminal loops. New min/max functions follow upstream null results for missing names; application maps/keys must be validated. New range/loop APIs emit no additional default CSS. Expand the Breakpoints/Stacks guides and exact-edge, fractional-container, RTL, physical-width, relative-unit, escaped-selector, metadata, and Sass-example tests. Complete layer/grid/container-class parity and manual assistive-technology review remain separate work. The CSS ceiling stays at the user-approved 47 kB gzip.
