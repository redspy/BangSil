// scripts/controllers/RequestController.js
angular.module('myAppMod').controller('RequestController', ['$scope', 'RequestRoom', 'ApprovalRequest', '$timeout',
    function ($scope, RequestRoom, ApprovalRequest, $timeout) {

        var refreshToken = null;

        function requestRooms() {
            RequestRoom.readAll({}, function (data) {
                $scope.requests = data;

                refreshToken = $timeout(requestRooms, 5000);
            });
        }

        requestRooms();

        $scope.$on('$locationChangeStart', function () {
            $timeout.cancel(refreshToken);
        });

        $scope.submitApproval = function (id) {
            ApprovalRequest.create({
                "id": id
            });
        };
    }
]);
