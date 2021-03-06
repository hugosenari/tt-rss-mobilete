(function(){
	'use strict';
    var mobilete = angular.module('ttRssMobilete');
	mobilete.factory('Api', ['$http', '$q', function($http, $q) {
		var api = '/api/',
			dataRequest = {},
			checkedSession = 0,
			tokenExpiration = 1000 * 60 * 20,
			markAsReadIds = [],
			markAsReadTimout = null,
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
		
		function checkSession() {
			var now = new Date().getTime();
			return now - checkedSession < tokenExpiration;
		}
		
		return {
			reasons: reasons,
			session: function setSession(sid, opts) {
				opts = opts || {};
				api = opts.api||api;
				
				dataRequest = {
					'op': 'getConfig',
					'sid': sid
				};
				
				if (checkSession()) {
					return $q.resolve("wont-check");
				}
				
				return defer(api, dataRequest).then(function(data) {
					checkedSession = new Date().getTime();
					return data;
				});
			},
			login: function login(user, pass, opts) {
				opts = opts || {};
				api = opts.api||api;
				
				var data = {
					'op': 'login',
					'user': user,
					'password': pass
				};
				return defer(api, data).then(function(data) {
					dataRequest.sid = data.content.session_id;
					return data;
				});
			},
			setApi: function(newApi) {
				var data = {
					'op': 'login'
				},
				result = $q.defer();
				if (api == newApi) {
					result.resolve('same-api');
				} else {
					var subResult = defer(newApi, data);
					subResult.catch(function(reason) {
						if (reason.id === 'invalid-api') {
							result.reject(reason);
						} else {
							api = newApi;
							result.resolve(reason);
						}
					});
				}
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
			feed: function(id, unread_only, is_cat){
				unread_only = unread_only || false;
				is_cat = is_cat || false;
				return defer(api, angular.extend({}, dataRequest, {
					op:'getHeadlines',
					feed_id: id,
					is_cat: is_cat,
					view_mode: unread_only? 'unread': 'all_articles'
				}));
			},
			updateArticle: function(opts) {
				return defer(api, angular.extend(
					{
						article_ids: id,
						mode: 2,
						field: 0,
					},
					dataRequest,
					opts,
					{op:'updateArticle',}
				));
			},
			markAsReaded: function(id, to, now){
				to = to || 0;
				var result = $q.defer();
				if (now) {
					result = defer(api, angular.extend({}, dataRequest, {
						op:'updateArticle',
						article_ids: id,
						mode: to,
						field: 2
					}));
				} else {
					clearTimeout(markAsReadTimout);
					markAsReadIds.push(id);
					markAsReadTimout = setTimeout(function(){
						return defer(api, angular.extend({}, dataRequest, {
							op:'updateArticle',
							article_ids: markAsReadIds.join(','),
							mode: to,
							field: 2
						})).then(function(data) {
							markAsReadIds = [];
							result.resolve(data);
							return data;
						});
					}, 1000);
				}
				return result.promise;
			},
			article: function(id){
				return defer(api, angular.extend({}, dataRequest, {
					op:'getArticle', article_id: id}));
			},
			publish: function(title, url, content){
				return defer(api, angular.extend({}, dataRequest, {
					op:'shareToPublished',
					title: title,
					url:url,
					content: content}));
			}
		};
	}]);
})();