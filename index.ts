import type Vue from 'vue';

type EventCallback<T = unknown> = (x: T) => void;

export type EventSource<T> = ((this: Vue, cb: EventCallback<T>) => void) & {
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
	return result;
}
