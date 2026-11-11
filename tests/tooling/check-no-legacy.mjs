import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const read = async file => JSON.parse(await readFile(file, 'utf8'))
const manifest = await read('metadata/legacy-removal.json')
const failures = []
const obsoleteDocuments = ['docs/MIGRATION_0.7.md', 'docs/MIGRATION_0.8.md', 'docs/BOOTSTRAP6-PARITY.md', 'docs/bootstrap-LICENSE.txt']
const exists = file => access(file).then(() => true, () => false)
const retirement = await exists('metadata/asset-retirement.json') ? await read('metadata/asset-retirement.json') : { sourceTargets: [], generatedTargets: [], retiredCssTokens: [] }
const normalize = file => file.replaceAll('\\', '/')
const forbidden = /(?:^|\/)(?:compat|legacy)(?:\/|\.|$)/
async function walk(directory) {
  if (!await exists(directory)) return []
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = normalize(path.join(directory, entry.name))
    if (entry.isSymbolicLink()) { failures.push(`Unexpected symlink in audited tree: ${file}`); continue }
    if (forbidden.test(file)) failures.push(`Retired output/source path: ${file}`)
    if (entry.isDirectory()) files.push(...await walk(file))
    else files.push(file)
  }
  return files
}
for (const target of [...manifest.sourceTargets, ...manifest.generatedTargets, ...retirement.sourceTargets, ...retirement.generatedTargets, ...obsoleteDocuments]) {
  if (await exists(target)) failures.push(`Retired target remains: ${target}`)
  // Preserve the original retirement inventories, but guard the relocated
  // tooling root too. Moving build tools must not reopen retired entrypoints.
  if (target.startsWith('scripts/')) {
    const relocated = 'build/' + target.slice('scripts/'.length)
    if (await exists(relocated)) failures.push(`Retired target remains: ${relocated}`)
  }
}
const product = await read('package.json')
for (const [specifier, target] of Object.entries(product.exports)) {
  if (/compat|legacy/.test(specifier + JSON.stringify(target))) failures.push(`Retired package export: ${specifier}`)
}
for (const [name, command] of Object.entries(product.scripts)) {
  if (/(?:build|check|inventory):compat|(?:build|check|preserve)-legacy|inventory-compat/.test(name + command)) failures.push(`Retired maintenance script: ${name}`)
}
if (product.sideEffects.some(entry => forbidden.test(entry))) failures.push('Retired sideEffects entry')
const sources = await walk('src')
for (const file of sources.filter(file => /\.(?:ts|scss)$/.test(file))) {
  const text = await readFile(file, 'utf8')
  if (/(?:from\s*|import\s*\(?\s*|require\s*\(\s*|@(?:use|forward)\s*)['"][^'"]*(?:compat\/|legacy\/|runtime\/legacy)/.test(text)) failures.push(`Retired dependency in ${file}`)
  if (/(?:hybrid|legacy)-0\.8/.test(text)) failures.push(`Retired runtime family in ${file}`)
  if (file.startsWith('src/scss/extensions/')) for (const token of retirement.retiredCssTokens) {
    if (new RegExp(token + '(?=\\s*[,):;])').test(text)) failures.push(`Retired optional CSS token ${token} in ${file}`)
  }
}
for (const directory of ['dist', 'site/public', 'site-dist', 'themes', 'artifacts/bootstrap6-integrations']) {
  for (const file of await walk(directory)) {
    if (!/\.(?:css|scss|[cm]?js|ts|map)$/.test(file)) continue
    const text = await readFile(file, 'utf8')
    if (/(?:hybrid|legacy)-0\.8|src\/runtime\/hybrid\.ts|src\/compat\/legacy\//.test(text)) failures.push(`Retired runtime source/content in ${file}`)
    if (file.endsWith('/src/scss/extensions/_palette.scss')) failures.push(`Retired palette shim in ${file}`)
    if (file.endsWith('.css') || file.endsWith('.scss')) for (const token of retirement.retiredCssTokens) {
      if (new RegExp(token + '(?=\\s*[,):;])').test(text)) failures.push(`Retired CSS token ${token} in ${file}`)
    }
  }
}
for (const graphFile of ['dist/strict-build-graph.json', 'artifacts/core-build-graph.json']) if (await exists(graphFile)) {
  const graph = await read(graphFile)
  const visit = value => {
    if (!value || typeof value !== 'object') return
    if (value.inputs) for (const file of Object.keys(value.inputs)) if (forbidden.test(normalize(file))) failures.push(`Retired build input: ${file}`)
    for (const child of Object.values(value)) if (child && typeof child === 'object') visit(child)
  }
  visit(graph)
}
if (await exists('metadata/compiler-cutover.json')) {
  const cutover=await read('metadata/compiler-cutover.json')
  for(const target of [...cutover.retiredTools,...cutover.retiredOutputRoots,cutover.retiredReport,'dist/css/tremplin-extensions.css','dist/css/tremplin-extensions.min.css']) if(await exists(target)) failures.push('Retired compiler/output remains: '+target)
}
if(await exists('metadata/build-tooling-relocation.json')) {
  const relocation=await read('metadata/build-tooling-relocation.json')
  for(const target of Object.keys(relocation.moves))if(await exists(target))failures.push('Retired QA/tool path remains: '+target)
}
if(await exists('metadata/npm-build-stages.json')) {
  const stages=await read('metadata/npm-build-stages.json')
  for(const target of [...stages.retiredTools,...Object.keys(stages.moves)])if(await exists(target))failures.push('Superseded build tool remains: '+target)
}
if(await exists('metadata/tremplin-tooling-rename.json')) {
  const branding=await read('metadata/tremplin-tooling-rename.json')
  for(const file of Object.keys(branding.moves))if(await exists(file))failures.push('Retired tool identity remains: '+file)
  for(const command of Object.keys(branding.commandRenames))if(command in product.scripts)failures.push('Retired command identity remains: '+command)
}
if(await exists('metadata/tremplin-branding.json')) {
  const branding=await read('metadata/tremplin-branding.json')
  for(const file of branding.retiredNoticePaths)if(await exists(file))failures.push('Retired duplicate notice remains: '+file)
}
for (const file of ['build/copy-site.mjs', 'site/src/layouts/DocsLayout.astro', 'site/src/pages/index.astro', 'site/src/pages/examples/index.astro']) {
  if (/['"]\/(?:legacy\/|docs\/0\.[567]\/)|copyChanged\([^\n]*legacy/.test(await readFile(file, 'utf8'))) failures.push(`Retired copy or navigation in ${file}`)
}
if (failures.length) throw new Error(`No-legacy gate failed:\n${[...new Set(failures)].join('\n')}`)
console.log('No-legacy gate passed: retired targets, exports, imports, graphs, site assets and archive routes are absent.')
