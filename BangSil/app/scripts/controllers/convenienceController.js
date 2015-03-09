// scripts/controllers/convenienceController.js
angular.module('myAppMod').controller('ConvenienceController', ['$scope', 'AccmType', 'AccmItem', '$q',
    function ($scope, AccmType, AccmItem, $q) {

        $scope.name = '편의시설';
        $scope.map = {
            center: {
                latitude: 37.751849,
                longitude: 128.876069
            },
            zoom: 16,
            bounds: {},
            options: {
                minZoom: 7,
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                panControl: false
            }
        };
        $scope.userPosition = [];
        $scope.userPositionOptions = {
            draggable: true,
            icon: {
                anchor: {
                    x: 32,
                    y: 32
                },
                url: "images/currentgps.png"
            }
        }

        navigator.geolocation.getCurrentPosition(function (position) {
            $scope.map.center = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }
            $scope.$apply();
        }, function () {}, {
            enableHighAccuracy: true,
            maximumAge: 5000
        });

        navigator.geolocation.watchPosition(function (position) {
            $scope.userPosition = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }
            $scope.$apply();
        }, function () {}, {
            enableHighAccuracy: true,
            maximumAge: 5000
        });

        $scope.mapMarker = [];

        var accmTypeService = AccmType.readAll();
        var accmItemService = AccmItem.readAll();

        $q.all([
            accmTypeService.$promise,
            accmItemService.$promise
        ]).then(function (result) {
            $scope.accmTypes = result[0];
            $scope.accmItems = result[1];

            google.maps.event.trigger($scope.map, 'resize');
        });

        $scope.getAccmItems = function (accmType) {
            return _.filter($scope.accmItems, function (elem) {
                return elem.type == accmType.id;
            });
        }

        $scope.openedMarker = null;

        var createMarker = function (id, geoX, geoY, type) {
            var icon = "images/icons/" + _.find($scope.accmTypes, function (elem) {
                return elem.id == type;
            }).icon;

            var ret = {
                id: id,
                options: {
                    draggable: false,
                    labelAnchor: '15 34',
                },
                latitude: geoX,
                longitude: geoY,
                icon: icon,
                show: false
            };

            return ret;
        };

        $scope.onAccmTypeClicked = function (accmType) {
            $scope.mapMarker = [];

            $scope.getAccmItems(accmType).forEach(function (elem, index, array) {
                var marker = createMarker(elem.id, elem.geox, elem.geoy, elem.type);
                var hour = (new Date()).getHours();

                marker.title = elem.name;
                marker.address = elem.address;
                marker.rate = elem.rate || '';
                marker.isOpened = (elem.begintime <= hour && elem.endtime >= hour);

                marker.click = function () {
                    if ($scope.openedMarker) {
                        $scope.openedMarker.show = false;
                    }

                    marker.show = !marker.show;
                    $scope.openedMarker = marker;
                }
                $scope.mapMarker.push(marker);

                elem.marker = marker;
            });
        }

        $scope.onAccmItemClicked = function (accmItem) {
            $scope.map.center = {
                latitude: accmItem.geox,
                longitude: accmItem.geoy
            };

            accmItem.marker.click();
        };
    }
]);