import D from './d-class';
import { slice } from './vars';
import { isString, isFunction, isPlainObject } from './utils';
import {
  returnFalse,
  compatible,
  findHandlers,
  addEvent,
  removeEvent,
  createProxy
} from './event-utils';

function one(event, selector, data, callback) {
  return this.on(event, selector, data, callback, 1);
}

function on(event, selector, data, callback, one) {
  var autoRemove, delegator, $this = this;
  if (event && !isString(event)) {
    D.each(event, function (type, fn) {
      $this.on(type, selector, data, fn, one);
    });
    return $this;
  }

  if (!isString(selector) && !isFunction(callback) && callback !== false)
    callback = data, data = selector, selector = undefined;
  if (callback === undefined || data === false)
    callback = data, data = undefined;

  if (callback === false) callback = returnFalse;

  return $this.each(function (_, element) {
    if (one) autoRemove = function (e) {
      removeEvent(element, e.type, callback);
      return callback.apply(this, arguments);
    };

    if (selector) delegator = function (e) {
      var evt, match = D(e.target).closest(selector, element).get(0);
      if (match && match !== element) {
        evt = D.extend(createProxy(e), { currentTarget: match, liveFired: element });
        return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)));
      }
    };

    addEvent(element, event, callback, data, selector, delegator || autoRemove);
  });
}

function off(event, selector, callback) {
  var $this = this;
  if (event && !isString(event)) {
    D.each(event, function (type, fn) {
      $this.off(type, selector, fn);
    });
    return $this;
  }

  if (!isString(selector) && !isFunction(callback) && callback !== false)
    callback = selector, selector = undefined;

  if (callback === false) callback = returnFalse;

  return $this.each(function () {
    removeEvent(this, event, callback, selector);
  });
}

function trigger(event, args) {
  event = (isString(event) || isPlainObject(event)) ? D.Event(event) : compatible(event);
  event._args = args;
  return this.each(function () {
    // handle `focus()`, `blur()` by calling them directly
    if (event.type in focus && typeof this[event.type] == 'function') this[event.type]();
    // items in the collection might not be DOM elements
    else if ('dispatchEvent' in this) this.dispatchEvent(event);
    else D(this).triggerHandler(event, args);
  });
}

// triggers event handlers on current element just as if an event occurred,
// doesn't trigger an actual event, doesn't bubble
function triggerHandler(event, args) {
  var e, result;
  this.each(function (i, element) {
    e = createProxy(isString(event) ? D.Event(event) : event);
    e._args = args;
    e.target = element;
    D.each(findHandlers(element, event.type || event), function (i, handler) {
      result = handler.proxy(e);
      if (e.isImmediatePropagationStopped()) return false;
    });
  });
  return result;
}

export {
  one,
  on,
  off,
  trigger,
  triggerHandler
};
