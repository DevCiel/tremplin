import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'rolldown'
import banner from './banner.mjs'
import browserTargets from './browser-targets.mjs'
import { mkdir, lstat, readFile, writeFile } from 'node:fs/promises'
import ts from 'typescript-bootstrap'

const root = fileURLToPath(new URL('../', import.meta.url))

// Normal output follows the pinned build. The local preview may write only
// inside its explicit artifact directory, never over source or arbitrary paths.
export function buildOutputRoot() {
  const candidate = path.resolve(root, process.env.TREMPLIN_BUILD_OUTPUT ?? 'dist')
  const preview = path.join(root, 'artifacts/core-delivery-preview')
  assert(candidate === path.join(root, 'dist') || candidate === preview || candidate.startsWith(preview + path.sep), 'Unsupported build output directory')
  return candidate
}

async function guardedBuildPaths() {
  for (const relative of [path.relative(root, buildOutputRoot()), 'artifacts']) {
    let current = root
    for (const part of relative.split(path.sep)) {
      current = path.join(current, part)
      const stat = await lstat(current).catch(error => { if(error.code === 'ENOENT')return null;throw error })
      assert(!stat || stat.isDirectory() && !stat.isSymbolicLink(), 'Unsafe build path: ' + current)
    }
  }
}

const BUNDLE = process.env.BUNDLE === 'true'
let destinationFile = 'tremplin'
const external = ['@floating-ui/dom', 'vanilla-calendar-pro']
const define = {}
if (BUNDLE) {
  destinationFile += '.bundle'
  external.length = 0
  define['process.env.NODE_ENV'] = '"production"'
}

export default defineConfig({
  plugins: [{
    name: 'tremplin-core-contract',
    buildStart: guardedBuildPaths,
    async generateBundle(output, result) {
      const product = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
      assert.equal(product.tremplinMigration?.releaseBlocked, true, 'Build cannot grant release approval')
      const api = JSON.parse(await readFile(path.join(root, 'metadata/public-api.json'), 'utf8'))
      const expected = api.javascriptModules.find(module => module.specifier === '.').runtimeExports.slice().sort()
      const chunks = Object.values(result).filter(item => item.type === 'chunk')
      assert.equal(chunks.length, 1, 'Core download must be one file')
      const chunk = chunks[0]
      assert.deepEqual(chunk.exports.slice().sort(), expected, 'Core exports changed')
      const inputs = Object.keys(chunk.modules).map(file => file.replaceAll('\\', '/'))
      assert(!inputs.some(file => /src\/(?:adapters|runtime|js\/extensions)\//.test(file)), 'Optional inputs entered core')
      const imports = ts.createSourceFile('core.js', chunk.code, ts.ScriptTarget.Latest, true).statements.filter(ts.isImportDeclaration).map(item => item.moduleSpecifier.text).sort()
      assert.deepEqual(imports, BUNDLE ? [] : ['@floating-ui/dom','vanilla-calendar-pro'])
      const preview = buildOutputRoot() !== path.join(root, 'dist')
      const record = { file: 'js/' + destinationFile + '.js', inputs, imports, exports: chunk.exports }
      await mkdir(path.join(root,'artifacts'),{recursive:true})
      await writeFile(path.join(root,`artifacts/${preview ? 'preview' : 'core'}-stage-${BUNDLE ? 'bundle' : 'standalone'}.json`), JSON.stringify(record,null,2)+'\n')
    }
  }],
  input: path.join(root, 'src/js/index.ts'),
  external,
  resolve: { extensionAlias: { '.js': ['.ts', '.js'] } },
  transform: { target: browserTargets, define },
  output: { banner: banner(), file: path.join(buildOutputRoot(), 'js', destinationFile + '.js'), format: 'esm', sourcemap: true }
})
