/*!
* Tremplin config.js v0.8.0-beta.0 (https://gettremplin.com)
* Copyright (c) 2026 Devciel
* Copyright (c) 2011-2026 The Bootstrap Authors
* Licensed under MIT. See LICENSE and THIRD_PARTY_NOTICES.txt.
*/
import Manipulator from "../dom/manipulator.js";
import { isElement, toType } from "./index.js";
//#region src/js/util/config.ts
/**
* --------------------------------------------------------------------------
* Tremplin util/config.ts
* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
* --------------------------------------------------------------------------
*/
/**
* Class definition
*/
var Config = class {
	static get Default() {
		return {};
	}
	static get DefaultType() {
		return {};
	}
	static get NAME() {
		throw new Error("You have to implement the static method \"NAME\", for each component!");
	}
	_getConfig(config) {
		config = this._mergeConfigObj(config);
		config = this._configAfterMerge(config);
		this._typeCheckConfig(config);
		return config;
	}
	_configAfterMerge(config) {
		return config;
	}
	_mergeConfigObj(config, element) {
		const jsonConfig = isElement(element) ? Manipulator.getDataAttribute(element, "config") : {};
		return {
			...this.constructor.Default,
			...typeof jsonConfig === "object" ? jsonConfig : {},
			...isElement(element) ? Manipulator.getDataAttributes(element) : {},
			...typeof config === "object" ? config : {}
		};
	}
	_typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
		for (const [property, expectedTypes] of Object.entries(configTypes)) {
			const value = config[property];
			const valueType = isElement(value) ? "element" : toType(value);
			if (!new RegExp(expectedTypes).test(valueType)) throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
		}
	}
};
//#endregion
export { Config as default };

//# sourceMappingURL=config.js.map