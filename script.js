// ── PROTECCIÓN DE SESIÓN ─────────────────────────────────────
// Si no hay usuario logueado, redirigir al login
const usuarioActivo = sessionStorage.getItem('usuarioActivo');
if (!usuarioActivo) {
    window.location.href = 'login.html';
}

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

const categoriaTexto = {
    'trabajo': 'Trabajo', 'personal': 'Personal',
    'estudio': 'Estudio', 'hobbies': 'Hobbies', 'otros': 'Otros'
};

const prioridadConfig = {
    'alta':  { label: 'Alta',  clase: 'prioridad-alta' },
    'media': { label: 'Media', clase: 'prioridad-media' },
    'baja':  { label: 'Baja',  clase: 'prioridad-baja' }
};

// Referencias DOM
const formulario        = document.getElementById('tarjetaForm');
const cardsGrid         = document.getElementById('cardsGrid');
const emptyState        = document.getElementById('emptyState');
const contadorTarjetas  = document.getElementById('contadorTarjetas');
const limpiarBtn        = document.getElementById('limpiarBtn');
const filtroCat         = document.getElementById('filtroCat');
const filtroPri         = document.getElementById('filtroPri');
const limpiarFiltrosBtn = document.getElementById('limpiarFiltros');
const filtroId          = document.getElementById('filtroId');
const buscarIdBtn       = document.getElementById('buscarId');

// ── CREAR TARJETA ─────────────────────────────────────────────
formulario.addEventListener('submit', function (event) {
    event.preventDefault();

    const titulo      = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const categoria   = document.getElementById('categoria').value;
    const prioridad   = document.getElementById('prioridad').value;

    crearTarjeta(titulo, descripcion, categoria, prioridad);
    limpiarFormulario();
});

function crearTarjeta(titulo, descripcion, categoria, prioridad) {
    const params = new URLSearchParams();
    params.append('nombre',      titulo);
    params.append('descripcion', descripcion);
    params.append('prioridad',   prioridad);
    params.append('tipo',        categoria);

    fetch("crearTarjeta.php", {
        method:  "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:    params.toString()
    })
    .then(res => res.json())
    .then(data => {
        if (data.ok) {
            cargarTarjetas();
        } else {
            console.error("Error al crear:", data.error);
        }
    });
}

// ── CARGAR TARJETAS DESDE MYSQL ───────────────────────────────
function cargarTarjetas() {
    fetch("obtenerTarjetas.php")
    .then(res => res.json())
    .then(data => {
        tarjetas = data.map(t => ({
            id:          "card-" + t.id,
            dbId:        t.id,               // id real de la BD para eliminar
            num:         t.numero_tarjeta,
            titulo:      t.nombre_tarjeta,
            descripcion: t.descripcion || "",
            categoria:   t.tipo,
            prioridad:   t.prioridad,
            color:       categoriaColor[t.tipo] || '#9b59b6',
            fecha:       t.fecha_creacion || ""
        }));

        renderizarTarjetas();
    });
}

// ── RENDERIZAR ────────────────────────────────────────────────
function renderizarTarjetas() {
    const catActiva = filtroCat.value;
    const priActiva = filtroPri.value;
    const idBuscado = filtroId.value.trim();

    let filtradas;

    if (idBuscado !== "") {
        filtradas = tarjetas.filter(t => String(t.num) === idBuscado);
    } else {
        filtradas = tarjetas.filter(t => {
            const pasaCat = catActiva === "todas" || t.categoria === catActiva;
            const pasaPri = priActiva === "todas" || t.prioridad === priActiva;
            return pasaCat && pasaPri;
        });
    }

    cardsGrid.querySelectorAll('.card').forEach(c => c.remove());

    if (filtradas.length === 0) {
        emptyState.style.display = 'block';
        emptyState.querySelector('h3').textContent =
            tarjetas.length === 0 ? 'No hay tarjetas creadas' : 'No hay tarjetas con ese filtro';
        emptyState.querySelector('p').textContent =
            tarjetas.length === 0 ? '¡Usa el formulario para crear tu primera tarjeta!' : 'Prueba cambiando los filtros.';
    } else {
        emptyState.style.display = 'none';

        filtradas.forEach(t => {
            const priConf = prioridadConfig[t.prioridad] || { label: t.prioridad, clase: '' };

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
                        <span class="card-category">${categoriaTexto[t.categoria] || t.categoria}</span>
                        <span class="card-prioridad ${priConf.clase}">${priConf.label}</span>
                    </div>
                    <p class="card-content">${t.descripcion}</p>
                </div>
                <div class="card-footer">
                    <span>Creada: ${t.fecha}</span>
                    <button class="delete-btn" onclick="eliminarTarjeta('${t.id}')">Eliminar</button>
                </div>
            `;

            cardsGrid.insertBefore(cardElement, cardsGrid.firstChild);
        });
    }

    actualizarContador();
}

// ── ELIMINAR TARJETA ──────────────────────────────────────────
window.eliminarTarjeta = function (cardId) {
    const tarjeta = tarjetas.find(t => t.id === cardId);
    if (!tarjeta) return;

    const cardElement = document.getElementById(cardId);
    if (cardElement) {
        cardElement.style.opacity    = '0';
        cardElement.style.transform  = 'scale(0.9)';
        cardElement.style.transition = 'all 0.3s';
    }

    const params = new URLSearchParams();
    params.append('id', tarjeta.dbId);  // usa el id real de la BD

    setTimeout(() => {
        fetch("eliminaTarjeta.php", {
            method:  "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body:    params.toString()
        })
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                cargarTarjetas();
            } else {
                console.error("Error al eliminar:", data.error);
            }
        });
    }, 300);
};

// ── CONTADOR ──────────────────────────────────────────────────
function actualizarContador() {
    tarjetasCreadas = tarjetas.length;
    const texto = tarjetasCreadas === 1 ? "1 tarjeta" : tarjetasCreadas + " tarjetas";
    contadorTarjetas.textContent = texto;
}

// ── LIMPIAR ───────────────────────────────────────────────────
function limpiarFormulario() { formulario.reset(); }

limpiarBtn.addEventListener('click', limpiarFormulario);
filtroCat.addEventListener('change', renderizarTarjetas);
filtroPri.addEventListener('change', renderizarTarjetas);

limpiarFiltrosBtn.addEventListener('click', () => {
    filtroCat.value = 'todas';
    filtroPri.value = 'todas';
    filtroId.value  = '';
    renderizarTarjetas();
});

buscarIdBtn.addEventListener('click', renderizarTarjetas);

filtroId.addEventListener('keydown', e => {
    if (e.key === 'Enter') renderizarTarjetas();
});

// ── SESIÓN ───────────────────────────────────────────────────
function cerrarSesion() {
    sessionStorage.removeItem('usuarioActivo');
    window.location.href = 'login.html';
}

// ── INICIO ────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function() {
    // Mostrar nombre de usuario en el header
    const nombreEl = document.getElementById('nombreUsuario');
    if (nombreEl) nombreEl.textContent = sessionStorage.getItem('usuarioActivo');
    cargarTarjetas();
});