/*!
* Tremplin event-handler.js v0.8.0-beta.0 (https://gettremplin.com)
* Copyright (c) 2026 Devciel
* Copyright (c) 2011-2026 The Bootstrap Authors
* Licensed under MIT. See LICENSE and THIRD_PARTY_NOTICES.txt.
*/
//#region src/js/dom/event-handler.ts
/**
* Constants
*/
const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
const stripNameRegex = /\..*/;
const stripUidRegex = /::\d+$/;
const eventRegistry = {};
let uidEvent = 1;
const customEvents = {
	mouseenter: "mouseover",
	mouseleave: "mouseout"
};
const nativeEvents = /* @__PURE__ */ new Set([
	"click",
	"dblclick",
	"mouseup",
	"mousedown",
	"contextmenu",
	"mousewheel",
	"DOMMouseScroll",
	"mouseover",
	"mouseout",
	"mousemove",
	"selectstart",
	"selectend",
	"keydown",
	"keypress",
	"keyup",
	"input",
	"paste",
	"orientationchange",
	"touchstart",
	"touchmove",
	"touchend",
	"touchcancel",
	"pointerdown",
	"pointermove",
	"pointerup",
	"pointerleave",
	"pointercancel",
	"gesturestart",
	"gesturechange",
	"gestureend",
	"focus",
	"blur",
	"change",
	"reset",
	"select",
	"submit",
	"focusin",
	"focusout",
	"load",
	"unload",
	"beforeunload",
	"resize",
	"move",
	"DOMContentLoaded",
	"readystatechange",
	"error",
	"abort",
	"scroll",
	"scrollend"
]);
/**
* Private methods
*/
function makeEventUid(element, uid) {
	return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
}
function getElementEvents(element) {
	const uid = makeEventUid(element);
	element.uidEvent = uid;
	eventRegistry[uid] = eventRegistry[uid] || {};
	return eventRegistry[uid];
}
function isMouseEventWithinTarget(event) {
	const { delegateTarget, relatedTarget } = event;
	return Boolean(relatedTarget && delegateTarget.contains(relatedTarget));
}
function tremplinHandler(element, fn, handlerTypeEvent) {
	const isCustomMouseEvent = handlerTypeEvent in customEvents;
	return function handler(event) {
		const tremplinEvent = hydrateObj(event, { delegateTarget: element });
		if (isCustomMouseEvent && isMouseEventWithinTarget(tremplinEvent)) return;
		if (handler.oneOff) EventHandler.off(element, handlerTypeEvent, fn);
		return fn.apply(element, [tremplinEvent]);
	};
}
function tremplinDelegationHandler(element, selector, fn, handlerTypeEvent) {
	const isCustomMouseEvent = handlerTypeEvent in customEvents;
	return function handler(event) {
		const domElements = element.querySelectorAll(selector);
		for (let { target } = event; target && target !== this; target = target.parentNode) for (const domElement of domElements) {
			if (domElement !== target) continue;
			const tremplinEvent = hydrateObj(event, { delegateTarget: target });
			if (isCustomMouseEvent && isMouseEventWithinTarget(tremplinEvent)) return;
			if (handler.oneOff) EventHandler.off(element, handlerTypeEvent, selector, fn);
			return fn.apply(target, [tremplinEvent]);
		}
	};
}
function findHandler(events, callable, handlerTypeEvent, delegationSelector = null) {
	return Object.values(events).find((event) => event.callable === callable && event.handlerTypeEvent === handlerTypeEvent && event.delegationSelector === delegationSelector);
}
function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
	const isDelegated = typeof handler === "string";
	const callable = isDelegated ? delegationFunction : handler || delegationFunction;
	const baseTypeEvent = originalTypeEvent.replace(stripNameRegex, "");
	let typeEvent = customEvents[baseTypeEvent] || baseTypeEvent;
	if (!nativeEvents.has(typeEvent)) typeEvent = originalTypeEvent;
	const handlerTypeEvent = baseTypeEvent in customEvents ? baseTypeEvent : typeEvent;
	return {
		isDelegated,
		callable,
		typeEvent,
		handlerTypeEvent
	};
}
function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
	if (typeof originalTypeEvent !== "string" || !element) return;
	const { isDelegated, callable, typeEvent, handlerTypeEvent } = normalizeParameters(originalTypeEvent, handler, delegationFunction);
	const events = getElementEvents(element);
	const handlers = events[typeEvent] || (events[typeEvent] = {});
	const previousFunction = findHandler(handlers, callable, handlerTypeEvent, isDelegated ? handler : null);
	if (previousFunction) {
		previousFunction.oneOff = previousFunction.oneOff && oneOff;
		return;
	}
	const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ""));
	const fn = isDelegated ? tremplinDelegationHandler(element, handler, callable, handlerTypeEvent) : tremplinHandler(element, callable, handlerTypeEvent);
	fn.delegationSelector = isDelegated ? handler : null;
	fn.callable = callable;
	fn.handlerTypeEvent = handlerTypeEvent;
	fn.oneOff = oneOff;
	fn.uidEvent = uid;
	handlers[uid] = fn;
	element.addEventListener(typeEvent, fn, isDelegated);
}
function removeHandler(element, events, typeEvent, handler) {
	element.removeEventListener(typeEvent, handler, Boolean(handler.delegationSelector));
	delete events[typeEvent][handler.uidEvent];
}
function removeNamespacedHandlers(element, events, typeEvent, namespace) {
	const storeElementEvent = events[typeEvent] || {};
	for (const [handlerKey, event] of Object.entries(storeElementEvent)) if (handlerKey.includes(namespace)) removeHandler(element, events, typeEvent, event);
}
function trigger(element, event, args) {
	if (typeof event !== "string" || !element) return null;
	const evt = hydrateObj(new Event(event, {
		bubbles: true,
		cancelable: true
	}), args);
	element.dispatchEvent(evt);
	return evt;
}
const EventHandler = {
	on(element, event, handler, delegationFunction) {
		addHandler(element, event, handler, delegationFunction, false);
	},
	one(element, event, handler, delegationFunction) {
		addHandler(element, event, handler, delegationFunction, true);
	},
	off(element, originalTypeEvent, handler, delegationFunction) {
		if (typeof originalTypeEvent !== "string" || !element) return;
		const { isDelegated, callable, typeEvent, handlerTypeEvent } = normalizeParameters(originalTypeEvent, handler, delegationFunction);
		const inNamespace = typeEvent !== originalTypeEvent && handlerTypeEvent !== originalTypeEvent;
		const events = getElementEvents(element);
		const storeElementEvent = events[typeEvent] || {};
		const isNamespace = originalTypeEvent.startsWith(".");
		if (typeof callable !== "undefined") {
			if (!Object.keys(storeElementEvent).length) return;
			const fn = findHandler(storeElementEvent, callable, handlerTypeEvent, isDelegated ? handler : null);
			if (fn) removeHandler(element, events, typeEvent, fn);
			return;
		}
		if (isNamespace) for (const elementEvent of Object.keys(events)) removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
		for (const [keyHandlers, event] of Object.entries(storeElementEvent)) {
			const handlerKey = keyHandlers.replace(stripUidRegex, "");
			if (event.handlerTypeEvent === handlerTypeEvent && (!inNamespace || originalTypeEvent.includes(handlerKey))) removeHandler(element, events, typeEvent, event);
		}
	},
	trigger
};
function hydrateObj(obj, meta = {}) {
	for (const [key, value] of Object.entries(meta)) try {
		obj[key] = value;
	} catch {
		Object.defineProperty(obj, key, {
			configurable: true,
			get() {
				return value;
			}
		});
	}
	return obj;
}
//#endregion
export { EventHandler as default };

//# sourceMappingURL=event-handler.js.map