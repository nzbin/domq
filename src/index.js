import D from './d-class';
import './core';
import * as css from './css';
import * as classes from './classes';
import * as offset from './offset';
import * as attr from './attr';
import * as prop from './prop';
import * as val from './val';
import * as wrap from './wrap';
import * as traversing from './traversing';
import './dimensions';
import './manipulation';
import './event';
import './animate';
import './effects';

D.extend(D.fn, css, classes, offset, attr, prop, val, wrap, traversing);

window.D = D;

export { D };