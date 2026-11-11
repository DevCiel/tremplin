type Lookup = { getInstance(element: Element): { dispose(): void } | null }

/** Dispose through the public instance registry before dropping fixture DOM.
 * Combobox owns an internal Menu; tear the owner down first. No DOM layout,
 * native modal stack or transition behavior is polyfilled here.
 */
export function cleanupCore(core: Record<string, unknown>) {
  const names = Object.keys(core).filter(name => !['BaseComponent', 'DialogBase'].includes(name))
  names.sort((a, b) => Number(b === 'Combobox') - Number(a === 'Combobox'))
  for (const name of names) {
    const component = core[name] as Partial<Lookup> | undefined
    if (typeof component?.getInstance !== 'function') continue
    for (const element of document.querySelectorAll('*')) component.getInstance(element)?.dispose()
  }
}
