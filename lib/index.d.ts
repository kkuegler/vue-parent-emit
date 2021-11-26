import type Vue from 'vue';
declare type EventCallback<T = unknown> = (x: T) => void;
export declare type EventSource<T> = ((this: Vue, cb: EventCallback<T>) => void) & {
    addListener: (cb: EventCallback<T>) => void;
    emit(data: T): void;
    removeListener: (cb: EventCallback<T>) => void;
};
/**
 * Creates a registry for a single event kind.
 *
 * @returns A function, that should be passed as a prop to the child component. Has an 'emit()' property that can be
 * used to fire the event in the parent. The child should call "this.eventPropFromParent(this.myCallback)" in mounted()
 * to register an event callback.
 */
export declare function newEventSource<T>(): EventSource<T>;
export {};
