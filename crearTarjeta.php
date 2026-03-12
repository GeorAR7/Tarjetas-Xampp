<?php
include "db.php";

$numero = $_POST['numero'];
$nombre = $_POST['nombre'];
$prioridad = $_POST['prioridad'];
$tipo = $_POST['tipo'];

$sql = "INSERT INTO tarjetas (numero_tarjeta, nombre_tarjeta, prioridad, tipo)
        VALUES ('$numero', '$nombre', '$prioridad', '$tipo')";

if ($conn->query($sql) === TRUE) {
    echo "Tarjeta creada";
} else {
    echo "Error: " . $conn->error;
}

$conn->close();
?>