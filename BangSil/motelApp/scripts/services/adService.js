// scripts/services/adService.js
angular.module('myAppMod').service('AdService', ['$resource', function($resource){
	this.Query = $resource('/api/ad', {}, {
		query: {method: 'GET', isArray: true}
	}).query;
}]);