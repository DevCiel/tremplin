// Reversible path-only projection; historical fixtures/transition records stay intact.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Tool commands and filesystem-based tests both run from the project root;
// Vitest's DOM environment rewrites import.meta.url to an HTTP module URL.
const policy=JSON.parse(readFileSync(resolve('metadata/build-tooling-relocation.json'),'utf8'))
assert.equal(policy.phase,'build-qa-tool-relocation')
assert.equal(Object.keys(policy.moves).length,47)
assert.equal(Object.values(policy.moves).filter(file=>file.startsWith('tests/tooling/')).length,45)
assert.equal(new Set(Object.values(policy.moves)).size,47)
for(const [from,to]of Object.entries(policy.moves)){
  for(const file of [from,to])assert(typeof file==='string'&&/^[\w./-]+$/.test(file)&&!file.startsWith('/')&&file.split('/').every(part=>part&&part!=='.'&&part!=='..'))
  assert(from.startsWith('build/'))
  assert(to.startsWith('tests/tooling/')||['build/generate-sri.mjs','build/copy-site.mjs'].includes(to))
}
export const toolMoves=Object.freeze({...policy.moves})
const forward=Object.entries(toolMoves).sort((a,b)=>b[0].length-a[0].length)
const reverse=Object.entries(toolMoves).map(([from,to])=>[to,from]).sort((a,b)=>b[0].length-a[0].length)
export function relocateToolPaths(source){assert.equal(typeof source,'string');for(const[from,to]of forward)source=source.replaceAll(from,to);return source}
export function restoreToolPaths(source){assert.equal(typeof source,'string');for(const[from,to]of reverse)source=source.replaceAll(from,to);return source}
