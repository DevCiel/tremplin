/*!
* Tremplin nav-overflow.js v0.8.0-beta.0 (https://gettremplin.com)
* Copyright (c) 2026 Devciel
* Copyright (c) 2011-2026 The Bootstrap Authors
* Licensed under MIT. See LICENSE and THIRD_PARTY_NOTICES.txt.
*/
import BaseComponent from "./base-component.js";
import EventHandler from "./dom/event-handler.js";
import SelectorEngine from "./dom/selector-engine.js";
import Menu from "./menu.js";
import { onDocumentReady } from "./util/component-functions.js";
import { getUID } from "./util/index.js";
import { DefaultIconAllowlist, sanitizeHtmlForSink, setElementHtml } from "./util/sanitizer.js";
//#region src/js/nav-overflow.ts
/**
* --------------------------------------------------------------------------
* Tremplin nav-overflow.ts
* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
* --------------------------------------------------------------------------
*/
/**
* Constants
*/
const NAME = "navoverflow";
const EVENT_KEY = `.trm.navoverflow`;
const EVENT_UPDATE = `update${EVENT_KEY}`;
const EVENT_OVERFLOW = `overflow${EVENT_KEY}`;
const EVENT_RESIZE = `resize${EVENT_KEY}`;
const CLASS_NAME_OVERFLOW = "nav-overflow";
const CLASS_NAME_OVERFLOW_MENU = "nav-overflow-menu";
const CLASS_NAME_HIDDEN = "d-none";
const CLASS_NAME_KEEP = "nav-overflow-keep";
const CLASS_NAME_INITIALIZED = "nav-overflow-initialized";
const CLASS_NAME_SUBMENU = "submenu";
const CLASS_NAME_SHOW = "show";
const SELECTOR_NAV = ".nav";
const SELECTOR_NAV_ITEM = ".nav-item";
const SELECTOR_NAV_LINK = ".nav-link";
const SELECTOR_OVERFLOW_TOGGLE = ".nav-overflow-toggle";
const SELECTOR_OVERFLOW_MENU = ".nav-overflow-menu";
const SELECTOR_CUSTOM_ICON = "[data-trm-overflow-icon]";
const SELECTOR_MENU = ".menu";
const SELECTOR_MENU_TOGGLE = "[data-trm-toggle=\"menu\"]";
const DEFAULT_TEXT = "More";
const Default = {
	collapseBelow: 0,
	iconPlacement: "start",
	menuPlacement: "bottom-end",
	menuStrategy: "absolute",
	moreText: DEFAULT_TEXT,
	moreIcon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 16 16\"><path d=\"M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3\"/></svg>",
	threshold: 0
};
const DefaultType = {
	collapseBelow: "(number|string)",
	iconPlacement: "string",
	menuPlacement: "string",
	menuStrategy: "string",
	moreText: "(string|boolean)",
	moreIcon: "string",
	threshold: "number"
};
/**
* Class definition
*/
var NavOverflow = class extends BaseComponent {
	constructor(element, config) {
		super(element, config);
		const nav = SelectorEngine.findOne(SELECTOR_NAV, this._element);
		if (!nav) throw new TypeError(`${this._element.outerHTML} has no child ${SELECTOR_NAV} to collapse`);
		this._nav = nav;
		this._items = [];
		this._overflowItems = [];
		this._overflowMenu = null;
		this._overflowToggle = null;
		this._resizeObserver = null;
		this._resizeHandler = null;
		this._collapseBelow = 0;
		this._itemMenus = /* @__PURE__ */ new Map();
		this._relocatedMenus = /* @__PURE__ */ new Map();
		this._init();
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
	update() {
		this._calculateOverflow();
		EventHandler.trigger(this._element, EVENT_UPDATE);
	}
	dispose() {
		if (this._resizeObserver) this._resizeObserver.disconnect();
		if (this._resizeHandler) EventHandler.off(window, EVENT_RESIZE, this._resizeHandler);
		this._restoreItems();
		if (this._overflowToggle && this._overflowToggle.parentElement) this._overflowToggle.parentElement.remove();
		super.dispose();
	}
	_init() {
		this._element.classList.add(CLASS_NAME_OVERFLOW);
		this._items = SelectorEngine.find(SELECTOR_NAV_ITEM, this._nav).filter((item) => !item.querySelector(SELECTOR_OVERFLOW_TOGGLE));
		for (const [index, item] of this._items.entries()) {
			item.dataset.trmNavOrder = index;
			const link = SelectorEngine.findOne(SELECTOR_NAV_LINK, item);
			if (link?.matches(SELECTOR_MENU_TOGGLE)) this._findItemMenu(item, link);
		}
		this._collapseBelow = this._resolveCollapseBelow();
		this._createOverflowMenu();
		this._setupResizeObserver();
		this._calculateOverflow();
		this._element.classList.add(CLASS_NAME_INITIALIZED);
	}
	_createOverflowMenu() {
		this._overflowToggle = SelectorEngine.findOne(SELECTOR_OVERFLOW_TOGGLE, this._element);
		if (this._overflowToggle) {
			this._overflowMenu = SelectorEngine.findOne(SELECTOR_OVERFLOW_MENU, this._element);
			return;
		}
		const { moreText } = this._config;
		const label = typeof moreText === "string" ? moreText : "";
		const overflowItem = document.createElement("li");
		overflowItem.className = "nav-item nav-overflow-item";
		const button = document.createElement("button");
		button.type = "button";
		button.className = "nav-link nav-overflow-toggle";
		button.setAttribute("data-trm-toggle", "menu");
		button.setAttribute("data-trm-placement", this._config.menuPlacement);
		button.setAttribute("data-trm-strategy", this._config.menuStrategy);
		button.setAttribute("aria-expanded", "false");
		if (label === "") button.setAttribute("aria-label", DEFAULT_TEXT);
		const iconSpan = document.createElement("span");
		iconSpan.className = "nav-overflow-icon";
		setElementHtml(iconSpan, sanitizeHtmlForSink(this._resolveIcon(), DefaultIconAllowlist));
		if (label === "") button.append(iconSpan);
		else {
			const textSpan = document.createElement("span");
			textSpan.className = "nav-overflow-text";
			textSpan.textContent = label;
			if (this._config.iconPlacement === "end") button.append(textSpan, iconSpan);
			else button.append(iconSpan, textSpan);
		}
		const menu = document.createElement("div");
		menu.className = `${CLASS_NAME_OVERFLOW_MENU} menu`;
		overflowItem.append(button, menu);
		this._nav.append(overflowItem);
		this._overflowToggle = button;
		this._overflowMenu = menu;
	}
	_resolveIcon() {
		const customIconElement = SelectorEngine.findOne(SELECTOR_CUSTOM_ICON, this._element);
		if (!customIconElement) return this._config.moreIcon;
		const iconClone = customIconElement.cloneNode(true);
		iconClone.removeAttribute("data-trm-overflow-icon");
		const iconHtml = iconClone.outerHTML;
		customIconElement.remove();
		return iconHtml;
	}
	_resolveCollapseBelow() {
		const value = this._config.collapseBelow;
		if (typeof value === "number") return value;
		if (typeof value === "string" && value !== "") {
			const cssValue = getComputedStyle(document.documentElement).getPropertyValue(`--trm-breakpoint-${value}`);
			return Number.parseFloat(cssValue) || 0;
		}
		return 0;
	}
	_setupResizeObserver() {
		if (typeof ResizeObserver === "undefined") {
			this._resizeHandler = () => this._calculateOverflow();
			EventHandler.on(window, EVENT_RESIZE, this._resizeHandler);
			return;
		}
		this._resizeObserver = new ResizeObserver(() => {
			this._calculateOverflow();
		});
		this._resizeObserver.observe(this._element);
	}
	_availableWidth() {
		const { paddingInlineStart, paddingInlineEnd } = getComputedStyle(this._element);
		const padding = (Number.parseFloat(paddingInlineStart) || 0) + (Number.parseFloat(paddingInlineEnd) || 0);
		return this._element.clientWidth - padding;
	}
	_navGap() {
		return Number.parseFloat(getComputedStyle(this._nav).columnGap) || 0;
	}
	_calculateOverflow() {
		this._restoreItems();
		const availableWidth = this._availableWidth();
		const overflowItem = this._overflowToggle?.closest(SELECTOR_NAV_ITEM) ?? null;
		const candidates = this._items.filter((item) => !item.classList.contains(CLASS_NAME_KEEP));
		if (this._collapseBelow > 0 && availableWidth < this._collapseBelow) {
			this._applyOverflow(candidates, overflowItem);
			return;
		}
		const gap = this._navGap();
		const widthOf = (items) => items.reduce((sum, item) => sum + item.offsetWidth + gap, 0);
		const space = availableWidth - widthOf(this._items.filter((item) => item.classList.contains(CLASS_NAME_KEEP))) + gap;
		if (widthOf(candidates) <= space + 1) {
			this._applyOverflow([], overflowItem);
			return;
		}
		const limit = space - (overflowItem ? overflowItem.offsetWidth + gap : 0);
		let usedWidth = 0;
		let itemsToOverflow = [];
		for (const item of candidates) {
			usedWidth += item.offsetWidth + gap;
			if (usedWidth > limit + 1) itemsToOverflow.push(item);
		}
		if (this._items.length - itemsToOverflow.length < this._config.threshold && this._items.length > this._config.threshold) itemsToOverflow = this._items.slice(this._config.threshold).filter((item) => !item.classList.contains(CLASS_NAME_KEEP));
		this._applyOverflow(itemsToOverflow, overflowItem);
	}
	_applyOverflow(items, overflowItem) {
		this._moveToOverflow(items);
		overflowItem?.classList.toggle(CLASS_NAME_HIDDEN, items.length === 0);
		if (items.length > 0) EventHandler.trigger(this._element, EVENT_OVERFLOW, {
			overflowCount: items.length,
			visibleCount: this._items.length - items.length
		});
	}
	_moveToOverflow(items) {
		if (!this._overflowMenu) return;
		this._overflowMenu.replaceChildren();
		this._overflowItems = [];
		for (const item of items) {
			const link = SelectorEngine.findOne(SELECTOR_NAV_LINK, item);
			if (!link) continue;
			const menu = this._findItemMenu(item, link);
			if (menu && link.matches(SELECTOR_MENU_TOGGLE)) this._overflowMenu.append(this._relocateAsSubmenu(item, link, menu));
			else this._overflowMenu.append(this._cloneAsMenuItem(link));
			item.classList.add(CLASS_NAME_HIDDEN);
			item.dataset.trmNavOverflow = "true";
			this._overflowItems.push(item);
		}
	}
	_relocateAsSubmenu(item, link, menu) {
		this._resetMenu(link, menu);
		item.classList.remove(CLASS_NAME_SHOW);
		this._relocatedMenus.set(item, {
			menu,
			parent: menu.parentNode,
			nextSibling: menu.nextSibling
		});
		const submenu = document.createElement("div");
		submenu.className = CLASS_NAME_SUBMENU;
		submenu.append(this._cloneAsMenuItem(link, true), menu);
		return submenu;
	}
	_cloneAsMenuItem(link, submenu = false) {
		const clonedLink = link.cloneNode(true);
		clonedLink.className = "menu-item";
		clonedLink.removeAttribute("id");
		this._remapCloneIds(clonedLink);
		if (link.classList.contains("active")) clonedLink.classList.add("active");
		if (link.classList.contains("disabled") || link.hasAttribute("disabled")) clonedLink.classList.add("disabled");
		if (submenu) {
			for (const name of clonedLink.getAttributeNames()) if (name.startsWith("data-trm-") && name !== "data-trm-theme") clonedLink.removeAttribute(name);
			clonedLink.removeAttribute("href");
			clonedLink.setAttribute("aria-haspopup", "true");
			clonedLink.setAttribute("aria-expanded", "false");
			if (clonedLink.tagName === "A") {
				clonedLink.setAttribute("role", "button");
				if (!clonedLink.hasAttribute("tabindex")) clonedLink.setAttribute("tabindex", "0");
			}
		}
		return clonedLink;
	}
	_remapCloneIds(clone) {
		const ids = /* @__PURE__ */ new Map();
		for (const [index, element] of [...clone.querySelectorAll("[id]")].entries()) {
			const id = getUID(`trm-nav-${index}-`);
			ids.set(element.id, id);
			element.id = id;
		}
		if (ids.size === 0) return;
		const idRefs = "aria-labelledby aria-describedby aria-controls aria-owns aria-flowto aria-activedescendant aria-details aria-errormessage for headers list form popovertarget commandfor".split(" ");
		const urlRefs = "style fill stroke clip-path mask filter marker marker-start marker-mid marker-end".split(" ");
		for (const element of [clone, ...clone.querySelectorAll("*")]) for (const attribute of [...element.attributes]) {
			let value = attribute.value;
			if (idRefs.includes(attribute.name)) value = value.replace(/\S+/g, (id) => ids.get(id) ?? id);
			else if (["href", "xlink:href"].includes(attribute.name) && value.startsWith("#")) value = `#${ids.get(value.slice(1)) ?? value.slice(1)}`;
			else if (urlRefs.includes(attribute.name)) value = value.replace(/url\(\s*(['"]?)#([^'"\s)]+)\1\s*\)/g, (match, _quote, id) => ids.has(id) ? match.replace(`#${id}`, `#${ids.get(id)}`) : match);
			if (value !== attribute.value) element.setAttribute(attribute.name, value);
		}
	}
	_findItemMenu(item, link) {
		const sibling = SelectorEngine.next(link, SELECTOR_MENU)[0];
		if (sibling && !sibling.classList.contains(CLASS_NAME_OVERFLOW_MENU)) {
			this._itemMenus.set(item, sibling);
			return sibling;
		}
		const nested = SelectorEngine.findOne(SELECTOR_MENU, item);
		if (nested && !nested.classList.contains(CLASS_NAME_OVERFLOW_MENU)) {
			this._itemMenus.set(item, nested);
			return nested;
		}
		const cached = this._itemMenus.get(item);
		if (cached?.isConnected) return cached;
		this._itemMenus.delete(item);
		return null;
	}
	_resetMenu(toggle, menu) {
		Menu.getInstance(toggle)?.dispose();
		toggle.classList.remove(CLASS_NAME_SHOW);
		toggle.setAttribute("aria-expanded", "false");
		toggle.parentElement?.classList.remove(CLASS_NAME_SHOW);
		menu.classList.remove(CLASS_NAME_SHOW);
	}
	_restoreRelocatedMenus() {
		for (const { menu, parent, nextSibling } of this._relocatedMenus.values()) if (nextSibling) nextSibling.before(menu);
		else parent.append(menu);
		this._relocatedMenus.clear();
	}
	_restoreItems() {
		if (this._overflowToggle && this._overflowMenu) {
			this._resetMenu(this._overflowToggle, this._overflowMenu);
			this._overflowToggle.closest(SELECTOR_NAV_ITEM)?.classList.remove(CLASS_NAME_SHOW);
		}
		this._restoreRelocatedMenus();
		for (const item of this._items) {
			item.classList.remove(CLASS_NAME_HIDDEN);
			delete item.dataset.trmNavOverflow;
		}
		this._overflowToggle?.closest(SELECTOR_NAV_ITEM)?.classList.remove(CLASS_NAME_HIDDEN);
		this._overflowMenu?.replaceChildren();
		this._overflowItems = [];
	}
};
/**
* Data API implementation
*/
onDocumentReady("DOMContentLoaded", () => {
	for (const element of SelectorEngine.find("[data-trm-toggle=\"nav-overflow\"]")) NavOverflow.getOrCreateInstance(element);
});
//#endregion
export { NavOverflow as default };

//# sourceMappingURL=nav-overflow.js.map