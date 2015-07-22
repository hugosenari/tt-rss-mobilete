(function(){
	'use strict';
    var mobilete = angular.module('ttRssMobilete');
	mobilete.factory('Api', ['$http', '$q', function($http, $q) {
		var api = '/api/',
			status = null,
			dataRequest = {},
			reasons = ['invalid-api', 'invalid-sid', 'invalid-login', 'invalid-unknow'];
			
		function rejected(defer, data, status) {
			if (!data) {
				defer.reject({data: data, id: reasons[3], status: status});
				return true;
			} else if (data.status) {
				var id = reasons[3];
				if (data.content){
					if (data.content.error === 'NOT_LOGGED_IN') {
						id = reasons[1];
					}
					if (data.content.error === 'LOGIN_ERROR') {
						id = reasons[2];
					}
				}
				defer.reject({data: data, id: id, status: status});	
				return true;
			} else if (status > 299) {
				defer.reject({data: data, id: reasons[0], status: status});
				return true;
			}
			return false;
		}
		
		function defer(api, dataRequest){
			var result = $q.defer();
			$http.post(api, dataRequest)
				.success(function(data, status){if (!rejected(result, data, status)) {result.resolve(data);}})
				.error(function(data, status){rejected(result, data, status);});
			return result.promise;
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
				return defer(api, dataRequest);
			},
			login: function login(user, pass, opts) {
				opts = opts || {};
				api = opts.api||api;
				
				var data = {
					'op': 'login',
					'user': user,
					'password': pass
				}
				return defer(api, data).then(function(data) {
					dataRequest.sid = data.content.session_id;
					return data;
				});
			},
			setApi: function(newApi) {
				var data = {
					'op': 'login'
				},
					subResult = defer(newApi, data),
					result = $q.defer();
					
				subResult.catch(function(reason) {
					if (reason.id === 'invalid-api') {
						result.reject(reason);
					} else {
						api = newApi;
						result.resolve(reason);
					}
				});

				return result.promise;
			},
			categories: function(){
				return defer(api, angular.extend({}, dataRequest, {
					op:'getCategories'}));
			},
			feeds: function(id){
				return defer(api, angular.extend({}, dataRequest, {
					op:'getFeeds', cat_id: id}));
			},
			feed: function(id, unread_only){
				unread_only = unread_only || false;
				return defer(api, angular.extend({}, dataRequest, {
					op:'getHeadlines',
					feed_id: id,
					view_mode: unread_only? 'unread': 'all_articles'
				}));
			},
			markAsReaded: function(id){
				return defer(api, angular.extend({}, dataRequest, {
					op:'updateArticle',
					article_ids: id,
					mode: 0,
					field: 2
				}));
			},
			article: function(id){
				return defer(api, angular.extend({}, dataRequest, {
					op:'getArticle', article_id: id}));
			}
		}
	}]);
})();