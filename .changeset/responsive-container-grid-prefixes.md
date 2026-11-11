---
"tremplin": minor
---

Add Bootstrap 6-style responsive containers and Flexbox grid prefix aliases, compared against main revision 25e322a54e610d0843b8ab887f8cfbabb0489c2b. Responsive sm:container through xxl:container are fluid until activation and then share each subsequent configured maximum. Prefix col/col-auto/col-N, offset, row-cols, gutter, and grid-only order selectors share declaration blocks with the existing infix names, preserving cascade equivalence and avoiding duplicate declarations.

Retain local breakpoint/width/spacing scales, logical geometry, generation switches, unlayered priority, and all legacy classes. Prefix offsets stop one short of the column count; legacy full-row offsets remain without new prefix aliases. Only width-map keys present in the breakpoint map generate variants; stale/unknown width keys are ignored so existing breakpoint-only customizations remain valid. Both full and grid-only CSS include the additions; independently used grid-only CSS still needs an application border-box reset.

Update layout guides and selector, progression, custom-map/count, exact-boundary, RTL, mixed-cascade, and grid-only browser tests. The CSS ceiling stays at the approved 47 kB gzip. Bootstrap CSS Grid g-col/g-start, automatic query containment, generator mixin parity, exact upstream values, and complete cascade layers remain separate work; legacy span/cq-span behavior is unchanged.
