
/*!
 * domq.js - v0.6.7
 * A modular DOM manipulation library.
 * https://github.com/nzbin/domq#readme
 *
 * Copyright (c) 2018 nzbin
 * Released under MIT License
 */

// Class D
var D = function D(selector, context) {
  return new D.fn.init(selector, context);
};

var document = window.document,
    emptyArray = [],
    concat = emptyArray.concat,
    filter = emptyArray.filter,
    slice = emptyArray.slice,
    elementDisplay = {},
    classCache = {},
    cssNumber = {
  'column-count': 1,
  'columns': 1,
  'font-weight': 1,
  'line-height': 1,
  'opacity': 1,
  'z-index': 1,
  'zoom': 1
},
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    // special attributes that should be get/set via method calls
methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
  'tr': document.createElement('tbody'),
  'tbody': table,
  'thead': table,
  'tfoot': table,
  'td': tableRow,
  'th': tableRow,
  '*': document.createElement('div')
},
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    tempParent = document.createElement('div'),
    propMap = {
  'tabindex': 'tabIndex',
  'readonly': 'readOnly',
  'for': 'htmlFor',
  'class': 'className',
  'maxlength': 'maxLength',
  'cellspacing': 'cellSpacing',
  'cellpadding': 'cellPadding',
  'rowspan': 'rowSpan',
  'colspan': 'colSpan',
  'usemap': 'useMap',
  'frameborder': 'frameBorder',
  'contenteditable': 'contentEditable'
},
    isArray = Array.isArray || function (arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
},
    contains = document.documentElement.contains ? function (parent, node) {
  return parent !== node && parent.contains(node);
} : function (parent, node) {
  while (node && (node = node.parentNode)) {
    if (node === parent) return true;
  }

  return false;
};

function type(obj) {
  return obj == null ? String(obj) : class2type[toString.call(obj)] || 'object';
}

function isFunction(value) {
  return type(value) == 'function';
}

function isWindow(obj) {
  return obj != null && obj == obj.window;
}

function isDocument(obj) {
  return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
}

function isObject(obj) {
  return type(obj) == 'object';
}

function isPlainObject(obj) {
  return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
}

function likeArray(obj) {
  var length = !!obj && 'length' in obj && obj.length,
      typeRes = type(obj);
  return 'function' != typeRes && !isWindow(obj) && ('array' == typeRes || length === 0 || typeof length == 'number' && length > 0 && length - 1 in obj);
}

function compact(array) {
  return filter.call(array, function (item) {
    return item != null;
  });
}

function dasherize$1(str) {
  return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/_/g, '-').toLowerCase();
}

function maybeAddPx(name, value) {
  return typeof value == 'number' && !cssNumber[dasherize$1(name)] ? value + 'px' : value;
}

function uniq(array) {
  return filter.call(array, function (item, idx) {
    return array.indexOf(item) == idx;
  });
}

function camelize(str) {
  return str.replace(/-+(.)?/g, function (match, chr) {
    return chr ? chr.toUpperCase() : '';
  });
}

function classRE(name) {
  return name in classCache ? classCache[name] : classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)');
}

function defaultDisplay(nodeName) {
  var element, display;

  if (!elementDisplay[nodeName]) {
    element = document.createElement(nodeName);
    document.body.appendChild(element);
    display = getComputedStyle(element, '').getPropertyValue('display');
    element.parentNode.removeChild(element);
    display == 'none' && (display = 'block');
    elementDisplay[nodeName] = display;
  }

  return elementDisplay[nodeName];
}

function flatten(array) {
  return array.length > 0 ? D.fn.concat.apply([], array) : array;
}

function children(element) {
  return 'children' in element ? slice.call(element.children) : D.map(element.childNodes, function (node) {
    if (node.nodeType == 1) return node;
  });
}

function isD(object) {
  return object instanceof D;
}

function filtered(nodes, selector) {
  return selector == null ? D(nodes) : D(nodes).filter(selector);
} // 'true'  => true

function funcArg(context, arg, idx, payload) {
  return isFunction(arg) ? arg.call(context, idx, payload) : arg;
}

function setAttribute(node, name, value) {
  value == null ? node.removeAttribute(name) : node.setAttribute(name, value);
} // access className property while respecting SVGAnimatedString


function className(node, value) {
  var klass = node.className || '',
      svg = klass && klass.baseVal !== undefined;
  if (value === undefined) return svg ? klass.baseVal : klass;
  svg ? klass.baseVal = value : node.className = value;
}

function isEmptyObject(obj) {
  var name;

  for (name in obj) {
    return false;
  }

  return true;
}

function isNumeric(val) {
  var num = Number(val),
      type = typeof val;
  return val != null && type != 'boolean' && (type != 'string' || val.length) && !isNaN(num) && isFinite(num) || false;
}

function inArray(elem, array, i) {
  return emptyArray.indexOf.call(array, elem, i);
}

function trim(str) {
  return str == null ? '' : String.prototype.trim.call(str);
}

