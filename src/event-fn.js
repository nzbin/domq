import D from './d-class';
import { document, slice } from './vars';
import { isFunction } from './utils';
import { isString, zid, compatible } from './event-utils';

// Event
var specialEvents = {
  click: 'MouseEvents',
  mousedown: 'MouseEvents',
  mouseup: 'MouseEvents',
  mousemove: 'MouseEvents',
};

var Event = function (type, props) {
  if (!isString(type)) props = type, type = props.type;
  var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true;
  if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name]);
  event.initEvent(type, bubbles, true);
  return compatible(event);
};

var proxy = function (fn, context) {
  var args = (2 in arguments) && slice.call(arguments, 2);
  if (isFunction(fn)) {
    var proxyFn = function () { return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments); };
    proxyFn._zid = zid(fn);
    return proxyFn;
  } else if (isString(context)) {
    if (args) {
      args.unshift(fn[context], fn);
      return D.proxy.apply(null, args);
    } else {
      return D.proxy(fn[context], fn);
    }
  } else {
    throw new TypeError('expected function');
  }
};

export {
  Event,
  proxy
};
