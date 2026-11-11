import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import reference from '../bootstrap6-site-routes-reference.json' with { type: 'json' }

/** Frozen pin-derived routes + explicit local additions. Never derive expected
 * routes or a lower page-count floor from the generated site's own output.
 */
export function expectedSiteRoutes(): string[] {
  const pin = JSON.parse(readFileSync('metadata/bootstrap6-reference.json', 'utf8')) as { commit: string }
  if (reference.commit !== pin.commit) throw new Error('Site route contract belongs to a different pin')
  const root = path.join('artifacts/bootstrap6-reference', pin.commit)
  const manifest = JSON.parse(readFileSync(path.join(root, 'reference-manifest.json'), 'utf8')) as { commit: string; files: { path: string; sha: string }[] }
  if (manifest.commit !== pin.commit) throw new Error('Wrong upstream documentation manifest')
  const docs = manifest.files.filter(file => file.path.startsWith('site/src/content/docs/') && file.path.endsWith('.mdx'))
  if (docs.length !== reference.upstreamDocumentCount) throw new Error('Incomplete pinned documentation inventory')
  for (const file of docs) {
    if (!/^site\/src\/content\/docs\/(?:[\w-]+\/)*[\w-]+\.mdx$/.test(file.path)) throw new Error('Unsafe pinned documentation path')
    const content = readFileSync(path.join(root, file.path))
    const gitHash = createHash('sha1').update('blob ' + content.length + '\0').update(content).digest('hex')
    if (gitHash !== file.sha) throw new Error('Modified pinned documentation: ' + file.path)
  }
  const excluded = new Set(reference.excludedUpstream.map(file => file.path))
  for (const item of reference.excludedUpstream) {
    if (!item.reason || !docs.some(file => file.path === item.path)) throw new Error('Invalid documented route exclusion')
  }
  const canonical = docs.filter(file => !excluded.has(file.path)).map(file => '/' + file.path.slice('site/src/content/docs/'.length).replace('.mdx', '') + '/').sort()
  if (JSON.stringify(canonical) !== JSON.stringify(reference.canonical)) throw new Error('Pinned canonical route inventory changed')
  const local = reference.localGroups.flatMap(group => {
    if (!group.reason) throw new Error('Local routes need an explicit classification')
    return group.routes
  })
  const result = [...canonical, ...local].sort()
  if (new Set(result).size !== result.length) throw new Error('Duplicate/overlapping expected routes')
  if (result.some(route => !/^\/(?:[\w-]+\/)*$/.test(route))) throw new Error('Invalid expected route')
  return result
}
