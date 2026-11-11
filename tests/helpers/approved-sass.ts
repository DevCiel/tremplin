import { readFileSync } from 'node:fs'
import path from 'node:path'
import { compileString } from 'sass'
import { sass, sassPin } from './pinned-sass'

const assembly = 'artifacts/bootstrap6-css-check/' + sassPin.commit + '/'
const cache = new Map<string, string>()
let verified = false

/** Verify the separately reconstructed CSS reference against the pristine,
 * hash-checked stage plus the existing literal security registry. Never copy
 * expected source from production, rewrite the stage, or filter declarations.
 * Prepare it explicitly with check:production-css before running this batch.
 */
export async function prepareApprovedSass() {
  if (verified) return
  sass("@use 'src/scss/config';", true)
  const modulePath = '../../build/lib/tremplin-security.mjs'
  const policy = await import(modulePath) as {
    loadSecurityRegistry(root: string, commit: string): Promise<unknown>
    approvedSecuritySource(file: string, source: string, registry: unknown): { source: string }
  }
  const registry = await policy.loadSecurityRegistry(process.cwd(), sassPin.commit)
  const stage = 'artifacts/bootstrap6-strict/' + sassPin.commit + '/'
  const manifest = JSON.parse(readFileSync(stage + 'stage-manifest.json', 'utf8')) as { modules: { path: string }[] }
  for (const entry of manifest.modules.filter(entry => entry.path.startsWith('scss/'))) {
    const file = 'src/' + entry.path.replace('bootstrap', 'tremplin')
    const accepted = policy.approvedSecuritySource(file, readFileSync(stage + entry.path, 'utf8'), registry)
    if (readFileSync(assembly + file, 'utf8') !== accepted.source) throw new Error('Stale or modified approved CSS assembly: ' + file)
  }
  verified = true
}

export function approvedSass(source: string) {
  if (!verified) throw new Error('Call prepareApprovedSass in setup first')
  if (!cache.has(source)) {
    const input = source.replaceAll('src/scss/', assembly + 'src/scss/')
    cache.set(source, compileString(input, { loadPaths: [path.resolve('.')], silenceDeprecations: ['color-4-api'] }).css)
  }
  return cache.get(source)!
}
