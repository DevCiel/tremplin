/*!
* Tremplin data.js v0.8.0-beta.0 (https://gettremplin.com)
* Copyright (c) 2026 Devciel
* Copyright (c) 2011-2026 The Bootstrap Authors
* Licensed under MIT. See LICENSE and THIRD_PARTY_NOTICES.txt.
*/
//#region src/js/dom/data.ts
/**
* --------------------------------------------------------------------------
* Tremplin dom/data.ts
* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
* --------------------------------------------------------------------------
*/
/**
* Constants
*/
const elementMap = /* @__PURE__ */ new Map();
var data_default = {
	set(element, key, instance) {
		if (!elementMap.has(element)) elementMap.set(element, /* @__PURE__ */ new Map());
		elementMap.get(element).set(key, instance);
	},
	get(element, key) {
		if (element && elementMap.has(element)) return elementMap.get(element).get(key) || null;
		return null;
	},
	remove(element, key) {
		if (!elementMap.has(element)) return;
		const instanceMap = elementMap.get(element);
		instanceMap.delete(key);
		if (instanceMap.size === 0) elementMap.delete(element);
	}
};
//#endregion
export { data_default as default };

//# sourceMappingURL=data.js.map