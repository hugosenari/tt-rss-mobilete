(function(){
	'use strict';
    var injector = angular.element(document).injector();
	
	function getImagurBtn(path){
		var id = path.replace(/.+imgur\.com\/([^.#?]+)\.*.*/, '$1');
		id = id.replace(/gallery\//, '');
		return !id ? '':'<blockquote class="imgur-embed-pub" lang="en" data-id="' + id  + '" data-context="false">\
<md-button class="md-fab md-mini md-raised" title="show this"\
	onclick="(function(){'+
		'var script = document.createElement(\'script\');'+
		'script.type = \'text/javascript\';'+
		'script.src = \'//s.imgur.com/min/embed.js\';'+
		'body.appendChild(script);})();">\
  <i class="material-icons" style="font-size:44px;">play_circle_outline</i>\
</md-button>\
</blockquote>';
	}
	
	function getUrls(cb) {
		var as = document.querySelectorAll('.article-content a');
		for (var i=0; i < as.length; i++) {
			var url = angular.element(as[i]).attr('href');
			if (url.match(/https?:\/\/[^.]*\.?imgur(\.|\\)/i)) {				
				cb(url);
			}
		}
	}
    
    injector.invoke(['Plugins', function(Plugins) {
        Plugins.watch('after-show-article', function(args){
			var myHtml = null;
			getUrls(function(url){
				myHtml = (myHtml||'') + getImagurBtn(url);
			});
			if (myHtml) {
				var contents = document.querySelectorAll('.article-content');
					angular.element(contents).append(angular.element(myHtml));
			}
            return args;
        });
    }]);
})();