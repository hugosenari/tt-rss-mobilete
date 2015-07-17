(function(){
	'use strict';
	angular.module('ttRssMobilete').factory('Api', function($http) {
		var api = '/api/',
			status = null,
			dataRequest = {},
			reasons = ['invalid-api', 'invalid-sid', 'invalid-login', 'invalid-unknow'];
			
		function rejected(defer, data, status) {
			if (!data) {
				defer.reject({data: data, reason: reasons[3], status: status});
				return true;
			} else if (data.status) {
				if (data.content){
					if (data.content.error === 'NOT_LOGGED_IN') {
						defer.reject({data: data, reason: reasons[1], status: status});
					}
					if (data.content.error === 'LOGIN_ERROR') {
						defer.reject({data: data, reason: reasons[2], status: status});
					}
				} else {
					defer.reject({data: data, reason: reasons[3], status: status});	
				}
				return true;
			}
			return false;
		}
		
		return {
			reasons: reasons,
			session: function setSession(sid, opts) {
				opts = opts || {};
				api = opts.api||api;
				
				dataRequest = {
					'op': 'getConfig',
					'sid': sid
				}
	
				var result = $q.defer();
				$http.post(api, data)
					.success(function(data, status){if (!rejected(result, data, status)) {result.resolve(data);}})
					.error(function(data, status){rejected(result, data, status);});
				return result.promise;
			},
			login: function login(user, pass, opts) {
				opts = opts || {};
				api = opts.api||api;
				
				var dataRequest = {
					'op': 'login',
					'user': user,
					'password': pass
				}
				
				var result = $q.defer();
				$http.post(api, data)
					.success(function(data, status){if (!rejected(result, data, status)) {result.resolve(data);}})
					.error(function(data, status){rejected(result, data, status);});
				return result.promise;
			}
		}
	});
})();