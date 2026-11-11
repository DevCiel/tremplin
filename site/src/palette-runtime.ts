// Documentation-only entry: one graph/owner for the core and optional palette.
// Never load this alongside a second independently built core graph.
import * as framework from '../../src/js/index.js'
import { CommandPalette } from '../../src/js/extensions/command-palette.js'
export * from '../../src/js/index.js'
export { CommandPalette } from '../../src/js/extensions/command-palette.js'
// Explicit documentation-owned inspection hook; public modules create no global.
Object.assign(window,{TremplinFramework:{...framework,CommandPalette}})
