// scripts/controllers/reservationController.js
angular.module('myAppMod').controller('ReservationController', 
	['$scope', '$interval', 'ConfirmPayment',
	function($scope, $interval, ConfirmPayment){
		ConfirmPayment.confirm({}, function (data){
			$scope.reservations = data;
		});
		
		var refreshToken = $interval(function(){
			ConfirmPayment.confirm({}, function (data){
				$scope.reservations = data;
			});
		}, 5000);

		$scope.$on('$locationChangeStart', function( event ){
			$interval.cancel(refreshToken);
		});
	}
]);