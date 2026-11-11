// Documentation-owned inspection hook, not a public framework global.
// Public distribution modules only export names; this app opts into a window hook.
import * as framework from '../../src/js/index.js'
export * from '../../src/js/index.js'
Object.assign(window,{TremplinFramework:framework})
