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
		
        Plugins.watch('before-show-article', function(args){
			if (args && args.link && args.link.match('www.reddit.com')) {
				args.link = args.link.replace('www.reddit.com', 'm.reddit.com');
				if (args.content) {
					args.content = removeTables(args.content);
				}
			}
            return args;
        });
    }]);
})();