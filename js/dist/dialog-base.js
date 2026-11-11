/*!
* Tremplin dialog-base.js v0.8.0-beta.0 (https://gettremplin.com)
* Copyright (c) 2026 Devciel
* Copyright (c) 2011-2026 The Bootstrap Authors
* Licensed under MIT. See LICENSE and THIRD_PARTY_NOTICES.txt.
*/
import BaseComponent from "./base-component.js";
import Data from "./dom/data.js";
import EventHandler from "./dom/event-handler.js";
import SelectorEngine from "./dom/selector-engine.js";
import { lockScroll, unlockScroll } from "./util/scroll-lock.js";
//#region src/js/dialog-base.ts
/**
* --------------------------------------------------------------------------
* Tremplin dialog-base.ts
* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
* --------------------------------------------------------------------------
*/
/**
* Class definition
*
* Shared base class for Dialog and Drawer components that use
* the native <dialog> element. Provides common behavior for:
* - Show/hide/toggle lifecycle with events
* - Opening/closing via showModal()/show()/close()
* - Escape key handling (modal and non-modal)
* - Backdrop click handling
* - Static backdrop transition ("bounce")
* - Body scroll prevention
* - Transition coordination
* - Child component cleanup (tooltips, popovers, toasts)
*/
var DialogBase = class extends BaseComponent {
	constructor(element, config) {
		super(element, config);
		this._isTransitioning = false;
		this._openedAsModal = false;
		this._addDialogListeners();
	}
	static get NAME() {
		return "dialogbase";
	}
	toggle(relatedTarget) {
		return this._element.open ? this.hide() : this.show(relatedTarget);
	}
	async show(relatedTarget) {
		if (!this._canShow(relatedTarget)) return;
		await this._show(relatedTarget);
	}
	async hide() {
		if (!this._canHide()) return;
		await this._hide();
	}
	_canShow(relatedTarget) {
		if (this._element.open || this._isTransitioning) return false;
		return !EventHandler.trigger(this._element, this.constructor.eventName("show"), { relatedTarget }).defaultPrevented;
	}
	async _show(relatedTarget) {
		this._isTransitioning = true;
		this._onBeforeShow();
		const { modal, preventBodyScroll } = this._getShowOptions();
		this._showElement({
			modal,
			preventBodyScroll
		});
		await this._queueCallback(() => {
			this._isTransitioning = false;
			EventHandler.trigger(this._element, this.constructor.eventName("shown"), { relatedTarget });
		}, this._element, this._isAnimated());
	}
	_canHide() {
		if (!this._element.open || this._isTransitioning) return false;
		return !EventHandler.trigger(this._element, this.constructor.eventName("hide")).defaultPrevented;
	}
	async _hide() {
		this._isTransitioning = true;
		this._hideElement();
		await this._queueCallback(() => {
			this._closeAndCleanup();
			this._element.classList.remove("hiding");
			this._onAfterHide();
			this._isTransitioning = false;
			EventHandler.trigger(this._element, this.constructor.eventName("hidden"));
		}, this._element, this._isAnimated());
	}
	dispose() {
		if (this._element.open) this._closeAndCleanup();
		unlockScroll(this._element);
		this._element.classList.remove("hiding");
		EventHandler.off(this._element, "cancel", this._cancelHandler);
		EventHandler.off(this._element, "close", this._closeHandler);
		super.dispose();
	}
	_getShowOptions() {
		return {
			modal: true,
			preventBodyScroll: true
		};
	}
	_onBeforeShow() {}
	_onAfterHide() {}
	_isAnimated() {
		return !this._element.classList.contains(this._getInstantClassName());
	}
	_getInstantClassName() {
		return "dialog-instant";
	}
	_getStaticClassName() {
		return "dialog-static";
	}
	_onCancel() {}
	_showElement({ modal = true, preventBodyScroll = true } = {}) {
		this._openedAsModal = modal;
		if (modal) this._element.showModal();
		else this._element.show();
		if (preventBodyScroll) lockScroll(this._element);
	}
	_hideElement() {
		this._hideChildComponents();
		this._element.classList.add("hiding");
		if (!this._shouldDeferClose()) this._closeAndCleanup();
	}
	_closeAndCleanup() {
		this._element.close();
		this._openedAsModal = false;
		unlockScroll(this._element);
	}
	_shouldDeferClose() {
		return false;
	}
	_triggerBackdropTransition() {
		if (EventHandler.trigger(this._element, this.constructor.eventName("hidePrevented")).defaultPrevented) return;
		const staticClass = this._getStaticClassName();
		this._element.classList.add(staticClass);
		this._queueCallback(() => {
			this._element.classList.remove(staticClass);
		}, this._element);
	}
	_hideChildComponents() {
		for (const el of SelectorEngine.find("[data-trm-toggle=\"tooltip\"], [data-trm-toggle=\"popover\"]", this._element)) {
			const instance = Data.get(el, `trm.${el.getAttribute("data-trm-toggle")}`);
			if (instance && typeof instance.hide === "function") instance.hide();
		}
		for (const el of SelectorEngine.find(".toast.show", this._element)) {
			const instance = Data.get(el, "trm.toast");
			if (instance && typeof instance.hide === "function") instance.hide();
		}
	}
	_addDialogListeners() {
		const eventKey = this.constructor.EVENT_KEY;
		this._closeHandler = () => {
			if (!this._element.open) {
				this._openedAsModal = false;
				unlockScroll(this._element);
			}
		};
		EventHandler.on(this._element, "close", this._closeHandler);
		this._cancelHandler = (event) => {
			event.preventDefault();
			if (!this._config.keyboard) {
				this._triggerBackdropTransition();
				return;
			}
			this._onCancel();
			this.hide();
		};
		EventHandler.on(this._element, "cancel", this._cancelHandler);
		EventHandler.on(this._element, `keydown${eventKey}`, (event) => {
			if (event.key !== "Escape" || this._openedAsModal) return;
			event.preventDefault();
			if (!this._config.keyboard) return;
			this._onCancel();
			this.hide();
		});
		EventHandler.on(this._element, `click${eventKey}`, (event) => {
			if (event.target !== this._element || !this._openedAsModal) return;
			if (this._config.backdrop === false) return;
			if (this._config.backdrop === "static") {
				this._triggerBackdropTransition();
				return;
			}
			this.hide();
		});
	}
};
//#endregion
export { DialogBase as default };

//# sourceMappingURL=dialog-base.js.map