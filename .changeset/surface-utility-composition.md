---
"tremplin": minor
---

Add Bootstrap 6-style border/radius/shadow utility composition with logical axes, width/removal/opacity controls, numeric and named radii, and local non-inheriting shadow color/strength controls. Retain local palette and geometry defaults, expand guides, and use the user-approved 42 kB CSS gzip ceiling.

Migration: as explicitly approved, .shadow now uses the Sass shadow map's literal composable expressions rather than the legacy --trm-shadow runtime token. Components still support that token. Customize utility shapes through $shadows and color/strength through their new controls; static custom shadow expressions remain static.
