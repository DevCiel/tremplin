import path from 'node:path'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { defineConfig, mergeConfig } from 'vitest/config'

const project = process.cwd()
const { commit } = JSON.parse(readFileSync('metadata/bootstrap6-reference.json', 'utf8'))
const stage = path.resolve('artifacts/bootstrap6-strict', commit)
const upstream = (await import(pathToFileURL(path.join(stage, 'js/tests/vitest.config.mts')).href)).default

export default defineConfig(mergeConfig(upstream, {
  // Keep the pinned test files, assertions, setup and browser configuration.
  // Only source resolution changes: tests exercise actual production modules.
  plugins: [{
    name: 'tremplin-production-core-under-upstream-tests', enforce: 'pre',
    resolveId(source: string, importer?: string) {
      if (!importer || !source.startsWith('.') || !/\.(?:js|ts)$/.test(source)) return null
      const resolved = path.resolve(path.dirname(importer), source)
      const prefix = path.join(stage, 'js/src') + path.sep
      if (!resolved.startsWith(prefix)) return null
      return path.join(project, 'src/js', path.relative(prefix, resolved)).replace(/\.js$/, '.ts')
    }
  }],
  server: { fs: { allow: [project] } }
}))
