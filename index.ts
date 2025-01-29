import { onMounted, onBeforeUnmount, getCurrentScope } from 'vue'

// make EventCallback<string|number> = (x:string|number) => void instead of = ((x: string) => void) | ((x: number) => void)
// see https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
type EventCallback<T = unknown> = [T] extends [undefined] ? () => void : (x: T) => void;

type GenericSource<T> = {
	addListener(eventListener: EventCallback<T>): void;
	removeListener(eventListener: EventCallback<T>): void;
	removeListeners(): void;
	emit(data: T): void;
};
export type EventSource<T> = undefined extends T ? GenericSource<T> & { emit(): void } : GenericSource<T>;

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
	function removeListeners() {
		callbacks.splice(0, callbacks.length);
	}

	return {
		emit(data: T) {
			callbacks.forEach((cb) => cb(data));
		},
		addListener,
		removeListener,
		removeListeners,
	} as EventSource<T>;
}
