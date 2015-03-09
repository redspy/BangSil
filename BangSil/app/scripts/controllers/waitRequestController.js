// scripts/controllers/RequestController.js
angular.module('myAppMod').controller('WaitRequestController', 
	['$scope', '$interval', 'ApprovalRequest', 'RequestRoom', 'Motel',
	function($scope, $interval, ApprovalRequest, RequestRoom, Motel)
	{
		// 마지막한 요청에서 5분이 지나면 자동으로 조건검색으로

		RequestRoom.last({"id":"last"}, function(data){
			console.log(data);
			if (data['valid'])
			{
				$scope.request_id = data['request']['id'];

				$approvalRequestToken = $interval(function(){
					ApprovalRequest.get({"id":$scope.request_id}, function(data){
						if (data['valid'])
						{
							window.location = "#/approvalrequest";
							$interval.cancel($approvalRequestToken);
						}
					});
				}, 3000);
			}
		});
		
	}
]);