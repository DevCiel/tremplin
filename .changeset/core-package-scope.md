---
"tremplin": minor
---

Separate the core npm archive from optional adapters, extensions, themes, starter
projects and the icon catalog. Remove their eight exports and React/Vue peers;
exclude their sources, generated outputs and old internal CJS/type graphs from
the core archive. Preserve authored local sources, all core modules, required
calendar assets and license notices. Nothing is published by this migration.
