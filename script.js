let tarjetasCreadas = 0;
let tarjetas = [];

// Colores por categoría
const categoriaColor = {
    'trabajo':  '#3498db',
    'personal': '#2ecc71',
    'estudio':  '#e74c3c',
    'hobbies':  '#f39c12',
    'otros':    '#9b59b6'
};

// Referencias DOM
const formulario = document.getElementById('tarjetaForm');
const cardsGrid = document.getElementById('cardsGrid');
const emptyState = document.getElementById('emptyState');
const contadorTarjetas = document.getElementById('contadorTarjetas');
const limpiarBtn = document.getElementById('limpiarBtn');

// filtros
const filtroCat = document.getElementById('filtroCat');
const filtroPri = document.getElementById('filtroPri');
const limpiarFiltrosBtn = document.getElementById('limpiarFiltros');
const filtroId = document.getElementById('filtroId');
const buscarIdBtn = document.getElementById('buscarId');


// CREAR TARJETA
formulario.addEventListener('submit', function (event) {

    event.preventDefault();

    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const categoria = document.getElementById('categoria').value;
    const prioridad = document.getElementById('prioridad').value;

    crearTarjeta(titulo, descripcion, categoria, prioridad);
    limpiarFormulario();

});

// FUNCION CREAR TARJETA (GUARDA EN MYSQL)
function crearTarjeta(titulo, descripcion, categoria, prioridad) {

    const num = tarjetas.length + 1;

    fetch("crearTarjeta.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body:
            "numero=" + num +
            "&nombre=" + encodeURIComponent(titulo) +
            "&prioridad=" + prioridad +
            "&tipo=" + categoria
    })
    .then(response => response.text())
    .then(data => {

        console.log(data);
        cargarTarjetas();

    });

}

// CARGAR TARJETAS DESDE MYSQL
function cargarTarjetas(){

    fetch("obtenerTarjetas.php")
    .then(response => response.json())
    .then(data => {

        tarjetas = [];

        data.forEach(t => {

            tarjetas.push({
                id: "card-" + t.id,
                titulo: t.nombre_tarjeta,
                descripcion: "",
                categoria: t.tipo,
                prioridad: t.prioridad,
                color: categoriaColor[t.tipo],
                num: t.numero_tarjeta
            });

        });

        renderizarTarjetas();

    });

}

// RENDERIZAR TARJETAS
function renderizarTarjetas() {

    const catActiva = filtroCat.value;
    const priActiva = filtroPri.value;
    const idBuscado = filtroId.value;

    let filtradas;

    if(idBuscado !== ""){

        filtradas = tarjetas.filter(t => t.num == idBuscado);

    }else{

        filtradas = tarjetas.filter(t => {

            const pasaCat = catActiva === "todas" || t.categoria === catActiva;
            const pasaPri = priActiva === "todas" || t.prioridad === priActiva;

            return pasaCat && pasaPri;

        });

    }

    const existingCards = cardsGrid.querySelectorAll('.card');
    existingCards.forEach(c => c.remove());


    if (filtradas.length === 0) {

        emptyState.style.display = 'block';

    } else {

        emptyState.style.display = 'none';

        filtradas.forEach(t => {

            const cardElement = document.createElement('div');

            cardElement.className = 'card';
            cardElement.id = t.id;

            cardElement.innerHTML = `

                <div class="card-header" style="background: ${t.color};">
                    <span class="card-id">#${t.num}</span>
                    <h3 class="card-title">${t.titulo}</h3>
                </div>

                <div class="card-body">

                    <div class="card-badges">
                        <span class="card-category">${t.categoria}</span>
                        <span class="card-prioridad">${t.prioridad}</span>
                    </div>

                </div>

                <div class="card-footer">
                    <span>Guardada en base de datos</span>
                    <button class="delete-btn" onclick="eliminarTarjeta('${t.id}')">Eliminar</button>
                </div>

            `;

            cardsGrid.insertBefore(cardElement, cardsGrid.firstChild);

        });

    }

    actualizarContador();

}

// ELIMINAR TARJETA
window.eliminarTarjeta = function (cardId) {

    const id = cardId.split("-")[1];

    fetch("eliminaTarjeta.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "id=" + id
    })
    .then(res => res.text())
    .then(data => {
        console.log(data);
        location.reload();

    });

};

// CONTADOR
function actualizarContador(){

    tarjetasCreadas = tarjetas.length;

    const texto = tarjetasCreadas === 1
        ? "1 tarjeta"
        : tarjetasCreadas + " tarjetas";

    contadorTarjetas.textContent = texto;

}

// LIMPIAR FORMULARIO
function limpiarFormulario(){

    formulario.reset();

}

// BOTONES
limpiarBtn.addEventListener('click', limpiarFormulario);

filtroCat.addEventListener('change', renderizarTarjetas);
filtroPri.addEventListener('change', renderizarTarjetas);

limpiarFiltrosBtn.addEventListener('click', () => {

    filtroCat.value = 'todas';
    filtroPri.value = 'todas';
    filtroId.value = '';

    renderizarTarjetas();

});

buscarIdBtn.addEventListener('click', renderizarTarjetas);


// CARGAR TARJETAS AL ABRIR LA PAGINA
window.addEventListener('DOMContentLoaded', function () {

    cargarTarjetas();

});
