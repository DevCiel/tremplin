/*!
* Tremplin selector-engine.js v0.8.0-beta.0 (https://gettremplin.com)
* Copyright (c) 2026 Devciel
* Copyright (c) 2011-2026 The Bootstrap Authors
* Licensed under MIT. See LICENSE and THIRD_PARTY_NOTICES.txt.
*/
import { parseSelector } from "../util/index.js";
//#region src/js/dom/selector-engine.ts
/**
* --------------------------------------------------------------------------
* Tremplin dom/selector-engine.ts
* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
* --------------------------------------------------------------------------
*/
const getSelector = (element) => {
	let selector = element.getAttribute("data-trm-target");
	if (!selector || selector === "#") {
		let hrefAttribute = element.getAttribute("href");
		if (!hrefAttribute || !hrefAttribute.includes("#") && !hrefAttribute.startsWith(".")) return null;
		if (hrefAttribute.includes("#") && !hrefAttribute.startsWith("#")) hrefAttribute = `#${hrefAttribute.split("#")[1]}`;
		selector = hrefAttribute && hrefAttribute !== "#" ? hrefAttribute.trim() : null;
	}
	return selector ? selector.split(",").map((sel) => parseSelector(sel)).join(",") : null;
};
const SelectorEngine = {
	find(selector, element = document.documentElement) {
		return [...Element.prototype.querySelectorAll.call(element, selector)];
	},
	findOne(selector, element = document.documentElement) {
		return Element.prototype.querySelector.call(element, selector);
	},
	parents(element, selector) {
		const parents = [];
		let ancestor = element.parentNode.closest(selector);
		while (ancestor) {
			parents.push(ancestor);
			ancestor = ancestor.parentNode.closest(selector);
		}
		return parents;
	},
	closest(element, selector) {
		return Element.prototype.closest.call(element, selector);
	},
	prev(element, selector) {
		let previous = element.previousElementSibling;
		while (previous) {
			if (previous.matches(selector)) return [previous];
			previous = previous.previousElementSibling;
		}
		return [];
	},
	next(element, selector) {
		let next = element.nextElementSibling;
		while (next) {
			if (next.matches(selector)) return [next];
			next = next.nextElementSibling;
		}
		return [];
	},
	getSelectorFromElement(element) {
		const selector = getSelector(element);
		if (selector) return SelectorEngine.findOne(selector) ? selector : null;
		return null;
	},
	getElementFromSelector(element) {
		const selector = getSelector(element);
		return selector ? SelectorEngine.findOne(selector) : null;
	},
	getMultipleElementsFromSelector(element) {
		const selector = getSelector(element);
		return selector ? SelectorEngine.find(selector) : [];
	}
};
//#endregion
export { SelectorEngine as default };

//# sourceMappingURL=selector-engine.js.map