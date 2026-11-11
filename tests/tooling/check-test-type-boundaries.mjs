import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript-bootstrap'

const root = process.cwd()
const read = async file => JSON.parse(await readFile(file, 'utf8'))
const pin = await read('metadata/bootstrap6-reference.json')
assert.equal(ts.version, pin.typescriptVersion, 'Use the pinned compiler for both projects')

const parse = file => {
  const loaded = ts.readConfigFile(file, ts.sys.readFile)
  if (loaded.error) throw new Error(ts.flattenDiagnosticMessageText(loaded.error.messageText, '\n'))
  const parsed = ts.parseJsonConfigFileContent(loaded.config, ts.sys, path.dirname(path.resolve(file)), undefined, path.resolve(file))
  assert.deepEqual(parsed.errors, [], 'Configuration must parse without errors')
  return parsed
}
const core = parse('tsconfig.core-types.json')
const original = parse('tsconfig.core.json')
const tests = parse('tsconfig.json')
for (const key of ['target', 'module', 'moduleResolution', 'strict', 'verbatimModuleSyntax', 'erasableSyntaxOnly', 'useDefineForClassFields', 'noUncheckedIndexedAccess']) {
  assert.equal(core.options[key], original.options[key], 'Core profile drift: ' + key)
}
assert.deepEqual(core.options.types, [], 'Core must not auto-load Node ambient types')
assert.deepEqual(core.options.lib, original.options.lib)
assert.deepEqual(core.fileNames, original.fileNames)
assert.equal(core.options.emitDeclarationOnly, true)
assert.equal(core.options.noEmitOnError, true)
assert.equal(tests.options.strict, true)
assert.equal(tests.options.noUncheckedIndexedAccess, true, 'Keep strict indexed access in tests')
assert.equal(tests.options.noEmit, true)
assert.equal(tests.options.disableSourceOfProjectReferenceRedirect, true)
assert.deepEqual(tests.options.types, ['node'])
assert.equal(tests.projectReferences?.length, 1)
assert.equal(path.resolve(tests.projectReferences[0].path), path.resolve('tsconfig.core-types.json'))
assert(tests.fileNames.length > 0 && tests.fileNames.every(file => path.resolve(file).startsWith(path.resolve('tests') + path.sep)), 'All test roots, no core implementation roots')

const create = (rootNames, host = ts.createCompilerHost(tests.options)) => ts.createProgram({
  rootNames, options: tests.options, projectReferences: tests.projectReferences, host
})
const baseline = create(tests.fileNames)
const errors = ts.getPreEmitDiagnostics(baseline)
if (errors.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(errors, {
  getCanonicalFileName: file => file, getCurrentDirectory: () => root, getNewLine: () => '\n'
}))
const sourceFiles = baseline.getSourceFiles().map(file => path.resolve(file.fileName))
const importedCoreSources = sourceFiles.filter(file => file.startsWith(path.resolve('src') + path.sep) && !file.endsWith('.d.ts'))
assert.deepEqual(importedCoreSources, [], 'Test compiler must consume core declarations, not recheck core bodies')
const importedDeclarations = sourceFiles.filter(file => file.startsWith(path.resolve('artifacts/test-typecheck/core') + path.sep) && file.endsWith('.d.ts'))
assert(importedDeclarations.length > 0, 'Tests must load real generated core declarations')

// Virtual, never-written negative fixtures. All tests still participate in the
// program; these three deliberately invalid assignments must add exactly three
// diagnostics while a legitimate Node timer in the harness remains valid.
const probePath = path.resolve('tests/__compiler_boundary_probe__.ts')
assert.equal(ts.sys.fileExists(probePath), false, 'Do not shadow an existing test file with the virtual probe')
const probe = [
  "import Toast from '../src/js/toast.js';",
  'const indexed: string[] = [];',
  'const definite: string = indexed[0]; // INDEX_PROBE',
  'const nullable: string | null = null;',
  'const nonNull: string = nullable; // NULL_PROBE',
  "new Toast(document.createElement('div'), { delay: 'slow' }); // API_PROBE",
  'const timer: NodeJS.Timeout = setTimeout(() => {}, 1);',
  'clearTimeout(timer);',
  'export {};'
].join('\n')
const host = ts.createCompilerHost(tests.options)
const originalGetSourceFile = host.getSourceFile.bind(host)
const originalReadFile = host.readFile.bind(host)
const originalFileExists = host.fileExists.bind(host)
host.getSourceFile = (file, ...args) => path.resolve(file) === probePath ? ts.createSourceFile(file, probe, tests.options.target, true) : originalGetSourceFile(file, ...args)
host.readFile = file => path.resolve(file) === probePath ? probe : originalReadFile(file)
host.fileExists = file => path.resolve(file) === probePath || originalFileExists(file)
const negatives = ts.getPreEmitDiagnostics(create([...tests.fileNames, probePath], host))
assert.equal(negatives.length, 3, 'Negative checks must fail for exactly the intended reasons')
const observed = negatives.map(diagnostic => {
  assert.equal(path.resolve(diagnostic.file.fileName), probePath)
  const line = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line
  return { code: diagnostic.code, marker: probe.split('\n')[line].split('// ')[1] }
})
assert.deepEqual(observed, [
  { code: 2322, marker: 'INDEX_PROBE' },
  { code: 2322, marker: 'NULL_PROBE' },
  { code: 2322, marker: 'API_PROBE' }
])
const hashes = []
for (const source of core.fileNames) {
  const declaration = path.resolve(core.options.outDir, path.relative(core.options.rootDir, source).replace(/\.ts$/, '.d.ts'))
  hashes.push({
    source: path.relative(root, source).replaceAll('\\', '/'),
    declaration: path.relative(root, declaration).replaceAll('\\', '/'),
    sha256: createHash('sha256').update(await readFile(declaration)).digest('hex')
  })
}
await mkdir('artifacts', { recursive: true })
await writeFile('artifacts/test-typecheck-boundaries.json', JSON.stringify({
  commit: pin.commit, compiler: ts.version, coreProfileChanged: false,
  coreProjectFilesDeclared: hashes.length, testRootFiles: tests.fileNames.length,
  importedCoreImplementationFiles: importedCoreSources,
  importedCoreDeclarations: importedDeclarations.length,
  testDiagnostics: errors.length,
  strictTests: true, noUncheckedIndexedAccess: true, nodeTimersValidInTests: true,
  rejectedProbes: observed,
  virtualProbeWrittenToDisk: false,
  declarations: hashes
}, null, 2) + '\n')
console.log('Type boundaries pass: unchanged DOM core profile; strict test project; indexed/null/API negative probes rejected; real generated declarations consumed.')
