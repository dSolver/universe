<?php
	include("blacklist.php");
	$useIP = $_SERVER['REMOTE_ADDR']; 
	
	if(!checkBlacklist($useIP)){
		//we're good. ok, what do we want to do
		
		//connect to db
		include("mysqliconnect.php");
		
		$outjson = array();
		$action = $_GET['a'];
		$wishid = $mysqli->escape_string($_GET['w']);
		$token = $mysqli->escape_string($_GET['t']);
		
		if($action == "flag" && $wishid != null){
			//don't need the token
			$query = "UPDATE wishes SET flag=1 WHERE wishid=$wishid";
			$res = $mysqli->query($query);
			if($res){
				$outjson["flag"] = 1;
			} else {
				$outjson["flag"] = 0;
			}
		} else if($action == "list"){
			$query = "SELECT wishes.time, wishes.ip_address, wishes.wish, wishes.offer, wishes.country, wishes.X, wishes.Y, wishes.wishid, wishes.token, wishes.email, totalstars.c, istar.s, wishes.flag from wishes left join (select wishid, count(*) as c from wish_stars group by wishid) AS totalstars on wishes.wishid = totalstars.wishid left join (select wishid, count(*) as s from wish_stars where ip_address = '".$useIP."' group by wishid) AS istar on wishes.wishid=istar.wishid where 1 order by wishes.wishid DESC";
	
			$res = $mysqli->query($query);
			$res->data_seek(0);
			echo "<table><tr><td>id</td><td>wish</td><td>offer</td><td>country</td><td>flag</td><td>stars</td><td>istar?</td></tr>";
			while ($row = $res->fetch_assoc()) {
				
				echo "<tr><td>".$row["wishid"]."</td><td>".$row["wish"]."</td><td>".$row["offer"]."</td><td>".$row["country"]."</td><td>".$row["flag"]."</td><td>".$row["c"]."</td><td>".$row["s"]."</tr>";
			}
			echo "</table>";
			
		} else if($action == "delete" && $wishid != null && $token != null){
			$query = "DELETE from wishes WHERE token='".$token."' AND wishid = ".$wishid;
			$res = $mysqli->query($query);
			if($res){
				$outjson["delete"] = 1;
			} else {
				$outjson["delete"] = 0;
			}
		} else if($action == "star" && $wishid != null){
			$query = "INSERT into wish_stars(wishid, ip_address) VALUES(".$wishid.", '".$useIP."')";
			$res = $mysqli->query($query);
			
			if($res){
				$outjson["star"] = 1;
				$query = "SELECT wishes.time, wishes.ip_address, wishes.wish, wishes.offer, wishes.country, wishes.X, wishes.Y, wishes.wishid, wishes.token, wishes.email, totalstars.c, istar.s, wishes.flag from wishes left join (select wishid, count(*) as c from wish_stars group by wishid) AS totalstars on wishes.wishid = totalstars.wishid left join (select wishid, count(*) as s from wish_stars where ip_address = '".$useIP."' group by wishid) AS istar on wishes.wishid=istar.wishid where wishes.wishid=".$wishid." order by wishes.wishid DESC";
	
				$res = $mysqli->query($query);
				$outjson["wish"] = $res->fetch_row();
			} else {
				$outjson["star"] = 0;
			}
		} else if($action == "unstar" && $wishid != null){
			$query = "DELETE FROM wish_stars WHERE wishid = $wishid AND ip_address='".$useIP."'";
			$res = $mysqli->query($query);
			if($res){
				$outjson["unstar"] = 1;
			} else {
				$outjson["unstar"] = 0;
			}
		}
		
		echo json_encode($outjson);
		
	}
	

?>