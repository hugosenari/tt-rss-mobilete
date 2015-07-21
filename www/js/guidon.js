(function(){
	'use strict';
    var mobilete = angular.module('ttRssMobilete'),
		appScope = null,
		history = [],
		goTo = function(page, params){
			history.unshift(angular.extend({}, params, {tpl: page}));
			appScope.template = page
		},
		back = function() {
			history.shift();
			appScope.template = history[0].tpl;
		},
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
		
	mobilete.controller('AppController', ['$scope', '$mdToast', 'Settings', 'Api',
						function($scope, $mdToast, Settings, Api) {
		appScope = $scope;
		if (Settings.get().sid) {
			Api.session(Settings.get().sid).then(
				function() {
					goTo('categories.html')
				},
				function (){
					inform('Expired Session');
					Settings.set('sid', null);
					goTo('login.html');
			});
		} else {
			goTo('login.html');
		}
		$scope.goTo = goTo;
		$scope.back = back;
		inform = informer($mdToast);
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
					inform('API info saved');
					Settings.set('api-url', settings.api);
					$scope.form.api.$error.invalid = false;
					back();
				},
				function() {
					$scope.saving = false;
					inform('invalid or not working API');
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
			goTo('items.html', {feed:item});
		};
	}]);
	
	mobilete.controller('FeedController', ['$scope', 'Settings', 'Api',
						function($scope, Settings, Api) {
		$scope.feed = history[0].feed;
		$scope.iconPath = Settings.icon;
		$scope.items = false;
		Api.feed(history[0].feed.id).then(function(data){
			$scope.items = data.content;
		});
		$scope.openItem= function(item){
			goTo('detail.html', {article: item});
		};
		
		$scope.markAsReaded = function(id, event){
			inform('Marked as readed');
			Api.markAsReaded(id);
			angular.element(event.target).removeClass('unread');
			angular.element(event.target).addClass('read');
		}
	}]);
	
	mobilete.controller('ArticleController', ['$scope', 'Settings', 'Api',
						function($scope, Settings, Api) {
		$scope.article = history[0].article;
		$scope.iconPath = Settings.icon;
		Api.article(history[0].article.id).then(function(data){
			$scope.items = data.content;
			Api.markAsReaded(history[0].article.id);
		});
	}]);
})();