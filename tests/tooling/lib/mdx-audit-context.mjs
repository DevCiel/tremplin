// Migration policies form a historical chain. Validate each policy once within
// one synchronous audit, then discard the context so later audits see edits.
let active
export function withinMdxAudit(key, validate) {
  const owner = !active
  if (owner) active = new Map()
  try {
    if (active.has(key)) return active.get(key)
    const value = validate()
    active.set(key, value)
    return value
  } finally { if (owner) active = undefined }
}
