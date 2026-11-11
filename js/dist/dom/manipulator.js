/*!
* Tremplin manipulator.js v0.8.0-beta.0 (https://gettremplin.com)
* Copyright (c) 2026 Devciel
* Copyright (c) 2011-2026 The Bootstrap Authors
* Licensed under MIT. See LICENSE and THIRD_PARTY_NOTICES.txt.
*/
//#region src/js/dom/manipulator.ts
/**
* --------------------------------------------------------------------------
* Tremplin dom/manipulator.ts
* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
* --------------------------------------------------------------------------
*/
function normalizeData(value) {
	if (value === "true") return true;
	if (value === "false") return false;
	if (value === Number(value).toString()) return Number(value);
	if (value === "" || value === "null") return null;
	if (typeof value !== "string") return value;
	try {
		return JSON.parse(decodeURIComponent(value));
	} catch {
		return value;
	}
}
function normalizeDataKey(key) {
	return key.replace(/[A-Z]/g, (chr) => `-${chr.toLowerCase()}`);
}
const Manipulator = {
	setDataAttribute(element, key, value) {
		element.setAttribute(`data-trm-${normalizeDataKey(key)}`, value);
	},
	removeDataAttribute(element, key) {
		element.removeAttribute(`data-trm-${normalizeDataKey(key)}`);
	},
	getDataAttributes(element) {
		if (!element) return {};
		const attributes = {};
		const trmKeys = Object.keys(element.dataset).filter((key) => key.startsWith("trm") && !key.startsWith("trmConfig"));
		for (const key of trmKeys) {
			let pureKey = key.replace(/^trm/, "");
			pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1);
			attributes[pureKey] = normalizeData(element.dataset[key]);
		}
		return attributes;
	},
	getDataAttribute(element, key) {
		return normalizeData(element.getAttribute(`data-trm-${normalizeDataKey(key)}`));
	}
};
//#endregion
export { Manipulator as default };

//# sourceMappingURL=manipulator.js.map