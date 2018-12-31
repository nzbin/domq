import D from './d-class';
import { funcArg, isDocument, isWindow } from './utils';
import { dimensions } from './vars';

dimensions.forEach(function (dimension) {
    var dimensionProperty =
        dimension.replace(/./, function (m) { return m[0].toUpperCase() })

    D.fn[dimension] = function (value) {
        var el = this[0]
        if (value === undefined) return isWindow(el)
            ? el['inner' + dimensionProperty]
            : isDocument(el)
                ? el.documentElement['scroll' + dimensionProperty]
                : parseFloat(this.css(dimension))
        else return this.each(function (idx) {
            el = D(this)
            el.css(dimension, funcArg(this, value, idx, el[dimension]()))
        })
    }
});