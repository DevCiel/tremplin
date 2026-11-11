/**
 * --------------------------------------------------------------------------
 * Tremplin util/sanitizer.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

type SanitizerAllowList = Record<string, Array<string | RegExp>>

// Tremplin security exception SEC-001: keep the policy capability private and
// scoped to its Trusted Types factory, never on a global symbol/default policy.
type TrustedHTMLLike = string | { toString(): string }
type TrustedTypePolicyLike = { createHTML(input: string): TrustedHTMLLike }
type TrustedTypesFactoryLike = { createPolicy(name: string, rules: { createHTML(input: string): string }): TrustedTypePolicyLike }
const trustedPolicies = new WeakMap<TrustedTypesFactoryLike, TrustedTypePolicyLike>()

const toTrustedHTML = (html: string): TrustedHTMLLike => {
  const factory = (globalThis as typeof globalThis & { trustedTypes?: TrustedTypesFactoryLike }).trustedTypes
  if (!factory) return html

  let policy = trustedPolicies.get(factory)
  if (!policy) {
    // Raw tokens are used only for the inert parser below. Live DOM writes
    // receive tokens only after sanitization (or an explicit owner callback).
    policy = factory.createPolicy('tremplin', { createHTML: input => input })
    trustedPolicies.set(factory, policy)
  }
  return policy.createHTML(html)
}

// js-docs-start allow-list
const ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i

export const DefaultAllowlist: SanitizerAllowList = {
  // Global attributes allowed on any supplied element below.
  '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
  a: ['target', 'href', 'title', 'rel'],
  area: [],
  b: [],
  br: [],
  col: [],
  code: [],
  dd: [],
  div: [],
  dl: [],
  dt: [],
  em: [],
  hr: [],
  h1: [],
  h2: [],
  h3: [],
  h4: [],
  h5: [],
  h6: [],
  i: [],
  img: ['src', 'srcset', 'alt', 'title', 'width', 'height'],
  li: [],
  ol: [],
  p: [],
  pre: [],
  s: [],
  small: [],
  span: [],
  sub: [],
  sup: [],
  strong: [],
  u: [],
  ul: []
}
// js-docs-end allow-list

// js-docs-start icon-allow-list
/**
 * Allowlist for icon HTML options (Chips `dismissIcon`, NavOverflow `moreIcon`,
 * and markup supplied via `[data-trm-overflow-icon]`). Covers the default SVG
 * icons plus common inline-icon markup. Event-handler attributes and tags not
 * listed here are stripped by `sanitizeHtml`.
 */
