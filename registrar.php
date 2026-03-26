<?php
include "db.php";

$email    = $conn->real_escape_string(trim($_POST['email']));
$edad     = (int)$_POST['edad'];
$usuario  = $conn->real_escape_string(trim($_POST['usuario']));
$password = $conn->real_escape_string($_POST['password']);

// Verificar si el usuario ya existe
$checkUsuario = $conn->query("SELECT id FROM usuarios WHERE usuario = '$usuario'");
if ($checkUsuario->num_rows > 0) {
    echo json_encode(["ok" => false, "error" => "usuario_duplicado"]);
    exit();
}

// Verificar si el email ya existe
$checkEmail = $conn->query("SELECT id FROM usuarios WHERE email = '$email'");
if ($checkEmail->num_rows > 0) {
    echo json_encode(["ok" => false, "error" => "email_duplicado"]);
    exit();
}

// Insertar nuevo usuario
$sql = "INSERT INTO usuarios (email, edad, usuario, password)
        VALUES ('$email', $edad, '$usuario', '$password')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["ok" => true]);
} else {
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $conn->error]);
}

$conn->close();
?>