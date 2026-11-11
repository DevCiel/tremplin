// Native-browser qualification for the replacement compiler, not a substitute
// for the full interaction/accessibility suite or release approval.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, firefox, webkit, expect } from '@playwright/test'

const root = fileURLToPath(new URL('../../', import.meta.url))
const modes = {
  modules: '/modules/index.js',
  standard: '/preview/js/tremplin.js',
  standardMin: '/preview/js/tremplin.min.js',
  bundle: '/preview/js/tremplin.bundle.js',
  bundleMin: '/preview/js/tremplin.bundle.min.js'
}
const api = JSON.parse(await readFile(path.join(root, 'metadata/api.json'), 'utf8'))
const core = api.components.filter(component => component.name !== 'command-palette')
const imports = { '@floating-ui/dom': '/vendor/floating-ui.js', 'vanilla-calendar-pro': '/vendor/vanilla-calendar-pro.js' }
const html = `<!doctype html><html lang="en" data-trm-theme="light"><head><meta charset="utf-8"><title>Core compiler qualification</title>
<link rel="stylesheet" href="/preview/css/tremplin.min.css">
<script type="importmap" nonce="delivery-preview">${JSON.stringify({ imports })}</script></head><body><main>
<h1>Core compiler qualification</h1><button id="toggle" class="btn-solid theme-primary" type="button" aria-pressed="false">Toggle</button>
<button id="launch" type="button" data-trm-toggle="dialog" data-trm-target="#native-dialog">Open dialog</button>
<button id="tip" type="button">Tooltip anchor</button>
<label for="date">Calendar date</label><input id="date" class="form-control" type="text">
<dialog id="native-dialog" class="dialog"><div class="dialog-content"><h2>Compiled dialog</h2><button type="button" data-trm-dismiss="dialog">Close dialog</button></div></dialog>
</main><script type="module" src="/harness.mjs"></script></body></html>`
const harness = `const modes=${JSON.stringify(modes)};const core=${JSON.stringify(core.map(({ name, className }) => ({ name, className })))};
const mode=new URL(location.href).searchParams.get('mode');
const framework=await import(modes[mode]);
if(mode==='modules')for(const item of core){const focused=await import('/modules/'+item.name+'.js');if(focused.default!==framework[item.className])throw Error('Duplicated module identity: '+item.name)}
window.__deliveryFramework=framework;window.__deliveryReady=true;`
const csp = "default-src 'self'; script-src 'self' 'nonce-delivery-preview'; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; require-trusted-types-for 'script'; trusted-types tremplin"

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1')
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Content-Security-Policy', csp)
    if (url.pathname === '/') { response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(html); return }
    if (url.pathname === '/harness.mjs') { response.writeHead(200, { 'Content-Type': 'text/javascript' }).end(harness); return }
    const mapping = [
      ['/preview/', path.join(root, 'artifacts/core-delivery-preview')],
      ['/modules/', path.join(root, 'js/dist')],
      ['/vendor/', path.join(root, 'artifacts/documentation-assets/dist/vendor')]
    ].find(([prefix]) => url.pathname.startsWith(prefix))
    if (!mapping) { response.writeHead(404).end(); return }
    const [prefix, directory] = mapping
    const target = path.resolve(directory, decodeURIComponent(url.pathname.slice(prefix.length)))
    if (!target.startsWith(directory + path.sep) || !/\.(?:js|css|svg|map)$/.test(target)) { response.writeHead(403).end(); return }
    const type = { '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.map': 'application/json' }[path.extname(target)]
    const bytes = await readFile(target)
    response.writeHead(200, { 'Content-Type': type }).end(bytes)
  } catch { response.writeHead(404).end() }
})
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
const port = server.address().port
const cases = []
try {
  for (const [engine, launcher] of Object.entries({ chromium, firefox, webkit })) {
    const browser = await launcher.launch()
    try {
      for (const mode of Object.keys(modes)) {
        const context = await browser.newContext({ reducedMotion: 'reduce' })
        try {
          const page = await context.newPage()
          const errors = []
          page.on('pageerror', error => errors.push(error.message))
          await page.addInitScript(() => {
            window.__deliveryViolations = []
            document.addEventListener('securitypolicyviolation', event => window.__deliveryViolations.push(event.violatedDirective))
          })
          await page.goto(`http://127.0.0.1:${port}/?mode=${mode}`)
          await page.waitForFunction(() => window.__deliveryReady === true)
          if (engine === 'chromium') {
            assert.equal(await page.evaluate(() => Boolean(window.trustedTypes)), true, 'Trusted Types are not available in the qualifying engine')
            const rejected = await page.evaluate(() => {
              try { document.body.innerHTML = '<p id="untrusted-sink">Untrusted</p>'; return false }
              catch (error) { return error instanceof TypeError }
            })
            assert.equal(rejected, true, 'Plain-string HTML sink was not blocked')
            await expect(page.locator('#untrusted-sink')).toHaveCount(0)
            await page.waitForFunction(() => window.__deliveryViolations.includes('require-trusted-types-for'))
            assert((await page.evaluate(() => window.__deliveryViolations)).every(directive => directive === 'require-trusted-types-for'), 'Unexpected violation during the deliberate sink probe')
            await page.evaluate(() => { window.__deliveryViolations = [] })
          }
          assert.deepEqual(await page.evaluate(() => Object.keys(window.__deliveryFramework).sort()), core.map(component => component.className).sort(), 'Native browser exports differ')
          await page.evaluate(() => window.__deliveryFramework.Button.getOrCreateInstance('#toggle').toggle())
          await expect(page.locator('#toggle')).toHaveAttribute('aria-pressed', 'true')
          await page.getByRole('button', { name: 'Open dialog', exact: true }).click()
          await expect(page.locator('#native-dialog:modal')).toBeVisible()
          await page.getByRole('button', { name: 'Close dialog', exact: true }).click()
          await expect(page.locator('#native-dialog')).not.toHaveAttribute('open', '')
          const iconResponse = page.waitForResponse(response => response.url().endsWith('/preview/icons/datepicker-chevron.svg'))
          await page.evaluate(() => {
            new window.__deliveryFramework.Datepicker('#date', {
              locale: 'en', selectedDates: ['2026-10-25'], vcpOptions: { animation: false }
            })
          })
          await page.locator('#date').click()
          const calendar = page.locator('[data-vc="calendar"]')
          await expect(calendar).toBeVisible()
          const icon = await iconResponse
          assert.equal(icon.status(), 200, 'Calendar mask did not load from the same origin')
          assert((await icon.text()).includes('viewBox="0 0 24 24"'), 'Calendar mask geometry changed')
          await expect(calendar.locator('[data-vc-date^="2026-10-"]')).toHaveCount(31)
          await calendar.locator('[data-vc-arrow="next"]').click()
          await expect(calendar.locator('[data-vc-date^="2026-11-"]')).toHaveCount(30)
          await page.evaluate(() => window.__deliveryFramework.Datepicker.getInstance('#date').dispose())
          await expect(calendar).toHaveCount(0)
          assert.deepEqual(await page.evaluate(() => window.__deliveryViolations), [], 'Ordinary compiled workflows violate CSP')
          await page.evaluate(() => {
            const tooltip = new window.__deliveryFramework.Tooltip(document.querySelector('#tip'), {
              trigger: 'manual', html: true,
              title: '<b>Safe compiled content</b><a href="javascript:window.__deliveryInjected=true" onclick="window.__deliveryInjected=true">Unsafe link</a>'
            })
            tooltip.show()
          })
          await expect(page.locator('.tooltip')).toBeVisible()
          await expect(page.locator('.tooltip-inner b')).toHaveText('Safe compiled content')
          await expect(page.locator('.tooltip-inner a')).not.toHaveAttribute('href', /javascript:/)
          await expect(page.locator('.tooltip-inner a')).not.toHaveAttribute('onclick', /./)
          assert.equal(await page.evaluate(() => Boolean(window.__deliveryInjected)), false)
          assert.equal(await page.evaluate(() => 'TremplinFramework' in window), false, 'Public build created a global')
          // Same negative-control qualification as tests/browser/csp.spec.ts:
          // Chromium can report a blocked handler while parsing this attack in
          // the inert sanitizer document. Ordinary flows above require zero;
          // no other violation, live unsafe attribute or execution is accepted.
          const attackViolations = await page.evaluate(() => window.__deliveryViolations)
          assert(attackViolations.every(directive => directive === 'script-src-attr'), 'Unexpected CSP violation during the deliberate attack')
          assert.deepEqual(errors, [], 'Native preview raised JavaScript errors')
          cases.push({ engine, mode, status: 'passed', trustedTypesNegativeControl: engine === 'chromium' ? 'plain sink rejected' : 'not supported by this engine', inertHandlerBlocks: attackViolations.length })
          console.log(`Passed ${engine}/${mode}: exports, module identity, button, native dialog, calendar/mask, Tooltip sanitization and CSP.`)
        } finally { await context.close() }
      }
    } finally { await browser.close() }
  }
  await writeFile(path.join(root, 'artifacts/core-delivery-native-report.json'), JSON.stringify({ cases, passed: cases.length, releaseBlocked: true, scope: 'Compiler smoke qualification only; not exhaustive interaction or accessibility acceptance.' }, null, 2) + '\n')
} finally {
  server.closeAllConnections()
  await new Promise(resolve => server.close(resolve))
}
