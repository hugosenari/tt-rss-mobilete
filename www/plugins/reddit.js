(function(){
	'use strict';
    var injector = angular.element(document).injector();
    
    injector.invoke(['Plugins', function(Plugins) {
		function targetBlank(content){
			return content.replace(/(href="[^"]+")/gi, '$1 target="_blank"');
		}
		
		function findLink(content){
			var link = content.replace(/.*<a[^>]+href="([^"]+)"[^>]*>\s*\[link\]\s*<\/a\s*>\s*<a[^>]+>\s*\[.*/gim, '$1');
			return link;
		}
		
		function linkType(link){
			var domain = link.replace(/^https?:\/\/([^:?/]+)[:?/]*.*/i, '$1');
			if (domain.match(/\.youtube\./i)) {
				return function(content){
					var path = getYoutubePath(link);
					content = content + getYoutubeIframe(path);
					return content;
				}
			}
			if (domain.match(/imgur\./i)) {
				return function(content){
					content = content + getImagurIframe(link);
					return content;
				}
			}
			return undefined;
		}
		
		function getYoutubeIframe(path){
			return '<style>\
.ytEmbed { position: relative; padding-bottom: 56.25%; padding-top: 25px; height: 0; }\
.ytEmbed iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }\
</style>\
<br/><div class="ytEmbed"><iframe src="https://www.youtube.com/embed/' + path + '" frameborder="0"  flex="80"/></div>';
		}
	
		
		function getImagurIframe(path){
			var id = path.replace(/.+imgur\.com\/([^.#]+)\.*.*#*.*/, '$1');
			id = id.replace(/gallery\//, '');
			return ! id ? '':'<blockquote class="imgur-embed-pub" lang="en" data-id="' + id  + '" data-context="false">\
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
		
		function getYoutubePath(link) {
			var params = link.replace(/[^?]+\?(.+)/g, '$1'),
			id = params.replace(/.*v=([^&]+).*/g, '$1');
			params = params.replace(/v=([^&]+)&*/g, '');
			return id + (params? '?' + params : '');
		}
		
		function removeTables(content){
			content = content.replace(/<table([^>]*)>/ig, '');
			content = content.replace(/<\/table([^>]*)>/ig, '');
			content = content.replace(/<tr([^>]*)>/ig, '<div$1>');
			content = content.replace(/<\/tr([^>]*)>/ig, '</div$1>');
			content = content.replace(/<td([^>]*)>/ig, '<span$1>');
			content = content.replace(/<\/td([^>]*)>/ig, '</span$1>');
			return content;
		}
		
        Plugins.watch('before-show-article', function(args){
			if (args && args.link && args.link.match('www.reddit.com')) {
				args.link = args.link.replace('www.reddit.com', 'm.reddit.com');
				if (args.content) {
					args.content = targetBlank(args.content);
					args.content = removeTables(args.content);
					var link = findLink(args.content);
					var type = linkType(link);
					if (type) {
						args.content = type(args.content);
					}
				}
			}
            return args;
        });
    }]);
})();
