(function(){
	'use strict';
    var injector = angular.element(document).injector();
    
    injector.invoke(['Plugins', function(Plugins) {
		function removeTables(content){
			content = content.replace(/(<\/?)table([^>]*>)/ig, '$1div$2');
			content = content.replace(/(<\/?)tr([^>]*>)/ig, '$1div$2');
			content = content.replace(/(<\/?)td([^>]*>)/ig, '$1span$2');
			return content;
		}
		
		function getUrl(content) {
			var url = content.replace(/.+<a([^>]+)>\[link\].+/, '$1');
			url = url.replace(/.+href='?"?([^"']+).+/, '$1')
			return url;
		}
		
		function appendVoteButton(content) {
			var URL = getUrl(content),
				btn = '<script type="text/javascript" src="//www.reddit.com/buttonlite.js?url='+URL+'&newwindow=1"></script>';
			return content + btn;
		}
		
        Plugins.watch('before-show-article', function(args){
			if (args && args.link && args.link.match('www.reddit.com')) {
				args.link = args.link.replace('www.reddit.com', 'm.reddit.com');
				if (args.content) {
					args.content = removeTables(args.content);
					//args.content = appendVoteButton(args.content);
				}
			}
            return args;
        });
    }]);
})();