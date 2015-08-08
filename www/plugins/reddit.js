(function(){
	'use strict';
    var injector = angular.element(document).injector();
	
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
		if (domain.match(/i\.imgur\./i)) {
			return function(content){
				content = content + getImagurIframe(link);
				return content;
			}
		}
		return undefined;
	}
	
	function getYoutubeIframe(path){
		return '\
<style>\
.ytEmbed {\
    position: relative;\
    padding-bottom: 56.25%; /* 16:9 */\
    padding-top: 25px;\
    height: 0;\
}\
.ytEmbed iframe {\
    position: absolute;\
    top: 0;\
    left: 0;\
    width: 100%;\
    height: 100%;\
}\
</style>\
<br/>\
<div class="ytEmbed">\
	<iframe src="https://www.youtube.com/embed/' + path + '" frameborder="0"  flex="80"/>\
</div>';
	}

	
	function getImagurIframe(path){
		var id = path.replace(/https?:\/\/[^/]+\/([^.]+).*/g, '$1');
		return !path.match(/\.gifv/g)?'':'\
<style>\
.imgurEmbed {\
    position: relative;\
    padding-bottom: 56.25%; /* 16:9 */\
    padding-top: 25px;\
    height: 0;\
}\
.imgurEmbed iframe {\
    position: absolute;\
    top: 0;\
    left: 0;\
    width: 100%;\
    height: 100%;\
	border: 0;\
}\
</style>\
<br/>\
<div class="imgurEmbed">\
	<iframe src="' + path + '" frameborder="0"  flex="80" height=500/>\
</div>';
	}
	
	function getYoutubePath(link) {
		var params = link.replace(/[^?]+\?(.+)/g, '$1'),
		id = params.replace(/.*v=([^&]+).*/g, '$1');
		params = params.replace(/v=([^&]+)&*/g, '');
		return id + (params? '?' + params : '');
	}
    
    injector.invoke(['Plugins', function(Plugins) {
        Plugins.watch('before-show-article', function(args){
			if (args && args.link && args.link.match('www.reddit.com')) {
				args.link = args.link + '.compact'
				if (args.content) {
					args.content = targetBlank(args.content);
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