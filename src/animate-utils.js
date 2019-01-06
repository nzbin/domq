import D from './d-class';

// Animate
var prefix = '',
  eventPrefix,
  vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
  testEl = document.createElement('div');

if (testEl.style.transform === undefined) D.each(vendors, function (vendor, event) {
  if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
    prefix = '-' + vendor.toLowerCase() + '-'
    eventPrefix = event
    return false
  }
})

var testTransitionProperty = testEl.style.transitionProperty;

testEl = null;

export {
  prefix,
  eventPrefix,
  testTransitionProperty
}