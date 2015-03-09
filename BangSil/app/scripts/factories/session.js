// scripts/factories/session.js

angular.module('myAppMod').factory('Session', ['$resource', function($resource){
	return $resource('/api/session/:type',  
	{},
	{
        create:		{method: 'POST'},
        read:		{method: 'GET'},
        update:		{method: 'PUT'},
        delete:		{method: 'DELETE'},
	});
}]);