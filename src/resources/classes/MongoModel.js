import * as mongodb from 'mongodb';
import underscore from 'underscore';
import {validate as validateJSONSchema} from 'jsonschema';
import {deferResponse} from '../services';
var ObjectID = mongodb.ObjectID;

export class MongoModel {

    constructor (db, name, jsonSchema, options) {
        this.name = name;
        this.db = db;
        this.collection = db.collection(name);
        this.schema = jsonSchema || {};
        this.options = options || {};
        if (options.indexes) {
            this.createIndexes(options.indexes);
        }
    }

    createIndexes (indexes) {
        indexes.forEach((index) => {
            this.collection.createIndex(index.key, index.options);
        });
    }

    validate (data) {
        var deferred = deferResponse();
        var validationResult = validateJSONSchema(
            data, this.schema
        )
        if (validationResult.errors.length) {
            deferred.reject(400, 'Validation error', validationResult.errors)
        } else {
            deferred.resolve(validationResult);
        }
        return deferred.promise;
    }
    
    insert (data) {
        var deferred = deferResponse();
        this.validate(data).then(() => {
            this.collection.insertOne(data, (err, r) => {
                if (err) {
                    deferred.reject(500, 'Insertion error on db', err);
                    return;
                }
                deferred.resolve(r.ops[0]);
            });
        }).catch((err) => {
            deferred.reject(400, 'Validation error', err);
        });
        return deferred.promise;
    }

    register (data) {
        return this.insert(data);
    }

    removeById (id) {
        var deferred = deferResponse();
        this.collection.remove({
            _id: new ObjectID(id)
        }, (err, resp) => {
            if (err) {
                deferred.reject(500, 'Remove error on db', err);
                return;
            }
            deferred.resolve(resp);
        });
        return deferred.promise;
    }

    findById (id) {
        var deferred = deferResponse();
        this.collection.findOne({
            _id: new ObjectID(id)
        }, (err, resp) => {
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

    rawUpdate (criteria, updateData, options) {
        options = options || {};
        var deferred = deferResponse();
        this.collection.update(criteria, updateData, options, (err, resp) => {
            if (err) {
                deferred.reject(500, 'Update error on db', err);
                return;
            }
            deferred.resolve(resp);
        });
        return deferred.promise;
    }

    update (id, data) {
        var deferred = deferResponse();
        this.findById(id).then((instance) => {
            var keys = underscore.union(Object.keys(instance), Object.keys(data));
            keys.forEach((attr) => {
                if (attr == '_id') return;
                if (data[attr] === null) {
                    instance[attr] = null;
                } else if (data[attr] === false) {
                    instance[attr] = false;
                } else if (data[attr] === 0) {
                    instance[attr] = 0;
                } else {
                    instance[attr] = (data[attr] || instance[attr]);
                }
            });
            this.collection.update({
                _id: new ObjectID(id)
            }, instance, (err, resp) => {
                if (err) {
                    deferred.reject(500, 'Update error on db', err);
                    return;
                }
                deferred.resolve(instance);
            });
        }).catch((err) => {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    
    findOne (criteria) {
        var deferred = deferResponse();
        this.collection.findOne( criteria, (err, r) => {
            if (err){
                deferred.reject(500, 'Find one error on db', err);
                return;
            }
            deferred.resolve(r);
        });
        return deferred.promise;
    }

    findAll (criteria) {
        var deferred = deferResponse();
        this.collection.find( criteria, (err, r) => {
            if (err){
                deferred.reject(500, 'Find error on db', err);
                return;
            }
            deferred.resolve(r.toArray());
        });
        return deferred.promise;
    }

    aggregate (pipeline, options) {
        var deferred = deferResponse();
        this.collection.aggregate(pipeline, options, (err, cursor) => {
            if (err) {
                deferred.reject(500, 'Aggregate error on db', err);
                return;
            }
            cursor.get((err, data) => {
                if (err) {
                    deferred.reject(500, 'Cursor error on db', err);
                    return;
                }
                deferred.resolve(data);
            })
        });
        return deferred.promise;
    }

}