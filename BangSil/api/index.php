<?php
/*
	RESTful Service
	 - Create: POST
	 - Read: GET
	 - Update: PUT
	 - Delete: DELETE

*/

require 'Slim/Slim.php';
require 'RedBeanPHP/rb.php';
require 'config.php';
include 'PHPExcel/PHPExcel/IOFactory.php';

global $db, $dbid, $dbpw;

session_start();

\Slim\Slim::registerAutoloader();

 date_default_timezone_set("Asia/Seoul"); 

$app = new \Slim\Slim(array(
		'debug' => true
	));
R::setup('mysql:host=localhost;dbname=' . $db, $dbid, $dbpw);

class GCMPushMessage {
 
    var $url = 'https://android.googleapis.com/gcm/send';
    var $serverApiKey = "";
    var $devices = array();
 
    function GCMPushMessage($apiKeyIn){
        $this->serverApiKey = $apiKeyIn;
    }
 
    function setDevices($deviceIds){
 
        if(is_array($deviceIds)){
            $this->devices = $deviceIds;
        } else {
            $this->devices = array($deviceIds);
        }
 
    }
 
    function send($msg){
 
        if(!is_array($this->devices) || count($this->devices) == 0){
            $this->error("No devices set");
        }
 
        if(strlen($this->serverApiKey) < 8){
            $this->error("Server API Key not set");
        }
 
 
        $fields = array(
            'registration_ids'  => $this->devices,
            'data'              => array( 'key1' => $msg),
        ); 
 
 
        //echo json_encode($fields);
        //exit;
 
 
        $headers = array( 
            'Authorization: key=' . $this->serverApiKey,
            'Content-Type: application/json'
        );
 
        // Open connection
        $ch = curl_init();
 
        // Set the url, number of POST vars, POST data
        curl_setopt( $ch, CURLOPT_URL, $this->url );
 
        curl_setopt( $ch, CURLOPT_POST, true );
        curl_setopt( $ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
 		curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt( $ch, CURLOPT_POSTFIELDS, json_encode( $fields ) );
 
        // Execute post
        $result = curl_exec($ch);

        // Close connection
        curl_close($ch);
 
        return $result;
    }
 
    function error($msg){
        echo "Android send notification failed with error:";
        echo "\t" . $msg;
        exit(1);
    }
}


function sendGCMMessage($clientKey, $msg)
{
	$gcm = new GCMPushMessage('AIzaSyC0edZo_dleJI-BiCya-eM-e24scdWveR0');
	$gcm->setDevices($clientKey);
	$response = $gcm->send($msg);
}

function setRequestToBean($request, $beanObj)
{
	 $req = json_decode($request, true);
	 
	if ($req != null)
	{
		foreach(array_keys($req) as $key)
		{
			$beanObj[$key] = $req[$key];
		}
	}
}

function copyAssocArrToBean($request, $beanObj)
{
	if ($request != null)
	{
		foreach(array_keys($request) as $key)
		{
			$beanObj[$key] = $request[$key];
		}
	}
}

function uploadFile($name, $destination)
{
	$file = $_FILES[$name];

	if (!is_dir($destination))
	{
		mkdir($destination, 0777);
	}

	$filename = uniqid() . '.' . pathinfo($file['name'])['extension'];

	if (is_uploaded_file($file['tmp_name']))
	{
		move_uploaded_file($file['tmp_name'], $destination . '/' . $filename);

		return $filename;
	}

	return '';
}

function deleteFile($file)
{
	if (file_exists($file) && is_file($file))
	{
		unlink($file);
	}
}

function checkSession($app)
{
	if (!isset($_SESSION['uuid']) or ($_SESSION['uuid'] == ""))
	{
		$app->response()->status(401);
  		echo "Session is invalid. Register again.";
  		return false;
	}

	return true;
}

/*---------------------------------------------------
	session
---------------------------------------------------*/
$app->post('/session/:type', function($type) use ($app) {
	$body = json_decode($app->request()->getBody(), true);

	$response = array();
	if($type == 'motel')
	{
		
		$motelinfo = R::findOne('motel', 'uuid = ?', [$body['uuid']]);

		$response['valid'] = ($motelinfo != null);
		
		if ($motelinfo == null)
		{
			// 등록되지 않은 모텔이면 motelapprovalqueue 테이블에 추가
			$isQueued = R::findOne('motelapprovalqueue', 'uuid = ?', [$body['uuid']]);
			if ($isQueued == null)
			{
				$motelApprovalItem = R::dispense('motelapprovalqueue');
				$motelApprovalItem['uuid'] = $body['uuid'];
				R::store($motelApprovalItem);
			}
			echo json_encode($response);
			return;
		}
		else
		{
			// gcmid가 이전과 다르면 업데이트
			if ($motelinfo['gcmid'] != $body['gcmId'])
			{
				$motelinfo['gcmid'] = $body['gcmId'];
				R::store($motelinfo);
			}
			$response['motel'] = $motelinfo->export();

			echo json_encode($response);
		}
	}
	else if ($type == 'client')
	{
		$requestItem = R::findOne('requestrooms', 'clientId = ?', [$body['uuid']]);

		$response['valid'] = true;
		$response['uuid'] = $body['uuid'];

		echo json_encode($response);
	}

	$_SESSION['uuid'] = $body['uuid'];
	$_SESSION['gcmId'] = $body['gcmId'];
	$_SESSION['type'] = $type; // client or motel	
});

$app->get('/session/delete', function() {
	session_unset();
	session_destroy();
	$_SESSION = array();
});

$app->get('/session/status', function() use ($app) {
	echo var_dump($_SESSION);
});

$app->get('/session/:type', function($type) use ($app)
{
	$session = array();

	if (isset($_SESSION['uuid']))
	{
		if ($type == "client")
		{
			$session = array("valid" => true, "type" => $_SESSION['type'], "uuid" => $_SESSION['uuid']);
		}
		else if ($type == 'motel')
		{
			$motel = R::findOne('motel', 'uuid = ?', [$_SESSION['uuid']]);

			if ($motel == null)
			{
				$session = array("valid" => false, "error" => "등록 대기 중입니다.", "errCode" => 2);
			}
			else
			{
				$session = array("valid" => true, "type" => $_SESSION['type'], "uuid" => $_SESSION['uuid']);
			}
		}
	}
	else
	{
		$session = array("valid" => false, 'error' => '세션 정보가 없습니다.', "errCode" => 1);
	}

	echo json_encode($session);
});

$app->get('/session', function ($type) use ($app) {
	checkSession();
});

$app->get('/motel_approval_queue', function () use ($app){
	$items = R::findAll('motelapprovalqueue');
	echo json_encode(R::exportAll($items));
});

/*---------------------------------------------------
	region
---------------------------------------------------*/
$app->post('/region', function() use ($app)
{
	$item = R::dispense('regions');	
	$request = json_decode($app->request()->getBody(), true);
	copyAssocArrToBean($request, $item);
	R::store($item);
});

$app->get('/region/:id', function ($id) use ($app) {
	$item = R::load('regions', $id);

	if ($item)
	{
		$app->response->setBody(json_encode($item->export()));
	}
});

$app->get('/region', function () use ($app) {
	$items = R::findAll('regions');
	if ($items)
	{
		$app->response->setBody(json_encode(R::exportAll($items)));
	}
});

$app->delete('/region/:id', function ($id) use ($app) {
	$item = R::load('regions', $id);

	if ($item)
	{
		$motels = R::findAll('motel', 'region = ?', [$item->id]);
		if ($motels) 
		{
			foreach ($motels as $motel)
			{
				$motel->region = 0;
			}
			R::storeAll($motels);
		}
		
		R::trash($item);
	}
});

$app->put('/region/:id', function ($id) use ($app) {
	$item = R::load('regions', $id);

	if ($item)
	{
		$request = json_decode($app->request()->getBody(), true);
		copyAssocArrToBean($request, $item);
		R::store($item);
	}
});

/*---------------------------------------------------
	ad
		name: 광고 이름
		banner: 광고 이미지
		link: 광고 클릭시 넘어갈 주소 또는 전화번호
---------------------------------------------------*/
// Create
$app->post('/ad', function() use ($app)
{
	if (!checkSession($app))
		return;

	$item = R::dispense('ad');	
	copyAssocArrToBean($app->request()->post(), $item);
	$item['banner'] = uploadFile('banner', '../app/images/ad/');
	R::store($item);
});
 
// Read
$app->get('/ad/:id', function($id) use ($app)
{
	if (!checkSession($app))
		return;
});

// ReadAll
$app->get('/ad', function() use ($app)
{
	if (!checkSession($app))
		return;

	$items = R::findAll('ad');
	echo json_encode(R::exportAll($items));
});

// Update
$app->put('/ad/:id', function($id) use ($app) {
	if (!checkSession($app))
		return;

	$item = R::load('ad', $id);
	setRequestToBean($app->request()->post(), $item);	
	R::store($itemObj);
});

// Delete
$app->delete('/ad/:id', function($id) use ($app)
{
	if (!checkSession($app))
		return;

	$item = R::load('ad', $id);
	deleteFile("../app/images/ad/" . $item['banner']);
	R::trash($item);
});

/*---------------------------------------------------
	motel
		name: 상호명
		ownername: 대표 이름
		address: 주소
		geox, geoy: GPS 좌표
		telephone: 전화번호
		mainimg: 대표 이미지
---------------------------------------------------*/
// Create
$app->post('/motel', function() use ($app) {
	if (!checkSession($app))
		return;

	$item = R::dispense('motel');	
	copyAssocArrToBean($app->request()->post(), $item);

	if (array_key_exists('uuid', $app->request()->post()))
	{
		$uuid = $app->request()->post()['uuid'];
		$queuedMotel = R::findOne('motelapprovalqueue', 'uuid = ?', [$uuid]);
		if ($queuedMotel != null)
		{
			R::trash($queuedMotel);
		}
	}

	$item['mainimg'] = uploadFile('mainimg', '../app/images/motel/');
	echo var_dump($app->request()->post());
	$item['gcmid'] = '';
	R::store($item);
});
 
// Read
$app->get('/motel/:id', function($id) use ($app)
{
	if (!checkSession($app))
		return;
	$motelinfo = R::load('motel', $id);
	if ($motelinfo != null)
		echo json_encode($motelinfo->export());
});

// Read
$app->get('/motel/uuid/:uuid', function($uuid) use ($app)
{
	if (!checkSession($app))
		return;

	$motelinfo = R::findOne('motel', 'uuid = ?', [$uuid]);
	if ($motelinfo != null)
		echo json_encode($motelinfo->export());
});

// ReadAll
$app->get('/motel', function() use ($app)
{
	if (!checkSession($app))
		return;

	$items = R::findAll('motel');
	echo json_encode(R::exportAll($items));
});

// Update
$app->post('/motel/:id', function($id) use ($app)
{
	if (!checkSession($app))
		return;

	$item = R::load('motel', $id);	

	copyAssocArrToBean($app->request()->post(), $item);

	if (isset($_FILES['mainimg']))
	{
		echo 'delete';
		echo '../app/images/motel/' . $item['mainimg'];
		deleteFile('../app/images/motel/' . $item['mainimg']);
		$item['mainimg'] = uploadFile('mainimg', '../app/images/motel/');
	}

	R::store($item);
});

// Delete
$app->delete('/motel/:id', function($id) use ($app)
{
	if (!checkSession($app))
		return;

	$item = R::load('motel', $id);
	deleteFile('../app/images/motel/' . $item['mainimg']);
	R::trash($item);
});


//---------------------------------------------------
//	accmType : 편의시설 종류
//---------------------------------------------------
$app->post('/accmType', function() use ($app)
{
	if (!checkSession($app))
		return;

	$accmType = R::dispense('accommodationtypes');	
	copyAssocArrToBean($app->request()->post(), $accmType);
	$accmType['icon'] = uploadFile('icon', '../app/images/icons/');
	R::store($accmType);
});

$app->get('/accmType', function() use ($app)
{
	if (!checkSession($app))
		return;

	$accmTypes = R::findAll('accommodationtypes');
	echo json_encode(R::exportAll($accmTypes));
});


$app->get('/accmType/:id', function($id) use ($app)
{
	if (!checkSession($app))
		return;

	$accmType = R::load('accommodationtypes', $id);
	echo json_encode($accmType->export());
});

$app->delete('/accmType/:id', function($id) use ($app)
{
	if (!checkSession($app))
		return;

	$accmType = R::load('accommodationtypes', $id);
	deleteFile('../app/images/icons/' . $accmType['icon']);
	R::trash($accmType);
});

//---------------------------------------------------
//	accmItem : 편의시설 항목
//---------------------------------------------------
$app->post('/accmItem', function() use ($app)
{
	if (!checkSession($app))
		return;

	$accmType = R::dispense('accommodations');	
	setRequestToBean($app->request()->getBody(), $accmType);
	R::store($accmType);
});

$app->get('/accmItem', function() use ($app)
{
	if (!checkSession($app))
		return;

	$accmTypes = R::findAll('accommodations');
	echo json_encode(R::exportAll($accmTypes));
});


$app->get('/accmItem/:id', function($id) use ($app)
{
	if (!checkSession($app))
		return;

	$accmType = R::load('accommodations', $id);
	echo json_encode($accmType->export());
});

$app->delete('/accmItem/:id', function($id) use ($app)
{
	if (!checkSession($app))
		return;

	$accmType = R::load('accommodations', $id);
	R::trash($accmType);
});

$app->post('/batchAccmItem', function () use ($app){
	$request = $app->request()->post();
	$type = $request['type'];
	$excel = uploadFile('file', 'temp');

	$objPHPExcel = PHPExcel_IOFactory::load('temp/'.$excel);
	$sheetData = $objPHPExcel->getActiveSheet()->toArray(null,true,true,true);

	$accmItems = R::findAll('accommodations', 'type = ?', [$type]);
	R::trashAll($accmItems);

	for ($i = 2; $i < count($sheetData); $i++)
	{
		$accmItem = R::dispense('accommodations');

		$name = $sheetData[$i]['A'];
		$addr = $sheetData[$i]['B'];
		$gps  = $sheetData[$i]['C'];

		$accmItem->name = $name;
		$accmItem->address = $addr;
		$accmItem->type = $type;

		$geoPosition = explode(", ", $gps);

		if (count($geoPosition) != 2)
			continue;

		$accmItem->geox = $geoPosition[0];
		$accmItem->geoy = $geoPosition[1];

		R::store($accmItem);
	}

	unlink("temp/" . $excel);	
});

$app->get('/busStop', function() use ($app)
{
	if (!checkSession($app))
		return;

	$busstops = R::findAll('busstop');
	echo json_encode(R::exportAll($busstops));
});

$app->get('/busLine', function() use ($app)
{
	if (!checkSession($app))
		return;

	$busstops = R::findAll('busline');
	echo json_encode(R::exportAll($busstops));
});

$app->post('/batchBusStop', function () use ($app){
	$request = $app->request()->post();
	$excel = uploadFile('file', 'temp');

	$objPHPExcel = PHPExcel_IOFactory::load('temp/'.$excel);
	$sheetData = $objPHPExcel->getActiveSheet()->toArray(null,true,true,true);

	
	$busstop = R::findAll('busstop');
	R::trashAll($busstop);

	for ($i = 2; $i < count($sheetData); $i++)
	{
		$busstop = R::dispense('busstop');
		$busstop->stopid = $sheetData[$i]['A'];
		$busstop->name = $sheetData[$i]['B'];
		$busstop->buses = $sheetData[$i]['D'];

		$geoPosition = explode(", ", $sheetData[$i]['C']);

		if (count($geoPosition) != 2)
			continue;

		$busstop->geox = $geoPosition[0];
		$busstop->geoy = $geoPosition[1];

		R::store($busstop);
	}
	/*
	$busline = R::findAll('busline');
	R::trashAll($busline);

	for ($i = 2; $i < count($sheetData); $i++)
	{
		$busline = R::dispense('busline');
		$busline->no = $sheetData[$i]['A'];
		$busline->route = $sheetData[$i]['D'];

		R::store($busline);
	}
	*/
	unlink("temp/" . $excel);	
});


//---------------------------------------------------
//	callTaxi : 콜택시
//---------------------------------------------------
$app->post('/callTaxi', function() use ($app)
{
	if (!checkSession($app))
		return;

	$callTaxi = R::dispense('calltaxi');	
	setRequestToBean($app->request()->getBody(), $callTaxi);
	R::store($callTaxi);
});

$app->get('/callTaxi', function() use ($app)
{
	if (!checkSession($app))
		return;

	$callTaxi = R::findAll('calltaxi');
	echo json_encode(R::exportAll($callTaxi));
});


$app->get('/callTaxi/:id', function($id) use ($app)
{
	if (!checkSession($app))
		return;

	$callTaxi = R::load('calltaxi', $id);
	echo json_encode($callTaxi->export());
});

$app->put('/callTaxi/:id', function($id) use ($app)
{
	if (!checkSession($app))
		return;

	$callTaxi = R::load('calltaxi', $id);
	setRequestToBean($app->request()->getBody(), $callTaxi);
	R::store($callTaxi);
});

$app->delete('/callTaxi/:id', function($id) use ($app)
{
	if (!checkSession($app))
		return;

	$callTaxi = R::load('calltaxi', $id);
	R::trash($callTaxi);
});

//---------------------------------------------------
//	requestRoom : 조건 방 검색 요청
//---------------------------------------------------
$app->post('/requestRoom', function() use ($app)
{
	if (!checkSession($app))
		return;

	$requestRoom = R::dispense('requestrooms');
	$request = json_decode($app->request()->getBody(), true);

	// 요청을 requestRooms 테이블에 추가함.
	$requestRoom->client_id   = $_SESSION['uuid'];		// client uuid
	$requestRoom->client_gcm  = $_SESSION['gcmId'];	// client uuid
	$requestRoom->requesttime = date('Y-m-d H:i:s');	// 요청시간
	$requestRoom->checkin     = new DateTime($request['checkin']);		// 체크인 시간
	$requestRoom->checkout    = new DateTime($request['checkout']);	// 체크아웃 시간
	$requestRoom->requestfee  = $request['requestfee'];// 요청 금액
	$requestRoom->status      = "waitOffer"; // request,
	$requestRoom->rsvname     = $request["rsvname"];
	$requestRoom->region      = $request["region"];
	$requestRoom->rejects     = 0;

	R::store($requestRoom);

	// 조건에 맞는 모텔 주인에게 call 함
	$motels = R::findAll('motel', 'alarm = ? and lowerfee < ? and (? = -1 or region = ?)', [1, $requestRoom->requestfee, $requestRoom->region, $requestRoom->region]);
	foreach ($motels as $motel)
	{
		sendGCMMessage($motel['gcmid'], '새로운 요청이 들어왔습니다.');
	}
});

// Motel
$app->get('/requestRoom', function() use ($app)
{
	if (!checkSession($app))
		return;

	// 모텔 주인 앱에서 보낸 요청이 아니면 거절
	if (!(isset($_SESSION['type']) && $_SESSION['type'] == 'motel'))
		return;

	$timeoffset = date("Y-m-d H:i:s", strtotime("-5 minutes"));
	
	$motelInfo = R::findOne('motel', 'uuid = ?', [$_SESSION['uuid']]);
	if ($motelInfo['alarm'] == 1)
	{	
		$requestRooms = R::findAll('requestrooms', 'requestfee >= ? and requesttime > ? and status = "waitOffer"', [$motelInfo['lowerfee'], $timeoffset]);
		$approvals = R::findAll('approvalrequests', 'motel_id = ?', [$_SESSION['uuid']]);

		$yetApprovalRequests = array();

		foreach ($requestRooms as $r)
		{
			$exists = false;
			foreach($approvals as $a)
			{
				$exists |= ($r['id'] == $a['request_id']);
			}

			if (!$exists){
				array_push($yetApprovalRequests, $r->export());
			}
		}
		echo json_encode($yetApprovalRequests);		
	}
	else
	{
		echo "[]";
	}
});

// Client
$app->get('/requestRoom/last', function() use ($app)
{
	if (!checkSession($app))
		return;

	$timeoffset =  date("Y-m-d H:i:s", strtotime("-5 minutes"));
	$last = R::findLast('requestrooms', 'client_id = ? and requesttime > ?', [$_SESSION['uuid'], $timeoffset]);

	$response = array();
	$response['valid'] = ($last != null);
	if ($response['valid'])
		$response['request'] = $last->export();

	echo json_encode($response);
});

$app->put('/requestRoom/:id', function() use ($app)
{
	if (!checkSession($app))
		return;

	$requestRooms = R::findAll('requestRooms');
	echo json_encode(R::exportAll($accmTypes));
});

$app->delete('/requestRoom/:id', function($id) use ($app)
{
	if (!checkSession($app))
		return;

	$requestRoom = R::load('requestRooms', $id);
	R::trash($requestRoom);
});

$app->post('/approvalRequest', function() use ($app)
{
	if (!checkSession($app))
		return;

	if ($_SESSION['type'] != 'motel')
		return;

	$request = json_decode($app->request()->getBody(), true);

	$requestRoom = R::load('requestrooms', $request['id']);

	if ($requestRoom->status == 'waitOffer' &&
		R::count('approvalrequests', 'request_id = ?', [$request['id']]) < 3)
	{
		$approval = R::dispense('approvalrequests');
		$approval['request_id'] = $request['id'];
		$approval['motel_id'] = $_SESSION['uuid'];
		$approval['reject'] = 0;
		R::store($approval);

		sendGCMMessage($requestRoom['client_gcm'], '숙소가 검색되었습니다.');
	}
});

$app->get('/approvalRequest/:request_id', function($request_id) use ($app)
{
	$response = array();

	if (!checkSession($app))
		return;

	$requestRoom = R::load('requestrooms', $request_id);

	$requesttime = date($requestRoom->requesttime);
	$timeoffset = date("Y-m-d H:i:s", strtotime("-5 minutes"));

	if ($requesttime < $timeoffset)
	{
		$response['valid'] = false;
		$response['reason'] = 'timeout';

		$requestRoom->status = "rejected";
		R::store($requestRoom);
	}
	else
	{
		$request = R::findOne('approvalrequests', 'request_id = ? and reject <> 1', [$request_id]);
		$response['valid'] = ($request != null);

		if ($response['valid'])
		{
			$response['request'] = $request->export();
			$motelinfo = R::findOne('motel', 'uuid = ?', [$request->motel_id]);
			$response['motel'] = $motelinfo->export();
		}	
	}

	echo json_encode($response);
});

$app->get('/rejectMotelOffer/:id', function ($id) use ($app) {
	$approval = R::load('approvalrequests', $id);
	$approval->reject = true;
	R::store($approval);

	$requestRoom = R::load('requestrooms', $approval->request_id);
	
	$requestRoom->rejects = $requestRoom->rejects + 1;
	if ($requestRoom->rejects == 3)
	{
		$requestRoom->status = 'rejected';
	}
	else
	{
		$requestRoom->status = 'waitOffer';
	}

	R::store($requestRoom);
	
	echo json_encode($requestRoom->export());
});

$app->get('/acceptMotelOffer/:id', function($id) use ($app)
{
	if (!checkSession($app))
		return;

	$approval = R::load('approvalrequests', $id);
	
	if ($approval->id != 0)
	{
		$notAcceptedApprovals = R::findAll('approvalrequests', 'request_id = ?', [$approval->request_id]);
		R::trashAll($notAcceptedApprovals);

		$requestRoom = R::load('requestrooms', $approval->request_id);
		$requestRoom->status = 'waitReservation';
		$requestRoom->motel_id = $approval->motel_id;
		R::store($requestRoom);

		$motelinfo = R::findOne('motel', 'uuid = ?', [$requestRoom['motel_id']]);

		sendGCMMessage($motelinfo['gcmid'], '사용자가 예약을 요청했습니다.');
	}
});

$app->get('/waitPaymentConfirm', function() use ($app)
{
	if (!checkSession($app))
		return;

	$requestRooms = R::findAll('requestrooms', 'status = "waitReservation" and motel_id = ?', [$_SESSION['uuid']]);
	echo json_encode(R::exportAll($requestRooms));
});

$app->get('/confirmPayment/:id', function($id) use ($app)
{
	if (!checkSession($app))
		return;
	$requestRoom = R::load('requestrooms', $id);

	$requestRoom['status'] = 'reservationOK';
	$requestRoom['confirmed'] = date("Y-m-d H:i:s");
	R::store($requestRoom);

	$reservation = R::dispense('reservations');
	$reservation['rsvname'] 	= $requestRoom['rsvname'];
	$reservation['checkin'] 	= $requestRoom['checkin'];
	$reservation['checkout'] 	= $requestRoom['checkout'];
	$reservation['requestfee'] 	= $requestRoom['requestfee'];
	$reservation['client_id'] 	= $requestRoom['client_id'];
	$reservation['motel_id'] 	= $requestRoom['motel_id'];
	$reservation['requesttime'] = $requestRoom['requesttime'];

	sendGCMMessage($requestRoom['client_gcm'], '숙소가 예약됐습니다.');
	
	R::store($reservation);
});

$app->get('/confirmPayment', function() use ($app)
{	
	if (!checkSession($app))
		return;

	if ($_SESSION['type'] == 'client')
	{
		$last = R::findLast('requestrooms', 'client_id = ?', [$_SESSION['uuid']]);

		$result = array();
		if ($last != null)
		{
			if ($last->status == 'reservationOK')
			{
				array_push($result, $last->export());
			}
		}
		echo json_encode($result);
	}
	else if ($_SESSION['type'] == 'motel')
	{
		$requestRooms = R::findAll('requestrooms', 'status = "reservationOK" and motel_id = ?', [$_SESSION['uuid']]);
		echo json_encode(R::exportAll($requestRooms));
	}
});

$app->get('/resvComplete/:id', function($id) use ($app)
{

});

$app->get('/lastStatus', function() use ($app)
{
	if (!checkSession($app))
		return;

	$timeoffset =  date("Y-m-d H:i:s", strtotime("-5 minutes"));
	$last = R::findLast('requestrooms', 'client_id = ? and requesttime > ?', [$_SESSION['uuid'], $timeoffset]);

	if ($last == null)
	{
		echo '{"status":"search"}';
		return;
	}

	if ($last->status == 'waitOffer')
	{
		$request = R::findOne('approvalrequests', 'request_id = ? and reject <> 1', [$last->id]);
		
		if ($request != null)
			echo '{"status":"chooseOffer"}';
		else 
			echo '{"status":"waitOffer"}';

		return;
	}

	if ($last->status == 'waitReservation')
	{
		echo '{"status":"waitReservation"}';
		return;
	}

	$last = R::findLast('requestrooms', 'client_id = ?', [$_SESSION['uuid']]);

	if ($last->status == 'reservationOK')
	{
		echo '{"status":"reservationOK"}';
		return;
	}

	echo '{"status":"search"}';
});

$app->get('/reservation/client', function() use ($app) {
	if (!checkSession($app))
		return;

	if ($_SESSION['type'] != 'client')
	{
		// Error
		return;
	}

	$reservations = R::findAll('reservations', 'client_id = ? order by checkin desc', [$_SESSION['uuid']]);
	foreach ($reservations as $resv)
	{
		$motel = R::findOne('motel', 'uuid = ?', [$resv['motel_id']]);
		if ($motel)
		{
			$resv['motel'] = $motel;
		}
	}

	echo json_encode(R::exportAll($reservations));
});


/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This executes the Slim application
 * and returns the HTTP response to the HTTP client.
 */
$app->run();
?>
