/*!
* Tremplin base-component.js v0.8.0-beta.0 (https://gettremplin.com)
* Copyright (c) 2026 Devciel
* Copyright (c) 2011-2026 The Bootstrap Authors
* Licensed under MIT. See LICENSE and THIRD_PARTY_NOTICES.txt.
*/
import Data from "./dom/data.js";
import EventHandler from "./dom/event-handler.js";
import Config from "./util/config.js";
import { executeAfterTransition, getElement } from "./util/index.js";
//#region src/js/base-component.ts
/**
* --------------------------------------------------------------------------
* Tremplin base-component.ts
* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
* --------------------------------------------------------------------------
*/
/**
* Constants
*/
const VERSION = "0.8.0-beta.0";
/**
* Class definition
*/
var BaseComponent = class extends Config {
	constructor(element, config) {
		super();
		element = getElement(element);
		if (!element) return;
		this._element = element;
		this._config = this._getConfig(config);
		const existingInstance = Data.get(this._element, this.constructor.DATA_KEY);
		if (existingInstance) existingInstance.dispose();
		Data.set(this._element, this.constructor.DATA_KEY, this);
	}
	dispose() {
		Data.remove(this._element, this.constructor.DATA_KEY);
		EventHandler.off(this._element, this.constructor.EVENT_KEY);
		for (const propertyName of Object.getOwnPropertyNames(this)) this[propertyName] = null;
	}
	_queueCallback(callback, element, isAnimated = true) {
		return new Promise((resolve) => {
			executeAfterTransition(() => {
				if (this._element) callback();
				resolve();
			}, element, isAnimated);
		});
	}
	_getConfig(config) {
		config = this._mergeConfigObj(config, this._element);
		config = this._configAfterMerge(config);
		this._typeCheckConfig(config);
		return config;
	}
	static getInstance(element) {
		return Data.get(getElement(element), this.DATA_KEY);
	}
	static getOrCreateInstance(element, config = {}) {
		return this.getInstance(element) || new this(element, typeof config === "object" ? config : null);
	}
	static get VERSION() {
		return VERSION;
	}
	static get DATA_KEY() {
		return `trm.${this.NAME}`;
	}
	static get EVENT_KEY() {
		return `.${this.DATA_KEY}`;
	}
	static eventName(name) {
		return `${name}${this.EVENT_KEY}`;
	}
};
//#endregion
export { BaseComponent as default };

//# sourceMappingURL=base-component.js.map