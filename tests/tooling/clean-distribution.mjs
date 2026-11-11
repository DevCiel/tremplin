import assert from 'node:assert/strict'
import { lstat, realpath, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const physicalRoot = await realpath(root)
// Only the two explicit generated output directories may be recursively cleaned.
for (const relative of ['dist', 'js/dist']) {
  const target = path.resolve(root, relative)
  assert(target.startsWith(path.resolve(root) + path.sep), 'Clean target leaves the project')
  try {
    assert(!(await lstat(target)).isSymbolicLink(), 'Refuse a symlink clean target: ' + relative)
    assert((await realpath(target)).startsWith(physicalRoot + path.sep), 'Refuse a junction-resolved clean target outside the project: ' + relative)
  }
  catch (error) { if (error.code !== 'ENOENT') throw error }
  await rm(target, { recursive: true, force: true })
}
