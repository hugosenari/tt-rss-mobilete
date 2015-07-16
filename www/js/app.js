(function(){
	'use strict';
	var module = ons.bootstrap('ttRssMobilete', [
		'onsen',
		'onsen.directives'
	]),
	sid = localStorage.getItem('sid'),
	settings = localStorage.getItem('settings');
	
	module.controller('AppController', function($scope) {
	});
	
	module.controller('LoadingController', function($scope) {
		if (sid) {
			$scope.guidon.pushPage('categories.html', {});
		} else if (settings) {
			$scope.guidon.pushPage('login.html', {});
		} else {
			$scope.guidon.pushPage('settings.html', {});
		}
	});
})();