import { readFile, readdir, mkdir, writeFile, lstat, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { compile } from 'sass'
import ts from 'typescript-bootstrap'
import { productionPath, safeReferencePath, sha256 } from '../../build/lib/tremplin-core.mjs'
import { runtimeGuardPlugin } from '../../build/lib/runtime-guard.mjs'
import { loadSecurityRegistry, approvedSecuritySource } from '../../build/lib/tremplin-security.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const read = async file => JSON.parse(await readFile(file, 'utf8'))
const pin = await read(path.join(root, 'metadata/bootstrap6-reference.json'))
const product = await read(path.join(root, 'package.json'))
if (!/^[a-f0-9]{40}$/.test(pin.commit)) throw new Error('Invalid strict reference pin')
if (ts.version !== pin.typescriptVersion) throw new Error('Strict integration compiler differs from the pinned compiler')
const stage = path.join(root, 'artifacts/bootstrap6-strict', pin.commit)
const securityRegistry = await loadSecurityRegistry(root, pin.commit)
const manifest = await read(path.join(stage, 'stage-manifest.json'))
if (manifest.commit !== pin.commit || manifest.productVersion !== product.version || manifest.modules.length !== Object.values(pin.expectedCoreModules).reduce((sum,count)=>sum+count,0)) throw new Error('Missing/stale strict candidate; run audit:tremplin -- --stage first')
const assembly = path.join(root, 'artifacts/bootstrap6-integrations', pin.commit)
// Regenerate this exact pin-specific cache instead of accumulating old chunks.
const expectedAssembly = `artifacts/bootstrap6-integrations/${pin.commit}`
if (!/^[a-f0-9]{40}$/.test(pin.commit) || path.relative(root, assembly).replaceAll('\\', '/') !== expectedAssembly) throw new Error('Unsafe integration cache target')
for (const directory of [root, path.join(root, 'artifacts'), path.join(root, 'artifacts/bootstrap6-integrations'), assembly]) {
  const entry = await lstat(directory).catch(error => { if (error.code === 'ENOENT') return null; throw error })
  if (entry && (entry.isSymbolicLink() || !entry.isDirectory())) throw new Error(`Linked or invalid integration cache: ${directory}`)
}
await rm(assembly, { recursive: true, force: true })
const source = path.join(assembly, 'src')
const output = path.join(assembly, 'dist')
await mkdir(assembly, { recursive: true })
// The assembly lives below the repository but has its own source roots. Do not
// inherit root sideEffects globs, which cannot match these generated paths.
await writeFile(path.join(assembly, 'package.json'), JSON.stringify({ private: true, type: 'module', sideEffects: true }) + '\n')
const copied = []
async function put(relative, bytes, origin) {
  const file = path.join(assembly, safeReferencePath(relative))
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, bytes)
  copied.push({ path: relative, origin, sha256: sha256(bytes) })
}
for (const entry of manifest.modules) {
  safeReferencePath(entry.path)
  const bytes = await readFile(path.join(stage, entry.path))
  if (sha256(bytes) !== entry.sha256) throw new Error(`Modified strict core: ${entry.path}`)
  const local = productionPath(entry.path)
  const accepted = approvedSecuritySource(local, bytes.toString('utf8'), securityRegistry)
  await put(local, accepted.source, accepted.patch ? `stage+${accepted.patch.id}:${entry.path}` : `stage:${entry.path}`)
}
const optionalFiles = ['src/integrations/core-bindings.ts', 'src/runtime/strict.ts', 'src/runtime/registry.ts']
for (const directory of ['src/js/extensions', 'src/adapters', 'src/scss/extensions']) {
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    if (!entry.isFile() || !/\.(?:ts|scss)$/.test(entry.name)) throw new Error(`Unexpected optional source: ${directory}/${entry.name}`)
    optionalFiles.push(`${directory}/${entry.name}`)
  }
}
for (const file of optionalFiles) {
  const bytes = await readFile(path.join(root, file))
  if (file === 'src/integrations/core-bindings.ts') {
    const text = bytes.toString('utf8')
    const strict = "export { default as BaseComponent } from '../js/base-component.js'"
    if (!text.includes(strict)) throw new Error('Core binding changed; review strict integration composition')
  }
  await put(file, bytes, file)
}
const configPath = path.join(root, 'artifacts/bootstrap6-reference', pin.commit, 'tsconfig.json')
const config = ts.readConfigFile(configPath, ts.sys.readFile)
if (config.error) throw new Error('Cannot load pinned compiler options')
const upstream = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath))
const program = ts.createProgram(copied.filter(entry => entry.path.endsWith('.ts')).map(entry => path.join(assembly, entry.path)), {
  ...upstream.options, types: [], rootDir: source, outDir: path.join(output, 'types'),
  declaration: true, declarationMap: true, noEmit: false, emitDeclarationOnly: true
})
const diagnostics = ts.getPreEmitDiagnostics(program)
if (diagnostics.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCanonicalFileName: file => file, getCurrentDirectory: () => root, getNewLine: () => '\n' }))
const consumerPath = 'tests/strict-integrations/consumer.ts'
await put(consumerPath, await readFile(path.join(root, consumerPath)), consumerPath)
const consumer = ts.createProgram([path.join(assembly, consumerPath)], { ...upstream.options, types: [], noEmit: true })
const consumerDiagnostics = ts.getPreEmitDiagnostics(consumer)
if (consumerDiagnostics.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(consumerDiagnostics, { getCanonicalFileName: file => file, getCurrentDirectory: () => root, getNewLine: () => '\n' }))
const emitted = program.emit()
if (emitted.emitSkipped || emitted.diagnostics.length) throw new Error('Strict integration declaration generation failed')
const entries = { tremplin: path.join(source, 'js/index.ts') }
for (const entry of manifest.modules.filter(entry => /^js\/src\/[^/]+\.ts$/.test(entry.path) && !/\/(?:base-component|dialog-base|index)\.ts$/.test(entry.path))) {
  entries[`components/${path.basename(entry.path, '.ts')}`] = path.join(assembly, productionPath(entry.path))
}
for (const name of ['command-palette', 'floating']) entries[`extensions/${name}`] = path.join(source, `js/extensions/${name}.ts`)
for (const name of ['react', 'vue']) entries[`adapters/${name}`] = path.join(source, `adapters/${name}.ts`)
const common = { bundle: true, format: 'esm', platform: 'browser', target: 'es2022', external: ['react', 'vue', '@floating-ui/dom', 'vanilla-calendar-pro'],
  define: { TREMPLIN_BUILD_VERSION: JSON.stringify(product.version) },
  plugins: [runtimeGuardPlugin(path.join(source, 'js'), path.join(source, 'runtime/strict.ts'))], metafile: true }
