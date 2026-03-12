<?php
include "db.php";

if(isset($_POST['id'])){

    $id = $_POST['id'];

    $sql = "DELETE FROM tarjetas WHERE id = $id";

    if($conn->query($sql) === TRUE){
        echo "Tarjeta eliminada";
    }else{
        echo "Error al eliminar";
    }

}else{
    echo "No se recibió id";
}
?>