import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { gzipSync } from 'node:zlib'
import { compile } from 'sass'
import postcss from 'postcss'
import ts from 'typescript-bootstrap'
import { build } from 'tsup'
import { brandSource, sha256, safeReferencePath } from '../../build/lib/tremplin-core.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const settings = JSON.parse(await readFile(path.join(root, 'metadata/bootstrap6-reference.json'), 'utf8'))
const product = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
if (ts.version !== settings.typescriptVersion) throw new Error(`Expected pinned TypeScript ${settings.typescriptVersion}, got ${ts.version}`)
if (!/^[a-f0-9]{40}$/.test(settings.commit)) throw new Error('Invalid reference commit')
const stage = path.join(root, 'artifacts/bootstrap6-strict', settings.commit)
const reference = path.join(root, 'artifacts/bootstrap6-reference', settings.commit)
const manifest = JSON.parse(await readFile(path.join(stage, 'stage-manifest.json'), 'utf8'))
if (manifest.commit !== settings.commit || manifest.productVersion !== product.version) throw new Error('Stale staged core: rerun audit:tremplin -- --stage')
if (!Array.isArray(manifest.testFixtures) || !manifest.testFixtures.length) throw new Error('Missing verified test fixture inventory; rerun audit:tremplin -- --stage')
for (const entry of [...manifest.modules, ...manifest.testFixtures]) {
  safeReferencePath(entry.path)
  if (sha256(await readFile(path.join(stage, entry.path))) !== entry.sha256) throw new Error(`Modified staged module: ${entry.path}`)
}
const identity = { version: product.version, upstreamVersion: settings.upstreamVersion }
// Ignore only CSS serialization whitespace/comments, never selectors, values,
// rule ordering, importance or at-rule conditions. Source comments are covered
// separately by the full source hash gate above.
const cssTree = css => {
  const visit = node => {
    if (node.type === 'comment') return null
    const fields = { type: node.type }
    for (const key of ['name', 'params', 'selector', 'prop', 'value', 'important']) if (node[key] !== undefined) fields[key] = node[key]
    if (node.nodes) fields.nodes = node.nodes.map(visit).filter(Boolean)
    return fields
  }
  return JSON.stringify(visit(postcss.parse(css)))
}
const distributions = []
for (const suffix of ['', '-grid', '-reboot', '-utilities']) {
  const input = path.join(stage, `scss/tremplin${suffix}.scss`)
  const raw = compile(path.join(reference, `scss/bootstrap${suffix}.scss`)).css
  const expected = cssTree(brandSource(raw, identity))
  const expanded = compile(input).css
  if (cssTree(expanded) !== expected) throw new Error(`Compiled CSS differs beyond declared branding: ${suffix || 'full'}`)
  const minified = compile(input, { style: 'compressed' }).css
  const output = path.join(stage, 'dist/css')
  await mkdir(output, { recursive: true })
  await writeFile(path.join(output, `tremplin${suffix}.css`), expanded)
  await writeFile(path.join(output, `tremplin${suffix}.min.css`), minified)
  distributions.push({ name: `tremplin${suffix}`, cssParity: true, gzipBytes: gzipSync(minified, { level: 9 }).byteLength })
}

const configPath = path.join(reference, 'tsconfig.json')
const loaded = ts.readConfigFile(configPath, ts.sys.readFile)
if (loaded.error) throw new Error(ts.flattenDiagnosticMessageText(loaded.error.messageText, '\n'))
const upstreamConfig = ts.parseJsonConfigFileContent(loaded.config, ts.sys, reference)
const entries = manifest.modules.filter(entry => entry.path.startsWith('js/src/')).map(entry => path.join(stage, entry.path))
// The candidate is a browser library. Do not let this checkout's unrelated
// @types/node globals change browser timer return types during validation.
const program = ts.createProgram(entries, { ...upstreamConfig.options, types: [], noEmit: true })
const diagnostics = ts.getPreEmitDiagnostics(program)
if (diagnostics.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCanonicalFileName: file => file, getCurrentDirectory: () => root, getNewLine: () => '\n' }))
await build({
  entry: { tremplin: path.join(stage, 'js/src/index.ts') },
  outDir: path.join(stage, 'dist/js'),
  tsconfig: configPath,
  format: ['esm'], platform: 'browser', target: 'es2022',
  external: ['@floating-ui/dom', 'vanilla-calendar-pro'],
  config: false, dts: false, splitting: false, sourcemap: true, minify: true, clean: false
})
const declarationProgram = ts.createProgram(entries, { ...upstreamConfig.options, types: [], noEmit: false, declaration: true, declarationMap: true, emitDeclarationOnly: true, rootDir: path.join(stage, 'js/src'), outDir: path.join(stage, 'dist/js') })
const declarations = declarationProgram.emit()
if (declarations.emitSkipped || declarations.diagnostics.length) throw new Error('Staged declaration generation failed')
const report = {
  commit: settings.commit, productionModified: false,
  sourceModulesVerified: manifest.modules.length,
  scssModules: manifest.modules.filter(entry => entry.path.startsWith('scss/')).length,
  javascriptModules: entries.length,
  distributions, javascriptTypecheck: true, typescriptVersion: ts.version, javascriptEsmBuild: true, javascriptDeclarations: true,
  browserBehaviorParity: 'see bootstrap-stage-browser-tests.json; cross-engine, integration, security and visual gates remain pending',
  productionPromotion: 'pending optional compatibility isolation, API migration and integrated verification'
}
await writeFile(path.join(root, 'artifacts/bootstrap-core-stage-validation.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
