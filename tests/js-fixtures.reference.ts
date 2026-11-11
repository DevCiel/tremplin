import { expect, test } from 'vitest'
import * as fixtureCore from '../src/js/index'
import pin from '../metadata/bootstrap6-reference.json'

// This file is selected only by the reference config, not by the default
// **/*.test.ts suite. It proves the fixture alias resolves actual stage
// constructor identities, rather than accidentally retesting production.
test('fixture imports are the independent pinned stage exports', async () => {
  // Keep the raw candidate out of the broad TS5 test compiler graph. Its TS6
  // source has its own pinned compiler gate; this is a runtime identity test.
  const stagePath = '../artifacts/bootstrap6-strict/' + pin.commit + '/js/src/index.ts'
  const pristineStage = await import(stagePath) as typeof fixtureCore
  expect(Object.keys(fixtureCore)).toEqual(Object.keys(pristineStage))
  for (const key of Object.keys(fixtureCore)) {
    expect(fixtureCore[key as keyof typeof fixtureCore], key).toBe(pristineStage[key as keyof typeof pristineStage])
  }
})
