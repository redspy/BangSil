// scripts/factories/accmType.js
angular.module('myAppMod').factory('AccmType', ['$resource', '$upload', function($resource, $upload){
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
	    }, 
	    read: res.read,
	    readAll: res.readAll,
	    update: res.update,
	    delete: res.delete
	};
}]);