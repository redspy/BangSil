// scripts/factories/session.js

angular.module('myAppMod').factory('Session', ['$resource', function($resource){
	return $resource('/api/session/:type',  
	{},
	{
        create:		{method: 'POST'},
        read:		{method: 'GET'},
        update:		{method: 'PUT'},
        delete:		{method: 'DELETE'},
	});
}]);

angular.module('myAppMod').factory('MotelByUUID', ['$resource', function($resource){
	return $resource('/api/motel/uuid/:uuid',
	{},
	{
		read:	{method: 'GET'},
	});
}]);

angular.module('myAppMod').factory('RequestRoom', ['$resource', function($resource){
	return $resource('/api/requestRoom',
	{},
	{
		readAll: 	{method: 'GET', isArray: true},
	});
}]);


angular.module('myAppMod').factory('ApprovalRequest', ['$resource', function($resource){
	return $resource('/api/approvalRequest/:id',
	{},
	{
		create: 	{method: 'POST'},
		read: 		{method: 'GET'},
	});
}]);

angular.module('myAppMod').factory('WaitPaymentConfirm', ['$resource', function($resource){
	return $resource('/api/waitPaymentConfirm',
	{},
	{
		readAll: 		{method: 'GET', isArray: true},
	});
}]);


angular.module('myAppMod').factory('ConfirmPayment', ['$resource', function($resource){
	return $resource('/api/confirmPayment/:id',
	{},
	{
		confirm: {method: 'GET', isArray: true},
		readAll: {method: 'GET', isArray: true},
	});
}]);

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

angular.module('myAppMod').factory("Alert",["$modal",function(e){return{show:function(t,n,r){console.log(arguments);var i=e.open({templateUrl:"./views/alertDialogView.html",resolve:{contents:function(){return{title:t,message:n}}},controller:["$scope","$modalInstance","contents",function(e,t,n){e.contents=n}]});i.result.then(angular.noop,r)}}}]);