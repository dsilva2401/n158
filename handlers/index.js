'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.handlersMap = undefined;

var _initHandler = require('./init-handler');

var _initHandler2 = _interopRequireDefault(_initHandler);

var _lastHandler = require('./last-handler');

var _lastHandler2 = _interopRequireDefault(_lastHandler);

var _modelTransaction = require('./model-transaction');

var _modelTransaction2 = _interopRequireDefault(_modelTransaction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var handlersMap = {
    'init-handler': _initHandler2.default,
    'last-handler': _lastHandler2.default,
    'model-transaction': _modelTransaction2.default
};

exports.handlersMap = handlersMap;