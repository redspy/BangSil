// scripts/controllers/ConfigController.js
angular.module('myAppMod').controller('ConfigController', 
	['$scope', 'MotelByUUID', 'Motel',
	function($scope, MotelByUUID, Motel)
	{
		$scope.config = {};
		console.log(localStorage.getItem('AppKey'));
		MotelByUUID.read(
			{"uuid":localStorage.getItem('AppKey')}, 
			function(data){
				$scope.motel = data;
				$scope.config.isOn = ($scope.motel.alarm == '1') ? 'on' : 'off';
				$scope.config.pivotMoney = $scope.motel.lowerfee;

				console.log(data);

				$scope.$watch('config.isOn', function(nv, ov) {
					var data = {};
					data.id = $scope.motel.id;
					data.alarm = (nv == 'on') ? 1 : 0;
					Motel.update(data);
				});

				$scope.$watch('config.pivotMoney', function(nv, ov) {
					var data = {};
					data.id = $scope.motel.id;
					data.lowerfee = nv;
					Motel.update(data);
				});
			}
		);

		
	}
]);