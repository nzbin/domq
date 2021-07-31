import D from './d-class';
import { defaultDisplay } from './utils';

var origShow = function () {
  return this.each(function () {
    this.style.display == 'none' && (this.style.display = '');
    if (getComputedStyle(this, '').getPropertyValue('display') == 'none')
      this.style.display = defaultDisplay(this.nodeName);
  });
};

var origHide = function () {
  return this.css('display', 'none');
};

var origToggle = function (setting) {
  return this.each(function () {
    var el = D(this);
    (setting === undefined ? el.css('display') == 'none' : setting)
      ? el.show()
      : el.hide();
  });
};

function anim(el, speed, opacity, scale, callback) {
  if (typeof speed == 'function' && !callback) callback = speed, speed = undefined;
  var props = { opacity: opacity };
  if (scale) {
    props.scale = scale;
    el.css(D.fx.cssPrefix + 'transform-origin', '0 0');
  }
  return el.animate(props, speed, null, callback);
}

function hideHelper(el, speed, scale, callback) {
  return anim(el, speed, 0, scale, function () {
    origHide.call(D(this));
    callback && callback.call(this);
  });
}

// Export

var show = function (speed, callback) {
  origShow.call(this);
  if (speed === undefined) speed = 0;
  else this.css('opacity', 0);
  return anim(this, speed, 1, '1,1', callback);
};

var hide = function (speed, callback) {
  if (speed === undefined) return origHide.call(this);
  else return hideHelper(this, speed, '0,0', callback);
};

var toggle = function (speed, callback) {
  if (speed === undefined || typeof speed == 'boolean')
    return origToggle.call(this, speed);
  else return this.each(function () {
    var el = D(this);
    el[el.css('display') == 'none' ? 'show' : 'hide'](speed, callback);
  });
};

var fadeTo = function (speed, opacity, callback) {
  return anim(this, speed, opacity, null, callback);
};

var fadeIn = function (speed, callback) {
  var target = this.css('opacity');
  if (target > 0) this.css('opacity', 0);
  else target = 1;
  return origShow.call(this).fadeTo(speed, target, callback);
};

var fadeOut = function (speed, callback) {
  return hideHelper(this, speed, null, callback);
};

var fadeToggle = function (speed, callback) {
  return this.each(function () {
    var el = D(this);
    el[
      (el.css('opacity') == 0 || el.css('display') == 'none') ? 'fadeIn' : 'fadeOut'
    ](speed, callback);
  });
};

export {
  show,
  hide,
  toggle,
  fadeTo,
  fadeIn,
  fadeOut,
  fadeToggle
};