D.fn = D.prototype = {
  constuctor: D,
  length: 0,
  // Because a collection acts like an array
  // copy over these useful array functions.
  forEach: emptyArray.forEach,
  reduce: emptyArray.reduce,
  push: emptyArray.push,
  sort: emptyArray.sort,
  splice: emptyArray.splice,
  indexOf: emptyArray.indexOf,
  // D's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  init: function init(selector, context) {
    var dom; // If nothing given, return an empty D collection

    if (!selector) {
      return this;
    } // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim(); // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <

      if (selector[0] == '<' && fragmentRE.test(selector)) {
        dom = D.fragment(selector, RegExp.$1, context);
        selector = null;
      } // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) {
        return D(context).find(selector);
      } // If it's a CSS selector, use it to select nodes.
      else {
        dom = D.qsa(document, selector);
      }
    } // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) {
      return D(document).ready(selector);
    } // If a D collection is given, just return it
    else if (isD(selector)) {
      return selector;
    } // normalize array if an array of nodes is given
    else if (isArray(selector)) {
      dom = compact(selector);
    } // Wrap DOM nodes.
    else if (isObject(selector)) {
      dom = [selector], selector = null;
    } // If there's a context, create a collection on that context first, and select
    // nodes from there
    else if (context !== undefined) {
      return D(context).find(selector);
    } // And last but no least, if it's a CSS selector, use it to select nodes.
    else {
      dom = D.qsa(document, selector);
    } // create a new D collection from the nodes found


    return D.makeArray(dom, selector, this);
  },
  // Modify the collection by adding elements to it
  concat: function concat$1() {
    var i,
        value,
        args = [];

    for (i = 0; i < arguments.length; i++) {
      value = arguments[i];
      args[i] = isD(value) ? value.toArray() : value;
    }

    return concat.apply(isD(this) ? this.toArray() : this, args);
  },
  // `pluck` is borrowed from Prototype.js
  pluck: function pluck(property) {
    return D.map(this, function (el) {
      return el[property];
    });
  },
  toArray: function toArray() {
    return this.get();
  },
  get: function get(idx) {
    return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length];
  },
  size: function size() {
    return this.length;
  },
  each: function each(callback) {
    emptyArray.every.call(this, function (el, idx) {
      return callback.call(el, idx, el) !== false;
    });
    return this;
  },
  map: function map(fn) {
    return D(D.map(this, function (el, i) {
      return fn.call(el, i, el);
    }));
  },
  slice: function slice$1() {
    return D(slice.apply(this, arguments));
  },
  first: function first() {
    var el = this[0];
    return el && !isObject(el) ? el : D(el);
  },
  last: function last() {
    var el = this[this.length - 1];
    return el && !isObject(el) ? el : D(el);
  },
  eq: function eq(idx) {
    return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1);
  }
};

D.extend = D.fn.extend = function () {
  var options,
      name,
      src,
      copy,
      copyIsArray,
      clone,
      target = arguments[0] || {},
      i = 1,
      length = arguments.length,
      deep = false; // Handle a deep copy situation

  if (typeof target === 'boolean') {
    deep = target; // Skip the boolean and the target

    target = arguments[i] || {};
    i++;
  } // Handle case when target is a string or something (possible in deep copy)


  if (typeof target !== 'object' && !isFunction(target)) {
    target = {};
  } // Extend D itself if only one argument is passed


  if (i === length) {
    target = this;
    i--;
  }

  for (; i < length; i++) {
    // Only deal with non-null/undefined values
    if ((options = arguments[i]) != null) {
      // Extend the base object
      for (name in options) {
        src = target[name];
        copy = options[name]; // Prevent never-ending loop

        if (target === copy) {
          continue;
        } // Recurse if we're merging plain objects or arrays


        if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
          if (copyIsArray) {
            copyIsArray = false;
            clone = src && isArray(src) ? src : [];
          } else {
            clone = src && isPlainObject(src) ? src : {};
          } // Never move original objects, clone them


          target[name] = D.extend(deep, clone, copy); // Don't bring in undefined values
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  } // Return the modified object


  return target;
};

D.extend({
  // Make DOM Array
  makeArray: function makeArray(dom, selector, me) {
    var i,
        len = dom ? dom.length : 0;

    for (i = 0; i < len; i++) {
      me[i] = dom[i];
    }

    me.length = len;
    me.selector = selector || '';
    return me;
  },
  // D's CSS selector
  qsa: function qsa(element, selector) {
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        // Ensure that a 1 char tag name still gets checked
    nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
        isSimple = simpleSelectorRE.test(nameOnly);
    return (// Safari DocumentFragment doesn't have getElementById
      element.getElementById && isSimple && maybeID ? (found = element.getElementById(nameOnly)) ? [found] : [] : element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11 ? [] : slice.call( // DocumentFragment doesn't have getElementsByClassName/TagName
      isSimple && !maybeID && element.getElementsByClassName ? maybeClass // If it's simple, it could be a class
      ? element.getElementsByClassName(nameOnly) // Or a tag
      : element.getElementsByTagName(selector) // Or it's not simple, and we need to query all
      : element.querySelectorAll(selector))
    );
  },
  // Html -> Node
  fragment: function fragment(html, name, properties) {
    var dom, nodes, container; // A special case optimization for a single tag

    if (singleTagRE.test(html)) dom = D(document.createElement(RegExp.$1));

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, '<$1></$2>');
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1;
      if (!(name in containers)) name = '*';
      container = containers[name];
      container.innerHTML = '' + html;
      dom = D.each(slice.call(container.childNodes), function () {
        container.removeChild(this);
      });
    }

    if (isPlainObject(properties)) {
      nodes = D(dom);
      D.each(properties, function (key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value);else nodes.attr(key, value);
      });
    }

    return dom;
  },
  matches: function matches(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false;
    var matchesSelector = element.matches || element.webkitMatchesSelector || element.mozMatchesSelector || element.oMatchesSelector || element.matchesSelector;
    if (matchesSelector) return matchesSelector.call(element, selector); // fall back to performing a selector:

    var match,
        parent = element.parentNode,
        temp = !parent;
    if (temp) (parent = tempParent).appendChild(element);
    match = ~D.qsa(parent, selector).indexOf(element);
    temp && tempParent.removeChild(element);
    return match;
  },
  each: function each(elements, callback) {
    var i, key;

    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++) {
        if (callback.call(elements[i], i, elements[i]) === false) return elements;
      }
    } else {
      for (key in elements) {
        if (callback.call(elements[key], key, elements[key]) === false) return elements;
      }
    }

    return elements;
  },
  map: function map(elements, callback) {
    var value,
        values = [],
        i,
        key;
    if (likeArray(elements)) for (i = 0; i < elements.length; i++) {
      value = callback(elements[i], i);
      if (value != null) values.push(value);
    } else for (key in elements) {
      value = callback(elements[key], key);
      if (value != null) values.push(value);
    }
    return flatten(values);
  }
}); // Populate the class2type map

