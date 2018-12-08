/*!
 * D.js is the shorthand version of Zepto.js
 * Copyright (c) 2018 nzbin
 * Released under the MIT License
 * 
 */
;
(function () {

    var undefined,
        key,
        classList,
        emptyArray = [],
        concat = emptyArray.concat,
        filter = emptyArray.filter,
        slice = emptyArray.slice,
        document = window.document,
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
        capitalRE = /([A-Z])/g,

        // special attributes that should be get/set via method calls
        methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

        adjacencyOperators = ['after', 'prepend', 'before', 'append'],
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
        camelize, uniq,
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
        isArray = Array.isArray || function (object) { return object instanceof Array };

    function type(obj) {
        return obj == null ? String(obj) :
            class2type[toString.call(obj)] || "object"
    }

    function isFunction(value) {
        return type(value) == "function"
    }

    function isWindow(obj) {
        return obj != null && obj == obj.window
    }

    function isDocument(obj) {
        return obj != null && obj.nodeType == obj.DOCUMENT_NODE
    }

    function isObject(obj) {
        return type(obj) == "object"
    }

    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
    }

    function likeArray(obj) {
        var length = !!obj && 'length' in obj && obj.length,
            type = D.type(obj)

        return 'function' != type && !isWindow(obj) && (
            'array' == type || length === 0 ||
            (typeof length == 'number' && length > 0 && (length - 1) in obj)
        )
    }

    function dasherize(str) {
        return str.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/_/g, '-')
            .toLowerCase()
    }

    function maybeAddPx(name, value) {
        return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
    }

    // Class D
    var D = function (selector, context) {
        return D.fn.init(selector, context)
    }

    // Make Array
    D.init = function (dom, selector) {
        var i, len = dom ? dom.length : 0
        for (i = 0; i < len; i++) this[i] = dom[i]
        this.length = len
        this.selector = selector || ''
    }

    // The function takes a html string and an optional tag name
    // to generate DOM nodes from the given html string.
    // The generated DOM nodes are returned as an array.
    // This function can be overridden in plugins for example to make
    // it compatible with browsers that don't support the DOM fully.
    D.fragment = function (html, name, properties) {
        var dom, nodes, container

        // A special case optimization for a single tag
        if (singleTagRE.test(html)) { dom = $(document.createElement(RegExp.$1)) }

        if (!dom) {

            if (html.replace) {
                html = html.replace(tagExpanderRE, "<$1></$2>")
            }

            if (name === undefined) {
                name = fragmentRE.test(html) && RegExp.$1
            }

            if (!(name in containers)) {
                name = '*'
            }

            container = containers[name]
            container.innerHTML = '' + html
            dom = D.each(slice.call(container.childNodes), function () {
                container.removeChild(this)
            })
        }

        if (isPlainObject(properties)) {
            nodes = $(dom)
            D.each(properties, function (key, value) {
                if (methodAttributes.indexOf(key) > -1) nodes[key](value)
                else nodes.attr(key, value)
            })
        }

        return dom
    }

    D.each = function (elements, callback) {
        var i, key
        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++)
                if (callback.call(elements[i], i, elements[i]) === false) return elements
        } else {
            for (key in elements)
                if (callback.call(elements[key], key, elements[key]) === false) return elements
        }

        return elements
    }

    // D's CSS selector implementation which
    // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
    // This method can be overridden in plugins.
    D.qsa = function (element, selector) {
        var found,
            maybeID = selector[0] == '#',
            maybeClass = !maybeID && selector[0] == '.',
            // Ensure that a 1 char tag name still gets checked
            nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
            isSimple = simpleSelectorRE.test(nameOnly)
        return (
            // Safari DocumentFragment doesn't have getElementById
            element.getElementById && isSimple && maybeID)
            ? (
                (found = element.getElementById(nameOnly))
                    ? [found]
                    : []
            ) : (
                element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11
            )
                ? []
                : slice.call(
                    // DocumentFragment doesn't have getElementsByClassName/TagName
                    isSimple && !maybeID && element.getElementsByClassName
                        ? maybeClass
                            // If it's simple, it could be a class
                            ? element.getElementsByClassName(nameOnly)
                            // Or a tag
                            : element.getElementsByTagName(selector)
                        // Or it's not simple, and we need to query all
                        : element.querySelectorAll(selector)
                )
    }

    D.type = type;

    // Populate the class2type map
    D.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase()
    });

    D.isD = function (object) {
        return object instanceof D
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
        // This method can be overridden in plugins.
        init: function (selector, context) {
            var dom;
            // If nothing given, return an empty D collection
            if (!selector) {
                return this
            }
            // Optimize for string selectors
            else if (typeof selector == 'string') {
                selector = selector.trim()
                // If it's a html fragment, create nodes from it
                // Note: In both Chrome 21 and Firefox 15, DOM error 12
                // is thrown if the fragment doesn't begin with <
                if (selector[0] == '<' && fragmentRE.test(selector)) {
                    dom = D.fragment(selector, RegExp.$1, context), selector = null
                }
                // If there's a context, create a collection on that context first, and select
                // nodes from there
                else if (context !== undefined) {
                    return D(context).find(selector)
                }
                // If it's a CSS selector, use it to select nodes.
                else {
                    dom = D.qsa(document, selector)
                }
            }
            // If a function is given, call it when the DOM is ready
            else if (isFunction(selector)) {
                return $(document).ready(selector)
            }
            // If a D collection is given, just return it
            else if (D.isD(selector)) {
                return selector
            }
            // 
            else {
                // normalize array if an array of nodes is given
                if (isArray(selector)) {
                    dom = compact(selector)
                }
                // Wrap DOM nodes.
                else if (isObject(selector)) {
                    dom = [selector], selector = null
                }
                // If it's a html fragment, create nodes from it
                else if (fragmentRE.test(selector)) {
                    dom = D.fragment(selector.trim(), RegExp.$1, context),
                        selector = null
                }
                // If there's a context, create a collection on that context first, and select
                // nodes from there
                else if (context !== undefined) {
                    return D(context).find(selector)
                }
                // And last but no least, if it's a CSS selector, use it to select nodes.
                else {
                    dom = D.qsa(document, selector)
                }
            }
            // create a new D collection from the nodes found
            return new D.init(dom, selector)
        },
        size: function () {
            return this.length
        },
        each: function (callback) {
            emptyArray.every.call(this, function (el, idx) {
                return callback.call(el, idx, el) !== false
            })
            return this
        },
        css: function (property, value) {
            if (arguments.length < 2) {
                var element = this[0]
                if (typeof property == 'string') {
                    if (!element) return
                    return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property)
                } else if (isArray(property)) {
                    if (!element) return
                    var props = {}
                    var computedStyle = getComputedStyle(element, '');
                    D.each(property, function (_, prop) {
                        props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
                    });
                    return props
                }
            }

            var css = ''
            if (type(property) == 'string') {
                if (!value && value !== 0) {
                    this.each(function () {
                        this.style.removeProperty(dasherize(property));
                    });
                } else {
                    css = dasherize(property) + ":" + maybeAddPx(property, value)
                }
            } else {
                for (key in property) {
                    if (!property[key] && property[key] !== 0) {
                        this.each(function () { this.style.removeProperty(dasherize(key)) })
                    } else {
                        css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
                    }
                }
            }

            return this.each(function () { this.style.cssText += ';' + css })
        },
    }


    D.init.prototype = D.fn;

    window.D = D;
})();