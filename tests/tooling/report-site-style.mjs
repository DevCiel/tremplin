import { readFile, writeFile } from 'node:fs/promises'

const read = async name => JSON.parse(await readFile(`artifacts/${name}`, 'utf8'))
const [baseline, firstAudit, audit, browser, unit, core] = await Promise.all([
  read('generated-site-accessibility-audit.json'), read('site-style-generated-audit.json'),
  read('site-style-final-audit.json'), read('site-style-final-browser.json'),
  read('site-style-unit.json'), read('bootstrap-core-audit.json')
])
function cases(report) {
  const result = []
  const visit = suite => {
    for (const spec of suite.specs ?? []) for (const test of spec.tests ?? []) result.push({ title: spec.title, ...test })
    for (const child of suite.suites ?? []) visit(child)
  }
  for (const suite of report.suites ?? []) visit(suite)
  return result
}
const pages = cases(audit).filter(test => test.title.startsWith('generated page WCAG audit: ')).map(test => {
  const attachment = test.results.flatMap(result => result.attachments ?? []).find(item => item.name === 'page-audit')
  const evidence = attachment?.body && JSON.parse(Buffer.from(attachment.body, 'base64').toString('utf8'))
  return {
    route: test.title.replace('generated page WCAG audit: ', ''), status: test.status,
    incomplete: !evidence,
    httpStatus: evidence?.status, runtimeErrors: evidence?.errors,
    violations: evidence?.violations.map(violation => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.map(node => ({ target: node.target, html: node.html, summary: node.failureSummary })) })),
    assertionErrors: test.status === 'expected' ? [] : test.results.flatMap(result => result.errors ?? []).map(error => error.message?.replace(/\u001b\[[0-9;]*m/g, '').slice(0,500))
  }
})
const report = {
  status: 'shared-site-styling-repaired-release-still-blocked',
  scope: 'Local documentation only: current core tokens, isolated page typography, accessible shell colors, strict homepage button markup, and one core/extension runtime graph on the palette page. No core source or frozen fallback changes. No hosting/deployment.',
  source: { commit: core.commit, counts: core.counts, extraCoreModules: core.extras.filter(entry => entry.location === 'core-extra').length, existingExceptions: ['SEC-001', 'A11Y-001'], newExceptions: [] },
  unit: { passed: unit.numPassedTests, failed: unit.numFailedTests, report: 'site-style-unit.json' },
  browser: { ...browser.stats, engines: ['chromium', 'firefox', 'webkit'], report: 'site-style-final-browser.json', scope: 'Typography/desktop columns, copy SVG/clipboard behavior, responsive light/dark shell, palette keyboard/focus/runtime isolation, and the previous control/form documentation repair subset.' },
  siteBuild: { pages: 192, status: 'passed', localOnly: true },
  audit: {
    baseline: { ...baseline.stats, report: 'generated-site-accessibility-audit.json' },
    firstSharedRepair: { ...firstAudit.stats, report: 'site-style-generated-audit.json', note: 'Before the final package-command text contrast correction.' },
    final: { ...audit.stats, report: 'site-style-final-audit.json', pages: pages.length, passingPages: pages.filter(page => page.status === 'expected').length, failingPages: pages.filter(page => page.status !== 'expected').length },
    runtimeErrorPages: pages.filter(page => page.runtimeErrors?.length).map(page => ({ route: page.route, errors: page.runtimeErrors })),
    incompletePages: pages.filter(page => page.incomplete).map(page => page.route),
    failures: pages.filter(page => page.status !== 'expected'),
    qualification: 'Desktop Chromium automated WCAG A/AA scan, not manual accessibility certification. Inventory assertions are not counted as pages. No exclusions added; sandboxed Playground scanning remains incomplete.'
  },
  validation: { coreTypecheck: 'passed', frozenFallbackHashes: 169, fallbackContracts: 1521, cssGzipBytes: 52168, jsGzipBytes: 59608, originalVisualBaselinesChanged: false },
  screenshots: ['site-style-homepage.png', 'site-style-homepage-dark.png', 'site-style-installation.png'],
  pending: ['Remaining individual demo contrast findings listed above', 'Playground full-frame audit completion', 'Eight obsolete Sass fixture discovery errors', '56 pre-existing wider test-type diagnostics', 'Visual-baseline acceptance after remaining repairs', 'Prerelease contract review and release gate']
}
await writeFile('artifacts/site-style-migration-status.json', JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify({ unit: report.unit, browser: report.browser, audit: report.audit.final, runtimeErrorPages: report.audit.runtimeErrorPages, incompletePages: report.audit.incompletePages, report: 'artifacts/site-style-migration-status.json' }, null, 2))