D.each('Boolean Number String Function Array Date RegExp Object Error'.split(' '), function (i, name) {
  class2type['[object ' + name + ']'] = name.toLowerCase();
});
D.fn.init.prototype = D.fn; // Export Static

function grep(elements, callback) {
  return filter.call(elements, callback);
}

function noop() {}

function css(property, value) {
  if (arguments.length < 2) {
    var element = this[0];

    if (typeof property == 'string') {
      if (!element) return;
      return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property);
    } else if (isArray(property)) {
      if (!element) return;
      var props = {};
      var computedStyle = getComputedStyle(element, '');
      D.each(property, function (_, prop) {
        props[prop] = element.style[camelize(prop)] || computedStyle.getPropertyValue(prop);
      });
      return props;
    }
  }

  var css = '';

  if (type(property) == 'string') {
    if (!value && value !== 0) {
      this.each(function () {
        this.style.removeProperty(dasherize$1(property));
      });
    } else {
      css = dasherize$1(property) + ':' + maybeAddPx(property, value);
    }
  } else {
    for (var key in property) {
      if (!property[key] && property[key] !== 0) {
        this.each(function () {
          this.style.removeProperty(dasherize$1(key));
        });
      } else {
        css += dasherize$1(key) + ':' + maybeAddPx(key, property[key]) + ';';
      }
    }
  }

  return this.each(function () {
    this.style.cssText += ';' + css;
  });
}

function hasClass(name) {
  if (!name) return false;
  return emptyArray.some.call(this, function (el) {
    return this.test(className(el));
  }, classRE(name));
}

function addClass(name) {
  var classList = [];
  if (!name) return this;
  return this.each(function (idx) {
    if (!('className' in this)) return;
    classList = [];
    var cls = className(this),
        newName = funcArg(this, name, idx, cls);
    newName.split(/\s+/g).forEach(function (klass) {
      if (!D(this).hasClass(klass)) classList.push(klass);
    }, this);
    classList.length && className(this, cls + (cls ? ' ' : '') + classList.join(' '));
  });
}

function removeClass(name) {
  var classList = [];
  return this.each(function (idx) {
    if (!('className' in this)) return;
    if (name === undefined) return className(this, '');
    classList = className(this);
    funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
      classList = classList.replace(classRE(klass), ' ');
    });
    className(this, classList.trim());
  });
}

function toggleClass(name, when) {
  if (!name) return this;
  return this.each(function (idx) {
    var $this = D(this),
        names = funcArg(this, name, idx, className(this));
    names.split(/\s+/g).forEach(function (klass) {
      (when === undefined ? !$this.hasClass(klass) : when) ? $this.addClass(klass) : $this.removeClass(klass);
    });
  });
}

function offset(coordinates) {
  if (coordinates) return this.each(function (index) {
    var $this = D(this),
        coords = funcArg(this, coordinates, index, $this.offset()),
        parentOffset = $this.offsetParent().offset(),
        props = {
      top: coords.top - parentOffset.top,
      left: coords.left - parentOffset.left
    };
    if ($this.css('position') == 'static') props['position'] = 'relative';
    $this.css(props);
  });
  if (!this.length) return null;
  if (document.documentElement !== this[0] && !contains(document.documentElement, this[0])) return {
    top: 0,
    left: 0
  };
  var obj = this[0].getBoundingClientRect();
  return {
    left: obj.left + window.pageXOffset,
    top: obj.top + window.pageYOffset,
    width: Math.round(obj.width),
    height: Math.round(obj.height)
  };
}

