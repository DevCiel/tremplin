import { readFile, writeFile } from 'node:fs/promises'

const read = async name => JSON.parse(await readFile(`artifacts/${name}`, 'utf8'))
const [baseline, audit, browser, regression, unit, core] = await Promise.all([
  read('site-style-final-audit.json'), read('contrast-preview-site-audit.json'),
  read('contrast-preview-browser.json'), read('contrast-preview-regressions.json'),
  read('contrast-docs-unit.json'), read('bootstrap-core-audit.json')
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
  return { route: test.title.replace('generated page WCAG audit: ', ''), status: test.status, evidence: evidence || null }
})
const preview = pages.find(page => page.route === '/playground/')?.evidence?.previewAudit
const report = {
  status: pages.every(page => page.status === 'expected') ? 'generated-page-checks-pass-prerelease-still-blocked' : 'documentation-acceptance-incomplete',
  scope: 'Documentation-only application contrast choices, canonical example classes, search label, and default Playground markup. No core/frozen-source change or new upstream exception; no publication or visual-baseline update.',
  customization: { components: 10, formerlyFailingRoutes: 13, additionalGuide: '/forms/datepicker/', css: 'site/src/data/contrast-examples.ts', transparent: 'Visible opt-in CSS and matching copyable wrappers/options; unchanged core defaults remain the documented defaults.' },
  baseline: { report: 'site-style-final-audit.json', stats: baseline.stats },
  generatedAudit: { report: 'contrast-preview-site-audit.json', stats: audit.stats, pages: pages.length, passingPages: pages.filter(page => page.status === 'expected').length, failingPages: pages.filter(page => page.status !== 'expected').length, runtimeErrorPages: pages.filter(page => page.evidence?.errors?.length), failures: pages.filter(page => page.status !== 'expected') },
  playground: { ...preview, nativeSandboxChanged: false, negativeControl: 'An unnamed preview button must produce button-name in the snapshot and combined results.', scope: 'Default static preview, with live DOM serialized, active script/handler content removed, and style/geometry fingerprints checked. Not in-sandbox Axe execution, pixel equivalence, arbitrary embedded-content certification or manual accessibility review.' },
  browser: { report: 'contrast-preview-browser.json', ...browser.stats },
  previousDocumentationRegressions: { report: 'contrast-preview-regressions.json', ...regression.stats },
  unit: { report: 'contrast-docs-unit.json', passed: unit.numPassedTests, failed: unit.numFailedTests },
  core: { commit: core.commit, counts: core.counts, extraCoreModules: core.extras.filter(entry => entry.location === 'core-extra').length },
  build: 'passed', releaseBlocked: true,
  broaderTypes: { diagnostics: 57, changedFileDiagnostics: 0, confirmation: 'The same 57 diagnostics remain when the new audit test roots are excluded; errors are in unchanged core and existing core/interactions hybrid fixtures. Earlier notes counted 56.' },
  pending: ['Eight obsolete Sass discovery fixtures', '57 broader test-type diagnostics', 'Visual baseline review after markup changes', 'Manual accessibility review and prerelease contract acceptance']
}
await writeFile('artifacts/contrast-preview-status.json', JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify({ status: report.status, generatedAudit: report.generatedAudit, browser: report.browser, regressions: report.previousDocumentationRegressions, unit: report.unit, playground: report.playground, report: 'artifacts/contrast-preview-status.json' }, null, 2))
