// Compile-time consumer fixture: checked against both the hybrid checkout and
// the generated strict assembly, without importing one implementation's types
// into the other. This file is not executed as a React hook outside a component.
import Dialog from '../../src/js/dialog.js'
import { useTremplin, type TremplinReactBinding } from '../../src/adapters/react.js'
import { createTremplinDirective } from '../../src/adapters/vue.js'

export function useDialog(): TremplinReactBinding<HTMLDialogElement, Dialog> {
  return useTremplin(Dialog, { keyboard: true })
}

export const dialogDirective = createTremplinDirective(Dialog)

export function rejectedOptions(): void {
  // @ts-expect-error keyboard must remain boolean across both editions.
  useTremplin(Dialog, { keyboard: 'invalid' })
}
