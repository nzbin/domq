import { propMap } from './vars';
import { funcArg, isObject } from './utils';

function prop(name, value) {
  name = propMap[name] || name;
  return (typeof name == 'string' && !(1 in arguments)) ?
    (this[0] && this[0][name]) :
    this.each(function (idx) {
      if (isObject(name))
        for (var key in name) this[propMap[key] || key] = name[key];
      else this[name] = funcArg(this, value, idx, this[name]);
    });
}

function removeProp(name) {
  name = propMap[name] || name;
  return this.each(function () { delete this[name]; });
}

export {
  prop,
  removeProp
};
