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

angular.module('myAppMod').directive('sessionChecker', ['Session', 'authService', '$window', '$modal', '$rootScope', 'Alert', function (Session, authService, $window, $modal, $rootScope, Alert) {
    return {
        restrict: 'C',
        link: function (scope, element, attrs) {
            scope.$on('event:auth-loginRequired', function () {
                console.log("Session Required");

                if ("SessionBridge" in $window) {
                    console.log("Acquire Session Information...");
                    $window.SessionBridge.register();
                }
                if ("SessionBridge" in $window) {
                    console.log("Acquire Session Information...");
                    $window.SessionBridge.register();
                }

                // 사용자 GCM의 UUID가 들어가야함.
                var appKey = localStorage.getItem('AppKey');
                var appType = localStorage.getItem('AppType');
                var gcmId = localStorage.getItem('GCMID');

                console.log("Session:", appKey, appType, gcmId);

                $rootScope.session = {};
                $rootScope.session.appKey = appKey;
                $rootScope.session.appType = appType;
                $rootScope.session.gcmId = gcmId;

                if (gcmId == null || appKey == null || appType == null)
                {
                    Alert.show('서버에 등록중', '최초 실행으로 앱을 서버에 등록하고 있습니다. 종료 후 1분 후에 다시 실행해 주세요');
                }
                else if (gcmId != '' && appKey != '' && appType != '')
                {
                    console.log("Session:", 'Session.create');
                    Session.create({
                        "type": appType
                    }, {
                        "uuid": appKey,
                        'gcmId': gcmId
                    }, function (response) {
                        console.log(response);
                        if (response.valid){
                            console.log("Session Registered");
                            authService.loginConfirmed();    
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

angular.module('myAppMod').directive('gpsDistance', [function(){
    function distanceBetween(lat1, lon1, lat2, lon2) {
        var radFactor = 0.0174532925199433;
        var R = 6371; // km
        var dLat = (lat2 - lat1) * radFactor;
        var dLon = (lon2 - lon1) * radFactor;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * radFactor) * Math.cos(lat2 * radFactor) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.asin(Math.sqrt(a));
        return R * c;
    }
    return {
        restrict: 'A',
        scope: {
            gpsDistance: '='
        },
        link: function (scope, element, attrs) {
            console.log('gps-distance');
            scope.$watch(function() { return scope.gpsDistance; }, function(nv, ov){
                var input = nv;
                var length = "계산중";

                if (input.from && input.to) {
                    if (input.from.lat && input.from.lon && input.to.lat && input.to.lon) {
                        if (angular.isNumber(input.from.lat * 1) && angular.isNumber(input.from.lon * 1) &&
                            angular.isNumber(input.to.lat * 1) && angular.isNumber(input.to.lon * 1)) {
                            var d = distanceBetween(input.from.lat, input.from.lon, input.to.lat, input.to.lon);

                            if (d < 1) {
                                d *= 1000;
                                length = sprintf('%d m', d);
                            } else {
                                length = sprintf('%.2f km', d);
                            }
                        }
                    }
                }

                element.text(length);
            });
        }
    }
}]);
