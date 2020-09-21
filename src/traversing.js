import D from './d-class';
import { emptyArray, filter, slice, contains } from './vars';
import { children, filtered, isDocument, isFunction, isObject, likeArray, uniq } from './utils';

function find(selector) {
  var result, $this = this;
  if (!selector) result = D();
  else if (typeof selector == 'object')
    result = D(selector).filter(function () {
      var node = this;
      return emptyArray.some.call($this, function (parent) {
        return contains(parent, node);
      });
    });
  else if (this.length == 1) result = D(D.qsa(this[0], selector));
  else result = this.map(function () { return D.qsa(this, selector); });
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
    return isObject(selector)
      ? contains(this, selector)
      : D(this).find(selector).size();
  });
}

function not(selector) {
  var nodes = [];
  if (isFunction(selector) && selector.call !== undefined)
    this.each(function (idx) {
      if (!selector.call(this, idx)) nodes.push(this);
    });
  else {
    var excludes = typeof selector == 'string' ? this.filter(selector) :
      (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : D(selector);
    this.forEach(function (el) {
      if (excludes.indexOf(el) < 0) nodes.push(el);
    });
  }
  return D(nodes);
}

function is(selector) {
  return typeof selector == 'string'
    ? this.length > 0 && D.matches(this[0], selector)
    : selector && this.selector == selector.selector;
}

function add(selector, context) {
  return D(uniq(this.concat(D(selector, context))));
}

function contents() {
  return this.map(function () { return this.contentDocument || slice.call(this.childNodes); });
}

function closest(selector, context) {
  var nodes = [],
    collection = typeof selector == 'object' && D(selector);
  this.each(function (_, node) {
    while (node && !(collection ? collection.indexOf(node) >= 0 : D.matches(node, selector)))
      node = node !== context && !isDocument(node) && node.parentNode;
    if (node && nodes.indexOf(node) < 0) nodes.push(node);
  });
  return D(nodes);
}

function parents(selector) {
  var ancestors = [],
    nodes = this;
  while (nodes.length > 0)
    nodes = D.map(nodes, function (node) {
      if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
        ancestors.push(node);
        return node;
      }
    });
  return filtered(ancestors, selector);
}

function parent(selector) {
  return filtered(uniq(this.pluck('parentNode')), selector);
}

function children$1(selector) {
  return filtered(this.map(function () { return children(this); }), selector);
}

function siblings(selector) {
  return filtered(this.map(function (i, el) {
    return filter.call(children(el.parentNode), function (child) { return child !== el; });
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

export {
  find,
  filter$1 as filter,
  has,
  not,
  is,
  add,
  contents,
  closest,
  parents,
  parent,
  children$1 as children,
  siblings,
  prev,
  next,
  index
};
