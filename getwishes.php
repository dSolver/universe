<?php
	include ("mysqliconnect.php");
	$useIP = $_SERVER['REMOTE_ADDR']; 
	//get wishes
	//$getwishesquery = "SELECT * FROM wishes WHERE flag=0 ORDER BY time DESC LIMIT 120";
	if($_GET['t'] == "archived"){
		$getwishesquery = "SELECT wish, offer, country FROM wishes order by time DESC";
	} else {
		$page = $_GET['page'];
		if($page > 0){
			$offset = $page * 100;
		} else {
			$offset = 0;
		}
		$getwishesquery = "SELECT wishes.time, wishes.ip_address, wishes.wish, wishes.offer, wishes.country, wishes.X, wishes.Y, wishes.wishid, wishes.token, wishes.email, totalstars.c, istar.s, wishes.flag from wishes left join (select wishid, count(*) as c from wish_stars group by wishid) AS totalstars on wishes.wishid = totalstars.wishid left join (select wishid, count(*) as s from wish_stars where ip_address = '".$useIP."' group by wishid) AS istar on wishes.wishid=istar.wishid where flag=0 order by wishes.time DESC limit ".$offset.", 100";

	}
	$res = $mysqli->query($getwishesquery);
	
	$outjson = array();
	$wishes = array();
	$res->data_seek(0);
	while ($row = $res->fetch_assoc()) {
		$wish = array();
		$wish["wish"] = $row["wish"];
		$wish["offer"] = $row["offer"];
		$wish["country"] = $row["country"];
		$wish["x"] = $row["X"];
		$wish["y"] = $row["Y"];
		$wish["id"] = $row["wishid"];
		$wish["stars"] = $row["c"];
		$wish["istar"] = $row["s"];
		$wishes[] = $wish;
	}
	$outjson["wishes"] = $wishes;
	
	echo json_encode($outjson);
	
	
	
?>