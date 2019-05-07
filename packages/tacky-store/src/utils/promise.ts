// var promiseCancel = function(promise, options) {
// 	options = options || {};
// 	var timeout = options.timeout;
// 	var canceled = false;

// 	var cancelResolve;
// 	var dummyRequest = new Promise(function(resolve, reject) {
// 		cancelResolve = resolve;
// 	});

// 	var race = Promise.race([dummyRequest, promise])
// 	.then(function(data) {
// 		if(canceled) {
// 			var error = new Error('User cancelled promise.');
// 			error.type = 'cancel';

// 			return Promise.reject(error);
// 		}
// 		else if(timeout) {
// 			var error = new Error('Promise timeout');
// 			error.type = 'timeout';

// 			return Promise.reject(error);
// 		}
// 		else {
// 			return Promise.resolve(data);
// 		}
// 	});

// 	if(options.timeout) {
// 		setTimeout(function() {
// 			timeout = true;
// 			cancelResolve();
// 		}, +options.timeout);
// 	}

// 	function cancel() {
// 		canceled = true;
// 		cancelResolve();
// 	}

// 	return {
// 		promise: race,
// 		cancel: cancel,
// 		abort: cancel
// 	};
// };

// module.exports = promiseCancel;
