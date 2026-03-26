<?php
include "db.php";

$nombre    = $conn->real_escape_string($_POST['nombre']);
$prioridad = $conn->real_escape_string($_POST['prioridad']);
$tipo      = $conn->real_escape_string($_POST['tipo']);
$descripcion = $conn->real_escape_string($_POST['descripcion'] ?? '');

// Calcular el número disponible más pequeño desde la BD
$usados = [];
$res = $conn->query("SELECT numero_tarjeta FROM tarjetas");
while ($row = $res->fetch_assoc()) {
    $usados[] = (int)$row['numero_tarjeta'];
}
$num = 1;
while (in_array($num, $usados)) $num++;

$sql = "INSERT INTO tarjetas (numero_tarjeta, nombre_tarjeta, prioridad, tipo, descripcion)
        VALUES ('$num', '$nombre', '$prioridad', '$tipo', '$descripcion')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["ok" => true, "numero" => $num]);
} else {
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $conn->error]);
}

$conn->close();
?>