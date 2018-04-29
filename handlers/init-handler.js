'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (context, next, finish) {
    context.set('startTimestamp', Date.now());
    next();
};