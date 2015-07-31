(function(){
	'use strict';
    var mobilete = angular.module('ttRssMobilete');
		
	mobilete.config(['$routeProvider', function($routeProvider){
		var resolver = {
			token: ['Settings', 'Api', function (Settings, Api) {
				return Api.session(Settings.get().sid);
			}]
		}
		
		$routeProvider
			.when('/', {
				redirectTo: "/feeds",
			})
			.when('/settings', {
				controller: "SettingsController",
				templateUrl: 'settings.html'
			})
			.when('/login', {
				controller: 'LoginController',
				templateUrl: 'login.html'
			})
			.when('/feeds', {
				controller: 'CategoryController',
				templateUrl: 'categories.html',
				resolve: angular.extend({}, resolver)
			})
			.when('/feeds/:category/:feed', {
				controller: 'FeedController',
				templateUrl: 'items.html',
				resolve: angular.extend({}, resolver)
			})
			.when('/feeds/:category/:feed/:article', {
				controller: 'ArticleController',
				templateUrl: 'detail.html',
				resolve: angular.extend({}, resolver)
			});
	}]);
		
	mobilete.controller('AppController',
			['$scope', '$mdToast', '$window', 'Settings', 'Api', 'Inform',
			function($scope, $mdToast, $window, Settings, Api, Inform) {
		$scope.$on('$routeChangeError', function (event, current, prev, rejection) {
			if (rejection && rejection.id == 'invalid-sid') {
				Settings.set('sid', null);
				Inform('Unknow token');
				$window.location.href = '#/login';
			}
		});
		$scope.$on('backTo', function (event, current, prev) {
			if (current != prev) {
				$scope.back = current;
			}
		});
	}]);
	
	mobilete.controller('SettingsController',
			['$scope', '$window', 'Settings', 'Api', 'Inform',
			function($scope, $window, Settings, Api, Inform) {
		$scope.settings = {
			api: Settings.get()['api-url'],
			unread_only: Settings.get()['unread_only']
		};
		
		$scope.doSave = function(settings) {
			$scope.saving = true;
			Api.setApi(settings.api).then(
				function() {
					Inform('Settings saved');
					Settings.set('api-url', settings.api);
					Settings.set('unread_only', settings.unread_only);
					$scope.form.api.$error.invalid = false;
					$window.location.href = '#/';
				},
				function() {
					$scope.saving = false;
					Inform('invalid or not working API');
					$scope.form.api.$error.invalid = true;
				}
			);
		}
		$scope.emit('backTo', '#/');
	}]);
	
	mobilete.controller('LoginController',
			['$scope', '$window', 'Settings', 'Api', 'Inform',
			function($scope, $window, Settings, Api, Inform) {
		$scope.login = {user: '', password: ''};
		$scope.doLogin = function(login) {
			$scope.saving = true;
			$scope.form.user.$error.invalid = false;
			$scope.form.password.$error.invalid = false;
			$scope.form.user.$error.unavailable = false;
			Api.login(login.user, login.password).then(
				function (data) {
					Settings.set('sid', data.content.session_id);
					$window.location.href = '#/feeds'
				},
				function (reason) {
					$scope.saving = false;
					if (reason.id === 'invalid-api') {
						Inform('Invalid or not working API');
						$scope.form.user.$error.unavailable = true;
					} else {
						Inform('Wrong user/pass');
						$scope.form.user.$error.invalid = true;
						$scope.form.password.$error.invalid = true;
					}
				}
			);
		}
		
		$scope.emit('backTo', null);
	}]);
	
	mobilete.controller('CategoryController',
			['$scope', 'Api', 'Inform',
			 function($scope, Api, Inform) {
		Api.categories().then(
			function (data) {
				$scope.categories = data.content;
				if (!data.content.length){
					Inform('Empty');
				}
			}
		);
		
		$scope.emit('backTo', null);
	}]);
	
	mobilete.controller('CategoryItemController',
			['$rootScope', '$scope', '$window', 'Settings', 'Api', 'Inform',
			function($rootScope, $scope, $window, Settings, Api, Inform) {
		$scope.colapse = false;
		$scope.iconPath = Settings.icon;
		$scope.$watch('colapse', function (value) {
			if (value) {
				Api.feeds(value).then(function(data){
					$scope.items = data.content;
					if (!data.content.length){
						Inform('Empty');
					}
				});
			}
		});
		$scope.openItem= function(item, category){
			$rootScope.feed = item;
			$window.location.href = '#/feeds/' + category.id + '/'+ item.id;
		};
	}]);
	
	mobilete.controller('FeedController',
			['$rootScope', '$scope', '$routeParams', '$window', 'Settings', 'Api', 'Inform',
			function($rootScope, $scope, $routeParams, $window, Settings, Api, Inform) {
		$scope.iconPath = Settings.icon;
		$scope.items = false;
		$scope.unread_only = Settings.get()['unread_only'] ? 'unread_only' : 'read_and_unread'
		
		if ($rootScope.feed) {
			$scope.feed = $rootScope.feed;
		} else {
			Api.feeds($routeParams.category).then(function(data){
				for(var i in data.content) {
					var feed = data.content[i];
					if (feed.id == $routeParams.feed) {
						$scope.feed = feed;
						break;
					}
				}
			});			
		}
		
		$scope.emit('backTo', '#/feeds/');

		var items = []
		Api.feed($routeParams.feed, Settings.get()['unread_only'])
		.then(function(data){
			$scope.items = data.content;
			items = data.content;
			if (!data.content.length){
				Inform('Empty');
			}
		});
		
		$scope.openItem= function(item, index){
			$rootScope.article = item;
			$rootScope.index = index;
			$rootScope.list = items;
			$window.location.href = '#/feeds/' +
				$routeParams.category + '/' +
				$routeParams.feed + '/'+
				item.id;
		};
		
		$scope.markAsReaded = function(article, event){
			Inform('Marked as readed');
			article.unread = false;
			Api.markAsReaded(article.id);
		}
		
		$scope.openInOtherTab = function(article, event) {
			Inform('Open in new tab/window');
			Api.markAsReaded(article.id);
			window.open(article.link, article.link);
		}
	}]);
	
	mobilete.controller('ArticleController',
			['$rootScope', '$scope', '$routeParams', '$window', 'hotkeys', 'Api', 'Inform',
			function($rootScope, $scope, $routeParams, $window, hotkeys, Api, Inform) {
		$scope.article = $rootScope.article || {};
		$scope.items = null
		
		Api.article($routeParams.article).then(function(data){
			for (var i in data.content) {
				$scope.article = angular.extend({}, $scope.article, data.content[i]);
				data.content[i].content =
				(
				 data.content[i].content||''
				).replace(/width=/, 'width-change-by-mobilete-rss=');
			}
			$scope.items = data.content;
			Api.markAsReaded($routeParams.article);
		});
		
		$scope.emit('backTo', '#/feeds/' +
			$routeParams.category + '/' +
			$routeParams.feed);
		
		var list = $rootScope.list || [],
		index = $rootScope.index || 0;
			
		$scope.openOtherItem= function(to){
			var newIndex = index + to;
			if (newIndex >= 0 && newIndex <= list.length-1) {
				$rootScope.article = list[newIndex];
				$rootScope.index = newIndex;
				$window.location.href = '#/feeds/' +
					$routeParams.category + '/' +
					$routeParams.feed + '/'+
					list[newIndex].id;
			} else {
				Inform('Nothing this side');
			}
		};
		
		$scope.hasNext = false;
		$scope.hasPrev = false;
		if (list && list.length > 0) {
			if (index - 1 >= 0 && index -1 <= list.length-1) {
				$scope.hasNext = true;
			}
			if (index + 1 >= 0 && index +1 <= list.length-1) {
				$scope.hasPrev = true;
			}
		}
		
		hotkeys
			.bind($scope)
			.add(
				{
					combo: 'left',
					description: 'Show prev',
					callback: function() {$scope.openOtherItem(-1);} 
				}
			)
			.add(
				{
					combo: 'right',
					description: 'Show next',
					callback: function() {$scope.openOtherItem(+1);} 
				}
			);
	}]);
})();