function position() {
  if (!this.length) return;
  var elem = this[0],
      offset,
      // Get *real* offset parent
  offsetParent = this.offsetParent(),
      parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? {
    top: 0,
    left: 0
  } : offsetParent.offset(); // `position: fixed` elements are offset from the viewport, which itself always has zero offset

  if (D(elem).css('position') === 'fixed') {
    // Assume `position: fixed` implies availability of getBoundingClientRect
    offset = elem.getBoundingClientRect();
  } else {
    offset = this.offset(); // Incorporate borders into its offset, since they are outside its content origin

    parentOffset.top += parseFloat(D(offsetParent[0]).css('border-top-width')) || 0;
    parentOffset.left += parseFloat(D(offsetParent[0]).css('border-left-width')) || 0;
  } // Subtract parent offsets and element margins
  // note: when an element has `margin: auto` the offsetLeft and marginLeft
  // are the same in Safari causing `offset.left` to incorrectly be 0


  return {
    top: offset.top - parentOffset.top - parseFloat(D(elem).css('margin-top')) || 0,
    left: offset.left - parentOffset.left - parseFloat(D(elem).css('margin-left')) || 0
  };
}

function scrollTop(value) {
  if (!this.length) return;
  var hasScrollTop = ('scrollTop' in this[0]);
  if (value === undefined) return hasScrollTop ? this[0].scrollTop : isWindow(this[0]) ? this[0].pageYOffset : this[0].defaultView.pageYOffset;
  return this.each(hasScrollTop ? function () {
    this.scrollTop = value;
  } : function () {
    this.scrollTo(this.scrollX, value);
  });
}

function scrollLeft(value) {
  if (!this.length) return;
  var hasScrollLeft = ('scrollLeft' in this[0]);
  if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : isWindow(this[0]) ? this[0].pageXOffset : this[0].defaultView.pageXOffset;
  return this.each(hasScrollLeft ? function () {
    this.scrollLeft = value;
  } : function () {
    this.scrollTo(value, this.scrollY);
  });
}

function offsetParent() {
  return this.map(function () {
    var parent = this.offsetParent || document.body;

    while (parent && !rootNodeRE.test(parent.nodeName) && D(parent).css('position') == 'static') {
      parent = parent.offsetParent;
    }

    return parent;
  });
}

function attr(name, value) {
  var result;
  return typeof name == 'string' && !(1 in arguments) ? 0 in this && this[0].nodeType == 1 && (result = this[0].getAttribute(name)) != null ? result : undefined : this.each(function (idx) {
    if (this.nodeType !== 1) return;
    if (isObject(name)) for (var key in name) {
      setAttribute(this, key, name[key]);
    } else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)));
  });
}

function removeAttr(name) {
  return this.each(function () {
    this.nodeType === 1 && name.split(' ').forEach(function (attribute) {
      setAttribute(this, attribute);
    }, this);
  });
}

function prop(name, value) {
  name = propMap[name] || name;
  return typeof name == 'string' && !(1 in arguments) ? this[0] && this[0][name] : this.each(function (idx) {
    if (isObject(name)) for (var key in name) {
      this[propMap[key] || key] = name[key];
    } else this[name] = funcArg(this, value, idx, this[name]);
  });
}

function removeProp(name) {
  name = propMap[name] || name;
  return this.each(function () {
    delete this[name];
  });
}

function val(value) {
  if (0 in arguments) {
    if (value == null) value = '';
    return this.each(function (idx) {
      this.value = funcArg(this, value, idx, this.value);
    });
  } else {
    return this[0] && (this[0].multiple ? D(this[0]).find('option').filter(function () {
      return this.selected;
    }).pluck('value') : this[0].value);
  }
}

function wrap(structure) {
  var func = isFunction(structure);
  if (this[0] && !func) var dom = D(structure).get(0),
      clone = dom.parentNode || this.length > 1;
  return this.each(function (index) {
    D(this).wrapAll(func ? structure.call(this, index) : clone ? dom.cloneNode(true) : dom);
  });
}

function wrapAll(structure) {
  if (this[0]) {
    D(this[0]).before(structure = D(structure));
    var children; // drill down to the inmost element

    while ((children = structure.children()).length) {
      structure = children.first();
    }

    D(structure).append(this);
  }

  return this;
}

function wrapInner(structure) {
  var func = isFunction(structure);
  return this.each(function (index) {
    var self = D(this),
        contents = self.contents(),
        dom = func ? structure.call(this, index) : structure;
    contents.length ? contents.wrapAll(dom) : self.append(dom);
  });
}

function unwrap() {
  this.parent().each(function () {
    D(this).replaceWith(D(this).children());
  });
  return this;
}

function find(selector) {
  var result,
      $this = this;
  if (!selector) result = D();else if (typeof selector == 'object') result = D(selector).filter(function () {
    var node = this;
    return emptyArray.some.call($this, function (parent) {
      return contains(parent, node);
    });
  });else if (this.length == 1) result = D(D.qsa(this[0], selector));else result = this.map(function () {
    return D.qsa(this, selector);
  });
  return result;
}

function filter$1(selector) {
  if (isFunction(selector)) return this.not(this.not(selector));
  return D(filter.call(this, function (element) {
    return D.matches(element, selector);
  }));
}

