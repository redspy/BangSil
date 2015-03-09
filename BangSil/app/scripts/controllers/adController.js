// scripts/controllers/adController.js
angular.module('myAppMod').controller('AdController', ['$scope', 'Advertise', function($scope, Advertise){
	$scope.name = '유용한정보';

	Advertise.readAll({}, function (data){
		$scope.ads = data;
	});
}]);