import { Button } from 'tremplin'
import FocusedButton from 'tremplin/button'
import CanonicalButton from 'tremplin/js/dist/button.js'
// @ts-expect-error Optional adapters are not shipped by the core package.
import { useTremplin } from 'tremplin/react'
// @ts-expect-error Optional extension declarations must not leak into the core.
import { CommandPalette } from 'tremplin/extensions/command-palette'

const same: typeof Button = FocusedButton
const canonical: typeof Button = CanonicalButton
void canonical
const button = same.getOrCreateInstance(document.createElement('button'))
button.toggle()
const version: string = Button.VERSION
// @ts-expect-error The real declaration must reject an unknown component method.
button.missingMethod()
// @ts-expect-error The real version declaration is a string, not any or number.
const wrongVersion: number = Button.VERSION
void version
void wrongVersion
