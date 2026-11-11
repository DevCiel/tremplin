export type RuntimeFamily = 'strict-6'

interface RuntimeClaim { family: RuntimeFamily; version: string; owner: symbol }
const key = Symbol.for('tremplin.framework.runtime')

/** Distribution-level guard. Deliberately outside the Bootstrap core modules. */
export function claimRuntime(family: RuntimeFamily, version: string, owner: symbol, root: Document | undefined = typeof document === 'undefined' ? undefined : document): void {
  if (!root) return // Independent SSR imports do not share a browser document.
  const holder = root as Document & { [key]?: RuntimeClaim }
  const existing = holder[key]
  if (existing) {
    if (existing.family === family && existing.version === version && existing.owner === owner) return
    throw new TypeError(`Tremplin runtime conflict: ${existing.family}@${existing.version} is already loaded. Use one distribution and module format per document; do not load duplicate bundles or mix module formats.`)
  }
  Object.defineProperty(root, key, { value: Object.freeze({ family, version, owner }), configurable: false, enumerable: false, writable: false })
}
