//
angular.module('myAppMod').controller('StayController', ['ENV', '$scope', '$interval', '$window', '$routeParams', 'Motel', 'RequestRoom', 'ApprovalRequest', 'AcceptMotelOffer', 'ConfirmPayment', 'LastStatus', 'RejectMotelOffer', 'Regions', 'Alert', 'Reservations',
    function (ENV, $scope, $interval, $window, $routeParams, Motel, RequestRoom, ApprovalRequest, AcceptMotelOffer, ConfirmPayment, LastStatus, RejectMotelOffer, Regions, Alert, Reservations) {
        var i;
        $scope.name = '숙박';
        // 조건검색 상태값
        // search, waitOffer, chooseOffer, waitReservation, reservationOK, rejected
        $scope.activeTab = [false, false, false];
        $scope.activeTab[$routeParams.tab || 0] = true;
        $scope.callRoomStatus = 'search';
        $scope.requestRoom = {};
        $scope.requestRoom.region = -1;
        $scope.requestRoom.requestfee = 40000;

        var today = (new Date());
        $scope.requestRoom.minCheckout = (new Date(today.setDate(today.getDate() + 1))).toYYYYMMDDwithDash();

        $scope.calendarOptions = {
            monthsFull: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            weekdaysShort: ['일', '월', '화', '수', '목', '금', '토'],
            format: 'yyyy-mm-dd',
            today: '오늘',
            close: '닫기',
            min: today.toYYYYMMDDwithDash()
        };

        $scope.checkInOption = angular.copy($scope.calendarOptions);
        $scope.checkOutOption = angular.copy($scope.calendarOptions);

        $scope.key = {};
        $scope.priceList = [];

        for (i = 0; i < 19; i++) {
            $scope.priceList.push(10000 + 5000 * i);
        }

        console.log($scope.priceList);

        $window.navigator.geolocation.watchPosition(
            function (position) {
                $scope.curPosition = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };

                $scope.$apply();
            },
            function (error) {
                Alert.show('GPS', error.code + error.message);
            }, {
                enableHighAccuracy: false,
                maximumAge: Infinity
            });

        function changeStatus(status) {
            switch (status) {
            case 'waitOffer':
                RequestRoom.last({
                    "id": "last"
                }, function (data) {
                    if (data.valid) {
                        $scope.request_id = data.request.id;
                        var refreshToken = $interval(function () {
                            ApprovalRequest.get({
                                "id": $scope.request_id
                            }, function (data) {
                                if (data.valid) {
                                    $scope.offerId = data.request.id;
                                    $scope.offerMotel = data.motel;
                                    $scope.callRoomStatus = 'chooseOffer';
                                    $interval.cancel(refreshToken);
                                } else {
                                    if (data.reason && data.reason == 'timeout') {
                                        $scope.callRoomStatus = "rejected";
                                        $interval.cancel(refreshToken);
                                    }
                                }
                            });
                        }, ENV.refreshDuration);
                    }
                });
                break;
            case 'chooseOffer':
                break;
            case 'waitReservation':
                var refreshToken = $interval(function () {
                    ConfirmPayment.readAll(function (data) {
                        if (data.length > 0) {
                            changeStatus('reservationOK');
                            $interval.cancel(refreshToken);
                        }
                    });
                }, ENV.refreshDuration);
                break;
            }

            $scope.callRoomStatus = status;
        }

        function resumeStatus(status) {
            switch (status) {
            case 'waitOffer':
                RequestRoom.last({
                    "id": "last"
                }, function (data) {
                    if (data.valid) {
                        $scope.request_id = data.request.id;
                        var refreshToken = $interval(function () {
                            ApprovalRequest.get({
                                "id": $scope.request_id
                            }, function (data) {
                                if (data.valid) {
                                    $scope.offerId = data.request.id;
                                    $scope.offerMotel = data.motel;
                                    changeStatus('chooseOffer');
                                    $interval.cancel(refreshToken);
                                } else {
                                    if (data.reason && data.reason == 'timeout') {
                                        $scope.callRoomStatus = "rejected";
                                        $interval.cancel(refreshToken);
                                    }
                                }
                            });
                        }, ENV.refreshDuration);
                    }
                });
                $scope.callRoomStatus = status;
                break;
            case 'chooseOffer':
                RequestRoom.last({
                    "id": "last"
                }, function (data) {
                    if (data.valid) {
                        $scope.searchCondition = data.request;
                        $scope.request_id = data.request.id;
                        ApprovalRequest.get({
                            "id": $scope.request_id
                        }, function (data) {
                            if (data.valid) {
                                $scope.offerId = data.request.id;
                                $scope.offerMotel = data.motel;
                                $scope.callRoomStatus = status;
                            }
                        });
                    }
                });

                break;
            case 'waitReservation':
                RequestRoom.last({
                    "id": "last"
                }, function (data) {
                    if (data.valid) {
                        $scope.request_id = data.request.id;
                        $scope.searchCondition = data.request;

                        ApprovalRequest.get({
                            "id": $scope.request_id
                        }, function (data) {
                            if (data.valid) {
                                $scope.offerId = data.request.id;
                                $scope.offerMotel = data.motel;
                            }
                        });

                        var refreshToken = $interval(function () {
                            ConfirmPayment.readAll(function (data) {
                                if (data.length > 0) {
                                    changeStatus('reservationOK');
                                    $interval.cancel(refreshToken);
                                }
                            });
                        }, ENV.refreshDuration);
                    }
                    $scope.callRoomStatus = status;
                });
                break;
            }
        }

        $scope.searchRoom = function () {
            if ($scope.requestRoom.checkin == null ||
                $scope.requestRoom.checkout == null ||
                $scope.requestRoom.requestfee == null ||
                $scope.requestRoom.checkin == null)
                return;

            $scope.requestRoom.rsvname = $window.localStorage.getItem('PhoneNumber');

            console.log($scope.requestRoom);

            RequestRoom.create({}, $scope.requestRoom, function () {
                changeStatus('waitOffer');
            });

            $scope.searchCondition = $scope.requestRoom;
            $scope.initSearchCondition();
        };

        $scope.acceptOffer = function (id) {
            AcceptMotelOffer.accept({
                'id': id
            }, function () {
                changeStatus('waitReservation');
            });
        };

        $scope.rejectOffer = function (id) {
            RejectMotelOffer.reject({
                'id': id
            }, function (data) {
                if (data.status == 'rejected') {
                    changeStatus('rejected');
                } else {
                    changeStatus('waitOffer');
                }
            });
        };

        $scope.finishReservation = function () {
            changeStatus('search');
        };

        $scope.onMotelSelected = function () {
            Motel.readAll({}, function (data) {
                $scope.rooms = data;
                angular.forEach($scope.rooms, function (room) {
                    room.geo = {
                        lat: room.geox,
                        lon: room.geoy
                    }
                });
            });
        }

        $scope.initSearchCondition = function () {
            var today = new Date();
            $scope.today = today.toYYYYMMDDwithDash();

            $scope.requestRoom = {};
            $scope.requestRoom.region = -1;
            $scope.requestRoom.requestfee = 40000;
            $scope.requestRoom.checkin = $scope.today;
            $scope.requestRoom.minCheckout = (new Date(today.setDate(today.getDate() + 1))).toYYYYMMDDwithDash();
            $scope.requestRoom.checkout = $scope.requestRoom.minCheckout;
        }

        $scope.onSearchSelected = function () {

            Regions.readAll(function (response) {
                $scope.regions = response;
            });

            LastStatus.get({}, function (data) {
                resumeStatus(data.status);
            });

            $scope.$watch('requestRoom.checkin', function (newValue, oldValue) {
                if (newValue == '') {
                    newValue = $scope.today;
                    $scope.requestRoom.checkin = $scope.today;
                }

                var today = new Date(newValue);

                $scope.requestRoom.minCheckout = (new Date(today.setDate(today.getDate() + 1))).toYYYYMMDDwithDash();

                if (new Date($scope.requestRoom.checkout) < new Date($scope.requestRoom.minCheckout))
                    $scope.requestRoom.checkout = $scope.requestRoom.minCheckout;
            });


            $scope.$watch('requestRoom.checkout', function (newValue, oldValue) {
                if (newValue == '' || (new Date(newValue)) < (new Date($scope.requestRoom.minCheckout))) {
                    $scope.requestRoom.checkout = $scope.requestRoom.minCheckout;
                }
            });

            $scope.initSearchCondition();
        }

        $scope.onReservationTabSelected = function () {
            Reservations.readAll(function (data) {
                console.log(data);
                $scope.reservations = data;
            });
        }
    }
]);