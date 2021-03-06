# vue-parent-emit <a href="https://www.npmjs.com/package/vue-parent-emit"><img src="https://badgen.net/npm/v/vue-parent-emit"></a> <img src="https://badgen.net/npm/types/vue-parent-emit">

Trigger events from a parent Vue 2 component to one or more child components.

There is also a [Vue 3 version](https://github.com/kkuegler/vue-parent-emit/tree/vue-3) of this library.

## Description

This small library provides an intentionally limited event bus. It allows parents to emit events and children to listen for these events in a local, understandable manner.

## Installation

```bash
npm install vue-parent-emit
```

## Usage

- Parent Component
  - Create an event source using `newEventSource()`
  - Pass as prop to child (e.g. `:on-my-event="myEventSource"`)
- Child Component
  - in `mounted()`: `this.onMyEvent(this.fetchSomeData)` Call this event source as a function, pass in an event listener
- Somewhere in parent
  - emit events using e.g. `myEventSource.emit('hello child!')`
  - call `emit()` without a parameter, or use a single parameter to pass arbitrary data to the event listener(s)

See [Usage Notes](#usage-notes) for further discussion.

## Example

Also see a [live sandbox example](https://codesandbox.io/s/vue-parent-emit-example-l95qe)

### Parent Component

```js
// parent-component.vue
<template>
  <div>
    <ChildComponent :on-my-event="myEventSource" other-prop="hello" />
    <button @click="sendEvent">Notify child</button>
  </div>
</template>
<script>
import { newEventSource } from 'vue-parent-emit';

export default Vue.extend({
  // ...
  data() {
    return {
      // ...
      myEventSource: newEventSource(), // TS: newEventSource<MyEventPayload>()
    };
  },
  methods: {
    sendEvent() {
      // use this anywhere in the parent component
      this.myEventSource.emit();
      // or this.myEventSource.emit(someEventPayload)
    },
  },
});
</script>
```

### Child Component

```js
// child-component.vue
<template>
  <!-- child template -->
</template>
<script>
export default Vue.extend({
  // ...
  props: {
    // ...
    onMyEvent: Function, // TS: as PropType<EventSource<MyEventPayload>>
  },
  mounted() {
    // register child event listener
    // automatically unregisters when this child component instance is destroyed
    this.onMyEvent(this.fetchSomeData);
  },
  methods: {
    fetchSomeData(eventPayload /*TS: :MyEventData*/) {
      // handle the event received from the parent, e.g.:
      console.log('child: fetching new data', eventPayload);
      this.myData = 'fetching ...';
    },
  },
});
</script>
```

## Usage Notes

### Events don't replace props

Triggering actions, like re-fetching child data is a very good use-case for this mechanism. It is not (primarily) intended to pass data to the child. Props can do that just fine.

Most of the time you should not need an event payload at all.

### Multiple event kinds

You can use a single event source for multiple kinds of events by passing in different payloads (`this.myEventSource.emit('foo-event')` and `this.myEventSource.emit('bar-event')`) and dispatch them according to the payload in the child component.

We however recommend to create multiple specific event sources instead. You will need to pass multiple props, but both emitting and handling the events is easier to understand this way. As an example, you could create two separate event sources and just invoke `this.fooEvent.emit()` or  `this.barEvent.emit()` respectively.
