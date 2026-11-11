#!/usr/bin/env node

// Utilities metadata delivery follows the pinned upstream generator.
// Derived work: MIT, The Bootstrap Authors; see licenses/third-party-code.txt.
// Compile in memory so Windows and Unix use the same implementation without
// shell quoting, temporary CSS, or broad temporary-file deletion.
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compile } from 'sass'
import { brandSource, gitBlobHash } from './lib/tremplin-core.mjs'
import { buildOutputRoot } from './rolldown.config.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
export const outputFile = path.join(buildOutputRoot(), 'css/tremplin-utilities.metadata.json')

export function extractUtilitiesMetadata(css) {
  const start = 'TREMPLIN-UTILITIES-METADATA-START'
  const end = 'TREMPLIN-UTILITIES-METADATA-END'
  assert.equal(css.split(start).length, 2, 'Expected one utilities metadata start marker')
  assert.equal(css.split(end).length, 2, 'Expected one utilities metadata end marker')
  const from = css.indexOf(start) + start.length
  const to = css.indexOf(end)
  assert(to > from, 'Utilities metadata markers are out of order')
  const metadata = JSON.parse(css.slice(from, to).trim())
  assert(metadata.utilities && typeof metadata.utilities === 'object' && !Array.isArray(metadata.utilities), 'Expected a utilities object')
  assert(Object.keys(metadata.utilities).length > 0, 'Utilities metadata must not be empty')
  for (const [name, utility] of Object.entries(metadata.utilities)) {
    assert(utility && typeof utility.class === 'string', 'Invalid class prefix: ' + name)
    assert(Array.isArray(utility.classes) && utility.classes.every(value => typeof value === 'string'), 'Invalid class list: ' + name)
    assert(utility.property === undefined || typeof utility.property === 'string', 'Invalid property: ' + name)
  }
  return metadata
}

export function compileUtilitiesMetadata() {
  return extractUtilitiesMetadata(compile(path.join(root, 'build/generate-utilities-metadata.scss'), { style: 'expanded', sourceMap: false }).css)
}

export async function verifyReferenceMetadata(metadata) {
  const pin = JSON.parse(await readFile(path.join(root, 'metadata/bootstrap6-reference.json'), 'utf8'))
  const product = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
  const manifest = JSON.parse(await readFile(path.join(root, 'metadata/core-delivery-reference.json'), 'utf8'))
  assert.equal(manifest.reference.commit, pin.commit, 'Delivery reference pin differs from core')
  const referencePath = 'dist/css/bootstrap-utilities.metadata.json'
  const expected = manifest.reference.files.find(file => file.path === referencePath)
  assert(expected, 'Missing pinned utilities metadata reference')
  const bytes = await readFile(path.join(root, 'artifacts/bootstrap6-reference', pin.commit, referencePath))
  assert.equal(gitBlobHash(bytes), expected.gitBlob, 'Upstream utilities metadata Git blob changed')
  const reference = JSON.parse(brandSource(bytes.toString('utf8'), { version: product.version, upstreamVersion: pin.upstreamVersion }))
  assert.deepEqual(metadata, reference, 'Source-derived utilities metadata differs from the pinned distribution')
}

export async function generateUtilitiesMetadata({ check = false, verifyReference = false } = {}) {
  const metadata = compileUtilitiesMetadata()
  if (verifyReference) await verifyReferenceMetadata(metadata)
  if (check) {
    assert.deepEqual(JSON.parse(await readFile(outputFile, 'utf8')), metadata, 'Built utilities metadata is stale')
  } else {
    await mkdir(path.dirname(outputFile), { recursive: true })
    await writeFile(outputFile, JSON.stringify(metadata, null, 2))
  }
  return metadata
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2))
  for (const arg of args) assert(['--check', '--verify-reference'].includes(arg), 'Unknown argument: ' + arg)
  const metadata = await generateUtilitiesMetadata({ check: args.has('--check'), verifyReference: args.has('--verify-reference') })
  console.log(`${args.has('--check') ? 'Verified' : 'Generated'} metadata for ${Object.keys(metadata.utilities).length} source-configured utilities.`)
}
