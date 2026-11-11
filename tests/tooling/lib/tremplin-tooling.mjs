// Exact successor mapping; do not rewrite historical fixtures or provenance.
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
export const toolingRename=JSON.parse(readFileSync(resolve('metadata/tremplin-tooling-rename.json'),'utf8'))
assert.equal(toolingRename.phase,'tremplin-tooling-rename')
assert.equal(Object.keys(toolingRename.moves).length,8)
assert.equal(Object.keys(toolingRename.commandRenames).length,7)
assert.equal(toolingRename.scope,'Path/command identity only. Real source provenance, authorship, licenses, source pin and security patches unchanged.')
const replacements=[...Object.entries(toolingRename.basenameReplacements),...Object.entries(toolingRename.commandRenames)]
for(const[from,to]of replacements){assert(/^[\w:.-]+$/.test(from)&&/^[\w:.-]+$/.test(to),'Unsafe tool identity');assert(from.includes('bootstrap')&&to.includes('tremplin'),'Unexpected branding substitution')}
export function brandTooling(source){assert.equal(typeof source,'string');for(const[from,to]of replacements)source=source.replaceAll(from,to);return source}
export function restoreBrandedTooling(source){assert.equal(typeof source,'string');for(const[from,to]of replacements.slice().reverse())source=source.replaceAll(to,from);return source}
export function currentToolPath(file){return toolingRename.moves[file]??file}