function has(selector) {
  return this.filter(function () {
    return isObject(selector) ? contains(this, selector) : D(this).find(selector).size();
  });
}

function not(selector) {
  var nodes = [];
  if (isFunction(selector) && selector.call !== undefined) this.each(function (idx) {
    if (!selector.call(this, idx)) nodes.push(this);
  });else {
    var excludes = typeof selector == 'string' ? this.filter(selector) : likeArray(selector) && isFunction(selector.item) ? slice.call(selector) : D(selector);
    this.forEach(function (el) {
      if (excludes.indexOf(el) < 0) nodes.push(el);
    });
  }
  return D(nodes);
}

function is(selector) {
  return typeof selector == 'string' ? this.length > 0 && D.matches(this[0], selector) : selector && this.selector == selector.selector;
}

function add$1(selector, context) {
  return D(uniq(this.concat(D(selector, context))));
}

function contents() {
  return this.map(function () {
    return this.contentDocument || slice.call(this.childNodes);
  });
}

function closest(selector, context) {
  var nodes = [],
      collection = typeof selector == 'object' && D(selector);
  this.each(function (_, node) {
    while (node && !(collection ? collection.indexOf(node) >= 0 : D.matches(node, selector))) {
      node = node !== context && !isDocument(node) && node.parentNode;
    }

    if (node && nodes.indexOf(node) < 0) nodes.push(node);
  });
  return D(nodes);
}

function parents(selector) {
  var ancestors = [],
      nodes = this;

  while (nodes.length > 0) {
    nodes = D.map(nodes, function (node) {
      if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
        ancestors.push(node);
        return node;
      }
    });
  }

  return filtered(ancestors, selector);
}

function parent(selector) {
  return filtered(uniq(this.pluck('parentNode')), selector);
}

function children$1(selector) {
  return filtered(this.map(function () {
    return children(this);
  }), selector);
}

function siblings(selector) {
  return filtered(this.map(function (i, el) {
    return filter.call(children(el.parentNode), function (child) {
      return child !== el;
    });
  }), selector);
}

function prev(selector) {
  return D(this.pluck('previousElementSibling')).filter(selector || '*');
}

function next(selector) {
  return D(this.pluck('nextElementSibling')).filter(selector || '*');
}

function index(element) {
  return element ? this.indexOf(D(element)[0]) : this.parent().children().indexOf(this[0]);
}

function isIE() {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf('MSIE ');
  return msie > 0 || !!navigator.userAgent.match(/Trident.*rv:11\./);
}

function subtract(el, dimen) {
  var offsetMap = {
    width: ['padding-left', 'padding-right', 'border-left-width', 'border-right-width'],
    height: ['padding-top', 'padding-bottom', 'border-top-width', 'border-bottom-width']
  };
  return el.css('box-sizing') === 'border-box' && !isIE() ? parseFloat(el.css(dimen)) - parseFloat(el.css(offsetMap[dimen][0])) - parseFloat(el.css(offsetMap[dimen][1])) - parseFloat(el.css(offsetMap[dimen][2])) - parseFloat(el.css(offsetMap[dimen][3])) : parseFloat(el.css(dimen));
}

function calc(dimension, value) {
  var dimensionProperty = dimension.replace(/./, function (m) {
    return m[0].toUpperCase();
  });
  var el = this[0];
  if (value === undefined) return isWindow(el) ? el.document.documentElement['client' + dimensionProperty] : isDocument(el) ? el.documentElement['scroll' + dimensionProperty] : subtract(this, dimension);else return this.each(function (idx) {
    el = D(this);
    el.css(dimension, funcArg(this, value, idx, el[dimension]()));
  });
} // Export


function width(value) {
  return calc.call(this, 'width', value);
}

function height(value) {
  return calc.call(this, 'height', value);
}

var traverseNode = function traverseNode(node, fn) {
  fn(node);

  for (var i = 0, len = node.childNodes.length; i < len; i++) {
    traverseNode(node.childNodes[i], fn);
  }
}; // inside => append, prepend


var domMani = function domMani(elem, args, fn, inside) {
  // arguments can be nodes, arrays of nodes, D objects and HTML strings
  var argType,
      nodes = D.map(args, function (arg) {
    var arr = [];
    argType = type(arg);

    if (argType == 'array') {
      arg.forEach(function (el) {
        if (el.nodeType !== undefined) return arr.push(el);else if (isD(el)) return arr = arr.concat(el.get());
        arr = arr.concat(D.fragment(el));
      });
      return arr;
    }

    return argType == 'object' || arg == null ? arg : D.fragment(arg);
  }),
      parent,
      copyByClone = elem.length > 1;
  if (nodes.length < 1) return elem;
  return elem.each(function (_, target) {
    parent = inside ? target : target.parentNode;
    var parentInDocument = contains(document.documentElement, parent);
    nodes.forEach(function (node) {
      if (copyByClone) node = node.cloneNode(true);else if (!parent) return D(node).remove();
      fn.call(target, node);

      if (parentInDocument) {
        traverseNode(node, function (el) {
          if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' && (!el.type || el.type === 'text/javascript') && !el.src) {
            var target = el.ownerDocument ? el.ownerDocument.defaultView : window;
            target['eval'].call(target, el.innerHTML);
          }
        });
      }
    });
  });
}; // Export


