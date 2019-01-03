import D from './d-class';
import * as core from './core';
import * as css from './css';
import * as classes from './classes';
import * as offset from './offset';
import * as attr from './attr';
import * as prop from './prop';
import * as val from './val';
import * as wrap from './wrap';
import * as traversing from './traversing';
import * as dimensions from './dimensions';
import * as manipulation from './manipulation';
import * as event from './event';
import * as animate from './animate';
import * as effects from './effects';

D.extend(
    D,
    core
);

D.extend(
    D.fn,
    css,
    classes,
    offset,
    attr,
    prop,
    val,
    wrap,
    traversing,
    dimensions,
    manipulation,
    event,
    animate,
    effects
);

window.D = D;

export { D };