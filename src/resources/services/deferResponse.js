import q from 'q';

export default () => {
	var deferred = q.defer();
	var customDeferred = {};
	customDeferred.promise = deferred.promise;
	customDeferred.reject = (statusOrErr, details, err) => {
		if (typeof statusOrErr == 'number') {
			deferred.reject({
				status: statusOrErr,
				details: details,
				error: err || {}
			});
		} else {
			if (!statusOrErr.status) {
				throw Error('Missing status attribute');
			}
			deferred.reject({
				status: statusOrErr.status || 200,
				details: statusOrErr.details,
				error: statusOrErr.err || {}
			});
		}
	}
	customDeferred.resolve = (data) => {
		deferred.resolve(data);
	}
	return customDeferred;
}