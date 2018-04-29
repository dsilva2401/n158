'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
	var deferred = _q2.default.defer();
	var customDeferred = {};
	customDeferred.promise = deferred.promise;
	customDeferred.reject = function (statusOrErr, details, err) {
		if (typeof statusOrErr == 'number') {
			deferred.reject({
				status: statusOrErr,
				details: details,
				error: err || {}
			});
		} else {
			if (!statusOrData.status) {
				throw Error('Missing status attribute');
			}
			deferred.reject({
				status: statusOrErr.status || 200,
				details: statusOrErr.details,
				error: statusOrErr.err || {}
			});
		}
	};
	customDeferred.resolve = function (data) {
		deferred.resolve(data);
	};
	return customDeferred;
};