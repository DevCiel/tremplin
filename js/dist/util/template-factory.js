/*!
* Tremplin template-factory.js v0.8.0-beta.0 (https://gettremplin.com)
* Copyright (c) 2026 Devciel
* Copyright (c) 2011-2026 The Bootstrap Authors
* Licensed under MIT. See LICENSE and THIRD_PARTY_NOTICES.txt.
*/
import SelectorEngine from "../dom/selector-engine.js";
import Config from "./config.js";
import { DefaultAllowlist, sanitizeHtmlForSink, setElementHtml } from "./sanitizer.js";
import { execute, getElement, isElement } from "./index.js";
//#region src/js/util/template-factory.ts
/**
* --------------------------------------------------------------------------
* Tremplin util/template-factory.ts
* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
* --------------------------------------------------------------------------
*/
/**
* Constants
*/
const NAME = "TemplateFactory";
const Default = {
	allowList: DefaultAllowlist,
	content: {},
	extraClass: "",
	html: false,
	sanitize: true,
	sanitizeFn: null,
	template: "<div></div>"
};
const DefaultType = {
	allowList: "object",
	content: "object",
	extraClass: "(string|function)",
	html: "boolean",
	sanitize: "boolean",
	sanitizeFn: "(null|function)",
	template: "string"
};
const DefaultContentType = {
	entry: "(string|element|function|null)",
	selector: "(string|element)"
};
/**
* Class definition
*/
var TemplateFactory = class extends Config {
	constructor(config) {
		super();
		this._config = this._getConfig(config);
	}
	static get Default() {
		return Default;
	}
	static get DefaultType() {
		return DefaultType;
	}
	static get NAME() {
		return NAME;
	}
	getContent() {
		return Object.values(this._config.content).map((config) => this._resolvePossibleFunction(config)).filter(Boolean);
	}
	hasContent() {
		return this.getContent().length > 0;
	}
	changeContent(content) {
		this._checkContent(content);
		this._config.content = {
			...this._config.content,
			...content
		};
		return this;
	}
	toHtml() {
		const templateWrapper = document.createElement("div");
		setElementHtml(templateWrapper, this._maybeSanitize(this._config.template));
		for (const [selector, text] of Object.entries(this._config.content)) this._setContent(templateWrapper, text, selector);
		const template = templateWrapper.children[0];
		const extraClass = this._resolvePossibleFunction(this._config.extraClass);
		if (extraClass) template.classList.add(...extraClass.split(" "));
		return template;
	}
	_typeCheckConfig(config) {
		super._typeCheckConfig(config);
		this._checkContent(config.content);
	}
	_checkContent(arg) {
		for (const [selector, content] of Object.entries(arg)) super._typeCheckConfig({
			selector,
			entry: content
		}, DefaultContentType);
	}
	_setContent(template, content, selector) {
		const templateElement = SelectorEngine.findOne(selector, template);
		if (!templateElement) return;
		content = this._resolvePossibleFunction(content);
		if (!content) {
			templateElement.remove();
			return;
		}
		if (isElement(content)) {
			this._putElementInTemplate(getElement(content), templateElement);
			return;
		}
		if (this._config.html) {
			setElementHtml(templateElement, this._maybeSanitize(content));
			return;
		}
		templateElement.textContent = content;
	}
	_maybeSanitize(arg) {
		return this._config.sanitize ? sanitizeHtmlForSink(arg, this._config.allowList, this._config.sanitizeFn) : arg;
	}
	_resolvePossibleFunction(arg) {
		return execute(arg, [void 0, this]);
	}
	_putElementInTemplate(element, templateElement) {
		if (this._config.html) {
			templateElement.replaceChildren(element);
			return;
		}
		templateElement.textContent = element.textContent;
	}
};
//#endregion
export { TemplateFactory as default };

//# sourceMappingURL=template-factory.js.map