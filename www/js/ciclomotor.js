(function(){
	'use strict';
    var mobilete = angular.module('ttRssMobilete');
	
	mobilete.factory('Settings', ['$http', '$q', function($http, $q) {
		var settings = angular.extend({
			'api-url': '/api/',
			'sid':  null,
			'icons_dir': 'feed-icons',
			'icons_url': 'feed-icons',
			'daemon_is_running': false,
			'num_feeds': 0,
			'unread_only': false,
		}, localStorage.getItem('settings'));
		
		function getSettings() {
			return angular.extend({}, settings, JSON.parse(localStorage.getItem('settings')));
		}
		
		function setSetting(key, value) {
			settings[key] = value;
			localStorage.setItem('settings', JSON.stringify(settings) );
		}
		
		function getIconUri(id) {
			return settings['api-url'] + '../' + settings['icons_dir'] + '/' + id + '.ico';
		}
		
		return {
			get: getSettings,
			set: setSetting,
			icon: getIconUri
		}
	}]);
})();