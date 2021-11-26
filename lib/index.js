"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newEventSource = void 0;
/**
 * Creates a registry for a single event kind.
 *
 * @returns A function, that should be passed as a prop to the child component. Has an 'emit()' property that can be
 * used to fire the event in the parent. The child should call "this.eventPropFromParent(this.myCallback)" in mounted()
 * to register an event callback.
 */
function newEventSource() {
    var callbacks = [];
    function addListener(cb) {
        callbacks.push(cb);
    }
    function removeListener(cb) {
        var index = callbacks.indexOf(cb);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }
    var result = function (cb) {
        addListener(cb);
        this.$once('hook:beforeDestroy', function () {
            removeListener(cb);
        });
    };
    // aka Object.assign(result, ...);
    result.emit = function (data) {
        callbacks.forEach(function (cb) { return cb(data); });
    };
    result.addListener = addListener;
    result.removeListener = removeListener;
    return result;
}
exports.newEventSource = newEventSource;
//# sourceMappingURL=index.js.map