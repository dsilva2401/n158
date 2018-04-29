import q from 'q';
import {MongoClient} from 'mongodb';

export default (dbUrl, dbName) => {
	var deferred = q.defer();
	MongoClient.connect(dbUrl, function (err, client) {
		if (err) {
			deferred.reject(err);
			return;
		}
		var db = client.db(dbName);
		deferred.resolve(db);
	});
	return deferred.promise;
}