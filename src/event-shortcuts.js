var events = {};

// shortcut methods for `.on(event, fn)` for each event type
('focusin focusout focus blur load resize scroll unload click dblclick ' +
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
  'change select keydown keypress keyup error')
  .split(' ').forEach(function (event) {
    events[event] = function (callback) {
      return (0 in arguments)
        ? this.on(event, callback)
        : this.trigger(event);
    };
  });

export {
  events
};
