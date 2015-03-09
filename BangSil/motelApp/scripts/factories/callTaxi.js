// scripts/factories/callTaxi.js
angular.module('myAppMod').factory('CallTaxi', ['$resource', function($resource){
	return $resource('/api/callTaxi/:id', 
	{},
	{
        create:		{method: 'POST'},
        read:		{method: 'GET'},
		readAll:	{method: 'GET', isArray: true},
        update:		{method: 'PUT'},
        delete:		{method: 'DELETE'},
	});
}]);