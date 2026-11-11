import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { measureBundleSizes } from '../../build/bundlewatch-table.mjs'
export { budgets } from '../../build/bundlewatch-table.mjs'

export async function checkSize() {
  let failed = false
  for (const { file, maximum, bytes } of measureBundleSizes()) {
    const status = bytes <= maximum ? 'ok' : 'over budget'
    process.stdout.write(`${file}: ${bytes} / ${maximum} gzip bytes (${status})\n`)
    if (bytes > maximum) failed = true
  }
  if (failed) throw new Error('Tremplin bundle-size budget exceeded')
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await checkSize()
