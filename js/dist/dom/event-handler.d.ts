/**
 * --------------------------------------------------------------------------
 * Tremplin dom/event-handler.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */
/**
 * Types
 */
type TremplinEvent = Event & Record<string, any>;
type EventCallable = (this: any, event: TremplinEvent) => any;
declare function trigger(element: EventTarget, event: string, args?: Record<string, unknown>): TremplinEvent;
declare function trigger(element: EventTarget | null, event: string, args?: Record<string, unknown>): TremplinEvent | null;
declare const EventHandler: {
    on(element: EventTarget | null, event: string, handler?: string | EventCallable, delegationFunction?: EventCallable): void;
    one(element: EventTarget | null, event: string, handler?: string | EventCallable, delegationFunction?: EventCallable): void;
    off(element: EventTarget | null, originalTypeEvent: string, handler?: string | EventCallable, delegationFunction?: EventCallable): void;
    trigger: typeof trigger;
};
export default EventHandler;
export type { TremplinEvent, EventCallable };
//# sourceMappingURL=event-handler.d.ts.map