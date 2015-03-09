angular.module('myAppMod').factory('Motel', ['$resource', '$upload', function ($resource, $upload) {
    var res = $resource('/api/motel/:id/:uuid', {}, {
        read: {
            method: 'GET'
        },
        readAll: {
            method: 'GET',
            isArray: true
        },
        readByUUID: {
            method: 'GET'
        },
        delete: {
            method: 'DELETE'
        }
    });

    return {
        create: function (data) {
        	console.log(data);
            $upload.upload({
                url: '/api/motel',
                method: 'POST',
                data: data,
                file: data.mainimg,
            });
        },
        read: res.read,
        readAll: res.readAll,
        readByUUID: res.readByUUID,
        update: function (data) {
        	console.log(data);
            $upload.upload({
                url: '/api/motel/' + data.id,
                method: 'POST',
                data: data,
                file: data.mainimg,
            });
        },
        delete: res.delete
    };
}]);

angular.module('myAppMod').factory('MotelApprovalQueue', ['$resource', function ($resource) {
    return $resource('/api/motel_approval_queue', {}, {
        readAll: {
            method: 'GET',
            isArray: true
        },
    });
}]);


angular.module('myAppMod').factory('RequestRoom', ['$resource', function ($resource) {
    return $resource('/api/requestRoom/:id', {}, {
        create: {
            method: 'POST'
        },
        last: {
            method: 'GET'
        }
    });
}]);

angular.module('myAppMod').factory('ApprovalRequest', ['$resource', function ($resource) {
    return $resource('/api/approvalRequest/:id', {}, {
        read: {
            method: 'GET'
        },
    });
}]);

angular.module('myAppMod').factory('AcceptMotelOffer', ['$resource', function ($resource) {
    return $resource('/api/acceptMotelOffer/:id', {}, {
        accept: {
            method: 'GET'
        },
    });
}]);

angular.module('myAppMod').factory('RejectMotelOffer', ['$resource', function ($resource) {
    return $resource('/api/rejectMotelOffer/:id', {}, {
        reject: {
            method: 'GET'
        },
    });
}]);

angular.module('myAppMod').factory('ConfirmPayment', ['$resource', function ($resource) {
    return $resource('/api/confirmPayment/:id', {}, {
        confirm: {
            method: 'POST'
        },
        readAll: {
            method: 'GET',
            isArray: true
        },
    });
}]);

angular.module('myAppMod').factory('LastStatus', ['$resource', function ($resource) {
    return $resource('/api/lastStatus', {}, {
        get: {
            method: 'GET'
        },
    });
}]);

angular.module('myAppMod').factory('Regions', ['$resource', function ($resource) {
    return $resource('/api/region/:id', {}, {
        create: {
            method: 'POST'
        },
        read: {
            method: 'GET'
        },
        readAll: {
            method: 'GET',
            isArray: true
        },
        remove: {
            method: 'DELETE'
        },
        update: {
            method: 'PUT'
        }
    });
}]);

angular.module('myAppMod').factory('Reservations', ['$resource', function ($resource) {
    return $resource('/api/reservation/client', {}, {
        readAll: {
            method: 'GET',
            isArray: true
        }
    })
}]);