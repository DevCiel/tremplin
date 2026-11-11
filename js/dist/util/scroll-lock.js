/*!
* Tremplin scroll-lock.js v0.8.0-beta.0 (https://gettremplin.com)
* Copyright (c) 2026 Devciel
* Copyright (c) 2011-2026 The Bootstrap Authors
* Licensed under MIT. See LICENSE and THIRD_PARTY_NOTICES.txt.
*/
import SelectorEngine from "../dom/selector-engine.js";
//#region src/js/util/scroll-lock.ts
/**
* --------------------------------------------------------------------------
* Tremplin util/scroll-lock.ts
* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
* --------------------------------------------------------------------------
*/
const CLASS_NAME_OPEN = "dialog-open";
const SELECTOR_FIXED_CONTENT = ".fixed-top, .fixed-bottom, .is-fixed";
const owners = /* @__PURE__ */ new Set();
let restore = null;
const getStyleChange = (element, property, offset) => {
	const value = Number.parseFloat(getComputedStyle(element).getPropertyValue(property)) || 0;
	return {
		element,
		property,
		value: element.style.getPropertyValue(property),
		priority: element.style.getPropertyPriority(property),
		adjustedValue: `${value + offset}px`
	};
};
const releaseUnusedLock = () => {
	for (const owner of owners) if (!owner.isConnected || !owner.open) owners.delete(owner);
	if (owners.size === 0 && restore) {
		restore();
		restore = null;
	}
};
const lockScroll = (owner) => {
	releaseUnusedLock();
	if (owners.has(owner)) return;
	owners.add(owner);
	if (owners.size > 1) return;
	const root = document.documentElement;
	const alreadyLocked = root.classList.contains(CLASS_NAME_OPEN);
	const initialWidth = root.offsetWidth;
	const viewportWidth = root.clientWidth;
	const initialLeft = root.getBoundingClientRect().left + root.clientLeft + window.scrollX;
	const changes = [];
	const fixed = SelectorEngine.find(SELECTOR_FIXED_CONTENT).filter((element) => !element.closest("dialog") && getComputedStyle(element).position === "fixed" && element.clientWidth >= viewportWidth).map((element) => ({
		element,
		width: element.offsetWidth
	}));
	root.classList.add(CLASS_NAME_OPEN);
	const width = Math.max(0, root.offsetWidth - initialWidth);
	const side = initialLeft > root.getBoundingClientRect().left + root.clientLeft + window.scrollX ? "left" : "right";
	const fixedChanges = fixed.map((item) => ({
		element: item.element,
		width: Math.max(0, item.element.offsetWidth - item.width)
	}));
	if (width > 0) changes.push(getStyleChange(root, `padding-${side}`, width));
	for (const item of fixedChanges) if (item.width > 0) changes.push(getStyleChange(item.element, `margin-${side}`, item.width));
	for (const { element, property, adjustedValue } of changes) element.style.setProperty(property, adjustedValue, "important");
	restore = () => {
		for (const { element, property, value, priority } of changes) if (value) element.style.setProperty(property, value, priority);
		else element.style.removeProperty(property);
		if (!alreadyLocked) root.classList.remove(CLASS_NAME_OPEN);
	};
};
const unlockScroll = (owner) => {
	owners.delete(owner);
	releaseUnusedLock();
};
//#endregion
export { lockScroll, unlockScroll };

//# sourceMappingURL=scroll-lock.js.map