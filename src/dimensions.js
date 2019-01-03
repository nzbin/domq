import D from './d-class';
import { funcArg, isDocument, isWindow } from './utils';

function subtract(el, dimen) {
    return el.css('box-sizing') === 'border-box'
        ? dimen === 'width'
            ? (parseFloat(el.css(dimen))
                - parseFloat(el.css('padding-left'))
                - parseFloat(el.css('padding-right'))
                - parseFloat(el.css('border-left'))
                - parseFloat(el.css('border-right')))
            : (parseFloat(el.css(dimen))
                - parseFloat(el.css('padding-top'))
                - parseFloat(el.css('padding-bottom'))
                - parseFloat(el.css('border-top'))
                - parseFloat(el.css('border-bottom')))
        : parseFloat(el.css(dimen))
};

function calc(dimension, value) {
    var dimensionProperty =
        dimension.replace(/./, function (m) { return m[0].toUpperCase() });

    var el = this[0]
    if (value === undefined) return isWindow(el)
        ? el['inner' + dimensionProperty]
        : isDocument(el)
            ? el.documentElement['scroll' + dimensionProperty]
            : subtract(this, dimension)
    else return this.each(function (idx) {
        el = D(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
    });
}

// Export
function width(value) {
    return calc.call(this, 'width', value);
}

function height(value) {
    return calc.call(this, 'height', value);
}

export {
    width,
    height
}