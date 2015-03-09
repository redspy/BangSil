// scripts/app.js
var App = angular.module('myApp', [
 // modules that ''myApp' depends on
 'myAppMod',
 'ngRoute',
    'ui.bootstrap',
 'mobile-angular-ui',
 'google-maps'.ns(),
 'angularFileUpload',
 'http-auth-interceptor',
 'sprintf',
 'angular-datepicker'
]);

// default module
angular.module('myAppMod', [
 'ngResource'
]);

// routing
App.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
        when('/main', {
            templateUrl: 'views/mainView.html',
            controller: 'MainController'
        }).
        when('/stay', {
            templateUrl: 'views/stayView.html',
            controller: 'StayController'
        }).
        when('/stay/:tab', {
            templateUrl: 'views/stayView.html',
            controller: 'StayController'
        }).
        when('/waitrequest', {
            templateUrl: 'views/waitRequestView.html',
            controller: 'WaitRequestController'
        }).
        when('/approvalrequest', {
            templateUrl: 'views/approvalRequestView.html',
            controller: 'ApprovalRequestController'
        }).
        when('/waitpaymentconfirm', {
            templateUrl: 'views/waitPaymentConfirmView.html',
            controller: 'WaitPaymentConfirmController'
        }).
        when('/paymentconfirmed', {
            templateUrl: 'views/paymentConfirmedView.html',
            controller: 'PaymentConfirmedController'
        }).
        when('/transport', {
            templateUrl: 'views/transportView.html',
            controller: 'TransportController'
        }).
        when('/convenience', {
            templateUrl: 'views/convenienceView.html',
            controller: 'ConvenienceController'
        }).
        when('/ad', {
            templateUrl: 'views/adView.html',
            controller: 'AdController'
        }).
        when('/admin', {
            templateUrl: 'views/adminView.html',
            controller: 'AdminController'
        }).
        when('/session', {
            templateUrl: 'views/sessionView.html',
            controller: 'SessionController'
        }).
        when('/sample', {
            templateUrl: 'views/sampleView.html',
            controller: 'SampleController'
        }).
        otherwise({
            redirectTo: '/stay'
        });
}]).controller('MainController', function ($rootScope, $scope, Session) {

    $rootScope.$on("$routeChangeStart", function () {
        $rootScope.loading = true;
    });

    $rootScope.$on("$routeChangeSuccess", function () {
        $rootScope.loading = false;
    });
}).constant('ENV', {
    refreshDuration: 10000
});