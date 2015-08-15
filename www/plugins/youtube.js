(function(){
	'use strict';
    var injector = angular.element(document).injector();
	
	function getMyStyle() {
		return '<style>\
	.ytEmbed { position: relative; padding-bottom: 56.25%; padding-top: 25px; height: 0; }\
	.ytEmbed iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }\
</style>';
	}
	
	function getYoutubeIframe(path, text){
		var reggae = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/i,
			id = path.replace(reggae, '$1');
return '<md-button class="md-fab md-mini md-raised" title="' + text + '" vid="'+ id +'"' +
		'onclick="(function(){appendYoutube(\''+ id +'\');})();">\
  <i class="material-icons" style="font-size:44px;">play_circle_outline</i>\
</md-button>';
		//return ;
	}
	
	window.appendYoutube = function(id, ele) {
		var myHtml = '<div class="ytEmbed"><iframe src="https://www.youtube.com/embed/' + id + '" frameborder="0"  flex="80"/></div>';
		var contents = document.querySelectorAll('.article-content');
			angular.element(contents).append(angular.element(myHtml));
			angular.element(document.querySelectorAll('md-button[vid="'+ id +'"]')).remove();
	}
	
	function getYoutubePath(link) {
		var params = link.replace(/[^?]+\?(.+)/g, '$1'),
		id = params.replace(/.*v=([^&]+).*/g, '$1');
		params = params.replace(/v=([^&]+)&*/g, '');
		return id + (params? '?' + params : '');
	}
	
	function getYoutubeUrls(cb) {
		var as = document.querySelectorAll('.article-content a');
		for (var i=0; i < as.length; i++) {
			var url = angular.element(as[i]).attr('href'),
				text = angular.element(as[i]).text();
			if (url.match(/.*youtu.*(\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/i)) {
				cb(url, text);
			}
		}
	}
    
    injector.invoke(['Plugins', function(Plugins) {
        Plugins.watch('after-show-article', function(args){
			var myHtml = null;
			getYoutubeUrls(function(url, text){
				myHtml = (myHtml||'') + getYoutubeIframe(getYoutubePath(url), text);
			});
			if (myHtml) {
				myHtml = myHtml + getMyStyle();
				var contents = document.querySelectorAll('.article-content');
					angular.element(contents).append(angular.element(myHtml));
			}
            return args;
        });
    }]);
})();

var b = 974589/2015;