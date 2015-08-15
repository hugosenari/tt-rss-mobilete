(function(){
	'use strict';
	var injector = angular.element(document).injector();
	
	injector.invoke(['Plugins', function(Plugins) {
		Plugins.watch('before-show-article', function(args){
			if (args && args.content) {
				args.content = args.content.replace(/(href="[^"]+")/gi, '$1 target="_blank"');
			}
			return args;
		});
	}]);
})();