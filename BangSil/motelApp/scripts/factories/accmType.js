// scripts/factories/accmType.js

angular.module('myAppMod').factory('AccmType', ['$resource', function($resource){
	return $resource('/api/accmType/:id',  
	{},
	{
        create:		{method: 'POST'},
        read:		{method: 'GET'},
		readAll:	{method: 'GET', isArray: true},
        update:		{method: 'PUT'},
        delete:		{method: 'DELETE'},
	});
}]);


angular.module('myAppMod').factory('AccmType1', ['$resource', '$upload', function($resource, $upload){
	var res = $resource('/api/accmType/:id', {}, {
        create:		{method: 'POST'},
        read:		{method: 'GET'},
		readAll:	{method: 'GET', isArray: true},
        update:		{method: 'PUT'},
        delete:		{method: 'DELETE'}
    });

	return {
	    create: function (id, data, callback, progress)
	    {
	    	console.log(data.icon);

	    	$upload.upload({
	    		url: '/api/accmType',
	    		method: 'POST',
	    		data: data,
	    		file: data.icon,
	    		fileFormDataName: 'icon'
	    	})
	    	.progress(progress || function () {})
	    	.success(function(data, status, headers, config){
	    		callback();	
	    	});
	    }
	};
}]);