import { onMounted, onBeforeUnmount, getCurrentScope } from 'vue'

type EventCallback<T = unknown> = (x: T) => void;

export type EventSource<T> = {
	addListener: (eventListener: EventCallback<T>) => void;
	removeListener: (eventListener: EventCallback<T>) => void;
	emit(data: T): void;
};

export function useExternalEvent<T>(eventRegistry: EventSource<T>, eventListener: EventCallback<T>) {
	if (!getCurrentScope()) {
		throw new Error("useExternalEvent() must be called from a setup() method - i.e. with the Composition API.\n"
			+ "See https://github.com/kkuegler/vue-parent-emit/tree/vue-3#child-component-traditional-options-api for an Options API approach.");
	}
	onMounted(() => {
		eventRegistry.addListener(eventListener);
	})
	onBeforeUnmount(() => {
		eventRegistry.removeListener(eventListener);
	})
}

/**
 * Creates a registry for a single event kind.
 *
 * @returns An object, that should be passed as a prop to the child component. Has an 'emit()' property that can be
 * used to fire the event from the parent. The child should call "useExternalEvent(eventPropFromParent, myCallback)" 
 * in the setup function to register an event callback.
 */
export function newEventSource<T>(): EventSource<T> {
	const callbacks: EventCallback<T>[] = [];
	function addListener(eventListener: EventCallback<T>) {
		callbacks.push(eventListener);
	}
	function removeListener(eventListener: EventCallback<T>) {
		const index = callbacks.indexOf(eventListener);
		if (index !== -1) {
			callbacks.splice(index, 1);
		}
	}

	return {
		emit(data: T) {
			callbacks.forEach((cb) => cb(data));
		},
		addListener,
		removeListener,
	};
}