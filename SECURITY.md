# Security policy

## Supported versions

Tremplin is pre-1.0. Security fixes are applied to the latest beta or alpha release only.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Send a private report to `security@devciel.com` with the affected version, impact, reproduction steps, and any suggested mitigation.

Devciel will acknowledge a complete report within five business days, validate the issue, coordinate a release, and credit the reporter when requested. Please allow a reasonable remediation period before public disclosure.

## Scope

Reports involving the HTML sanitizer, unsafe URL handling, focus or overlay escape, package integrity, release credentials, or documentation playground isolation are particularly valuable.

## Rich HTML and Trusted Types

The unreleased Bootstrap 6-derived core includes user-approved exception
`SEC-001`. Six modules differ intentionally from upstream; the exact edits and
base/output hashes are recorded in `metadata/bootstrap6-security-patches.json`.
The audit distinguishes 131 exact modules from these six approved patches and
rejects changes outside the recorded edits. Original upstream notices remain.

NavOverflow also has a separately approved accessibility exception, `A11Y-001`.
Its registry entry is labelled `SEC-001+A11Y-001`, not an exact upstream match.
Cloned link roots remain ID-less as upstream intended. Descendant IDs receive
unique internal IDs; local HTML/ARIA ID references, fragment-only href/xlink:href
and SVG/style `url(#id)` references follow those new IDs. Original nodes, their
IDs and external targets are unchanged, including across updates and disposal.
Author markup must have valid, unique original IDs. Arbitrary stylesheet
selectors, script-held references, cross-link clone references and full URL
fragments are not rewritten. Prefer classes for styling cloned contents.
The original pinned reference remains untouched. No legacy implementation is retained.
This accessibility fix does not relax the sanitizer, CSP or Trusted Types policy.

Tooltip, Popover, and TemplateFactory rich HTML is sanitized by default. The allowlist removes unknown elements, event-handler attributes, unsafe URL schemes, unsafe `srcset` candidates, and external SVG `<use>` references. Links opening a new browsing context receive `noopener noreferrer` automatically.

When the browser exposes Trusted Types, Tremplin caches a private `tremplin`
policy per factory in a module-local WeakMap. It is not exported or stored on a
global symbol; no `default` policy is installed. Raw tokens are used only for the
inert parser. Live-sink tokens are created after allowlist processing, or after
an explicitly configured application sanitizer callback. The existing
`sanitizeHtml()` API still returns a string; framework sinks use the separate
`sanitizeHtmlForSink()` path to preserve TrustedHTML identity.

Keep `sanitize: true`. A custom `sanitizeFn` replaces the built-in checks and is
trusted application code. `sanitize: false` does not cause Tremplin to trust raw
strings under enforcement: those assignments still fail closed. Named policies
do not authorize arbitrary raw string writes; the application must allow the
policy name in its CSP. See the [Trusted Types specification](https://www.w3.org/TR/trusted-types/)
and [Chrome's Trusted Types guidance](https://developer.chrome.com/docs/modern-web-guidance/guides/security/trusted-types).

For strict CSP deployments, allow the policy name and avoid inline script exceptions:

```text
Content-Security-Policy: require-trusted-types-for 'script'; trusted-types tremplin
```

These two directives cover Trusted Types only. A complete same-origin baseline,
as enforced by the framework browser tests, is:

```text
Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; require-trusted-types-for 'script'; trusted-types tremplin
```

Load framework JavaScript and styles from external same-origin files and adapt
resource sources to your application. This baseline is validated for the
framework components below; the documentation site's inline scripts and
playground require their own policy and are not covered by this claim.

Run `npm run build` followed by `npm run test:csp`. The suite runs in Chromium,
Firefox, and WebKit. All 18 hardened overlay/icon/calendar/policy checks pass
across these engines. Chromium verifies that raw strings, fake TrustedHTML-like
objects, disabled-sanitizer bypass attempts and unauthorized policies remain
blocked. Other engines exercise CSP/components without assuming TT enforcement.

Calendar Pro's `sanitizerHTML` hook is now integrated with SEC-001. Generated and
custom layouts pass through a calendar-specific allowlist that preserves controls,
ARIA/focus semantics and `data-vc-*` markers while removing executable markup,
inline styles and external SVG references. An owner's `vcpOptions.sanitizerHTML`
transform runs first; it cannot bypass this final allowlist. Native TrustedHTML
identity is retained despite Calendar Pro's string-only TypeScript declaration.
This hook does not sanitize arbitrary DOM writes performed by owner callbacks.

The migrated Datepicker cases exercise real input-mode rendering, keyboard date
selection, literal ARIA labels, disposal, two-month inline layouts and malicious
owner-transform output. The user selected external same-origin SVG masks for
calendar arrows. `src/scss/_datepicker.scss` uses the separately verified asset
instead of Bootstrap's data URL; its viewBox/path, mask styling and rotations
are unchanged. The browser tests require a real HTTP 200 SVG response and the
external computed mask URL. All **18 checks pass**, with zero skips/flakes; see
`artifacts/calendar-external-svg-csp.json`. Neither `img-src 'self'` nor any
script/Trusted Types restriction was relaxed. The former failing result remains
in `artifacts/datepicker-csp-all.json` as historical evidence.

When deploying, preserve both `dist/css/` and `dist/icons/`. The CSS resolves
`../icons/datepicker-chevron.svg` relative to its own URL. `npm run build:css`
copies the approved `icons/ui/datepicker-chevron.svg` into `dist/icons/`, and
`dist/integrity.json` records its SHA-384 digest. Asset source/output paths and
the source SHA-256 digest are pinned in the security registry. If your bundler
relocates CSS, let it resolve/rewrite this URL and emit the SVG, or preserve the
same relative directory layout yourself. Serve the SVG with `image/svg+xml`.
Custom Sass builds must also deploy this asset at the referenced path. Other
components or application content may need additional resource policies; this
calendar change is not a claim that every framework feature works with the
sample policy. Release stays blocked on the broader migration gates.

Safe component operations must produce no CSP violations. When parsing hostile
HTML in an inert document, Chromium may report a blocked inline event handler;
the attack test permits only that specific `script-src-attr` report and verifies
that the handler and unsafe link are removed before live insertion.

The former hybrid Datepicker used DOM construction; the strict Datepicker now
delegates to Vanilla Calendar Pro and uses sanitized HTML sinks instead of
claiming the former implementation's no-HTML-sink guarantee.
TemplateFactory inserts element content with `replaceChildren()`, avoiding an
untrusted empty-string assignment under Trusted Types enforcement.

## Overlay security boundary

Dialog and Drawer retain native `<dialog>` focus containment and top-layer behavior. Tremplin tracks component ownership so only the topmost dialog handles Escape or backdrop dismissal, nested modal locks are reference-counted, closing an inner dialog does not unlock the page, and disposal releases only the disposing component's ownership. Tooltip and Popover use a shared component-local stack so one Escape dismisses only the most recently shown floating surface.
