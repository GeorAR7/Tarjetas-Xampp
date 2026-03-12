<?php
include "db.php";

$sql = "SELECT * FROM tarjetas ORDER BY id DESC";
$result = $conn->query($sql);

$tarjetas = array();

while($row = $result->fetch_assoc()){
    $tarjetas[] = $row;
}

echo json_encode($tarjetas);

$conn->close();
?>