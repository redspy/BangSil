angular.module('myAppMod').controller('ApprovalRequestController', 
	['$scope', '$interval', 'ApprovalRequest', 'RequestRoom', 'Motel', 'AcceptMotelApproval',
	function($scope, $interval, ApprovalRequest, RequestRoom, Motel, AcceptMotelApproval)
	{
		// 마지막한 요청에서 5분이 지나면 자동으로 조건검색으로
		$scope.acceptedMotels = [];

		RequestRoom.last({"id":"last"}, function(data){
			if (data['valid'])
			{
				$scope.requestCond = data['request'];
				$scope.request_id = data['request']['id'];
				ApprovalRequest.get({"id":$scope.request_id}, function(data){
					$scope.approval = data;
					Motel.readByUUID({'id':'uuid', 'uuid':data['request']['motel_id']}, function(data){
							$scope.acceptedMotels = [data];
					});
				});
			}
		});

		$scope.submitReservation = function() {
			// 예약 요청 보내기
			// 예약 요청 대기 페이지로 이동
			console.log($scope.approval);
			AcceptMotelApproval.accept({'id': $scope.approval['request']['id']}, function(){
				window.location = "#/waitpaymentconfirm";	
			});			
		};

		$scope.submitRefuse = function() {
			window.location = "#/waitrequest";
		};		
	}
]);