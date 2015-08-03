(function(){
	'use strict';
	var mobilete = angular.module('ttRssMobilete');

	mobilete.factory('Inform', ['$mdToast', function($mdToast) {
		return function(msg) {
			$mdToast.show(
			  $mdToast.simple()
				.content(msg)
				.position('top left')
				.hideDelay(3000)
			);
		}
	}]);
	
	mobilete.factory('Plugins', ['Settings', function(Settings) {
		var before = [];
		function addScript(src) {
			var body = document.getElementsByTagName('body')[0];
			if (src) {
				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.src = src
				body.appendChild(script);
			}
		}
		return {
			addScript: addScript,
			load: function () {
				var plugins = Settings.get()['plugins'];
				for (var i in plugins) {
					if (plugins[i] && plugins[i].enabled && plugins[i].src) {
						addScript(plugins[i].src);
					}
				}
			},
			watch: function(match, callback) {
				if (callback) {
					before.push(
						{ match: match, callback:callback }
					)
				}
			},
			apply: function(name, params){
				for (var i in before){
					var item = before[i];
					if (item.match && name.match(item.match)) {
						try{
							params = item.callback(params);
						} catch(e) {
							window.console && window.console.log(e);
						}
					}
				}
				return params;
			}
		}
	}]);
	
	mobilete.factory('Settings', ['$http', '$q', function($http, $q) {
		var settings = angular.extend({
			'api-url': '/api/',
			'sid':  null,
			'icons_dir': 'feed-icons',
			'icons_url': 'feed-icons',
			'daemon_is_running': false,
			'num_feeds': 0,
			'unread_only': false,
			'plugins': [
				{src: 'plugins/reddit.js'}
			],
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