// scripts/directives/sampleDirective.js
angular.module('myAppMod').directive('percentHeight', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var parentHeight = $('ng-view').outerHeight();
            var height = parentHeight * attrs.percentHeight / 100;
            element.height(height);
        }
    };
});

angular.module('myAppMod').directive('mapHeight', function () {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            var className = attrs.to;
            var parentHeight = $('ng-view').outerHeight();
            var height = parentHeight * attrs.height / 100;
            $(className).height(height);
        }
    };
});

angular.module('myAppMod').directive('tabScroll', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var tabHeight = $(element).parent().parent().parent().children('ul.nav').outerHeight();
            var parentHeight = $(element).parent().parent().parent().innerHeight();
            var contentHeight = parentHeight - tabHeight;

            $(element).parent().height(contentHeight);
        }
    };
});

angular.module('myAppMod').directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        scope: {
            fileModel: '=',
        },
        link: function (scope, element, attrs) {
            element.bind('change', function (event) {
                scope.$apply(function () {
                    var files = [],
                        fileList, i;
                    fileList = event.__files_ || event.target.files;
                    if (fileList != null) {
                        for (i = 0; i < fileList.length; i++)
                            files.push(fileList[i]);
                    }

                    scope.fileModel = 'multiple' in attrs ? files : files[0];
                    console.log(scope.fileModel);
                });
            });

            scope.$watch(function () {
                return scope.fileModel;
            }, function (file) {
                if (file == undefined) {
                    $(element).val(null);
                }
            })
        }
    };
}]);

angular.module('myAppMod').directive('sessionChecker', ['Session', 'authService', '$window', '$modal', 'Alert', function (Session, authService, $window, $modal, Alert) {
    return {
        restrict: 'C',
        link: function (scope, element, attrs) {
            scope.$on('event:auth-loginRequired', function () {
                console.log("Session Required");

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
                            authService.loginConfirmed();
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
            scope.$on('event:auth-loginConfirmed', function () {
                console.log("Session Confirmed");
            });
        }
    };
}]);
