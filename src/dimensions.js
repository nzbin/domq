import D from './d-class';
import { funcArg, isDocument, isWindow } from './utils';

function subtract(el, dimen) {
  var offset = el.offset(),
    offsetMap = {
      width: ['padding-left', 'padding-right', 'border-left-width', 'border-right-width'],
      height: ['padding-top', 'padding-bottom', 'border-top-width', 'border-bottom-width']
    };
  return offset[dimen]
    - parseFloat(el.css(offsetMap[dimen][0]))
    - parseFloat(el.css(offsetMap[dimen][1]))
    - parseFloat(el.css(offsetMap[dimen][2]))
    - parseFloat(el.css(offsetMap[dimen][3]));
}

function calc(dimension, value) {
  var dimensionProperty =
    dimension.replace(/./, function (m) { return m[0].toUpperCase(); });

  var el = this[0];
  if (value === undefined) return isWindow(el)
    ? el['inner' + dimensionProperty]
    : isDocument(el)
      ? el.documentElement['scroll' + dimensionProperty]
      : subtract(this, dimension);
  else return this.each(function (idx) {
    el = D(this);
    el.css(dimension, funcArg(this, value, idx, el[dimension]()));
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
};
