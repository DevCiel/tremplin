import { readFile } from 'node:fs/promises'
import path from 'node:path'

export function runtimeGuardPlugin(sourceRoot, runtimeModule, { skipCommonJS = false } = {}) {
  const directory = path.resolve(sourceRoot) + path.sep
  const runtime = path.resolve(runtimeModule)
  return {
    name: 'tremplin-distribution-runtime-guard',
    setup(build) {
      if (skipCommonJS && build.initialOptions.format === 'cjs') return
      build.onLoad({ filter: /\.ts$/ }, async ({ path: file }) => {
        if (!file.startsWith(directory)) return undefined
        let specifier = path.relative(path.dirname(file), runtime).replaceAll('\\', '/').replace(/\.ts$/, '')
        if (!specifier.startsWith('.')) specifier = './' + specifier
        // A bare side-effect import can be hoisted behind component chunks by
        // ESM splitting. A live call before each module body prevents any data
        // API registration before the document claim, even after chunking.
        return { contents: `import { assertRuntime as __tremplinAssertRuntime } from ${JSON.stringify(specifier)};\n__tremplinAssertRuntime();\n` + await readFile(file, 'utf8'), loader: 'ts', resolveDir: path.dirname(file) }
      })
    }
  }
}
