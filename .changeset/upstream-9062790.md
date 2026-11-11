---
"tremplin": patch
---

Port the reviewed Bootstrap core changes through commit 9062790: reference-counted
native-dialog scroll locking, same-element component-key coexistence, dialog
self-target handling, NavOverflow fit calculations, literal Tooltip/Popover data
values, and the corresponding Sass fixes. Add the dialog-2xl class.

The core now contains 137 modules. Existing security/accessibility literal edits
remain unchanged; NavOverflow patch digests are rebased onto the new source.
Component APIs, package exports, Sass symbols and CSS property names stay stable.
The approved bundled-JavaScript budget is 61 kB. This update does not change the
package version or authorize publication/deployment.
