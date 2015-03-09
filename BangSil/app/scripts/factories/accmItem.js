// scripts/factories/accmItem.js
angular.module('myAppMod').factory('AccmItem', ['$resource', function ($resource) {
    return $resource('/api/accmItem/:id', {}, {
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
        update: {
            method: 'PUT'
        },
        delete: {
            method: 'DELETE'
        },
    });
}]);

angular.module('myAppMod').factory('BatchAccmItem', ['$upload', function ($upload) {
    return {
        create: function (data, callback, progress) {
        	console.log(data);
            $upload.upload({
                url: '/api/batchAccmItem',
                method: 'POST',
                data: data,
                file: data.file,
                fileFormDataName: 'file'
            })
                .progress(progress || angular.noop)
                .success(callback || angular.noop);
        }
    };
}]);

angular.module('myAppMod').factory('BatchBusStop', ['$upload', function ($upload) {
    return {
        create: function (data, callback, progress) {
        	console.log(data);
            $upload.upload({
                url: '/api/batchBusStop',
                method: 'POST',
                file: data.file,
                fileFormDataName: 'file'
            })
                .progress(progress || angular.noop)
                .success(callback || angular.noop);
        }
    };
}]);

angular.module('myAppMod').factory('BusStop', ['$resource', function ($resource) {
    return $resource('/api/busStop/:id', {}, {
        readAll: {
            method: 'GET',
            isArray: true
        }
    });
}]);

angular.module('myAppMod').factory('BusLine', ['$resource', function ($resource) {
    return $resource('/api/busLine', {}, {
        readAll: {
            method: 'GET',
            isArray: true
        }
    });
}]);