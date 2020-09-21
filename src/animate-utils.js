import D from './d-class';
import { document } from './vars';

var prefix = '',
  eventPrefix,
  vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
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

export {
  prefix,
  eventPrefix,
  testTransitionProperty
};
