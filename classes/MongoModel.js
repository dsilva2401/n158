'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MongoModel = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mongodb = require('mongodb');

var mongodb = _interopRequireWildcard(_mongodb);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _jsonschema = require('jsonschema');

var _services = require('../services');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ObjectID = mongodb.ObjectID;

var MongoModel = exports.MongoModel = function () {
    function MongoModel(db, name, jsonSchema, options) {
        _classCallCheck(this, MongoModel);

        this.name = name;
        this.db = db;
        this.collection = db.collection(name);
        this.schema = jsonSchema || {};
        this.options = options || {};
        if (options.indexes) {
            this.createIndexes(options.indexes);
        }
    }

    _createClass(MongoModel, [{
        key: 'createIndexes',
        value: function createIndexes(indexes) {
            var _this = this;

            indexes.forEach(function (index) {
                _this.collection.createIndex(index.key, index.options);
            });
        }
    }, {
        key: 'validate',
        value: function validate(data) {
            var deferred = (0, _services.deferResponse)();
            var validationResult = (0, _jsonschema.validate)(data, this.schema);
            if (validationResult.errors.length) {
                deferred.reject(400, 'Validation error', validationResult.errors);
            } else {
                deferred.resolve(validationResult);
            }
            return deferred.promise;
        }
    }, {
        key: 'insert',
        value: function insert(data) {
            var _this2 = this;

            var deferred = (0, _services.deferResponse)();
            this.validate(data).then(function () {
                _this2.collection.insertOne(data, function (err, r) {
                    if (err) {
                        deferred.reject(500, 'Insertion error on db', err);
                        return;
                    }
                    deferred.resolve(r.ops[0]);
                });
            }).catch(function (err) {
                deferred.reject(400, 'Validation error', err);
            });
            return deferred.promise;
        }
    }, {
        key: 'register',
        value: function register(data) {
            return this.insert(data);
        }
    }, {
        key: 'removeById',
        value: function removeById(id) {
            var deferred = (0, _services.deferResponse)();
            this.collection.remove({
                _id: new ObjectID(id)
            }, function (err, resp) {
                if (err) {
                    deferred.reject(500, 'Remove error on db', err);
                    return;
                }
                deferred.resolve(resp);
            });
            return deferred.promise;
        }
    }, {
        key: 'findById',
        value: function findById(id) {
            var deferred = (0, _services.deferResponse)();
            this.collection.findOne({
                _id: new ObjectID(id)
            }, function (err, resp) {
                if (err) {
                    deferred.reject(500, 'Find error on db', err);
                    return;
                }
                if (!resp) {
                    deferred.reject(404, 'Item not found');
                    return;
                }
                deferred.resolve(resp);
            });
            return deferred.promise;
        }
    }, {
        key: 'update',
        value: function update(id, data) {
            var _this3 = this;

            var deferred = (0, _services.deferResponse)();
            this.findById(id).then(function (instance) {
                var keys = _underscore2.default.union(Object.keys(instance), Object.keys(data));
                keys.forEach(function (attr) {
                    if (attr == '_id') return;
                    if (data[attr] === null) {
                        instance[attr] = null;
                    } else if (data[attr] === false) {
                        instance[attr] = false;
                    } else if (data[attr] === 0) {
                        instance[attr] = 0;
                    } else {
                        instance[attr] = data[attr] || instance[attr];
                    }
                });
                _this3.collection.update({
                    _id: new ObjectID(id)
                }, instance, function (err, resp) {
                    if (err) {
                        deferred.reject(500, 'Update error on db', err);
                        return;
                    }
                    deferred.resolve(instance);
                });
            }).catch(function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        }
    }, {
        key: 'findOne',
        value: function findOne(criteria) {
            var deferred = (0, _services.deferResponse)();
            this.collection.findOne(criteria, function (err, r) {
                if (err) {
                    deferred.reject(500, 'Find one error on db', err);
                    return;
                }
                deferred.resolve(r);
            });
            return deferred.promise;
        }
    }, {
        key: 'findAll',
        value: function findAll(criteria) {
            var deferred = (0, _services.deferResponse)();
            this.collection.find(criteria, function (err, r) {
                if (err) {
                    deferred.reject(500, 'Find error on db', err);
                    return;
                }
                deferred.resolve(r.toArray());
            });
            return deferred.promise;
        }
    }, {
        key: 'aggregate',
        value: function aggregate(pipeline, options) {
            var deferred = (0, _services.deferResponse)();
            this.collection.aggregate(pipeline, options, function (err, cursor) {
                if (err) {
                    deferred.reject(500, 'Aggregate error on db', err);
                    return;
                }
                cursor.get(function (err, data) {
                    if (err) {
                        deferred.reject(500, 'Cursor error on db', err);
                        return;
                    }
                    deferred.resolve(data);
                });
            });
            return deferred.promise;
        }
    }]);

    return MongoModel;
}();
//# sourceMappingURL=MongoModel.js.map