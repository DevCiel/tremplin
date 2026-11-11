import type { Directive, ObjectDirective } from 'vue'
import type { TremplinInstance as BaseComponent, ElementLike } from './types.js'
export type { TremplinInstance } from './types.js'

export interface TremplinConstructor<T extends BaseComponent, O> {
  new (element: ElementLike, options?: O): T
}

/** Creates a Vue directive that owns a Tremplin component lifecycle. */
export function createTremplinDirective<T extends BaseComponent, O>(
  Component: TremplinConstructor<T, O>
): Directive<HTMLElement, O> {
  const instances = new WeakMap<HTMLElement, T>()
  const directive: ObjectDirective<HTMLElement, O> = {
    mounted(element, binding) {
      instances.set(element, new Component(element, binding.value))
    },
    unmounted(element) {
      instances.get(element)?.dispose()
      instances.delete(element)
    }
  }
  return directive
}