const main = await build({ ...common, entryPoints: [entries.tremplin], write: false })
if (Object.keys(main.metafile.inputs).some(file => /\/(?:extensions|adapters|compat)\//.test(file.replaceAll('\\', '/')))) throw new Error('Strict default graph includes optional code')
const integrated = await build({ ...common, entryPoints: entries, outdir: path.join(output, 'js'), splitting: true, sourcemap: true })
if (!Object.keys(integrated.metafile.inputs).some(file => file.replaceAll('\\', '/').endsWith('/src/runtime/strict.ts'))) throw new Error('Strict runtime guard was removed')
const assemblyPrefix = path.relative(root, assembly).replaceAll('\\', '/') + '/'
for (const input of Object.keys(integrated.metafile.inputs)) {
  const normalized = input.replaceAll('\\', '/')
  if (!normalized.startsWith(assemblyPrefix) && !normalized.startsWith('node_modules/')) throw new Error(`Strict integration imports an implementation outside its assembly: ${input}`)
}
const styles = []
for (const asset of securityRegistry.assets) {
  await put(asset.output, await readFile(path.join(root, asset.path)), `SEC-001:${asset.path}`)
}
await mkdir(path.join(output, 'css'), { recursive: true })
for (const [name, entry] of [['tremplin', 'tremplin.scss'], ['extensions', 'extensions/index.scss']]) {
  const result = compile(path.join(source, 'scss', entry), { sourceMap: true, sourceMapIncludeSources: true })
  const loaded = result.loadedUrls.map(url => fileURLToPath(url).replaceAll('\\', '/'))
  if (name === 'tremplin' && loaded.some(file => file.includes('/extensions/'))) throw new Error('Strict default CSS includes extensions')
  if (name === 'extensions' && loaded.some(file => /\/src\/scss\/(?:_root|_reboot|tremplin)\.scss$/.test(file))) throw new Error('Optional stylesheet emits a second core')
  await writeFile(path.join(output, 'css', `${name}.css`), result.css + `\n/*# sourceMappingURL=${name}.css.map */\n`)
  await writeFile(path.join(output, 'css', `${name}.css.map`), JSON.stringify(result.sourceMap))
  styles.push({ name, loaded, sha256: sha256(result.css) })
}
// Test-only multi-entry splitting gives React DOM and the adapter one React
// dispatcher and converts React DOM's CommonJS requires to browser-safe ESM.
const vendors = {}
for (const [name, contents] of Object.entries({ react: 'export { createElement, StrictMode, act, useEffect, useRef } from "react"', 'react-dom': 'export { createRoot } from "react-dom/client"', vue: 'export { createApp, h, nextTick, withDirectives } from "vue"' })) {
  const file = path.join(assembly, 'test-vendors', `${name}.ts`)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, contents)
  vendors[name] = file
}
await build({ entryPoints: vendors, bundle: true, splitting: true, format: 'esm', platform: 'browser', outdir: path.join(output, 'vendors') })
for (const entry of manifest.modules) {
  const local = productionPath(entry.path)
  const accepted = approvedSecuritySource(local, await readFile(path.join(stage, entry.path), 'utf8'), securityRegistry)
  if (sha256(await readFile(path.join(assembly, local))) !== sha256(accepted.source)) throw new Error(`Integration altered source beyond approved patches: ${entry.path}`)
}
const report = { commit: pin.commit, productionPromotion: false, productVersion: product.version, coreModulesVerified: manifest.modules.length,
  exactCoreModules: manifest.modules.length - securityRegistry.files.length, securityPatchedModules: securityRegistry.files.length,
  optionalInputs: optionalFiles.length, bindingAdaptation: 'Uses the strict default binding; source exceptions are reconstructed only from approved SEC-001 and A11Y-001 literal edits.',
  typescriptVersion: ts.version, declarations: true, consumerTypes: true, copied, defaultGraph: main.metafile, integratedGraph: integrated.metafile, styles }
await writeFile(path.join(assembly, 'integration-manifest.json'), JSON.stringify(report, null, 2) + '\n')
console.log(`Strict integration preview: ${manifest.modules.length} pinned core modules, ${optionalFiles.length} optional/runtime inputs, shared ESM identity, declarations and separate extension CSS. Preview generation does not modify production files.`)
