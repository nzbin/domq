import D from './d-class';
import { document, contains } from './vars';

var _zid = 1,
  handlers = {},
  focusinSupported = 'onfocusin' in window,
  focus = { focus: 'focusin', blur: 'focusout' },
  hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' },
  ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
  returnTrue = function () { return true; },
  returnFalse = function () { return false; },
  eventMethods = {
    preventDefault: 'isDefaultPrevented',
    stopImmediatePropagation: 'isImmediatePropagationStopped',
    stopPropagation: 'isPropagationStopped'
  };

function zid(element) {
  return element._zid || (element._zid = _zid++);
}

function compatible(event, source) {
  if (source || !event.isDefaultPrevented) {
    source || (source = event);

    D.each(eventMethods, function (name, predicate) {
      var sourceMethod = source[name];
      event[name] = function () {
        this[predicate] = returnTrue;
        return sourceMethod && sourceMethod.apply(source, arguments);
      };
      event[predicate] = returnFalse;
    });

    try {
      event.timeStamp || (event.timeStamp = Date.now());
    } catch (ignored) {
      console.warn(ignored);
    }

    if (source.defaultPrevented !== undefined ? source.defaultPrevented :
      'returnValue' in source ? source.returnValue === false :
        source.getPreventDefault && source.getPreventDefault())
      event.isDefaultPrevented = returnTrue;
  }
  return event;
}

function parse(event) {
  var parts = ('' + event).split('.');
  return { e: parts[0], ns: parts.slice(1).sort().join(' ') };
}

function matcherFor(ns) {
  return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
}

function findHandlers(element, event, fn, selector) {
  event = parse(event);
  if (event.ns) var matcher = matcherFor(event.ns);
  return (handlers[zid(element)] || []).filter(function (handler) {
    return handler
      && (!event.e || handler.e == event.e)
      && (!event.ns || matcher.test(handler.ns))
      && (!fn || zid(handler.fn) === zid(fn))
      && (!selector || handler.sel == selector);
  });
}

function eventCapture(handler, captureSetting) {
  return handler.del &&
    (!focusinSupported && (handler.e in focus)) ||
    !!captureSetting;
}

function realEvent(type) {
  return hover[type] || (focusinSupported && focus[type]) || type;
}

function addEvent(element, events, fn, data, selector, delegator, capture) {
  var id = zid(element), set = (handlers[id] || (handlers[id] = []));
  events.split(/\s/).forEach(function (event) {
    if (event == 'ready') return D(document).ready(fn);
    var handler = parse(event);
    handler.fn = fn;
    handler.sel = selector;
    // emulate mouseenter, mouseleave
    if (handler.e in hover) fn = function (e) {
      var related = e.relatedTarget;
      if (!related || (related !== this && !contains(this, related)))
        return handler.fn.apply(this, arguments);
    };
    handler.del = delegator;
    var callback = delegator || fn;
    handler.proxy = function (e) {
      e = compatible(e);
      if (e.isImmediatePropagationStopped()) return;
      e.data = data;
      var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args));
      if (result === false) e.preventDefault(), e.stopPropagation();
      return result;
    };
    handler.i = set.length;
    set.push(handler);
    if ('addEventListener' in element)
      element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
  });
}

function removeEvent(element, events, fn, selector, capture) {
  var id = zid(element);
  (events || '').split(/\s/).forEach(function (event) {
    findHandlers(element, event, fn, selector).forEach(function (handler) {
      delete handlers[id][handler.i];
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
    });
  });
}

function createProxy(event) {
  var key, proxy = { originalEvent: event };
  for (key in event)
    if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key];

  return compatible(proxy, event);
}

export {
  handlers,
  zid,
  returnTrue,
  returnFalse,
  compatible,
  parse,
  matcherFor,
  findHandlers,
  eventCapture,
  realEvent,
  addEvent,
  removeEvent,
  createProxy
};
