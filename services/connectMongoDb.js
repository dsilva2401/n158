'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _mongodb = require('mongodb');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (dbUrl, dbName) {
	var deferred = _q2.default.defer();
	_mongodb.MongoClient.connect(dbUrl, function (err, client) {
		if (err) {
			deferred.reject(err);
			return;
		}
		var db = client.db(dbName);
		deferred.resolve(db);
	});
	return deferred.promise;
};
//# sourceMappingURL=connectMongoDb.js.map