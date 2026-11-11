---
"tremplin": minor
---

Add theme-aware/runtime focus controls, module-owned icon-link tokens and hover/focus-visible motion, configurable stretched-link before/after overlays and layer tokens, and border-token-driven vertical rules. Include all four helpers in utilities-only CSS and document module configuration and motion switches. Adapted against Bootstrap main e0bbab74ad1f97f29baddeed9bb0381cb34348ea; existing focus geometry/mixin signatures, direct SVG support, logical dimensions, and helper cascade priority are retained.

Migration: vertical rules now use opaque --trm-border-color styling rather than currentColor at .25 opacity. Customize --trm-vr-border-width/--trm-border-color instead of relying on color alone. Contextual focus colors take precedence over optional new and legacy fallback colors. Full layer migration and manual assistive-technology testing remain separate work.
