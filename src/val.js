import D from './d-class';
import { funcArg } from './utils';

function val(value) {
  if (0 in arguments) {
    if (value == null) value = '';
    return this.each(function (idx) {
      this.value = funcArg(this, value, idx, this.value);
    });
  } else {
    return this[0] && (this[0].multiple ?
      D(this[0]).find('option').filter(function () { return this.selected; }).pluck('value') :
      this[0].value);
  }
}

export {
  val
};
