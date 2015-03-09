angular.module('myAppMod').controller('NotRegisteredMotelDlgController', ['$scope', 'sessions', function ($scope, sessions) {
    $scope.sessions = sessions;
}]);
