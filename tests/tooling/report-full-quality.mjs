import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

async function log(file){const bytes=await readFile('artifacts/'+file);return(bytes[0]===255?bytes.subarray(2).toString('utf16le'):bytes.toString()).replace(/\x1b\[[0-9;]*m/g,'')}
const json=async file=>JSON.parse(await readFile(file,'utf8'))
const root=await log('full-quality-initial.log')
for(const count of [2,139,416,1018])assert(new RegExp('(?:^|\\n)\\s*'+count+' passed\\b').test(root),'Root pipeline lacks successful suite: '+count)
for(const count of [50,990])assert(new RegExp('Tests\\s+'+count+' passed').test(root),'Root pipeline lacks successful unit/fixture count: '+count)
assert(/(?:^|\n)\s*4 skipped\b/.test(root),'Expected the four documented native forced-colors exclusions')
assert(!/(?:^|\n)\s*\d+ failed\b/.test(root),'Root pipeline contains a failed suite')
assert(/pass 22\b/.test(root)&&/fail 0\b/.test(root),'Server suite is incomplete')
assert(root.includes('Installed and verified tremplin@'),'Installed-package probe is incomplete')
assert(root.includes('All four production CSS distributions match'),'CSS parity gate is incomplete')
const optional=await log('full-quality-esm-docs.log'),integrations=await log('full-quality-integrations.log')
assert(/(?:^|\n)\s*321 passed\b/.test(optional)&&!/(?:^|\n)\s*\d+ failed\b/.test(optional),'Optional three-engine documentation suite is incomplete')
assert(/(?:^|\n)\s*33 passed\b/.test(integrations)&&!/(?:^|\n)\s*\d+ failed\b/.test(integrations),'Optional integrations suite is incomplete')
const identities=await json('artifacts/full-quality-identities.json')
for(const value of Object.values(identities))assert.deepEqual({changed:value.changed,removed:value.removed,added:value.added},{changed:[],removed:[],added:[]})
const product=await json('package.json'),pin=await json('metadata/bootstrap6-reference.json')
assert.equal(product.tremplinMigration.releaseBlocked,true)
const source=await json('artifacts/bootstrap-core-audit.json'),types=await json('artifacts/test-typecheck-boundaries.json'),consumer=await json('artifacts/package-qualification-report.json'),distribution=await json('artifacts/distribution-contract-audit.json')
assert.equal(distribution.browserDistributionParity,true)
const evidenceFiles=['artifacts/full-quality-initial.log','artifacts/full-quality-esm-docs.log','artifacts/full-quality-integrations.log','artifacts/full-quality-before.json','artifacts/full-quality-identities.json','tests/tooling/check-full-quality-scope.mjs','tests/tooling/report-full-quality.mjs','docs/BOOTSTRAP6-MIGRATION-PLAN.md','docs/SASS-FOUNDATION-MIGRATION.md']
const evidenceHashes=Object.fromEntries(await Promise.all(evidenceFiles.map(async file=>[file,createHash('sha256').update(await readFile(file)).digest('hex')])))
const report={
  date:'2026-11-09',commit:pin.commit,upstreamVersion:pin.upstreamVersion,version:product.version,
  outcome:'Fresh complete local root quality pipeline and serial optional suites passed; no product/API/style/baseline changes.',
  root:{command:'npm.cmd run check',log:'artifacts/full-quality-initial.log',freshSingleCompleteRun:true,exitCode:0,units:{passed:990,files:80},referenceFixtures:50,server:22,nativeBrowsers:{planned:420,passed:416,existingForcedColorsExclusions:4,isolatedRerunsRequired:false},coreVisuals:2,defaultSite:{passed:1018,freshSingleCompleteRun:true},documentationVisuals:{passed:139,updates:false,tolerance:0.03},build:true,cssParityOutputs:4,installedPackage:true},
  optional:{documentation:{passed:321,engines:['chromium','firefox','webkit'],workers:1,freshSingleCompleteRun:true,log:'artifacts/full-quality-esm-docs.log'},integrations:{passed:33,freshSingleCompleteRun:true,log:'artifacts/full-quality-integrations.log'},heavySuitesOverlapped:false},
  invariants:{identities,core:{total:136,counts:source.counts,newApprovedExceptions:0},types:{roots:types.testRootFiles,producerFiles:types.coreProjectFilesDeclared,consumedDeclarations:types.importedCoreDeclarations,diagnostics:types.testDiagnostics,rejectedProbes:types.rejectedProbes},consumer:{archiveFiles:consumer.archiveFiles,plugins:consumer.corePlugins,allEsmCjsClassIdentities:true,actualPackedDeclarationsChecked:true},browserDistributionParity:distribution.browserDistributionParity,releaseBlockPreserved:true},
  limits:{actualRemoteCiRun:false,additionalConsumerToolchainMatrix:false,manualScreenReaderAndRealDeviceQualification:false,releaseApproval:false},
  sourceAndBaselineChanges:false,server:'Existing development server retained on http://127.0.0.1:4321/',evidenceHashes,published:false,deployed:false,releaseBlocked:true
}
await writeFile('artifacts/full-quality-report.json',JSON.stringify(report,null,2)+'\n')
await writeFile('artifacts/full-quality-follow-up.json',JSON.stringify({commit:pin.commit,localAutomatedQuality:'complete; fresh root and optional suites passed',next:['Validate the existing workflow definitions through an authorized remote CI run.','Complete the wider consumer-toolchain matrix and manual screen-reader/real-device release review.','Review prerelease packaging/version/release readiness without removing the publishing block automatically.'],requiresFurtherAuthority:['Remote workflow triggering or repository writes','Any release/publication/deployment','Any new core/API/security exception'],releaseBlocked:true,published:false,deployed:false},null,2)+'\n')
console.log('Recorded fresh full quality success: root pipeline, 1,018-site suite, 321 cross-engine docs, 33 integrations; all accepted source/distribution/render/snapshot identities unchanged. Publishing remains blocked.')
