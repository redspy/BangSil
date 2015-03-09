// scripts/controllers/ApprovalController.js
angular.module('myAppMod').controller('ApprovalController', 
	['$scope', '$interval', 'WaitPaymentConfirm', 'ConfirmPayment',
	function($scope, $interval, WaitPaymentConfirm, ConfirmPayment){
		WaitPaymentConfirm.readAll(function(data){
			$scope.requests = data;
		});

		var refreshToken = $interval(function(){
				WaitPaymentConfirm.readAll(function(data){
				$scope.requests = data;
			});
		}, 5000);

		$scope.$on('$locationChangeStart', function( event ){
			$interval.cancel(refreshToken);
		});

		$scope.submitConfirm = function (id) {
			ConfirmPayment.confirm({'id':id}, function (){
			});
		}
	}
]);