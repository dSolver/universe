<?php
	$blacklist = array();
	//fill out this array with IPs you want blocked on app level
	
	function checkBlacklist($ip){
		return in_array($ip, $blacklist);
	}
	
	
	
	function replaceProfanity($str){
		//get creative...
		$str = str_ireplace("fuck", "play", $str);
		$str = str_ireplace("bitch", "buddy", $str);
		$str = str_ireplace("douchebag", "creeper", $str);
		$str = str_ireplace("skank", "peach", $str);
		$str = str_ireplace("jackass", "jackrabbit", $str);
		$str = str_ireplace("cumsucker", "vampire", $str);
		$str = str_ireplace("jerkoff", "jester", $str);
		$str = str_ireplace("shitface", "mammoth", $str);
		$str = str_ireplace("nigga", "friend", $str);
		return $str;
	}
?>