angular.module('myAppMod').factory('Advertise', ['$resource', '$upload', function($resource, $upload){
	var res = $resource('/api/ad/:id', {}, {
		readAll: {method: 'GET', isArray: true},
		read: 	 {method:'GET'},
        delete:	 {method: 'DELETE'}
    });

	return {
	    create: function (data, success, progress)
	    {
	    	$upload.upload({
	    		url: '/api/ad',
	    		method: 'POST',
	    		data: data,
	    		file: data.banner,
	    	})
	    	.progress(progress || function () {})
	    	.success(success || function () {});
	    },
	    readAll: res.readAll,
	    read: res.read,
	    delete: res.delete
	};
}]);