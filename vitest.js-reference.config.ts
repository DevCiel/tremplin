import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

const pin = JSON.parse(readFileSync('metadata/bootstrap6-reference.json', 'utf8'))
const product = JSON.parse(readFileSync('package.json', 'utf8'))
const stage = path.resolve('artifacts/bootstrap6-strict', pin.commit)
const manifest = JSON.parse(readFileSync(path.join(stage, 'stage-manifest.json'), 'utf8')) as {
  commit: string; productVersion: string; modules: { path: string; sha256: string }[]
}
if (manifest.commit !== pin.commit || manifest.productVersion !== product.version) throw new Error('Stale pinned JS stage')
const modules = manifest.modules.filter(entry => entry.path.startsWith('js/src/'))
if (modules.length !== pin.expectedCoreModules.javascript) throw new Error('Incomplete pinned JS stage')
for (const entry of modules) {
  if (!/^js\/src\/(?:[\w-]+\/)*[\w-]+\.ts$/.test(entry.path)) throw new Error('Unsafe JS stage path')
  const digest = createHash('sha256').update(readFileSync(path.join(stage, entry.path))).digest('hex')
  if (digest !== entry.sha256) throw new Error('Modified pinned JS reference: ' + entry.path)
}

// Run identical fixture files in a separate process/environment. Importing the
// reference and production index together would double-register data APIs and
// make delegated click tests invalid. Optional CommandPalette stays local and
// remains explicitly outside upstream parity claims.
export default defineConfig({
  resolve: { alias: [{ find: '../src/js/index', replacement: path.join(stage, 'js/src/index.ts') }] },
  test: {
    environment: 'jsdom',
    include: ['tests/components.test.ts', 'tests/discovery.test.ts', 'tests/interactions.test.ts', 'tests/js-fixtures.reference.ts'],
    setupFiles: ['./tests/setup.ts'],
    restoreMocks: true,
    maxWorkers: 2
  }
})
