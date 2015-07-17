(function(){
	'use strict';
	angular.module('ttRssMobilete').factory('Messages', function(){
		var messages = [];
		function setMessage(msg) {
			messages.push(msg);
		}
		function getMessages() {
			return messages.slice(0);
		}
		return {
			set: setMessage,
			get: getMessages
		};
	});
	
	angular.module('ttRssMobilete').factory('Settings', function($http) {
		var settings = angular.extend({
			'api-url': '/api/',
			'sid':  null,
			'icons_dir': 'feed-icons',
			'icons_url': 'feed-icons',
			'daemon_is_running': false,
			'num_feeds': 0,
		}, localStorage.getItem('settings'));
		
		function getSettings() {
			return angular.extend({}, settings, localStorage.getItem('settings'));
		}
		
		function setSetting(key, value) {
			settings[key] = value;
			localStorage.setItem('settings', settings);
		}

		return {
			get: getSettings,
			set: setSetting
		}
	});
    
	angular.module('ttRssMobilete').factory('ciclomotor', function(){
		var messages = [];
		function setMessage(msg) {
			messages.push(msg);
		}
		function getMessages() {
			return messages.slice(0);
		}
		return {
			set: setMessage,
			get: getMessages
		};
	});
})();