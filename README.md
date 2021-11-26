# vue-parent-emit

Trigger events from a parent Vue 2 component to one or more child components.

## Description

This small library provides an intentionally limited event bus. It allows parents to emit events and children to listen for these events in a local, understandable manner.

## Installation

```bash
npm install vue-parent-emit@git://github.com/kkuegler/vue-parent-emit.git#main
```

## Usage

Create an event source using `newEventSource()` in the parent and pass it as a prop (e.g. `:onMyEvent="myEventSource"`) to the child. In the child's `mounted()` method, use the event source as a method to pass in the event listener (e.g. `this.onMyEvent(this.fetchSomeData)`). Now your event listener is set up.

You can emit events from the parent like `myEventSource.emit('hello child!')`.

Triggering actions, like re-fetching child data is a very good use-case for this mechanism. It is not (primarily) intended to pass data to the child. Props can do that just fine.

## Example

### Parent Component

```js
// parent-component.vue
<template>
  <div>
    <ChildComponent :onMyEvent="myEventSource" other-prop="hello" />
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
import { newEventSource } from 'vue-parent-emit';

export default Vue.extend({
  // ...
  props: {
    // ...
    onMyEvent: Function, // TS: as PropType<EventSource<MyEventPayload>>
  },
  mounted() {
    // register child event listener
    // automatically unregisters when this Vue instance is destroyed
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

## Advanced Uses

### Multiple Event Kinds

You can use a single event source for multiple kinds of events by passing in different paylods (`this.myEventSource.emit('event-a')` and `this.myEventSource.emit('event-b')`) and dispatch them according to the payload in the child component.

We however recommend to create multiple event sources instead. You will need to pass multiple props, but both emitting and handling the events is easier to understand this way.
