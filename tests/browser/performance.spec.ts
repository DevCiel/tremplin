import { expect, test } from '@playwright/test'

test('mutates 500 configured delegated targets within the beta budget and toggles them back', async ({ page }, testInfo) => {
  await page.route('**/runtime-performance/', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Current runtime performance</title></head><body><main><h1>Runtime performance fixture</h1></main></body></html>' }))
  await page.goto('/runtime-performance/')
  const result = await page.evaluate(async () => {
    const moduleUrl = '/dist/js/tremplin.bundle.min.js'
    await import(moduleUrl)
    const root = document.createElement('section')
    for (let index = 0; index < 500; index++) {
      // Toggler reads its configuration from each target, not the trigger.
      root.insertAdjacentHTML('beforeend', `<button type="button" data-trm-toggle="toggler" data-trm-target="#target-${index}">Toggle ${index}</button><div class="benchmark-target" id="target-${index}" data-trm-value="active"></div>`)
    }
    document.body.append(root)
    const targets = root.querySelectorAll('.benchmark-target')
    const count = () => root.querySelectorAll('.benchmark-target.active').length
    let toggledEvents = 0
    root.addEventListener('toggled.trm.toggler', () => { toggledEvents++ })
    const initial = count()
    const start = performance.now()
    for (const button of root.querySelectorAll('button')) button.click()
    const duration = performance.now() - start
    const active = count(), eventsAfterActivation = toggledEvents
    for (const button of root.querySelectorAll('button')) button.click()
    return { duration, targets: targets.length, initial, active, reset: count(), eventsAfterActivation, eventsAfterReset: toggledEvents, mutatedTriggers: root.querySelectorAll('button.active').length }
  })

  expect(result).toMatchObject({ targets: 500, initial: 0, active: 500, reset: 0, eventsAfterActivation: 500, eventsAfterReset: 1000, mutatedTriggers: 0 })
  await testInfo.attach('delegated-toggle-metrics', { body: JSON.stringify(result), contentType: 'application/json' })
  expect(result.duration).toBeLessThan(1_000)
})
