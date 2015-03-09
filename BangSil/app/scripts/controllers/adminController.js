// scripts/controllers/adminController.js
angular.module('myAppMod').controller('AdminController', ['$scope', '$upload', 'AccmType', 'AccmItem', 'CallTaxi', 'Session', 'Advertise', 'Motel', 'MotelApprovalQueue', 'Regions', 'Alert', 'BatchAccmItem', 'BatchBusStop',
    function ($scope, $upload, AccmType, AccmItem, CallTaxi, Session, Advertise, Motel, MotelApprovalQueue, Regions, Alert, BatchAccmItem, BatchBusStop) {
        $scope.name = '관리자 모드';

        localStorage.setItem('AppType', 'client');
        localStorage.setItem('AppKey', 'ZF017754-0AC7-4FDF-8100-F8757214190B');
        localStorage.setItem('GCMID', 'APA91bGh2_2pxImzpgyvQ3Y61_KnE9s0DYlLn-5nyxukKl6RTehZw9p3V1acGZjJuN5pKgkWWCYVow47CipAr-duB0WuR11FLXUZZdGZPijx1GuNUFI40C6wI9yNRcdIg6XY_sRTUhnCCj8VN6-rR6jy2zeVWwqDtmcTr-K-E2FwyZpOgrqLrQ8');
        localStorage.setItem('PhoneNumber', '010-8807-7279');

        $scope.opTimeOptions = _.range(0, 25);

        $scope.refresh = function () {
            AccmType.readAll({}, function (data) {
                $scope.accmTypes = data;
                $scope.curAccmType = {};
            });
        };

        $scope.removeAccmType = function (id) {
            AccmType.delete({
                "id": id
            }, function () {
                $scope.refresh();
            });
        };

        $scope.submitCurrentItem = function () {
            if ($scope.curAccmType.hasOwnProperty('id')) {
                //
            } else {
                console.log($scope.icon);
                AccmType.create({}, $scope.curAccmType, function () {
                    $scope.refresh();
                });
            }
        };

        $scope.refreshAccmItems = function () {
            AccmItem.readAll({}, function (data) {
                $scope.accmItems = data;
            });
        };

        $scope.removeAccmItem = function (id) {
            AccmItem.delete({
                "id": id
            }, function () {
                $scope.refreshAccmItems();
            });
        };

        $scope.submitCurrentAccmItem = function () {
            if ($scope.curAccmItem.hasOwnProperty('id')) {

            } else {
                var geo = $scope.curAccmItem.geo.split(', ');
                $scope.curAccmItem.geox = geo[0];
                $scope.curAccmItem.geoy = geo[1];
                delete $scope.curAccmItem["geo"];

                AccmItem.create({}, $scope.curAccmItem, function () {
                    $scope.refreshAccmItems();
                    $scope.curAccmItem = {};
                });
            }
        };

        $scope.refreshCallTaxis = function () {
            CallTaxi.readAll({}, function (data) {
                $scope.callTaxis = data;
            });
        };

        $scope.removeCallTaxi = function (id) {
            CallTaxi.delete({
                "id": id
            }, function () {
                $scope.refreshCallTaxis();
            });
        }

        $scope.submitCurrentCallTaxi = function () {
            if ("id" in $scope.curCallTaxi) {

            } else {
                CallTaxi.create({}, $scope.curCallTaxi, function () {
                    $scope.refreshCallTaxis();
                    $scope.curCallTaxi = {};
                });
            }
        }


        $scope.submitAdvertise = function () {
            $scope.curAd.link = $scope.curAd.type + $scope.curAd.link;
            delete $scope.curAd['type'];

            Advertise.create($scope.curAd, function () {
                $scope.curAd = {};
                $scope.refreshAds();
            });
        }

        $scope.refreshAds = function () {
            Advertise.readAll({}, function (data) {
                $scope.ads = data;
            });
        }

        $scope.removeAd = function (id) {
            Advertise.delete({
                'id': id
            }, function () {
                $scope.refreshAds();
            });
        }

        $scope.submitMotel = function () {
            if ($scope.curMotel.hasOwnProperty('gps')) {
                var gps = $scope.curMotel.gps.split(', ');

                $scope.curMotel.geox = gps[0];
                $scope.curMotel.geoy = gps[1];

                delete $scope.curMotel.gps;
            }

            $scope.curMotel.alarm = 1;
            $scope.curMotel.lowerfee = 0;

            if ($scope.curMotel.hasOwnProperty('id')) {
                Motel.update($scope.curMotel);
            } else {
                Motel.create($scope.curMotel);
            }

            $scope.refreshMotels();
            $scope.curMotel = {};
        }

        $scope.refreshMotels = function () {
            Motel.readAll({}, function (data) {
                $scope.motels = data;
            });
        }

        $scope.removeMotel = function (id) {
            Motel.delete({
                'id': id
            }, function () {
                $scope.refreshMotels();
            });
        }

        $scope.modifyMotel = function (data) {
        	$scope.curMotel = {};
        	shallowClearAndCopy(data, $scope.curMotel);
        	delete $scope.curMotel.mainimg;
            $scope.curMotel.gps = $scope.curMotel.geox + ', ' + $scope.curMotel.geoy;
        }

        $scope.cancelMotel = function () {
            $scope.curMotel = {};
        }

        $scope.onMotelSelected = function () {
            $scope.curMotel = {};
            $scope.refreshRegions();
            $scope.refreshMotels();

            MotelApprovalQueue.readAll({}, function (data) {
                $scope.motelApprovalQueue = data;
            });
        }

        $scope.onAdSelected = function () {
            $scope.curAd = {};
            $scope.refreshAds();
        }


        $scope.onCallTaxiSelected = function () {
            $scope.curCallTaxi = {};

            CallTaxi.readAll({}, function (data) {
                $scope.callTaxis = data;
            });
        }

        $scope.onAccmSelected = function () {
            $scope.curAccmType = {};

            AccmType.readAll({}, function (data) {
                $scope.accmTypes = data;
            });

            $scope.curAccmItem = {};

            AccmItem.readAll({}, function (data) {
                $scope.accmItems = data;
            });
        }


        $scope.refreshRegions = function () {
            Regions.readAll(function (response) {
                $scope.regions = response;
                $scope.curRegion = {};
            });
        };
        $scope.onRegionSelected = function () {
            $scope.curRegion = {};
            $scope.refreshRegions();
        };

        $scope.confirmRegion = function () {
            if ($scope.curRegion.name.length == 0) {
                // 에러메시지...
            }

            if ($scope.curRegion.hasOwnProperty('id')) {
                var id = $scope.curRegion.id;
                delete $scope.curRegion.id;

                Regions.update({
                    'id': id
                }, $scope.curRegion, function (response) {
                    $scope.refreshRegions();
                });
            } else {
                Regions.create($scope.curRegion, function (response) {
                    $scope.refreshRegions();
                });
            }
        };

        $scope.removeRegion = function (region) {
            Regions.delete({
                'id': region.id
            }, function (response) {
                $scope.refreshRegions();
            });
        };

        $scope.updateRegion = function (region) {
            $scope.curRegion = region;
            console.log(region);
        };


        $scope.batchAccmItems = {};
        $scope.submitAccmDatabase = function () {
            console.log($scope.batchAccmItems)
            BatchAccmItem.create($scope.batchAccmItems);
            $scope.batchAccmItems = {};
        }

        $scope.batchBusStop = {};
        $scope.submitBusStop = function () {
            BatchBusStop.create($scope.batchBusStop);
            $scope.batchBusStop = {};
        }
    }
]);
