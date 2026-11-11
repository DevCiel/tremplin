import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile, access } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { syncSiteDirectory } from '../../build/lib/site-assets.mjs'

const privateAssets=['css/tremplin-extensions.css','css/tremplin-extensions.min.css','vendor/floating-ui.js','vendor/vanilla-calendar-pro.js'].flatMap(file=>[file,file+'.map'])

test('merges only declared documentation support while pruning obsolete core copies',()=>fixture(async(root,put)=>{
  await put('dist/js/tremplin.js','core')
  for(const file of privateAssets)await put('artifacts/documentation-assets/dist/'+file,'private '+file)
  await put('site/public/dist/cjs/stale.js','retired')
  const result=await syncSiteDirectory(root,'dist')
  assert.equal(result.files,9)
  assert.equal(result.removed.length,1)
  assert.equal(await readFile(path.join(root,'site/public/dist/vendor/floating-ui.js'),'utf8'),'private vendor/floating-ui.js')
  await assert.rejects(access(path.join(root,'dist/vendor')))
  assert.equal((await syncSiteDirectory(root,'dist')).copied,0)
}))

test('rejects unexpected private files before changing any mirrored file',()=>fixture(async(root,put)=>{
  await put('dist/js/tremplin.js','core')
  for(const file of privateAssets)await put('artifacts/documentation-assets/dist/'+file,'private')
  await put('artifacts/documentation-assets/dist/js/tremplin.js','overwriting core')
  await put('site/public/dist/js/tremplin.js','keep')
  await assert.rejects(syncSiteDirectory(root,'dist'),/Unexpected or colliding/)
  assert.equal(await readFile(path.join(root,'site/public/dist/js/tremplin.js'),'utf8'),'keep')
}))

test('rejects incomplete private support instead of publishing a broken demo mirror',()=>fixture(async(root,put)=>{
  await put('dist/js/tremplin.js','core')
  await put('artifacts/documentation-assets/dist/vendor/floating-ui.js','incomplete')
  await assert.rejects(syncSiteDirectory(root,'dist'),/Missing private/)
}))

async function fixture(run) {
  const temporary = await mkdtemp(path.join(tmpdir(), 'tremplin-asset-mirror-'))
  const root = path.join(temporary, 'project')
  const put = async (relative, contents) => {
    const file = path.join(root, relative)
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, contents)
  }
  try { await mkdir(root); await run(root, put, temporary) }
  finally { await rm(temporary, { recursive: true, force: true }) }
}
test('removes orphan chunks/maps, updates current assets and is idempotent', () => fixture(async (root, put) => {
  await put('dist/js/current.js', 'current')
  await put('dist/css/current.css', '.current {}')
  await put('site/public/dist/js/current.js', 'old')
  await put('site/public/dist/old/chunk.js', 'hybrid')
  await put('site/public/dist/old/chunk.js.map', '{}')
  await put('site/src/keep.ts', 'user source')
  const result = await syncSiteDirectory(root, 'dist')
  assert.equal(result.removed.length, 2)
  assert.equal(result.copied, 2)
  await assert.rejects(access(path.join(root, 'site/public/dist/old')))
  assert.equal(await readFile(path.join(root, 'site/public/dist/js/current.js'), 'utf8'), 'current')
  assert.equal(await readFile(path.join(root, 'site/src/keep.ts'), 'utf8'), 'user source')
  const again = await syncSiteDirectory(root, 'dist')
  assert.equal(again.removed.length, 0)
  assert.equal(again.copied, 0)
}))
test('rejects broad/unknown destinations and protects the built theme HTML route', () => fixture(async (root, put) => {
  await put('themes/current.css', '.theme {}')
  await put('site-dist/themes/index.html', '<h1>Theme route</h1>')
  await assert.rejects(syncSiteDirectory(root, '../src'), /Unknown/)
  await assert.rejects(syncSiteDirectory(root, 'dist', '.'), /Unknown/)
  await assert.rejects(syncSiteDirectory(root, 'themes', 'site-dist'), /HTML route/)
  assert.equal(await readFile(path.join(root, 'site-dist/themes/index.html'), 'utf8'), '<h1>Theme route</h1>')
}))
test('can clean only the owned built distribution subtree', () => fixture(async (root, put) => {
  await put('dist/js/current.js', 'current')
  await put('site-dist/dist/js/orphan.js', 'old')
  await put('site-dist/themes/index.html', 'keep')
  assert.equal((await syncSiteDirectory(root, 'dist', 'site-dist')).removed.length, 1)
  assert.equal(await readFile(path.join(root, 'site-dist/themes/index.html'), 'utf8'), 'keep')
}))
test('rejects linked destination parents without touching their content', () => fixture(async (root, put, temporary) => {
  await put('dist/js/current.js', 'current')
  const outside = path.join(temporary, 'outside')
  await mkdir(outside)
  await writeFile(path.join(outside, 'keep'), 'untouched')
  await mkdir(path.join(root, 'site'))
  await symlink(outside, path.join(root, 'site/public'), process.platform === 'win32' ? 'junction' : 'dir')
  await assert.rejects(syncSiteDirectory(root, 'dist'), /ordinary asset directory/)
  assert.equal(await readFile(path.join(outside, 'keep'), 'utf8'), 'untouched')
}))
test('rejects linked source entries before any destination pruning', () => fixture(async (root, put, temporary) => {
  await put('dist/js/current.js', 'current')
  await put('site/public/dist/keep.js', 'not pruned after invalid input')
  const outside = path.join(temporary, 'outside')
  await mkdir(outside)
  await symlink(outside, path.join(root, 'dist/linked'), process.platform === 'win32' ? 'junction' : 'dir')
  await assert.rejects(syncSiteDirectory(root, 'dist'), /Linked asset/)
  assert.equal(await readFile(path.join(root, 'site/public/dist/keep.js'), 'utf8'), 'not pruned after invalid input')
}))

test('mirrors canonical modules without pruning the documentation-owned JS graph', () => fixture(async (root, put) => {
  await put('js/dist/button.js', 'canonical module')
  await put('js/dist/button.d.ts', 'canonical declaration')
  await put('site/public/js/dist/stale.js', 'retired module')
  await put('site/public/js/tremplin-docs.min.js', 'documentation owner')
  const result = await syncSiteDirectory(root, 'js/dist')
  assert.equal(result.files, 2)
  assert.deepEqual(result.removed, ['site/public/js/dist/stale.js'])
  assert.equal(await readFile(path.join(root, 'site/public/js/dist/button.js'), 'utf8'), 'canonical module')
  assert.equal(await readFile(path.join(root, 'site/public/js/tremplin-docs.min.js'), 'utf8'), 'documentation owner')
}))
