---
"tremplin": minor
---

Align hover-lift with Bootstrap main e0bbab74ad1f97f29baddeed9bb0381cb34348ea: add the module-owned $hover-lift-tokens map for duration, timing, transform, and shadow; use the shared transition and box-shadow mixins; and include the helper in utilities-only CSS. Preserve the existing unlayered helper priority and Tremplin shadow geometry/palette pending the coordinated layer migration.

Raise the CSS gzip ceiling to the user-approved 47 kB so the helper remains included by default.

Migration: the default lift changes from -.125rem to -.25rem, the transition from the shared fast token to .2s ease, and the shadow from the small to the large token. Shared --trm-transition-fast and --trm-shadow-sm overrides no longer control this helper; use --trm-hover-lift-* tokens. Reduced motion now retains the selected transform/shadow without animation, matching Bootstrap 6. Override --trm-hover-lift-transform: none under the reduced-motion media query if the old no-translation behavior is required. Global transition, reduced-motion, and shadow switches are honored. Manual assistive-technology verification and full cascade-layer alignment remain separate work.