function remove$1() {
  return this.each(function () {
    if (this.parentNode != null) this.parentNode.removeChild(this);
  });
}

function empty() {
  return this.each(function () {
    this.innerHTML = '';
  });
}

function clone() {
  return this.map(function () {
    return this.cloneNode(true);
  });
}

function html(html) {
  return 0 in arguments ? this.each(function (idx) {
    var originHtml = this.innerHTML;
    D(this).empty().append(funcArg(this, html, idx, originHtml));
  }) : 0 in this ? this[0].innerHTML : null;
}

function text(text) {
  return 0 in arguments ? this.each(function (idx) {
    var newText = funcArg(this, text, idx, this.textContent);
    this.textContent = newText == null ? '' : '' + newText;
  }) : 0 in this ? this.pluck('textContent').join('') : null;
}

function replaceWith(newContent) {
  return this.before(newContent).remove();
}

function append() {
  return domMani(this, arguments, function (elem) {
    this.insertBefore(elem, null);
  }, true);
}

function prepend() {
  return domMani(this, arguments, function (elem) {
    this.insertBefore(elem, this.firstChild);
  }, true);
}

function after() {
  return domMani(this, arguments, function (elem) {
    this.parentNode.insertBefore(elem, this.nextSibling);
  }, false);
}

function before() {
  return domMani(this, arguments, function (elem) {
    this.parentNode.insertBefore(elem, this);
  }, false);
} // appendTo -> append
// prependTo -> prepend
// insertBefore -> before
// insertAfter -> after
// replaceAll -> replaceWith


function appendTo(html) {
  D(html)['append'](this);
  return this;
}

function prependTo(html) {
  D(html)['prepend'](this);
  return this;
}

function insertAfter(html) {
  D(html)['after'](this);
  return this;
}

function insertBefore(html) {
  D(html)['before'](this);
  return this;
}

function replaceAll(html) {
  D(html)['replaceWith'](this);
  return this;
}

var _zid = 1;

function zid(element) {
  return element._zid || (element._zid = _zid++);
}

function isString(obj) {
  return typeof obj == 'string';
}

var returnTrue = function returnTrue() {
  return true;
},
    returnFalse = function returnFalse() {
  return false;
},
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

    if (source.defaultPrevented !== undefined ? source.defaultPrevented : 'returnValue' in source ? source.returnValue === false : source.getPreventDefault && source.getPreventDefault()) event.isDefaultPrevented = returnTrue;
  }

  return event;
}

var handlers = {},
    focusinSupported = ('onfocusin' in window),
    focus = {
  focus: 'focusin',
  blur: 'focusout'
},
    hover = {
  mouseenter: 'mouseover',
  mouseleave: 'mouseout'
},
    ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/;

function parse(event) {
  var parts = ('' + event).split('.');
  return {
    e: parts[0],
    ns: parts.slice(1).sort().join(' ')
  };
}

function matcherFor(ns) {
  return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
}

function findHandlers(element, event, fn, selector) {
  event = parse(event);
  if (event.ns) var matcher = matcherFor(event.ns);
  return (handlers[zid(element)] || []).filter(function (handler) {
    return handler && (!event.e || handler.e == event.e) && (!event.ns || matcher.test(handler.ns)) && (!fn || zid(handler.fn) === zid(fn)) && (!selector || handler.sel == selector);
  });
}

function eventCapture(handler, captureSetting) {
  return handler.del && !focusinSupported && handler.e in focus || !!captureSetting;
}

function realEvent(type) {
  return hover[type] || focusinSupported && focus[type] || type;
}

function add(element, events, fn, data, selector, delegator, capture) {
  var id = zid(element),
      set = handlers[id] || (handlers[id] = []);
  events.split(/\s/).forEach(function (event) {
    if (event == 'ready') return D(document).ready(fn);
    var handler = parse(event);
    handler.fn = fn;
    handler.sel = selector; // emulate mouseenter, mouseleave

    if (handler.e in hover) fn = function fn(e) {
      var related = e.relatedTarget;
      if (!related || related !== this && !contains(this, related)) return handler.fn.apply(this, arguments);
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
    if ('addEventListener' in element) element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
  });
}

function remove(element, events, fn, selector, capture) {
  var id = zid(element);
  (events || '').split(/\s/).forEach(function (event) {
    findHandlers(element, event, fn, selector).forEach(function (handler) {
      delete handlers[id][handler.i];
      if ('removeEventListener' in element) element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
    });
  });
}

function createProxy(event) {
  var key,
      proxy = {
    originalEvent: event
  };

  for (key in event) {
    if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key];
  }

  return compatible(proxy, event);
} // D.event = { add: add, remove: remove }
// Export


var one = function one(event, selector, data, callback) {
  return this.on(event, selector, data, callback, 1);
};

