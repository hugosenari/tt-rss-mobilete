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
			['$scope', '$mdToast', '$window', 'Settings', 'Api', 'Inform', 'Plugins',
			function($scope, $mdToast, $window, Settings, Api, Inform, Plugins) {
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
		Plugins.load();
	}]);
	
	mobilete.controller('SettingsController',
			['$scope', '$window', '$routeParams', 'Settings', 'Api', 'Inform', 'Plugins',
			function($scope, $window, $routeParams, Settings, Api, Inform, Plugins) {
		var settings = Settings.get(),
			plugins_src = $routeParams.plugin || [];
		if (angular.isString(plugins_src)) {
			plugins_src = [plugins_src];
		}
		
		for(var i in plugins_src){
			settings['plugins'] = settings['plugins'].concat([{
				src: plugins_src[i],
				enabled: false
			}]);
		}
		
		$scope.settings = {
			api: settings['api-url'],
			unread_only: settings['unread_only'],
			plugins: settings['plugins']
		};
		
		$scope.save = function(settings) {
			$scope.saving = true;
			Api.setApi(settings.api).then(
				function() {
					Inform('Settings saved');
					Settings.set('api-url', settings.api);
					Settings.set('unread_only', settings.unread_only);
					var plugins = [];
					for(var i in settings.plugins){
						if (!settings.plugins[i].removed) {
							plugins.push(settings.plugins[i]);
						}
					}
					Settings.set('plugins', plugins);
					Plugins.load();
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
		
		$scope.addPlugin = function(newPlugin){
			if (newPlugin) {
				plugins_src.push(newPlugin);
			}
			var plugins_param = [];
			for(var i in plugins_src){
				plugins_param.push('plugin=' + plugins_src[i]);
			}
			$window.location.href = '#/settings?' + plugins_param.join('&');
		}
		$scope.$emit('backTo', '#/');
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
		
		$scope.$emit('backTo', null);
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
		
		$scope.$emit('backTo', null);
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
			['$rootScope', '$scope', '$routeParams', '$window', 'hotkeys', 'Settings', 'Api', 'Inform', 'Plugins',
			function($rootScope, $scope, $routeParams, $window, hotkeys, Settings, Api, Inform, Plugins) {
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
		
		$scope.$emit('backTo', '#/feeds/');

		var items = [],
		index = 0;
		
		Api.feed($routeParams.feed, Settings.get()['unread_only'])
			.then(function(data){
				data.content = Plugins.apply('before-list-headlines', data.content);
				$scope.items = data.content;
				items = data.content;
				if (!data.content.length){
					Inform('Empty');
				} else {
					bindShortcuts();
					focusOn(0);
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
			article.unread = false;
			Api.markAsReaded(article.id);
			window.open(article.link, article.link);
		}
		
		function focusOn(to) {
			var newIndex = index + to;
			if (newIndex >= 0 && newIndex <= items.length-1) {
				angular.element(
					document.querySelector('.md-list-item' + index + ' button')
				).removeClass('md-focused');
				angular.element(
					document.querySelector('.md-list-item' + newIndex + ' button')
				).addClass('md-focused');
				index = newIndex;
			}
		}
		
		function showFocused() {
			$rootScope.article = items[index];
			$rootScope.index = index;
			$rootScope.list = items;
			$window.location.href = '#/feeds/' +
				$routeParams.category + '/' +
				$routeParams.feed + '/'+
				items[index].id;
		}
		
		function markFocusedAsRead() {
			Inform('Marked as readed');
			items[index].unread = false;
			Api.markAsReaded(items[index].id);
			focusOn(+1);
		}
		
		function openFocusedInOtherTab() {
			Inform('Open in new tab/window');
			window.open(items[index].link, items[index].link);
			items[index].unread = false;
			Api.markAsReaded(items[index].id);
			focusOn(+1);
		}
		
		function bindShortcuts() {
			hotkeys
				.bindTo($scope)
				.add(
					{
						combo: 'right',
						description: 'Focus prev',
						callback: function() {focusOn(-1);}
					}
				)
				.add(
					{
						combo: 'left',
						description: 'Focus next',
						callback: function() {focusOn(+1);}
					}
				)
				.add(
					{
						combo: 'space',
						description: 'Show current',
						callback: showFocused
					}
				)
				.add(
					{
						combo: 'r',
						description: 'Mark as Read',
						callback: markFocusedAsRead
					}
				)
				.add(
					{
						combo: 'o',
						description: 'Open link',
						callback: openFocusedInOtherTab
					}
				);
		}
	}]);
	
	mobilete.controller('ArticleController',
			['$rootScope', '$scope', '$routeParams', '$window', '$sce', 'hotkeys', 'Api', 'Inform', 'Plugins',
			function($rootScope, $scope, $routeParams, $window, $sce, hotkeys, Api, Inform, Plugins) {
		$scope.article = $rootScope.article || {};
		$scope.items = null
		
		Api.article($routeParams.article).then(function(data){
			for (var i in data.content) {
				data.content[i] = Plugins.apply('before-show-article', data.content[i]);
				$scope.article = angular.extend({}, $scope.article, data.content[i]);
				data.content[i].content = $sce.trustAsHtml(
					data.content[i].content||''
				);
			}
			$scope.items = data.content;
			$scope.$watch('items', function(val){
				if (val) {
					setTimeout(function(){Plugins.apply('after-show-article', val)}, 200);
				}
			});
			Api.markAsReaded($routeParams.article);
		});
		
		$scope.$emit('backTo', '#/feeds/' +
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

		
		function openInOtherTab() {
			Inform('Open in new tab/window');
			window.open($scope.article.link, $scope.article.link);
		}
		
		$scope.hasNext = false;
		$scope.hasPrev = false;
		if (list && list.length > 0) {
			if (index - 1 >= 0 && index -1 <= list.length-1) {
				$scope.hasNext = true;
			}
			if (index + 1 >= 0 && index +1 <= list.length-1) {
				$scope.hasPrev = true;
			}
			hotkeys
				.bindTo($scope)
				.add(
					{
						combo: 'left',
						description: 'Show Prev',
						callback: function() {$scope.openOtherItem(-1);} 
					}
				)
				.add(
					{
						combo: 'right',
						description: 'Show Next',
						callback: function() {$scope.openOtherItem(+1);} 
					}
				)
				.add(
					{
						combo: 'o',
						description: 'Open link',
						callback: openInOtherTab
					}
				);
		}
	}]);
})();
