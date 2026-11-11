import { lstat, mkdir, readFile, readdir, rmdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

const exists = file => lstat(file).catch(error => { if (error.code === 'ENOENT') return null; throw error })
const inside = (base, file) => {
  const relative = path.relative(base, file)
  if (!relative || relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) throw new Error(`Unsafe generated asset path: ${file}`)
}
async function noLinks(root, target) {
  inside(root, target)
  let current = root
  for (const segment of ['', ...path.relative(root, target).split(path.sep)]) {
    if (segment) current = path.join(current, segment)
    const entry = await exists(current)
    if (!entry) break
    if (entry.isSymbolicLink() || !entry.isDirectory()) throw new Error(`Not an ordinary asset directory: ${current}`)
  }
}
export async function assetFiles(directory) {
  const base = await exists(directory)
  if (!base) return []
  if (base.isSymbolicLink() || !base.isDirectory()) throw new Error(`Not an ordinary asset root: ${directory}`)
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isSymbolicLink()) throw new Error(`Linked asset is not allowed: ${file}`)
    if (entry.isDirectory()) files.push(...await assetFiles(file))
    else if (entry.isFile()) files.push(file)
    else throw new Error(`Unsupported asset: ${file}`)
  }
  return files
}

// Core mirrors may be supplemented only by the eight named private demo assets.
// They are never written into root dist or packed as framework downloads.
export async function siteAssetInputs(projectRoot, name) {
  const source = path.resolve(projectRoot, name)
  const inputs = new Map((await assetFiles(source)).map(file => [path.relative(source, file), file]))
  const privateRoot = path.resolve(projectRoot, 'artifacts/documentation-assets/dist')
  if (name === 'dist' && await exists(privateRoot)) {
    const allowed = ['css/tremplin-extensions.css','css/tremplin-extensions.min.css','vendor/floating-ui.js','vendor/vanilla-calendar-pro.js'].flatMap(file => [file, file + '.map'])
    for (const file of await assetFiles(privateRoot)) {
      const relative = path.relative(privateRoot, file)
      if (!allowed.includes(relative.split(path.sep).join('/')) || inputs.has(relative)) throw new Error('Unexpected or colliding private documentation asset: ' + file)
      inputs.set(relative, file)
    }
    for (const file of allowed) if (!inputs.has(file.split('/').join(path.sep))) throw new Error('Missing private documentation asset: ' + file)
  }
  return inputs
}

/** Only named source/public/build mirrors are owned by site preparation. Never use
 * an arbitrary destination, recursive glob, or broad workspace delete. */
export async function syncSiteDirectory(projectRoot, name, destinationPrefix = 'site/public') {
  if (!['dist', 'themes', 'js/dist'].includes(name)) throw new Error('Unknown site asset mirror')
  if (!['site/public', 'site-dist'].includes(destinationPrefix)) throw new Error('Unknown site asset destination')
  if (destinationPrefix === 'site-dist' && name === 'themes') throw new Error('Built themes also owns an HTML route; prepare public assets and rebuild the site instead')
  const root = path.resolve(projectRoot)
  const source = path.resolve(root, name)
  const destination = path.resolve(root, destinationPrefix, name)
  await noLinks(root, source)
  await noLinks(root, destination)
  if (!await exists(source)) throw new Error(`Missing built asset source: ${source}`)
  const inputs = await siteAssetInputs(root, name)
  const expected = new Set(inputs.keys())
  const removed = []
  for (const file of await assetFiles(destination)) {
    inside(destination, file)
    if (!expected.has(path.relative(destination, file))) {
      await unlink(file)
      removed.push(path.relative(root, file).replaceAll('\\', '/'))
    }
  }
  // Remove only empty generated directories, never recurse through deletion.
  async function prune(directory) {
    if (!await exists(directory)) return
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const child = path.join(directory, entry.name)
      inside(destination, child)
      await prune(child)
      if (!(await readdir(child)).length) await rmdir(child)
    }
  }
  await prune(destination)
  let copied = 0
  for (const [relative, file] of inputs) {
    const target = path.join(destination, relative)
    inside(destination, target)
    const contents = await readFile(file)
    const previous = await readFile(target).catch(error => { if (error.code === 'ENOENT') return null; throw error })
    if (!previous?.equals(contents)) {
      await mkdir(path.dirname(target), { recursive: true })
      await writeFile(target, contents)
      copied++
    }
  }
  return { mirror: name, copied, removed, files: inputs.size }
}
