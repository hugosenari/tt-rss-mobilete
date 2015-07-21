(function(){
	'use strict';
    var mobilete = angular.module('ttRssMobilete'),
		appScope = null,
		goTo = function(tpl){
			appScope.backto = appScope.template;
			appScope.template = tpl;
		};
		
	mobilete.controller('AppController', ['$scope', 'Settings', 'Api',
						function($scope, Settings, Api) {
		appScope = $scope;
		$scope.template = Settings.get().sid ? 'categories.html' : 'login.html';
		if (Settings.get().sid) {
			Api.session(Settings.get().sid)
			.catch(function (){
				Settings.set('sid', null);
				goTo('login.html');
			});
		}
		$scope.goTo = goTo;
	}]);
	
	mobilete.controller('SettingsController', ['$scope', 'Settings', 'Api',
						function($scope, Settings, Api) {
		$scope.settings = {
			api: Settings.get()['api-url']
		};
		
		$scope.doSave = function(settings) {
			$scope.saving = true;
			Api.setApi(settings.api).then(
				function() {
					Settings.set('api-url', settings.api);
					$scope.form.api.$error.invalid = false;
					goTo($scope.backto);
				},
				function() {
					$scope.form.api.$error.invalid = true;
				}
			);
		}
	}]);
	
	mobilete.controller('LoginController', ['$scope', 'Settings', 'Api',
						function($scope, Settings, Api) {
		$scope.login = {user: '', password: ''};
		$scope.doLogin = function(login) {
			$scope.saving = true;
			$scope.form.user.$error.invalid = false;
			$scope.form.password.$error.invalid = false;
			$scope.form.user.$error.unavailable = false;
			Api.login(login.user, login.password).then(
				function (data) {
					Settings.set('sid', data.content.session_id);
					goTo('categories.html');
				},
				function (reason) {
					if (reason.id === 'invalid-api') {
						$scope.form.user.$error.unavailable = true;
					} else {
						$scope.form.user.$error.invalid = true;
						$scope.form.password.$error.invalid = true;
					}
				}
			);
		}
	}]);
	
	mobilete.controller('CategoryController', ['$scope', 'Api',
						function($scope, Api) {
		Api.categories().then(
			function (data) {
				$scope.categories = data.content;
			}
		);
	}]);
	
	mobilete.controller('CategoryItemController', ['$scope', 'Settings', 'Api',
						function($scope, Settings, Api) {
		$scope.colapse = false;
		$scope.iconPath = Settings.icon;
		$scope.$watch('colapse', function (value) {
			if (value) {
				Api.feeds(value).then(function(data){
					$scope.items = data.content;
				});
			}
		});
		$scope.openItem= function(item){
			appScope.feed = item;
			goTo('items.html');
		};
	}]);
	
	mobilete.controller('FeedController', ['$scope', 'Settings', 'Api',
						function($scope, Settings, Api) {
		$scope.feed = appScope.feed;
		$scope.iconPath = Settings.icon;
		$scope.items = false;
		Api.feed(appScope.feed.id).then(function(data){
			console.log(data.content);
			$scope.items = data.content;
		});
		$scope.openItem= function(item){
			appScope.article = item;
			goTo('detail.html');
		};
		
		$scope.markAsReaded = function(id, event){
			console.log('swipe');
			Api.markAsReaded(id);
			angular.element(event.target).removeClass('unread');
			angular.element(event.target).addClass('read');
		}
	}]);
	
	mobilete.controller('ArticleController', ['$scope', 'Settings', 'Api',
						function($scope, Settings, Api) {
		$scope.article = appScope.article;
		$scope.iconPath = Settings.icon;
		Api.article(appScope.article.id).then(function(data){
			$scope.items = data.content;
			Api.markAsReaded(appScope.article.id);
		});
	}]);
})();