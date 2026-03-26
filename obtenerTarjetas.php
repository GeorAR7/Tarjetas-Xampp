<?php
include "db.php";

$sql    = "SELECT id, numero_tarjeta, nombre_tarjeta, prioridad, tipo, descripcion,
                  DATE_FORMAT(fecha_creacion, '%d/%m/%Y %H:%i') AS fecha_creacion
           FROM tarjetas
           ORDER BY id DESC";

$result = $conn->query($sql);

$tarjetas = [];
while ($row = $result->fetch_assoc()) {
    $tarjetas[] = $row;
}

header("Content-Type: application/json; charset=UTF-8");
echo json_encode($tarjetas);

$conn->close();
?>