export const DefaultIconAllowlist: SanitizerAllowList = {
  '*': ['class', 'role', ARIA_ATTRIBUTE_PATTERN],
  // Attribute names are matched lowercased (see allowedAttribute). `viewBox` is
  // listed as `viewbox` so the default SVG icons keep their coordinate system.
  svg: ['xmlns', 'width', 'height', 'viewbox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'focusable'],
  path: ['d', 'fill', 'stroke', 'stroke-width', 'fill-rule', 'clip-rule'],
  line: ['x1', 'y1', 'x2', 'y2', 'stroke', 'stroke-width', 'stroke-linecap'],
  circle: ['cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width'],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry', 'fill', 'stroke', 'stroke-width'],
  polyline: ['points', 'fill', 'stroke', 'stroke-width'],
  polygon: ['points', 'fill', 'stroke', 'stroke-width'],
  g: ['fill', 'stroke', 'stroke-width', 'transform'],
  // No `use` here: `href` / `xlink:href` on <use> can load external SVG
  // fragments. Apps that need sprites can extend this allowlist deliberately.
  span: [],
  i: []
}
// js-docs-end icon-allow-list

const uriAttributes = new Set([
  'background',
  'cite',
  'href',
  'itemtype',
  'longdesc',
  'poster',
  'src',
  'srcset',
  'xlink:href'
])

/**
 * A pattern that recognizes URLs that are safe wrt. XSS in URL navigation
 * contexts.
 *
 * Shout-out to Angular https://github.com/angular/angular/blob/15.2.8/packages/core/src/sanitization/url_sanitizer.ts#L38
 */
const SAFE_URL_PATTERN = /^(?!(?:javascript|data|vbscript):)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i

/**
 * A pattern that matches safe data URLs. Only matches image, video and audio
 * types — notably NOT `data:text/html`, which is an XSS vector.
 *
 * Shout-out to Angular https://github.com/angular/angular/blob/15.2.8/packages/core/src/sanitization/url_sanitizer.ts#L49
 */
const DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[\d+/a-z=]+$/i

// SEC-001: each srcset URL needs checking, not just the first candidate. Data
// URLs contain commas; reject them here rather than using an ambiguous parser.
const isSafeSrcset = (value: string): boolean => value.split(',').every(candidate => {
  const url = candidate.trim().split(/\s+/)[0]
  return Boolean(url && !/^data:/i.test(url) && SAFE_URL_PATTERN.test(url))
})

const allowedAttribute = (attribute: Attr, allowedAttributeList: Array<string | RegExp>): boolean => {
  const attributeName = attribute.nodeName.toLowerCase()

  const allowed = allowedAttributeList.includes(attributeName) || allowedAttributeList
    .filter(attributeRegex => attributeRegex instanceof RegExp)
    .some(regex => regex.test(attributeName))
  if (!allowed) return false
  if (attributeName === 'srcset') return isSafeSrcset(attribute.nodeValue ?? '')
  if (uriAttributes.has(attributeName)) {
    return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue!) || DATA_URL_PATTERN.test(attribute.nodeValue!))
  }
  return true
}

export function sanitizeHtml(unsafeHtml: string, allowList: SanitizerAllowList, sanitizeFunction?: ((unsafeHtml: string) => string) | null): string {
  if (!unsafeHtml.length) {
    return unsafeHtml
  }

  if (sanitizeFunction && typeof sanitizeFunction === 'function') {
    return sanitizeFunction(unsafeHtml)
  }

  const domParser = new window.DOMParser()
  const createdDocument = domParser.parseFromString(toTrustedHTML(unsafeHtml) as string, 'text/html')
  const elements = [...createdDocument.body.querySelectorAll('*')]

  for (const element of elements) {
    const elementName = element.nodeName.toLowerCase()

    if (!Object.keys(allowList).includes(elementName)) {
      element.remove()
      continue
    }

    const attributeList = [...element.attributes]
    const allowedAttributes = [...(allowList['*'] || []), ...(allowList[elementName] || [])]

    for (const attribute of attributeList) {
      if (!allowedAttribute(attribute, allowedAttributes)) {
        element.removeAttribute(attribute.nodeName)
      }
    }

    // SEC-001: retain useful rel tokens but never an explicit opener override.
    if (elementName === 'a' && element.getAttribute('target')?.toLowerCase() === '_blank') {
      const rel = new Set((element.getAttribute('rel') ?? '').toLowerCase().split(/\s+/).filter(token => token && token !== 'opener'))
      rel.add('noopener')
      rel.add('noreferrer')
      element.setAttribute('rel', [...rel].join(' '))
    }
  }

  return createdDocument.body.innerHTML
}

// Existing sanitizeHtml() deliberately still returns a string. Only this
// sanitizing entry point creates a live-sink token; the raw policy is not public.
export function sanitizeHtmlForSink(unsafeHtml: string, allowList: SanitizerAllowList, sanitizeFunction?: ((unsafeHtml: string) => string) | null): TrustedHTMLLike {
  return toTrustedHTML(sanitizeHtml(unsafeHtml, allowList, sanitizeFunction))
}

export function setElementHtml(element: Element, html: TrustedHTMLLike): void {
  // This does not trust/coerce a raw string. Enforcing browsers still reject
  // untrusted strings, including an explicit TemplateFactory sanitize:false.
  (element as unknown as { innerHTML: TrustedHTMLLike }).innerHTML = html
}

export type { SanitizerAllowList, TrustedHTMLLike }
