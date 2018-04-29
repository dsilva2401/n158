'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (credentials) {
	var deferred = _q2.default.defer();
	var connection = _mysql2.default.createConnection(credentials);
	connection.connect();
	var queryHandler = function queryHandler(sqlString) {
		var deferred = _q2.default.defer();
		connection.query(sqlString, function (err, results, fields) {
			if (err) {
				deferred.reject(err);
				return;
			}
			deferred.resolve({
				results: results,
				fields: fields
			});
		});
		return deferred.promise;
	};
	deferred.resolve(queryHandler);
	return deferred.promise;
};