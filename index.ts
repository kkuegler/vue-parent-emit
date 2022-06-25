import type Vue from 'vue';

// make EventCallback<string|number> = (x:string|number) => void instead of = ((x: string) => void) | ((x: number) => void)
// see https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
type EventCallback<T = unknown> = [T] extends [undefined] ? () => void : (x: T) => void;

type GenericSource<T> = ((this: Vue, eventListener: EventCallback<T>) => void) & {
	addListener: (eventListener: EventCallback<T>) => void;
	removeListener: (eventListener: EventCallback<T>) => void;
	emit(data: T): void;
};
export type EventSource<T> = undefined extends T ? GenericSource<T> & { emit(): void; } : GenericSource<T>;

/**
 * Creates a registry for a single event kind.
 *
 * @returns A function, that should be passed as a prop to the child component. Has an 'emit()' property that can be
 * used to fire the event in the parent. The child should call "this.eventPropFromParent(this.myCallback)" in mounted()
 * to register an event callback.
 */
export function newEventSource<T>(): EventSource<T> {
	const callbacks: EventCallback<T>[] = [];
	function addListener(cb: EventCallback<T>) {
		callbacks.push(cb);
	}
	function removeListener(cb: EventCallback<T>) {
		const index = callbacks.indexOf(cb);
		if (index !== -1) {
			callbacks.splice(index, 1);
		}
	}

	const result = function (this: Vue /*the child Vue instance*/, cb: EventCallback<T>) {
		addListener(cb);
		this.$once('hook:beforeDestroy', () => {
			removeListener(cb);
		});
	};

	// aka Object.assign(result, ...);
	result.emit = function (data: T) {
		callbacks.forEach((cb) => cb(data));
	};
	result.addListener = addListener;
	result.removeListener = removeListener;
	return result as EventSource<T>;
}
