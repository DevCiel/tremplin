import { readFile, writeFile } from 'node:fs/promises'

const read = async file => JSON.parse(await readFile(`artifacts/${file}`, 'utf8'))
const [generated, visual, interactions] = await Promise.all([
  read('generated-site-accessibility-audit.json'), read('full-site-visual-audit.json'), read('full-site-audit.json')
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
const pages = []
for (const test of cases(generated)) {
  const attachment = test.results.flatMap(result => result.attachments ?? []).find(item => item.name === 'page-audit')
  if (!attachment) {
    if (test.title.startsWith('generated page WCAG audit: ')) pages.push({
      route: test.title.replace('generated page WCAG audit: ', ''), status: test.status,
      auditIncomplete: true, violations: [],
      assertionErrors: test.results.flatMap(result => result.errors ?? []).map(error => error.message?.replace(/\u001b\[[0-9;]*m/g, '').slice(0,400))
    })
    continue // Preserve incomplete page failures; exclude only the inventory check.
  }
  const evidence = attachment.body ? JSON.parse(Buffer.from(attachment.body, 'base64').toString('utf8')) : JSON.parse(await readFile(attachment.path, 'utf8'))
  pages.push({
    route: evidence.route, status: test.status, httpStatus: evidence.status,
    runtimeErrors: evidence.errors,
    violations: evidence.violations.map(violation => ({
      id: violation.id, impact: violation.impact,
      nodes: violation.nodes.map(node => ({ target: node.target, html: node.html, failureSummary: node.failureSummary }))
    })),
    assertionErrors: test.results.flatMap(result => result.errors ?? []).map(error => error.message?.replace(/\u001b\[[0-9;]*m/g, '').slice(0,400))
  })
}
const violationPageCounts = {}
for (const page of pages) for (const violation of page.violations) violationPageCounts[violation.id] = (violationPageCounts[violation.id] ?? 0) + 1
let recheck
try {
  const report = await read('site-audit-infrastructure-recheck.json')
  recheck = { report: 'site-audit-infrastructure-recheck.json', stats: report.stats, cases: cases(report).map(test => ({ title: test.title, status: test.status })), interpretation: 'Icons and Integrations pass on an isolated recheck. Playground remains incomplete after 60 seconds; do not count it as accessible. Original full-run counts are retained, not silently merged.' }
} catch (error) { if (error.code !== 'ENOENT') throw error }
const summary = {
  status: 'not-release-ready',
  provenance: 'Full-site reports captured before the A11Y-001 code and guidance rebuild. Focused post-fix evidence is separately recorded in nav-overflow-browser.json. No visual baselines updated.',
  generatedSite: {
    report: 'generated-site-accessibility-audit.json', startedAt: generated.stats.startTime,
    scope: 'Desktop Chromium; generated documentation routes and current examples, including iframe content. Excludes legacy archives and copied dependency directories. Automated checks are not a complete accessibility certification.',
    pages: pages.length, passingPages: pages.filter(page => page.status === 'expected').length,
    failingPages: pages.filter(page => page.status !== 'expected').length,
    incompleteAuditPages: pages.filter(page => page.auditIncomplete).map(page => page.route),
    checks: generated.stats, violationPageCounts,
    runtimeErrorPages: pages.filter(page => page.runtimeErrors?.length).map(page => ({ route: page.route, errors: page.runtimeErrors })),
    failures: pages.filter(page => page.status !== 'expected')
  },
  fullInteractions: {
    report: 'full-site-audit.json', stats: interactions.stats,
    discoveryErrors: interactions.errors?.map(error => error.message?.replace(/\u001b\[[0-9;]*m/g, '')) ?? [],
    interpretation: 'Eight obsolete Sass fixture discovery errors prevented this suite from running; zero executed tests is not a pass.'
  },
  visual: {
    report: 'full-site-visual-audit.json', stats: visual.stats,
    failedCases: cases(visual).filter(test => test.status !== 'expected').map(test => test.title),
    baselinesUpdated: false,
    inspection: 'Homepage and installation actual screenshots show real styling regressions (missing theme colors/hero text and cramped heading spacing), not only changed guide lengths. Review site token/class usage and content before approving any new baseline.'
  },
  infrastructureRecheck: recheck,
  nextWork: [
    'Migrate shared documentation styling and examples to current strict tokens/classes without changing the pinned core.',
    'Resolve reported color contrast and runtime/landmark failures; re-run the full generated-site audit.',
    'Migrate obsolete Sass fixture APIs, preserving assertions or explicit frozen-legacy coverage.',
    'Review visual diffs after repairs; only approve snapshots after visual acceptance.'
  ]
}
await writeFile('artifacts/site-acceptance-audit.json', JSON.stringify(summary, null, 2) + '\n')
console.log(JSON.stringify({ pages: summary.generatedSite.pages, passingPages: summary.generatedSite.passingPages, failingPages: summary.generatedSite.failingPages, violationPageCounts, runtimeErrorPages: summary.generatedSite.runtimeErrorPages, discoveryErrors: summary.fullInteractions.discoveryErrors.length, visual: visual.stats, report: 'artifacts/site-acceptance-audit.json' }, null, 2))
