import assert from 'node:assert/strict'

const cssNames=['tremplin','tremplin-grid','tremplin-reboot','tremplin-utilities']
const jsNames=['tremplin','tremplin.bundle']
export const requiredReleaseIntegrityAssets=Object.freeze([
  ...cssNames.flatMap(name=>['css/'+name+'.css','css/'+name+'.min.css']),
  ...jsNames.flatMap(name=>['js/'+name+'.js','js/'+name+'.min.js']),
  'icons/datepicker-chevron.svg'
])
export const requiredReleaseAssets=Object.freeze([
  ...requiredReleaseIntegrityAssets.map(file=>'dist/'+file),
  'js/dist/index.js','js/dist/index.js.map','js/dist/index.d.ts','js/dist/index.d.ts.map',
  'src/js/index.ts','src/scss/tremplin.scss','dist/LICENSE','dist/THIRD_PARTY_NOTICES.txt'
])
const requiredPackageFiles=['metadata/api.json','metadata/public-api.json','LICENSE','THIRD_PARTY_NOTICES.txt']
const retiredAssets=['dist/js/tremplin.cjs','dist/js/tremplin.d.ts','dist/cjs','dist/types','dist/vendor','LICENSE.bootstrap','dist/LICENSE.bootstrap']

/** Read-only inventory validation, not permission to release or bypass a block. */
export function validateCoreReleaseInventory(manifest,integrity,exists){
  assert(Array.isArray(manifest.files),'Core package files must be explicit')
  for(const file of requiredPackageFiles)assert(manifest.files.includes(file),'Required consumer file is not packaged: '+file)
  assert.deepEqual(manifest.files.filter(file=>file.startsWith('metadata/')).sort(),requiredPackageFiles.filter(file=>file.startsWith('metadata/')).sort(),'Consumer metadata exceeds the two public API files')
  for(const file of ['metadata','docs','icons','themes','starters','src/adapters'])assert(!manifest.files.includes(file),'Internal or optional product is packaged: '+file)
  for(const file of requiredReleaseAssets)assert(exists(file),'Required current release asset is missing: '+file)
  for(const file of retiredAssets)assert(!exists(file),'Retired release output remains: '+file)
  assert.equal(integrity.algorithm,'sha384','Release integrity algorithm must remain SHA-384')
  for(const file of requiredReleaseIntegrityAssets){
    const entry=integrity.assets[file]
    assert(/^sha384-[A-Za-z0-9+/]{64}$/.test(entry?.integrity??''),'Missing or invalid SHA-384 entry: '+file)
    assert(Number.isSafeInteger(entry.bytes)&&entry.bytes>0,'Invalid asset byte count: '+file)
  }
  for(const file of Object.keys(integrity.assets))assert(!/^(?:cjs\/|types\/|vendor\/)|^js\/tremplin\.(?:cjs|d\.ts)$/.test(file),'Integrity advertises retired output: '+file)
  return {requiredAssets:requiredReleaseAssets.length,requiredIntegrityAssets:requiredReleaseIntegrityAssets.length}
}
