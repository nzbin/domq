import D from './d-class';

var _zid = 1;
function zid(element) {
  return element._zid || (element._zid = _zid++);
}

function isString(obj) {
  return typeof obj == 'string';
}

var returnTrue = function () { return true; },
  returnFalse = function () { return false; },
  eventMethods = {
    preventDefault: 'isDefaultPrevented',
    stopImmediatePropagation: 'isImmediatePropagationStopped',
    stopPropagation: 'isPropagationStopped'
  };

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

export {
  zid,
  isString,
  returnTrue,
  returnFalse,
  compatible
};
