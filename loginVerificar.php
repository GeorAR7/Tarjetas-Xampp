<?php
include "db.php";

$usuario  = $conn->real_escape_string(trim($_POST['usuario']));
$password = $conn->real_escape_string($_POST['password']);

$sql    = "SELECT id, usuario, email FROM usuarios 
           WHERE usuario = '$usuario' AND password = '$password'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    echo json_encode([
        "ok"      => true,
        "usuario" => $user['usuario'],
        "email"   => $user['email']
    ]);
} else {
    echo json_encode(["ok" => false, "error" => "credenciales_invalidas"]);
}

$conn->close();
?>