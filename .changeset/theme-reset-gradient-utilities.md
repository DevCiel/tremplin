---
"tremplin": minor
---

Generate contextual theme classes and reset keys from the configurable role map, retain the legacy theme-color alias, and expose public generation mixins. Add coordinated contrast/subtle/muted/border surface utilities, contextual link colors, and theme helpers to the utilities-only entry. Add the configurable gradient token/bg-gradient family and three-color gradient mixins, retaining existing mixin signatures and the opt-in gradient-bg switch.

Theme-context consumers now resolve the newer role values, including mode-aware foregrounds and the role map's muted/border/focus expressions. Legacy standalone palette shortcuts and component root tokens remain unchanged. Fix suffixless property-map default utility generation without changing named null removals, expand both guides/tests, and retain the approved 46 kB CSS gzip ceiling.
