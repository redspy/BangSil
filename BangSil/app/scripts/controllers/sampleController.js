// scripts/controllers/sampleController.js
angular.module('myAppMod').controller('SampleController', ['$scope', 'AccmType', 'AccmItem', function($scope, AccmType, AccmItem){
	$scope.map = {
		center: {
			latitude: 37.269854,
			longitude: 127.133675
		},
		zoom: 16,
		bounds:  {},
		options: {
			minZoom: 7,
			zoomControl: false,
			streetViewControl: false,
			mapTypeControl: false,
			panControl: false
		}
	};
	$scope.toiletMarkers = [];
	
	AccmType.readAll(function(data){
		$scope.accmTypes = data;
		
		AccmItem.readAll(function(data){
			$scope.accmItems = data;
			
			$scope.toiletMarkers = [];
			
			$scope.accmItems.forEach(function(elem, index, array){
				elem.marker = createMarker(elem.id, elem.geox, elem.geoy, elem.desc, elem.type);
				$scope.toiletMarkers.push(elem.marker);
			});
		});
	});

	$scope.onAccmItemClicked = function(accmItem)
	{
		$scope.map.center = { latitude: accmItem.geox, longitude: accmItem.geoy};
	};
	
	$scope.getAccmItems = function(accmType)
	{
		return _.filter($scope.accmItems, function(elem){
			return elem.type == accmType.id;
		});
	}
		
	$scope.$watch( 
		function () { return $scope.map.bounds; }, 
		function (newValue, oldValue){
			
		});
		
	var createMarker = function (id, geoX, geoY, description, type)
	{
		var icon = "images/" + _.find($scope.accmTypes, function(elem) { return elem.id == type;}).icon;
		
		var ret = {
			id: id,
			options: {
				draggable: false,
				labelAnchor:'15 34',
				labelContent: description,
				labelClass: 'labelMarker',
			},
			latitude: geoX,
			longitude: geoY,
			title: 'title',
			icon: icon
		};
		return ret;
	};
	
}]);