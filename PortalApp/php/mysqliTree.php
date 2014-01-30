<?php 

$flds='collectionobjectid, catalognumber, family, year, country, StartDateCollected, ';
$flds.='StationFieldNumber, taxon, Latitude1, Longitude1, LocalityName, geography, ';
$flds.='PrimaryCollector, image ';

$host='localhost';
$user='root';
$pw='root';
$db='kufish';

$params = json_decode($_GET['WHERE'], true);
$connector = ' AND ';
//if ($_GET['connector'] !== FALSE) {
//  $connector = ' '.$_GET['connector'].' ';
//}
$where = '';
if ($params !== FALSE) {
  $first = TRUE;
  foreach ($params as $param) {
    if ($first !== TRUE) {
      $where.=$connector;
    } else {
      $where = ' WHERE ';
      $first = FALSE;
    }
    $where.=$param["property"].$param["operator"].$param["params"];
  }
}

$mi = mysqli_connect($host, $user, $pw) or die(mysql_error($mi)); 
$mi->select_db($db) or die($mi->error);
$start = $_GET['start'];
$limit = $_GET['limit'];  
$sorts = json_decode($_GET['sort'], true);
$order = '';
if ($sorts !== FALSE) {
  $first = TRUE;
  foreach ($sorts as $sort) {
    if ($first !== TRUE) {
      $order .= ', ';
    } else {
      $order = ' ORDER BY ';
      $first = FALSE;
    }
    $order .= $sort["property"].' '.$sort["direction"];
  }
}
$sql = "SELECT $flds FROM flattaxspecs $where $order LIMIT $limit OFFSET $start";
$countSql = "SELECT COUNT(*) numFound FROM flattaxspecs $where";
$data = $mi->query($sql) or die($mi->error);  
$count = $mi->query($countSql) or die($mi->error);
$countArray = $count->fetch_array();
$numFound = $countArray['numFound'];
$first = TRUE;
//$info = mysql_fetch_array($data);
while($info = $data->fetch_array()) { 
  if ($first !== TRUE) {
    $docs .= ',';
  } else {
    $first = FALSE;
  }
  $docs .= json_encode($info);
} 
//$result = '{"response":{"numFound":'.$numFound.',"start":'.$start.',"docs":['.$docs.']}}';
//echo $result; 
$mi->close();
echo '{"response":{"numFound":'.$numFound.',"start":'.$start.',"docs":['.$docs.']}}';
?>
