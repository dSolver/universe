<?php
include("config.php");
$conn = mysql_connect($dbhost, $dbuser, $dbpass) or die ("failed to connect");

mysql_select_db($dbname) or die("failed to open up db");


?>