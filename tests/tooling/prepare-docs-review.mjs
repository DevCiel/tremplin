// Safety adapter for build/docs-prep.sh. Builds no code and never touches Git.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { copyFile, lstat, mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const hash = bytes => createHash('sha256').update(bytes).digest('hex')
export async function prepareDocsReview(root, prepare = false) {
  root = path.resolve(root)
  assert(!(await lstat(root)).isSymbolicLink(), 'Linked docs root')
  const source = path.join(root, 'site-dist')
  async function inventory(directory, relative = '') {
    assert(!(await lstat(directory)).isSymbolicLink(), 'Linked docs directory: ' + directory)
    const files = []
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      assert(!entry.isSymbolicLink(), 'Linked docs file: ' + entry.name)
      const filename = relative ? relative + '/' + entry.name : entry.name
      assert(entry.isFile() || entry.isDirectory(), 'Unsupported docs input: ' + filename)
      if (entry.isDirectory()) files.push(...await inventory(path.join(directory, entry.name), filename))
      else files.push({ file: filename, sha256: hash(await readFile(path.join(source, filename))) })
    }
    return files.sort((a, b) => a.file.localeCompare(b.file))
  }
  const files = await inventory(source)
  for (const required of ['index.html', 'dist/css/tremplin.min.css', 'dist/js/tremplin.bundle.min.js', 'dist/LICENSE', 'dist/THIRD_PARTY_NOTICES.txt']) assert(files.some(item => item.file === required), 'Incomplete built docs: missing ' + required)
  let destination = null
  if (prepare) {
    let parent = root
    for (const segment of ['artifacts', 'docs-review']) {
      parent = path.join(parent, segment)
      try { await mkdir(parent) } catch (error) { if (error.code !== 'EEXIST') throw error }
      const stat = await lstat(parent)
      assert(stat.isDirectory() && !stat.isSymbolicLink(), 'Unsafe docs-review directory')
    }
    destination = await mkdtemp(path.join(parent, 'tremplin-'))
    const payload = path.join(destination, 'payload')
    await mkdir(payload)
    for (const item of files) {
      const input = path.join(source, item.file)
      assert.equal(hash(await readFile(input)), item.sha256, 'Docs changed while staging: ' + item.file)
      const output = path.join(payload, item.file)
      await mkdir(path.dirname(output), { recursive: true })
      await copyFile(input, output, 1) // COPYFILE_EXCL: never overwrite a review file.
      assert.equal(hash(await readFile(output)), item.sha256, 'Staged docs differ: ' + item.file)
    }
    await writeFile(path.join(destination, 'manifest.json'), JSON.stringify({ schemaVersion: 1, localOnly: true, deploymentApproved: false, files }, null, 2) + '\n', { flag: 'wx' })
  }
  return { mode: prepare ? 'prepare-local-review' : 'dry-run', files: files.length, destination, deploymentApproved: false }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  assert(args.length <= 1 && args.every(arg => ['--dry-run', '--prepare'].includes(arg)), 'Usage: docs-prep.sh [--dry-run|--prepare]; deployment is unsupported')
  console.log(JSON.stringify(await prepareDocsReview(fileURLToPath(new URL('../../', import.meta.url)), args.includes('--prepare')), null, 2))
}
