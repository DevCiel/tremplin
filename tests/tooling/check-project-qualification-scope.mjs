// Compare the complete qualification batch with the preceding accepted checkout.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'

const before=JSON.parse(await readFile('artifacts/entry-docs-after.json','utf8'))
const digest=async file=>createHash('sha256').update(await readFile(file)).digest('hex')
async function walk(dir) {
  const files=[]
  for(const entry of await readdir(dir,{withFileTypes:true})) {
    assert(!entry.isSymbolicLink(),'Unexpected symlink in qualification scope: '+dir+'/'+entry.name)
    const file=dir+'/'+entry.name
    if(entry.isDirectory())files.push(...await walk(file))
    else files.push(file)
  }
  return files.sort()
}
const output=await walk('site-dist')
const sets={
  protectedInputs:[...new Set([...Object.keys(before.protectedInputs),...await walk('src'),...await walk('dist')])].sort(),
  snapshots:[...await walk('tests/site-visual/snapshots'),...await walk('tests/visual/snapshots')].sort(),
  html:output.filter(file=>file.endsWith('/index.html')),
  renderAssets:output.filter(file=>!file.startsWith('site-dist/pagefind/')&&/\.(?:css|[cm]?js|svg|woff2?|ttf|otf|png|jpe?g|webp|gif|avif)$/.test(file))
}
const scopes={}
for(const [key,files] of Object.entries(sets)) {
  const actual=Object.fromEntries(await Promise.all(files.map(async file=>[file,await digest(file)])))
  const changed=Object.keys(before[key]).filter(file=>file in actual&&before[key][file]!==actual[file])
  const removed=Object.keys(before[key]).filter(file=>!(file in actual))
  const added=Object.keys(actual).filter(file=>!(file in before[key]))
  scopes[key]={total:files.length,changed,removed,added}
  assert.deepEqual({changed,removed,added},{changed:[],removed:[],added:[]},'Unexpected change in '+key)
}
const workFiles=['licenses/third-party-code.txt','.github/workflows/ci.yml','.github/workflows/docs.yml','.github/workflows/release.yml','CONTRIBUTING.md','tests/tooling/audit-tremplin-core.mjs','tests/tooling/test-package.mjs','tests/tooling/audit-distribution-contract.mjs','tests/tooling/check-project-qualification-scope.mjs','tests/tooling/inspect-theme-contrast.mjs','tests/metadata.test.ts','tests/toolchain.test.ts','tests/distribution-contract.test.ts','tests/package/esm-consumer.mjs','tests/package/types-consumer.mts','tests/package/types-consumer.cts','tests/site/contrast-docs.spec.ts','tests/site/documentation-contracts.spec.ts','tests/site/documentation-repair.spec.ts']
const reviewedInputs=Object.fromEntries(await Promise.all(workFiles.map(async file=>[file,await digest(file)])))
for(const file of ['.gitattributes','playwright.qualification.config.ts','tests/site/site-style-migration.spec.ts']) reviewedInputs[file]=await digest(file)
const report={baseline:'artifacts/entry-docs-after.json',scopes,reviewedInputs,rootDistributionRebuilt:true,rootDistributionBytesChanged:false,coreSourceChanged:false,apiBaselineChanged:false,releaseBlocked:JSON.parse(await readFile('package.json','utf8')).tremplinMigration.releaseBlocked}
await writeFile('artifacts/project-qualification-identities.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(scopes))
