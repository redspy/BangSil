<?
	error_reporting(E_ALL);
	set_time_limit(0);

	date_default_timezone_set('Asia/Seoul');
?>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

<title>PHPExcel Reader Example #01</title>

</head>
<body>

<?
	include 'PHPExcel/IOFactory.php';

	$inputFileName = "toilet.xlsx";
	$objPHPExcel = PHPExcel_IOFactory::load($inputFileName);
	$COLUMN = array('A', 'B', 'B');

	$sheetData = $objPHPExcel->getActiveSheet()->toArray(null,true,true,true);

	for ($i = 7; $i < count($sheetData); $i++)
	{
		echo $sheetData[$i]['E'] . "<br />";
	}
?>
<body>
</html>