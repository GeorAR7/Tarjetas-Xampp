<?php
include "db.php";

if (isset($_POST['id'])) {

    $id = (int)$_POST['id']; // cast a entero — evita SQL injection

    if ($id <= 0) {
        echo json_encode(["ok" => false, "error" => "ID inválido"]);
        exit();
    }

    $sql = "DELETE FROM tarjetas WHERE id = $id";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["ok" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["ok" => false, "error" => $conn->error]);
    }

} else {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "No se recibió id"]);
}

$conn->close();
?>