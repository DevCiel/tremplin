import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'

const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

// Axe needs timers/callbacks which the script-disabled sandbox intentionally
// blocks. Never relax that production flag or silently omit the preview.
// Scan the parent (including iframe title), then a CSP-protected inert copy of
// the actual preview DOM, requiring matching rendered styles and geometry.
export async function auditDocumentationPage(page: Page) {
  const preview = page.locator('#preview[sandbox]')
  if (await preview.count() === 0) return { ...await new AxeBuilder({ page }).withTags(tags).analyze(), previewAudit: null }
  const sandbox = await preview.getAttribute('sandbox')
  if (sandbox !== 'allow-same-origin') throw new Error('Unexpected Playground sandbox policy; review the audit scope')
  const frame = await (await preview.elementHandle())!.contentFrame()
  if (!frame) throw new Error('Preview frame missing')
  if (page.frames().filter(candidate => candidate.parentFrame()).length !== 1) throw new Error('Additional page frames require a separate audit')
  await frame.locator('body > *').first().waitFor()
  if (frame.childFrames().length) throw new Error('Nested preview frames require a separate audit; not certified by this helper')
  await frame.evaluate(() => document.fonts.ready)
  const capture = await frame.evaluate(() => {
    if (document.querySelector('object, embed')) throw new Error('Embedded preview content requires a separate audit')
    const clone = document.documentElement.cloneNode(true) as HTMLElement
    clone.querySelectorAll('script, base, meta[http-equiv]').forEach(node => node.remove())
    for (const node of clone.querySelectorAll('*')) for (const attr of [...node.attributes]) if (/^on/i.test(attr.name)) node.removeAttribute(attr.name)
    return { html: '<!doctype html>' + clone.outerHTML, width: innerWidth, height: innerHeight, scrollX, scrollY }
  })
  // Exactly the same read-only fingerprint is evaluated in both documents.
  const fingerprint = () => [...document.querySelectorAll('body, body *')].flatMap(element => {
    const rect = element.getBoundingClientRect(), style = getComputedStyle(element)
    if (!rect.width || !rect.height || style.display === 'none' || style.visibility === 'hidden') return []
    return [{ tag: element.tagName, text: element.textContent, color: style.color, background: style.backgroundColor, font: style.font, display: style.display, rect: [rect.x, rect.y, rect.width, rect.height].map(value => Math.round(value * 100) / 100) }]
  })
  const liveRendering = await frame.evaluate(fingerprint)
  // The default Playwright adapter recursively calls runPartial in each frame
  // even when iframes:false is set. Its supported legacy runner honors that
  // option for this parent-only scan; the frame is audited separately below.
  const parent = await new AxeBuilder({ page }).setLegacyMode(true).options({ iframes: false }).withTags(tags).analyze()
  const snapshot = await page.context().newPage()
  try {
    await snapshot.setViewportSize({ width: capture.width, height: capture.height })
    const url = new URL('/__playground_audit_snapshot__/', page.url()).href
    await snapshot.route(url, route => route.fulfill({ contentType: 'text/html', body: capture.html, headers: {
      'Content-Security-Policy': "default-src 'none'; script-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; form-action 'none'; base-uri 'none'"
    } }))
    await snapshot.goto(url)
    await snapshot.evaluate(() => document.fonts.ready)
    await snapshot.evaluate(({ x, y }) => scrollTo(x, y), { x: capture.scrollX, y: capture.scrollY })
    const snapshotRendering = await snapshot.evaluate(fingerprint)
    if (JSON.stringify(liveRendering) !== JSON.stringify(snapshotRendering)) throw new Error('Inert preview rendering differs from the live frame; audit is incomplete')
    const result = await new AxeBuilder({ page: snapshot }).withTags(tags).analyze()
    return {
      ...parent, violations: [...parent.violations, ...result.violations],
      previewAudit: { method: 'inert snapshot of live script-disabled frame', sandbox, renderEquivalent: true, renderedElements: liveRendering.length, previewViolations: result.violations, qualification: 'Not an in-sandbox Axe execution or manual assistive-technology certification. Native sandbox is unchanged; copied build/handlers are removed and snapshot CSP blocks scripts, forms and off-origin resources.' }
    }
  } finally { await snapshot.close() }
}
