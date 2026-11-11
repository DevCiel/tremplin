import { execFileSync } from 'node:child_process'
import { expect, it } from 'vitest'

it('passes maintenance-tool safety and pinned-reference regressions in native Node', () => {
  const result=execFileSync(process.execPath,['--test','--test-reporter=tap','tests/tooling/maintenance-tools.test.mjs'],{encoding:'utf8',timeout:25_000})
  expect(result).toContain('# fail 0')
},30_000)
