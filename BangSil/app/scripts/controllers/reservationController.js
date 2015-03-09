// scripts/controllers/reservationController.js
angular.module('myAppMod').controller('ReservationController', 
    ['$scope', '$http', 'Motel',
    function($scope, $http, Motel) {
        $scope.name = '예약관리';

        Motel.readAll({}, function (data){
            $scope.rooms = data;
        });

        $scope.regions = ['송파구', '강남구', '관악구', '서초구', '동작구', '은평구', '금천구', '중구', '서대문구'];

        $scope.payExamples = ['20000원', '21000원', '22000원', '23000원', '24000원', '25000원', '26000원', '27000원', '28000원', '29000원',
            '30000원', '31000원', '32000원', '33000원', '34000원', '35000원', '36000원', '37000원', '38000원', '39000원',
        ];

    }
]);

var DatepickerDemoCtrl = function($scope) {
    $scope.today = function() {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function() {
        $scope.dt = null;
    };

    // Disable weekend selection
    //   $scope.disabled = function(date, mode) {
    //     return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    //   };

    $scope.toggleMin = function() {
        $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.initDate = new Date('2016-15-20');
    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[1];
};