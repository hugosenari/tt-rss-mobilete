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
		console.log(domain);
		if (domain.match(/\.youtube\./i)) {
			return function(content){
				return content;
			}
		}
		if (domain.match(/\.i\.imgur\./i)) {
			return function(content){
				return content;
			}
		}
		return undefined;
	}
    
    injector.invoke(['Plugins', function(Plugins) {
        Plugins.watch('before-show-article', function(args){
			if (args && args.link && args.link.match('www.reddit.com')) {
				args.link = args.link + '.compact'
				//if (args.content) {
				//	args.content = targetBlank(args.content);
				//	var link = findLink(args.content);
				//	var type = linkType(link);
				//	if (type) {
				//		args.content = type(args.content);
				//	}
				//}
			}
            return args;
        });
    }]);
})();