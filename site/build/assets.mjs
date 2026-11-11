import assert from 'node:assert/strict'
import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileAsync } from 'sass'

const siteRoot = fileURLToPath(new URL('../', import.meta.url))

async function directory(relative) {
  let current = siteRoot
  for (const segment of relative.split('/')) {
    current = path.join(current, segment)
    const stat = await lstat(current).catch(error => { if (error.code !== 'ENOENT') throw error; return null })
    assert(!stat || stat.isDirectory() && !stat.isSymbolicLink(), `Unsafe site asset directory: ${current}`)
    if (!stat) await mkdir(current)
  }
  return current
}

async function put(relative, bytes) {
  const target = path.join(siteRoot, 'public', relative)
  await directory(['public', path.posix.dirname(relative)].filter(part => part !== '.').join('/'))
  const stat = await lstat(target).catch(error => { if (error.code !== 'ENOENT') throw error; return null })
  assert(!stat || stat.isFile() && !stat.isSymbolicLink(), `Unsafe site asset file: ${target}`)
  const previous = stat && await readFile(target)
  if (!previous || !previous.equals(bytes)) await writeFile(target, bytes)
}

async function staticFiles(relative = '') {
  const root = path.join(siteRoot, 'static', relative)
  const stat = await lstat(root)
  assert(stat.isDirectory() && !stat.isSymbolicLink(), `Unsafe authored asset directory: ${root}`)
  for (const entry of await readdir(root, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), `Linked authored asset: ${entry.name}`)
    const name = path.posix.join(relative, entry.name)
    if (entry.isDirectory()) await staticFiles(name)
    else if (entry.isFile()) {
      assert(/\.(?:svg|woff2?|png|jpe?g|gif|webp|avif|ico)$/i.test(name), `Not an authored image/font asset: ${name}`)
      assert(!/^(?:dist|css|js|icons|themes|pagefind)(?:\/|$)/i.test(name), `Authored asset collides with generated output: ${name}`)
      await put(name, await readFile(path.join(root, entry.name)))
    }
  }
}

/** Website assets only. Never writes framework dist, notices, or font licenses. */
export async function prepareDocumentationAssets() {
  await staticFiles()
  const result = await compileAsync(path.join(siteRoot, 'src/scss/docs.scss'), {
    style: 'expanded', sourceMap: false, charset: false
  })
  await put('docs.css', Buffer.from(result.css))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await prepareDocumentationAssets()
  console.log('Prepared documentation Sass and authored static assets; framework dist and notices are untouched.')
}
