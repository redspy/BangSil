angular.module('myAppMod').controller('WaitPaymentConfirmController', 
	['$scope', '$interval', 'ConfirmPayment',
	function($scope, $interval, ConfirmPayment)
	{
		var refreshToken = $interval(function(){
			ConfirmPayment.readAll(function (data){
				if (data.length > 0){
					window.location = "#/paymentconfirmed";	
					$interval.cancel(refreshToken);
				}
			});
		}, 5000);

		$scope.$on('$locationChangeStart', function( event ){
			$interval.cancel(refreshToken);
		});
		
	}
]);