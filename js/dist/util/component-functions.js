/*!
* Tremplin component-functions.js v0.8.0-beta.0 (https://gettremplin.com)
* Copyright (c) 2026 Devciel
* Copyright (c) 2011-2026 The Bootstrap Authors
* Licensed under MIT. See LICENSE and THIRD_PARTY_NOTICES.txt.
*/
import EventHandler from "../dom/event-handler.js";
import SelectorEngine from "../dom/selector-engine.js";
import { isDisabled } from "./index.js";
//#region src/js/util/component-functions.ts
const enableDismissTrigger = (component, method = "hide") => {
	const clickEvent = `click.dismiss${component.EVENT_KEY}`;
	const name = component.NAME;
	EventHandler.on(document, clickEvent, `[data-trm-dismiss="${name}"]`, function(event) {
		if (["A", "AREA"].includes(this.tagName)) event.preventDefault();
		if (isDisabled(this)) return;
		const target = SelectorEngine.getElementFromSelector(this) || this.closest(`.${name}, [class*=":${name}"]`);
		component.getOrCreateInstance(target)[method]();
	});
};
const eventActionOnPlugin = (Plugin, onEvent, stringSelector, method, callback = null) => {
	eventAction(`${onEvent}.${Plugin.NAME}`, stringSelector, (data) => {
		const instances = data.targets.filter(Boolean).map((element) => Plugin.getOrCreateInstance(element));
		if (typeof callback === "function") callback({
			...data,
			instances
		});
		for (const instance of instances) instance[method]();
	});
};
const eventAction = (onEvent, stringSelector, callback) => {
	const selector = `${stringSelector}:not(.disabled):not(:disabled)`;
	EventHandler.on(document, onEvent, selector, function(event) {
		if (["A", "AREA"].includes(this.tagName)) event.preventDefault();
		const selector = SelectorEngine.getSelectorFromElement(this);
		callback({
			targets: selector ? SelectorEngine.find(selector) : [this],
			event
		});
	});
};
const onDocumentReady = (eventName, callback) => {
	EventHandler.on(document, eventName, callback);
	if (document.readyState !== "loading") callback();
};
//#endregion
export { enableDismissTrigger, eventActionOnPlugin, onDocumentReady };

//# sourceMappingURL=component-functions.js.map