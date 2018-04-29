'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (context, next, finish) {
    var startTimestamp = context.get('startTimestamp');
    var requestDuration = Date.now() - startTimestamp;
    finish();
};