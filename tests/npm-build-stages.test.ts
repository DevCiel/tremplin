import {execFileSync} from 'node:child_process'
import {expect,it} from 'vitest'
it('passes npm-stage, offline archive and example-thumbnail safety regressions',()=>{
  const result=execFileSync(process.execPath,['--test','--test-reporter=tap','tests/tooling/npm-build-stages.test.mjs'],{encoding:'utf8',timeout:90_000})
  expect(result).toContain('# fail 0')
},95_000)
