#!/usr/bin/env node

/*!
 * Script to build our plugins to use them separately.
 * Copyright 2020-2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import assert from 'node:assert/strict'
import { access, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { globby } from 'globby'
import { rolldown } from 'rolldown'
import ts from 'typescript-bootstrap'
import banner from './banner.mjs'
import browserTargets from './browser-targets.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const sourcePath = path.join(root, 'src/js').replaceAll('\\', '/')
const distPath = path.join(root, 'js/dist').replaceAll('\\', '/')

export async function buildPlugins() {
  // Optional products are not part of the canonical core module graph.
  const sources = (await globby(`${sourcePath}/**/*.ts`, { ignore: [`${sourcePath}/extensions/**`] })).sort()
  const policy = JSON.parse(await readFile(path.join(root, 'metadata/core-delivery-reference.json'), 'utf8'))
  const emitted = policy.reference.files.filter(file => file.path.startsWith('js/dist/') && file.path.endsWith('.js')).map(file => file.path)
  for (const entry of policy.sourceDerivedModuleOutputs ?? []) emitted.push(...entry.outputs.filter(file => file.endsWith('.js')))
  const expected = emitted.map(file => file.replace(/^js\/dist\//, sourcePath + '/').replace(/\.js$/, '.ts')).sort()
  assert.deepEqual(sources, expected, 'Core module inventory differs from the reviewed source-derived delivery inventory')
  await Promise.all(sources.map(async source => {
    const destination = source.replace(sourcePath, distPath).replace(/\.ts$/, '.js')
    const bundle = await rolldown({
      input: source,
      // Keep every import external so each file mirrors its maintained module.
      external: () => true,
      resolve: { extensionAlias: { '.js': ['.ts', '.js'] } },
      transform: { target: browserTargets }
    })
    try {
      const generated = await bundle.write({ banner: banner(path.basename(destination)), format: 'esm', sourcemap: true, file: destination })
      const chunk = generated.output.find(entry => entry.type === 'chunk')
      assert(chunk, 'Missing compiled module: ' + source)
      if (!chunk.map) {
        // Rolldown omits a map for the re-export-only entry. The reference
        // distribution explicitly includes its empty-source map. Emit that
        // truthful shape, never fabricate executable source positions.
        const entry = ts.createSourceFile(source, await readFile(source, 'utf8'), ts.ScriptTarget.Latest, true)
        assert(source === sourcePath + '/index.ts' && entry.statements.every(ts.isExportDeclaration), 'Unexpected sourcemap-less executable module')
        const map = { version: 3, file: path.basename(destination), sources: [], sourcesContent: [], names: [], mappings: ';'.repeat(chunk.code.split('\n').length - 1) }
        await writeFile(destination + '.map', JSON.stringify(map))
        await writeFile(destination, chunk.code + `\n//# sourceMappingURL=${path.basename(destination)}.map\n`)
      }
    } finally {
      await bundle.close()
    }
  }))
  const transition = JSON.parse(await readFile(path.join(root, 'metadata/core-entrypoint-transition.json'), 'utf8'))
  for (const file of transition.retiredGeneratedEntries) {
    assert(/^dist\/js\/(?:components\/[\w.-]+|tremplin\.(?:cjs|d\.ts))$/.test(file), 'Unexpected retired entry path')
    let present = false
    try { await access(path.join(root, file)); present = true } catch (error) { if (error.code !== 'ENOENT') throw error }
    assert(!present, 'Retired entry was recreated: ' + file)
  }
  console.log(`Built ${sources.length} canonical ES modules under js/dist; optional modules excluded.`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildPlugins()
