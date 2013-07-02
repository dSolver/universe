<?php
	
	include("config.php");
	
	$mysqli = new mysqli($dbhost, $dbuser, $dbpass, $dbname);
	
	/* check connection */
	if ($mysqli->connect_errno) {
		printf("Connect failed: %s\n", $mysqli->connect_error);
		exit();
	}
	
	$createTableWishes = "CREATE TABLE `wishes` (
	  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	  `ip_address` varchar(50) COLLATE latin1_general_ci NOT NULL,
	  `wish` varchar(250) COLLATE latin1_general_ci NOT NULL,
	  `offer` varchar(250) COLLATE latin1_general_ci NOT NULL,
	  `country` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
	  `X` int(11) NOT NULL,
	  `Y` int(11) NOT NULL,
	  `wishid` int(11) NOT NULL AUTO_INCREMENT,
	  `email` varchar(40) COLLATE latin1_general_ci NOT NULL,
	  `token` varchar(64) COLLATE latin1_general_ci NOT NULL,
	  `flag` tinyint(1) NOT NULL DEFAULT '0',
	  PRIMARY KEY (`wishid`)
	)";
	
	if ($mysqli->query($createTableWishes) === TRUE) {
		printf("Table wishes successfully created.\n");
	}
	
	$createTableWish_Stars = "CREATE TABLE `wish_stars` (
	  `wishid` int(11) NOT NULL,
	  `ip_address` varchar(50) COLLATE latin1_general_ci NOT NULL
	)";

	if ($mysqli->query($createTableWish_Stars) === TRUE) {
		printf("Table wish_stars successfully created.\n");
	}
	
?>