// scripts/app.js
var App = angular.module('myApp', [
	// modules that ''myApp' depends on
	'myAppMod',
	'ngRoute',
    'ui.bootstrap',
	'mobile-angular-ui',
	'google-maps',
	'angularFileUpload',
	'http-auth-interceptor'
]);

// default module
angular.module('myAppMod', [
	'ngResource'
]);

// routing
App.config(['$routeProvider', function($routeProvider){
	$routeProvider.
		when('/config', {
			templateUrl: 'views/configView.html',
			controller: 'ConfigController'
		}).
		when('/request', {
			templateUrl: 'views/requestView.html',
			controller: 'RequestController'
		}).
		when('/reservation', {
			templateUrl: 'views/reservationView.html',
			controller: 'ReservationController'
		}).
		when('/approval', {
			templateUrl: 'views/approvalView.html',
			controller: 'ApprovalController'
		}).
		otherwise({
			redirectTo: '/request'
		});
}])
.run(function ($window, Session, Alert) {
    if ("SessionBridge" in $window) {
        console.log("Acquire Session Information...");
        $window.SessionBridge.register();
    }

    // 사용자 GCM의 UUID가 들어가야함.
    var appKey = localStorage.getItem('AppKey');
    var appType = localStorage.getItem('AppType');
    var gcmId = localStorage.getItem('GCMID');

    console.log(appKey);
    console.log(gcmId);

    if (gcmId == null || appKey == null || appType == null)
    {
        Alert.show('서버에 등록중', '최초 실행으로 앱을 서버에 등록하고 있습니다. 종료 후 1분 후에 다시 실행해 주세요');
    }
    else if (gcmId != '' && appKey != '' && appType != '')
    {
        Session.create({
            'type': appType
        }, {
            'uuid': appKey,
            'gcmId': gcmId
        }, function (response) {
            if (response.valid) {
                console.log("Session Registered");
            } else {
                var modalObj = $modal.open({
                    templateUrl: 'views/notRegisteredMotelDialog.html',
                    controller: 'NotRegisteredMotelDlgController',
                    backdrop: 'static',
                    resolve: {
                        sessions: function () {
                            return {
                                'appKey': appKey,
                                'appType': appType,
                                'gcmKey': gcmId
                            };
                        }
                    }
                });
            }
        });
    }
    else
    {
        //Alert.show('Session', 'Session Error' + appKey + ", " + appType + ", " + gcmId);
        Alert.show('서버에 등록중', '최초 실행으로 앱을 서버에 등록하고 있습니다. 종료 후 1분 후에 다시 실행해 주세요');
    }
});

App.controller('MainController', function($rootScope, $scope){
	console.log("onload");
  $rootScope.$on("$routeChangeStart", function(){
    $rootScope.loading = true;
  });

  $rootScope.$on("$routeChangeSuccess", function(){
    $rootScope.loading = false;
  });

});