// scripts/factories/accmItem.js
angular.module('myAppMod').factory('AccmItem', ['$resource', function($resource){
	return $resource('/api/accmItem/:id', 
	{},
	{
        create:		{method: 'POST'},
        read:		{method: 'GET'},
		readAll:	{method: 'GET', isArray: true},
        update:		{method: 'PUT'},
        delete:		{method: 'DELETE'},
	});
}]);