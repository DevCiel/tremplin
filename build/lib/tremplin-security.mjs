import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { safeReferencePath, sha256 } from './tremplin-core.mjs'

// Approved scope is explicit: adding another file requires policy/code review,
// not merely appending a wildcard or silently refreshing a source baseline.
const approvedFiles = new Set([
  'src/js/util/sanitizer.ts', 'src/js/util/template-factory.ts',
  'src/js/chips.ts', 'src/js/nav-overflow.ts', 'src/js/datepicker.ts', 'src/scss/_datepicker.scss'
])

export function validateSecurityRegistry(registry, commit) {
  if (registry?.format !== 'tremplin-security-literal-patch-v1' || registry.referenceCommit !== commit || registry.approval?.id !== 'SEC-001') throw new Error('Invalid/stale security patch policy')
  if (registry.accessibilityApproval?.id !== 'A11Y-001' || registry.accessibilityApproval.date !== '2026-11-04' || !registry.accessibilityApproval.scope) throw new Error('Missing approved accessibility patch policy')
  if (!Array.isArray(registry.files) || registry.files.length !== approvedFiles.size) throw new Error('Incomplete security patch inventory')
  const seen = new Set()
  for (const entry of registry.files) {
    safeReferencePath(entry.path)
    const approvedId = entry.path === 'src/js/nav-overflow.ts' ? 'SEC-001+A11Y-001' : 'SEC-001'
    if (!approvedFiles.has(entry.path) || seen.has(entry.path) || entry.id !== approvedId || !entry.reason) throw new Error(`Unapproved/duplicate security patch target: ${entry.path}`)
    seen.add(entry.path)
    if (![entry.baseSha256, entry.patchedSha256, entry.editsSha256].every(value => /^[a-f0-9]{64}$/.test(value))) throw new Error('Invalid security patch digest')
    if (!Array.isArray(entry.edits) || !entry.edits.length || sha256(JSON.stringify(entry.edits)) !== entry.editsSha256) throw new Error('Security patch edits/digest mismatch')
  }
  if (!Array.isArray(registry.assets) || registry.assets.length !== 1) throw new Error('Incomplete security asset inventory')
  const asset = registry.assets[0]
  if (asset.path !== 'icons/ui/datepicker-chevron.svg' || asset.output !== 'dist/icons/datepicker-chevron.svg' || asset.id !== 'SEC-001' || !asset.reason || !/^[a-f0-9]{64}$/.test(asset.sha256)) throw new Error('Unapproved security asset')
  return registry
}

export async function loadSecurityRegistry(root, commit) {
  const registry = validateSecurityRegistry(JSON.parse(await readFile(path.join(root, 'metadata/bootstrap6-security-patches.json'), 'utf8')), commit)
  for (const asset of registry.assets) {
    if (sha256(await readFile(path.join(root, asset.path))) !== asset.sha256) throw new Error(`Security asset digest differs: ${asset.path}`)
  }
  return registry
}

export function approvedSecuritySource(file, brandedSource, registry) {
  const entry = registry.files.find(entry => entry.path === file)
  if (!entry) return { source: brandedSource, patch: null }
  if (sha256(brandedSource) !== entry.baseSha256) throw new Error(`Security patch base differs from pinned source: ${file}`)
  let source = brandedSource
  for (const edit of entry.edits) {
    if (!Array.isArray(edit.before) || !Array.isArray(edit.after) || !edit.before.length || !edit.before.every(line => typeof line === 'string') || !edit.after.every(line => typeof line === 'string')) throw new Error('Invalid literal security edit')
    const before = edit.before.join('\n')
    const after = edit.after.join('\n')
    const pieces = source.split(before)
    if (!before || before === after || pieces.length !== 2) throw new Error(`Security edit anchor is missing/ambiguous: ${file}`)
    source = pieces[0] + after + pieces[1]
  }
  if (sha256(source) !== entry.patchedSha256) throw new Error(`Security patch output digest differs: ${file}`)
  return { source, patch: { id: entry.id, baseSha256: entry.baseSha256, patchedSha256: entry.patchedSha256, reason: entry.reason } }
}

export function classifySecuritySource(actual, original, accepted) {
  if (actual === undefined) return 'missing'
  const normalized = actual.replaceAll('\r\n', '\n')
  if (normalized === accepted.source) return accepted.patch ? 'approved-security-patch' : 'matched'
  if (accepted.patch && normalized === original) return 'security-patch-missing'
  return 'implementation-differs'
}