var on = function on(event, selector, data, callback, one) {
  var autoRemove,
      delegator,
      $this = this;

  if (event && !isString(event)) {
    D.each(event, function (type, fn) {
      $this.on(type, selector, data, fn, one);
    });
    return $this;
  }

  if (!isString(selector) && !isFunction(callback) && callback !== false) callback = data, data = selector, selector = undefined;
  if (callback === undefined || data === false) callback = data, data = undefined;
  if (callback === false) callback = returnFalse;
  return $this.each(function (_, element) {
    if (one) autoRemove = function autoRemove(e) {
      remove(element, e.type, callback);
      return callback.apply(this, arguments);
    };
    if (selector) delegator = function delegator(e) {
      var evt,
          match = D(e.target).closest(selector, element).get(0);

      if (match && match !== element) {
        evt = D.extend(createProxy(e), {
          currentTarget: match,
          liveFired: element
        });
        return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)));
      }
    };
    add(element, event, callback, data, selector, delegator || autoRemove);
  });
};

var off = function off(event, selector, callback) {
  var $this = this;

  if (event && !isString(event)) {
    D.each(event, function (type, fn) {
      $this.off(type, selector, fn);
    });
    return $this;
  }

  if (!isString(selector) && !isFunction(callback) && callback !== false) callback = selector, selector = undefined;
  if (callback === false) callback = returnFalse;
  return $this.each(function () {
    remove(this, event, callback, selector);
  });
};

var trigger = function trigger(event, args) {
  event = isString(event) || isPlainObject(event) ? D.Event(event) : compatible(event);
  event._args = args;
  return this.each(function () {
    // handle `focus()`, `blur()` by calling them directly
    if (event.type in focus && typeof this[event.type] == 'function') this[event.type](); // items in the collection might not be DOM elements
    else if ('dispatchEvent' in this) this.dispatchEvent(event);else D(this).triggerHandler(event, args);
  });
}; // triggers event handlers on current element just as if an event occurred,
// doesn't trigger an actual event, doesn't bubble


var triggerHandler = function triggerHandler(event, args) {
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
};

var specialEvents = {
  click: 'MouseEvents',
  mousedown: 'MouseEvents',
  mouseup: 'MouseEvents',
  mousemove: 'MouseEvents'
};

var Event = function Event(type, props) {
  if (!isString(type)) props = type, type = props.type;
  var event = document.createEvent(specialEvents[type] || 'Events'),
      bubbles = true;
  if (props) for (var name in props) {
    name == 'bubbles' ? bubbles = !!props[name] : event[name] = props[name];
  }
  event.initEvent(type, bubbles, true);
  return compatible(event);
};

var proxy = function proxy(fn, context) {
  var args = 2 in arguments && slice.call(arguments, 2);

  if (isFunction(fn)) {
    var proxyFn = function proxyFn() {
      return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments);
    };

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

var prefix = '',
    eventPrefix,
    vendors = {
  Webkit: 'webkit',
  Moz: '',
  O: 'o'
},
    testEl = document.createElement('div'),
    testTransitionProperty = testEl.style.transitionProperty;
if (testEl.style.transform === undefined) D.each(vendors, function (vendor, event) {
  if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
    prefix = '-' + vendor.toLowerCase() + '-';
    eventPrefix = event;
    return false;
  }
});
testEl = null;

function normalizeEvent(name) {
  return eventPrefix ? eventPrefix + name : name.toLowerCase();
}

D.fx = {
  off: eventPrefix === undefined && testTransitionProperty === undefined,
  speeds: {
    _default: 400,
    fast: 200,
    slow: 600
  },
  cssPrefix: prefix,
  transitionEnd: normalizeEvent('TransitionEnd'),
  animationEnd: normalizeEvent('AnimationEnd')
};
var supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    transform,
    transitionProperty,
    transitionDuration,
    transitionTiming,
    transitionDelay,
    animationName,
    animationDuration,
    animationTiming,
    animationDelay,
    cssReset = {};

