(function(){
	'use strict';
    var mobilete = angular.module('ttRssMobilete'),
		appScope = null,
		informer = function($mdToast){
			return function(msg) {
				$mdToast.show(
				  $mdToast.simple()
					.content(msg)
					.position('top left')
					.hideDelay(3000)
				);
			}
		},
		inform = null;
		
		mobilete.config(['$routeProvider',
						 function($routeProvider, Settings){
			$routeProvider
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
					templateUrl: 'categories.html'
				})
				.when('/feeds/:category/:feed', {
					controller: 'FeedController',
					templateUrl: 'items.html'
				})
				.when('/feeds/:category/:feed/:article', {
					controller: 'ArticleController',
					templateUrl: 'detail.html'
				});
		}]);
		
	mobilete.controller('AppController',
						['$scope', '$mdToast', '$window', 'Settings', 'Api',
						function($scope, $mdToast, $window, Settings, Api) {
		appScope = $scope;
		if (Settings.get().sid) {
			Api.session(Settings.get().sid).catch(
				function (){
					inform('Expired Session');
					Settings.set('sid', null);
					$window.location.href = '#/login';
			});
		} else {
			$window.location.href = '#/login';
		}
		$scope.back = null;
		inform = informer($mdToast);
	}]);
	
	mobilete.controller('SettingsController',
						['$scope', '$window', 'Settings', 'Api',
						function($scope, $window, Settings, Api) {
		$scope.settings = {
			api: Settings.get()['api-url'],
			unread_only: Settings.get()['unread_only']
		};
		
		$scope.doSave = function(settings) {
			$scope.saving = true;
			Api.setApi(settings.api).then(
				function() {
					inform('Settings saved');
					Settings.set('api-url', settings.api);
					Settings.set('unread_only', settings.unread_only);
					$scope.form.api.$error.invalid = false;
					$window.location.href = '';
				},
				function() {
					$scope.saving = false;
					inform('invalid or not working API');
					$scope.form.api.$error.invalid = true;
				}
			);
		}
	}]);
	
	mobilete.controller('LoginController',
						['$scope', '$window', 'Settings', 'Api',
						function($scope, $window, Settings, Api) {
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
						inform('Invalid or not working API');
						$scope.form.user.$error.unavailable = true;
					} else {
						inform('Wrong user/pass');
						$scope.form.user.$error.invalid = true;
						$scope.form.password.$error.invalid = true;
					}
				}
			);
		}
	}]);
	
	mobilete.controller('CategoryController',
						['$scope', 'Api',
						 function($scope, Api) {
		Api.categories().then(
			function (data) {
				$scope.categories = data.content;
				if (!data.content.length){
					inform('Empty');
				}
			}
		);
	}]);
	
	mobilete.controller('CategoryItemController',
						['$scope', '$window', 'Settings', 'Api',
						function($scope, $window, Settings, Api) {
		$scope.colapse = false;
		$scope.iconPath = Settings.icon;
		$scope.$watch('colapse', function (value) {
			if (value) {
				Api.feeds(value).then(function(data){
					$scope.items = data.content;
					if (!data.content.length){
						inform('Empty');
					}
				});
			}
		});
		$scope.openItem= function(item, category){
			appScope.feed = item;
			$window.location.href = '#/feeds/' + category.id + '/'+ item.id;
		};
	}]);
	
	mobilete.controller('FeedController',
						['$scope', '$routeParams', '$window', 'Settings', 'Api',
						function($scope, $routeParams, $window, Settings, Api) {
		$scope.iconPath = Settings.icon;
		$scope.items = false;
		$scope.unread_only = Settings.get()['unread_only'] ? 'unread_only' : 'read_and_unread'
		
		if (appScope.feed) {
			$scope.feed = appScope.feed;
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

		var items = []
		Api.feed($routeParams.feed, Settings.get()['unread_only'])
		.then(function(data){
			$scope.items = data.content;
			items = data.content;
			if (!data.content.length){
				inform('Empty');
			}
		});
		
		$scope.openItem= function(item, index){
			appScope.article = item;
			appScope.index = index;
			appScope.list = items;
			$window.location.href = '#/feeds/' +
				$routeParams.category + '/' +
				$routeParams.feed + '/'+
				item.id;
		};
		
		$scope.markAsReaded = function(article, event){
			inform('Marked as readed');
			article.unread = false;
			Api.markAsReaded(article.id);
		}
		
		$scope.openInOtherTab = function(article, event) {
			inform('Open in new tab/window');
			Api.markAsReaded(article.id);
			window.open(article.link, article.link);
		}
	}]);
	
	mobilete.controller('ArticleController',
						['$scope', '$routeParams', '$window', 'Api',
						function($scope, $routeParams, $window, Api) {
		$scope.article = appScope.article ? appScope.article : {};
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

		$scope.openOtherItem= function(to){
			var list = appScope.list || [],
				index = (appScope.index || 0)  + to;
			if (index >= 0 && index <= list.length-1) {
				appScope.article = list[index];
				appScope.index = index;
				$window.location.href = '#/feeds/' +
					$routeParams.category + '/' +
					$routeParams.feed + '/'+
					list[index].id;
			} else {
				inform('Nothing this side');
			}
		};
	}]);
})();