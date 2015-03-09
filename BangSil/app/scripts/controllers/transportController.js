// scripts/controllers/transportController.js
angular.module('myAppMod').controller('TransportController', ['$scope', 'CallTaxi', 'BusStop', 'BusLine', function($scope, CallTaxi, BusStop, BusLine){
    $scope.name = '교통정보';
    $scope.randomMarkers = [];
    $scope.userPosition = [];
    $scope.userPositionOptions = {
        draggable: true,
        icon: {
            anchor: {x: 32, y: 32},
            url: "images/currentgps.png"
        }
    }

    CallTaxi.readAll(function(data){
        $scope.callTaxis = data;
        console.log(data);
    });

    BusLine.readAll(function (data) {
        $scope.busLine = data;
    });

    $scope.getBusLine = function (no) {
        return _.find($scope.busLine, function (item) { return item.no == no;}).route;
    }
    
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

    navigator.geolocation.getCurrentPosition(function(position){
        $scope.map.center = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        $scope.userPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };

        $scope.$apply();

        console.log($scope.userPosition);
    }, function () { },  {enableHighAccuracy: true, maximumAge: 5000});

    $scope.busStops = [];
    

    var createRandomMarker = function (i, geox, geoy, name, buses, idKey, data) {
        if (idKey == null) {
            idKey = "id";
        }

        var latitude = geox;
        var longitude = geoy;
        var ret = {
            latitude: latitude,
            longitude: longitude,
            title: name,
            buses: buses,
            show: false,
            icon: 'images/bus.png',
        };
        ret.onClick = function() {
            ret.show = !ret.show;
            $scope.busStops = _.filter(ret.buses.split(' '), function(item) { return item != ''; });
        };
        ret[idKey] = i;
        return ret;
    };
    
    // Get the bounds from the map once it's loaded

    BusStop.readAll(function (response) {
        angular.forEach(response, function (res) {
            $scope.randomMarkers.push(createRandomMarker(res.id, res.geox, res.geoy, res.name, res.buses));
        });
    });
}]); 