import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read=(file:string)=>JSON.parse(readFileSync(file,'utf8'))
describe('browser distribution parity reporting',()=>{
  it('checks the Git-verified pinned build against actual emitted syntax without concealing differences',()=>{
    execFileSync(process.execPath,['tests/tooling/audit-distribution-contract.mjs'],{encoding:'utf8',timeout:30_000})
    const audit=read('artifacts/distribution-contract-audit.json')
    expect(audit.commit).toBe(read('metadata/bootstrap6-reference.json').commit)
    expect(audit.reference.gitBlobVerified).toBe(true)
    expect(audit.reference.browserFormat).toBe('esm')
    const builds=read('artifacts/core-build-graph.json').graphs
    for(const download of audit.current.browserDownloads) {
      const name=download.file.split('/').at(-1).slice(0,-3)
      expect(download.format).toBe(builds.find((build:{name?:string})=>build.name===name).format)
      expect(download.hasModuleSyntax).toBe(download.format==='esm')
    }
    expect(audit.browserDistributionParity).toBe(true)
    expect(audit.differences).toEqual([])
    expect(audit.current.upstreamNoticeMatches).toBe(true)
    expect(audit.releaseBlocked).toBe(true)
    expect(audit.coreSourceChanged).toBe(false)
    expect(audit.apiBaselineChanged).toBe(false)
  })
})
