import framework = require('tremplin')
import focused = require('tremplin/button')
import canonical = require('tremplin/js/dist/button.js')
// @ts-expect-error Optional adapters are not shipped by the core package.
import adapter = require('tremplin/vue')
// @ts-expect-error Optional extension declarations must not leak into the core.
import extension = require('tremplin/extensions/command-palette')

const same: typeof framework.Button = focused.default
const sameCanonical: typeof framework.Button = canonical.default
void sameCanonical
const button = same.getOrCreateInstance(document.createElement('button'))
button.toggle()
const version: string = framework.Button.VERSION
// @ts-expect-error The real declaration must reject an unknown component method.
button.missingMethod()
// @ts-expect-error The real version declaration is a string, not any or number.
const wrongVersion: number = framework.Button.VERSION
void version
void wrongVersion
