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
				if (!data.content.length){
					inform('Empty');
				}
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
					if (!data.content.length){
						inform('Empty');
					}
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
		$scope.unread_only = Settings.get()['unread_only'] ? 'unread_only' : 'read_and_unread'
		var items = []
		Api.feed(history[0].feed.id,
				 Settings.get()['unread_only']
		).then(function(data){
			$scope.items = data.content;
			items = data.content;
			if (!data.content.length){
				inform('Empty');
			}
		});
		$scope.openItem= function(item, index){
			goTo('detail.html', {article: item, list:items, index: index});
		};
		
		function markAsRead(id, target) {
			
		}
		
		$scope.markAsReaded = function(article, event){
			inform('Marked as readed');
			article.unread = false;
			Api.markAsReaded(article.id);
		}
		$scope.openInOtherTab = function(article, event) {
			inform('Open in new tab');
			Api.markAsReaded(article.id);
			window.open(article.link, '_'+Math.random());
		}
	}]);
	
	mobilete.controller('ArticleController', ['$scope', 'Api',
						function($scope, Api) {
		$scope.article = history[0].article;		
		function load(id) {
			$scope.items = null
			Api.article(id).then(function(data){
				for (var i in data.content) {
					data.content[i].content =
					(
					 data.content[i].content
					 ||''
					).replace(/width=/, 'width-change-by-mobilete-rss=');
				}
				$scope.items = data.content;
				Api.markAsReaded(id);
			});
		}
		
		load(history[0].article.id);

		$scope.openOtherItem= function(to){
			var list = history[0].list,
				index = history[0].index + to;
			if (index >= 0 && index <= list.length-1) {
				history[0] = {
					article: list[index],
					list:list,
					index: index
				};
				$scope.article = list[index];
				load(list[index].id);
			} else {
				inform('Nothing this side');
			}
		};
	}]);
})();