<?php
	//make-a-wish
	include ("mysqliconnect.php");
	
	$useIP = $_SERVER['REMOTE_ADDR'];
	
	$wish = $mysqli->escape_string($_GET['wish']);
	$offer = $mysqli->escape_string($_GET['offer']);
	$country = $mysqli->escape_string($_GET['country']);
	$x = $mysqli->escape_string($_GET['x']);
	$y = $mysqli->escape_string($_GET['y']);
	$insertwishquery = "INSERT INTO `wishes` (`time`, `ip_address`, `wish`, `offer`, `country`, `X`, `Y`) VALUES (NOW(), '".$useIP."', '".$wish."', '".$offer."', '".$country."', $x, $y);";
	$outjson = array();
	if(!$mysqli->query($insertwishquery)){
		//error
	} else {
		$outjson["success"] = true;
		$outjson["wish"] = $wish;
		$outjson["offer"] = $offer;
		$outjson["country"] = $country;
		$outjson["x"] = $x;
		$outjson["y"] = $y;
	}
	
	echo json_encode($outjson);
?>