function dasherize(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

transform = prefix + 'transform';
cssReset[transitionProperty = prefix + 'transition-property'] = cssReset[transitionDuration = prefix + 'transition-duration'] = cssReset[transitionDelay = prefix + 'transition-delay'] = cssReset[transitionTiming = prefix + 'transition-timing-function'] = cssReset[animationName = prefix + 'animation-name'] = cssReset[animationDuration = prefix + 'animation-duration'] = cssReset[animationDelay = prefix + 'animation-delay'] = cssReset[animationTiming = prefix + 'animation-timing-function'] = '';

var anim$1 = function anim(properties, duration, ease, callback, delay) {
  var key,
      cssValues = {},
      cssProperties,
      transforms = '',
      that = this,
      _wrappedCallback,
      endEvent = D.fx.transitionEnd,
      fired = false;

  if (duration === undefined) duration = D.fx.speeds._default / 1000;
  if (delay === undefined) delay = 0;
  if (D.fx.off) duration = 0;

  if (typeof properties == 'string') {
    // keyframe animation
    cssValues[animationName] = properties;
    cssValues[animationDuration] = duration + 's';
    cssValues[animationDelay] = delay + 's';
    cssValues[animationTiming] = ease || 'linear';
    endEvent = D.fx.animationEnd;
  } else {
    cssProperties = []; // CSS transitions

    for (key in properties) {
      if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') ';else cssValues[key] = properties[key], cssProperties.push(dasherize(key));
    }

    if (transforms) cssValues[transform] = transforms, cssProperties.push(transform);

    if (duration > 0 && typeof properties === 'object') {
      cssValues[transitionProperty] = cssProperties.join(', ');
      cssValues[transitionDuration] = duration + 's';
      cssValues[transitionDelay] = delay + 's';
      cssValues[transitionTiming] = ease || 'linear';
    }
  }

  _wrappedCallback = function wrappedCallback(event) {
    if (typeof event !== 'undefined') {
      if (event.target !== event.currentTarget) return; // makes sure the event didn't bubble from "below"

      D(event.target).off(endEvent, _wrappedCallback);
    } else D(this).off(endEvent, _wrappedCallback); // triggered by setTimeout


    fired = true;
    D(this).css(cssReset);
    callback && callback.call(this);
  };

  if (duration > 0) {
    this.on(endEvent, _wrappedCallback); // transitionEnd is not always firing on older Android phones
    // so make sure it gets fired

    setTimeout(function () {
      if (fired) return;

      _wrappedCallback.call(that);
    }, (duration + delay) * 1000 + 25);
  } // trigger page reflow so new elements can animate


  this.size() && this.get(0).clientLeft;
  this.css(cssValues);
  if (duration <= 0) setTimeout(function () {
    that.each(function () {
      _wrappedCallback.call(this);
    });
  }, 0);
  return this;
};

var animate = function animate(properties, duration, ease, callback, delay) {
  if (isFunction(duration)) callback = duration, ease = undefined, duration = undefined;
  if (isFunction(ease)) callback = ease, ease = undefined;
  if (isPlainObject(duration)) ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration;
  if (duration) duration = (typeof duration == 'number' ? duration : D.fx.speeds[duration] || D.fx.speeds._default) / 1000;
  if (delay) delay = parseFloat(delay) / 1000;
  return this.anim(properties, duration, ease, callback, delay);
};

var origShow = function origShow() {
  return this.each(function () {
    this.style.display == 'none' && (this.style.display = '');
    if (getComputedStyle(this, '').getPropertyValue('display') == 'none') this.style.display = defaultDisplay(this.nodeName);
  });
};

var origHide = function origHide() {
  return this.css('display', 'none');
};

var origToggle = function origToggle(setting) {
  return this.each(function () {
    var el = D(this);
    (setting === undefined ? el.css('display') == 'none' : setting) ? el.show() : el.hide();
  });
};

function anim(el, speed, opacity, scale, callback) {
  if (typeof speed == 'function' && !callback) callback = speed, speed = undefined;
  var props = {
    opacity: opacity
  };

  if (scale) {
    props.scale = scale;
    el.css(D.fx.cssPrefix + 'transform-origin', '0 0');
  }

  return el.animate(props, speed, null, callback);
}

function hideHelper(el, speed, scale, callback) {
  return anim(el, speed, 0, scale, function () {
    origHide.call(D(this));
    callback && callback.call(this);
  });
} // Export


var show = function show(speed, callback) {
  origShow.call(this);
  if (speed === undefined) speed = 0;else this.css('opacity', 0);
  return anim(this, speed, 1, '1,1', callback);
};

var hide = function hide(speed, callback) {
  if (speed === undefined) return origHide.call(this);else return hideHelper(this, speed, '0,0', callback);
};

var toggle = function toggle(speed, callback) {
  if (speed === undefined || typeof speed == 'boolean') return origToggle.call(this, speed);else return this.each(function () {
    var el = D(this);
    el[el.css('display') == 'none' ? 'show' : 'hide'](speed, callback);
  });
};

var fadeTo = function fadeTo(speed, opacity, callback) {
  return anim(this, speed, opacity, null, callback);
};

var fadeIn = function fadeIn(speed, callback) {
  var target = this.css('opacity');
  if (target > 0) this.css('opacity', 0);else target = 1;
  return origShow.call(this).fadeTo(speed, target, callback);
};

var fadeOut = function fadeOut(speed, callback) {
  return hideHelper(this, speed, null, callback);
};

var fadeToggle = function fadeToggle(speed, callback) {
  return this.each(function () {
    var el = D(this);
    el[el.css('opacity') == 0 || el.css('display') == 'none' ? 'fadeIn' : 'fadeOut'](speed, callback);
  });
};

export { D, Event, add$1 as add, addClass, after, anim$1 as anim, animate, append, appendTo, attr, before, camelize as camelCase, children$1 as children, clone, closest, contains, contents, css, empty, fadeIn, fadeOut, fadeTo, fadeToggle, filter$1 as filter, find, grep, has, hasClass, height, hide, html, inArray, index, insertAfter, insertBefore, is, isArray, isEmptyObject, isFunction, isNumeric, isPlainObject, isWindow, next, noop, not, off, offset, offsetParent, on, one, parent, parents, position, prepend, prependTo, prev, prop, proxy, remove$1 as remove, removeAttr, removeClass, removeProp, replaceAll, replaceWith, scrollLeft, scrollTop, show, siblings, text, toggle, toggleClass, trigger, triggerHandler, trim, type, unwrap, val, width, wrap, wrapAll, wrapInner };
