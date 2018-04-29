'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (context, next, finish) {
    var CurrentModel = context.params.model;
    var model = new CurrentModel(context.params.db);

    var resolveParamPath = function resolveParamPath(obj, paramPath) {
        var buffObj = obj;
        paramPath.split('.').forEach(function (k) {
            // buffObj = (typeof buffObj[k] == 'undefined') ? {} : buffObj[k];
            switch (_typeof(buffObj[k])) {
                case 'undefined':
                    buffObj = null;
                    break;
                case 'object':
                    buffObj = JSON.parse(JSON.stringify(buffObj[k]));
                    break;
                default:
                    buffObj = buffObj[k];
                    break;
            }
        });
        return buffObj;
    };

    var resolveAttributes = function resolveAttributes(value, init) {
        var fValue;
        if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object') {
            fValue = JSON.parse(JSON.stringify(value));
        } else {
            fValue = value;
        }
        if (typeof value == 'string') {
            if (value[0] == '&') {
                fValue = resolveParamPath(context.req, value.substring(1, value.length));
            }
        } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object') {
            if (!Array.isArray(value)) {
                Object.keys(value).forEach(function (k) {
                    value[k] = resolveAttributes(value[k]);
                });
            } else {
                value = value.map(function (item) {
                    return resolveAttributes(item);
                });
            }
        }
        if (init) {
            return value;
        }
        return fValue;
    };

    var transactionParams = resolveAttributes(context.params.transactionParams, true);

    if (!model) {
        next(404, 'Model not found');
        return;
    }
    if (!context.params.transaction) {
        next(404, 'Transaction not found');
        return;
    }
    if (!model[context.params.transaction]) {
        next(404, 'Model transaction not found');
        return;
    }

    model[context.params.transaction].apply(model, transactionParams).then(function (resp) {
        next(200, resp);
    }).catch(function (resp) {
        next(resp.status || 500, resp);
    });
};