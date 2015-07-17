(function(){
	angular.module('ttRssMobilete').controller('AppController', ['$scope', function($scope) {
		$scope.settings = angular.extend({
			'api-url': '/api/',
			'sid':  null,
			'icons_dir': 'feed-icons',
			'icons_url': 'feed-icons',
			'daemon_is_running': false,
			'num_feeds': 0,
		}, localStorage.getItem('settings'));
	}]);
	
	angular.module('ttRssMobilete').controller('LoadingController', ['$scope', function($scope) {
		$scope.guidon.hideBack = 1;
		if ($scope.settings.sid) {
			$scope.guidon.replacePage('categories.html', { animation: "none" });
		} else {
			$scope.guidon.replacePage('login.html', { animation: "none" });
		}
	}]);
	
	angular.module('ttRssMobilete').controller('LoginController', ['$scope', function($scope) {
		$scope.guidon.hideBack = 1;
		if ($scope.settings.sid) {
			$scope.guidon.replacePage('categories.html', { animation: "none" });
		}
	}]);
	
	angular.module('ttRssMobilete').controller('CategoryController', ['$scope', function($scope) {
		console.log('CategoryController', $scope);
		$scope.guidon.hideBack = 1;
		if (!$scope.settings.sid) {
			$scope.guidon.replacePage('login.html', { animation: "none" });
		}
	}]);
})();