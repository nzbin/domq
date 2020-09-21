# Domq

[![Travis](https://img.shields.io/travis/nzbin/domq.svg)](https://travis-ci.org/nzbin/domq)
[![npm](https://img.shields.io/npm/v/domq.js.svg)](https://www.npmjs.com/package/domq.js)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/nzbin/domq/blob/master/LICENSE)

Domq is a modular DOM manipulation library. It's built according to Zepto.js.

## Who uses it?

- [photoviewer](https://github.com/nzbin/photoviewer)

## Installation

```sh
$ npm install domq.js --save
```

There have four files in `dist` after build.

```plain
dist
├── domq.js (UMD)
├── domq.common.js (CJS)
├── domq.esm.js (ESM)
└── domq.modular.js (MODULAR)
```

It's used `domq.modular.js` by default.

```js
import { D } from 'domq.js';
```

Or you can also import the other file as needed.

```js
import { D } from 'domq.js/dist/domq.esm.js';
```

## Modular Usage

You should put the methods as needed on `D` function manually.

```js
import { D, isArray, addClass } from 'domq.js/src/domq.modular';

// Static methods
const methods = {
  isArray,
};

// Instance methods
const fnMethods = {
  addClass,
};

D.extend(methods);
D.fn.extend(fnMethods);
```

## API

### Instance methods

- `D().css()`
- `D().attr()`
- `D().removeAttr()`
- `D().prop()`
- `D().removeProp()`
- `D().hasClass()`
- `D().addClass()`
- `D().removeClass()`
- `D().toggleClass()`
- `D().offset()`
- `D().offsetParent()`
- `D().position()`
- `D().scrollTop()`
- `D().scrollLeft()`
- `D().width()`
- `D().height()`
- `D().remove()`
- `D().empty()`
- `D().clone()`
- `D().html()`
- `D().text()`
- `D().append()`
- `D().prepend()`
- `D().after()`
- `D().before()`
- `D().replaceWith()`
- `D().appendTo()`
- `D().prependTo()`
- `D().insertAfter()`
- `D().insertBefore()`
- `D().replaceAll()`
- `D().find()`
- `D().filter()`
- `D().has()`
- `D().not()`
- `D().is()`
- `D().add()`
- `D().contents()`
- `D().closest()`
- `D().parents()`
- `D().parent()`
- `D().children()`
- `D().siblings()`
- `D().prev()`
- `D().next()`
- `D().index()`
- `D().wrap()`
- `D().wrapAll()`
- `D().wrapInner()`
- `D().unwrap()`
- `D().val()`
- `D().one()`
- `D().on()`
- `D().off()`
- `D().trigger()`
- `D().triggerHandler()`
- `D().animate()`
- `D().anim()`
- `D().show()`
- `D().hide()`
- `D().toggle()`
- `D().fadeTo()`
- `D().fadeIn()`
- `D().fadeOut()`
- `D().fadeToggle()`

### Static methods

- `D.type()`
- `D.contains()`
- `D.camelCase()`
- `D.isFunction()`
- `D.isWindow()`
- `D.isEmptyObject()`
- `D.isPlainObject()`
- `D.isNumeric()`
- `D.isArray()`
- `D.inArray()`
- `D.trim()`
- `D.grep()`
- `D.noop()`
- `D.Event()`
- `D.proxy()`

## License

MIT License
