/*!
* Tremplin sanitizer.js v0.8.0-beta.0 (https://gettremplin.com)
* Copyright (c) 2026 Devciel
* Copyright (c) 2011-2026 The Bootstrap Authors
* Licensed under MIT. See LICENSE and THIRD_PARTY_NOTICES.txt.
*/
//#region src/js/util/sanitizer.ts
const trustedPolicies = /* @__PURE__ */ new WeakMap();
const toTrustedHTML = (html) => {
	const factory = globalThis.trustedTypes;
	if (!factory) return html;
	let policy = trustedPolicies.get(factory);
	if (!policy) {
		policy = factory.createPolicy("tremplin", { createHTML: (input) => input });
		trustedPolicies.set(factory, policy);
	}
	return policy.createHTML(html);
};
const ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
const DefaultAllowlist = {
	"*": [
		"class",
		"dir",
		"id",
		"lang",
		"role",
		ARIA_ATTRIBUTE_PATTERN
	],
	a: [
		"target",
		"href",
		"title",
		"rel"
	],
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
	img: [
		"src",
		"srcset",
		"alt",
		"title",
		"width",
		"height"
	],
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
};
/**
* Allowlist for icon HTML options (Chips `dismissIcon`, NavOverflow `moreIcon`,
* and markup supplied via `[data-trm-overflow-icon]`). Covers the default SVG
* icons plus common inline-icon markup. Event-handler attributes and tags not
* listed here are stripped by `sanitizeHtml`.
*/
const DefaultIconAllowlist = {
	"*": [
		"class",
		"role",
		ARIA_ATTRIBUTE_PATTERN
	],
	svg: [
		"xmlns",
		"width",
		"height",
		"viewbox",
		"fill",
		"stroke",
		"stroke-width",
		"stroke-linecap",
		"stroke-linejoin",
		"focusable"
	],
	path: [
		"d",
		"fill",
		"stroke",
		"stroke-width",
		"fill-rule",
		"clip-rule"
	],
	line: [
		"x1",
		"y1",
		"x2",
		"y2",
		"stroke",
		"stroke-width",
		"stroke-linecap"
	],
	circle: [
		"cx",
		"cy",
		"r",
		"fill",
		"stroke",
		"stroke-width"
	],
	rect: [
		"x",
		"y",
		"width",
		"height",
		"rx",
		"ry",
		"fill",
		"stroke",
		"stroke-width"
	],
	polyline: [
		"points",
		"fill",
		"stroke",
		"stroke-width"
	],
	polygon: [
		"points",
		"fill",
		"stroke",
		"stroke-width"
	],
	g: [
		"fill",
		"stroke",
		"stroke-width",
		"transform"
	],
	span: [],
	i: []
};
const uriAttributes = /* @__PURE__ */ new Set([
	"background",
	"cite",
	"href",
	"itemtype",
	"longdesc",
	"poster",
	"src",
	"srcset",
	"xlink:href"
]);
/**
* A pattern that recognizes URLs that are safe wrt. XSS in URL navigation
* contexts.
*
* Shout-out to Angular https://github.com/angular/angular/blob/15.2.8/packages/core/src/sanitization/url_sanitizer.ts#L38
*/
const SAFE_URL_PATTERN = /^(?!(?:javascript|data|vbscript):)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;
/**
* A pattern that matches safe data URLs. Only matches image, video and audio
* types — notably NOT `data:text/html`, which is an XSS vector.
*
* Shout-out to Angular https://github.com/angular/angular/blob/15.2.8/packages/core/src/sanitization/url_sanitizer.ts#L49
*/
const DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[\d+/a-z=]+$/i;
const isSafeSrcset = (value) => value.split(",").every((candidate) => {
	const url = candidate.trim().split(/\s+/)[0];
	return Boolean(url && !/^data:/i.test(url) && SAFE_URL_PATTERN.test(url));
});
const allowedAttribute = (attribute, allowedAttributeList) => {
	const attributeName = attribute.nodeName.toLowerCase();
	if (!(allowedAttributeList.includes(attributeName) || allowedAttributeList.filter((attributeRegex) => attributeRegex instanceof RegExp).some((regex) => regex.test(attributeName)))) return false;
	if (attributeName === "srcset") return isSafeSrcset(attribute.nodeValue ?? "");
	if (uriAttributes.has(attributeName)) return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue) || DATA_URL_PATTERN.test(attribute.nodeValue));
	return true;
};
function sanitizeHtml(unsafeHtml, allowList, sanitizeFunction) {
	if (!unsafeHtml.length) return unsafeHtml;
	if (sanitizeFunction && typeof sanitizeFunction === "function") return sanitizeFunction(unsafeHtml);
	const createdDocument = new window.DOMParser().parseFromString(toTrustedHTML(unsafeHtml), "text/html");
	const elements = [...createdDocument.body.querySelectorAll("*")];
	for (const element of elements) {
		const elementName = element.nodeName.toLowerCase();
		if (!Object.keys(allowList).includes(elementName)) {
			element.remove();
			continue;
		}
		const attributeList = [...element.attributes];
		const allowedAttributes = [...allowList["*"] || [], ...allowList[elementName] || []];
		for (const attribute of attributeList) if (!allowedAttribute(attribute, allowedAttributes)) element.removeAttribute(attribute.nodeName);
		if (elementName === "a" && element.getAttribute("target")?.toLowerCase() === "_blank") {
			const rel = new Set((element.getAttribute("rel") ?? "").toLowerCase().split(/\s+/).filter((token) => token && token !== "opener"));
			rel.add("noopener");
			rel.add("noreferrer");
			element.setAttribute("rel", [...rel].join(" "));
		}
	}
	return createdDocument.body.innerHTML;
}
function sanitizeHtmlForSink(unsafeHtml, allowList, sanitizeFunction) {
	return toTrustedHTML(sanitizeHtml(unsafeHtml, allowList, sanitizeFunction));
}
function setElementHtml(element, html) {
	element.innerHTML = html;
}
//#endregion
export { DefaultAllowlist, DefaultIconAllowlist, sanitizeHtml, sanitizeHtmlForSink, setElementHtml };

//# sourceMappingURL=sanitizer.js.map