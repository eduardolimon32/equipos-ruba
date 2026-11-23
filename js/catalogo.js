// ============================================================
//  catalogo.js — Lógica del catálogo de Equipos Ruba
//  Depende de: main.js (tarjetaProducto) y productos.js (PRODUCTOS)
// ============================================================

// Definición de los botones de filtro
const FILTROS_CONFIG = [
  { valor: 'todas',       etiqueta: 'Todo' },
  { valor: 'rampas',      etiqueta: 'Rampas' },
  { valor: 'llantas',     etiqueta: 'Llantas y balanceo' },
  { valor: 'alineacion',  etiqueta: 'Alineación y suspensión' },
  { valor: 'gatos',       etiqueta: 'Gatos y grúas' },
  { valor: 'herramienta', etiqueta: 'Herramienta' },
  { valor: 'equipo',      etiqueta: 'Equipo para taller' },
  { valor: 'paquetes',    etiqueta: 'Paquetes' },
];

// Estado de los filtros actuales
let filtrosActivos = { categoria: 'todas', busqueda: '' };
let debounceTimer = null;

// ------------------------------------------------------------
//  Leer parámetros de la URL al cargar la página
// ------------------------------------------------------------
function leerFiltrosURL() {
  const params = new URLSearchParams(window.location.search);
  filtrosActivos.categoria = params.get('categoria') || 'todas';
  filtrosActivos.busqueda  = params.get('q') || '';
}

// ------------------------------------------------------------
//  Actualizar la URL sin recargar (para que el link sea compartible)
// ------------------------------------------------------------
function actualizarURL() {
  const params = new URLSearchParams();
  if (filtrosActivos.categoria !== 'todas') params.set('categoria', filtrosActivos.categoria);
  if (filtrosActivos.busqueda)              params.set('q', filtrosActivos.busqueda);

  const nueva = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;

  history.replaceState(null, '', nueva);
}

// ------------------------------------------------------------
//  Filtrar el arreglo de productos
// ------------------------------------------------------------
function filtrarProductos() {
  const { categoria, busqueda } = filtrosActivos;
  const termino = busqueda.toLowerCase().trim();

  return PRODUCTOS.filter(p => {
    const coincideCategoria = categoria === 'todas' || p.categoria === categoria;
    const coincideBusqueda  = !termino ||
      p.nombre.toLowerCase().includes(termino) ||
      (p.modelo || '').toLowerCase().includes(termino) ||
      p.descripcion.toLowerCase().includes(termino);
    return coincideCategoria && coincideBusqueda;
  });
}

// ------------------------------------------------------------
//  Renderizar las tarjetas en el grid
// ------------------------------------------------------------
function renderizarCatalogo() {
  const grid   = document.getElementById('catalogo-grid');
  const cuenta = document.getElementById('catalogo-cuenta');
  if (!grid) return;

  const resultado = filtrarProductos();

  // Contador de resultados
  if (cuenta) {
    cuenta.textContent = resultado.length === 1
      ? '1 producto encontrado'
      : `${resultado.length} productos encontrados`;
  }

  // Sin resultados
  if (resultado.length === 0) {
    grid.innerHTML = `
      <div class="sin-resultados">
        <h3>No hay productos con esa búsqueda</h3>
        <p>Prueba con otra palabra, o pregúntanos por WhatsApp por el equipo que buscas.</p>
        <button class="btn btn-contorno" id="btn-limpiar">Ver todo el catálogo</button>
      </div>
    `;
    document.getElementById('btn-limpiar')?.addEventListener('click', limpiarFiltros);
    return;
  }

  // Tarjetas de producto (función compartida en main.js)
  grid.innerHTML = resultado.map(tarjetaProducto).join('');
}

// ------------------------------------------------------------
//  Marcar el botón de categoría activo visualmente
// ------------------------------------------------------------
function actualizarBotonesCategoria() {
  document.querySelectorAll('.btn-filtro').forEach(btn => {
    const activo = btn.dataset.categoria === filtrosActivos.categoria;
    btn.classList.toggle('activo', activo);
    btn.setAttribute('aria-pressed', String(activo));
  });
}

// ------------------------------------------------------------
//  Limpiar todos los filtros
// ------------------------------------------------------------
function limpiarFiltros() {
  filtrosActivos = { categoria: 'todas', busqueda: '' };

  const input = document.getElementById('busqueda-input');
  if (input) input.value = '';

  actualizarBotonesCategoria();
  actualizarURL();
  renderizarCatalogo();
}

// ------------------------------------------------------------
//  Inicializar botones de categoría
// ------------------------------------------------------------
function initFiltrosCategorias() {
  const contenedor = document.getElementById('filtros-categorias');
  if (!contenedor) return;

  contenedor.innerHTML = FILTROS_CONFIG.map(f => `
    <button
      class="btn-filtro ${filtrosActivos.categoria === f.valor ? 'activo' : ''}"
      data-categoria="${f.valor}"
      aria-pressed="${filtrosActivos.categoria === f.valor}">
      ${f.etiqueta}
    </button>
  `).join('');

  contenedor.addEventListener('click', e => {
    const btn = e.target.closest('.btn-filtro');
    if (!btn) return;

    filtrosActivos.categoria = btn.dataset.categoria;
    actualizarBotonesCategoria();
    actualizarURL();
    renderizarCatalogo();
  });
}

// ------------------------------------------------------------
//  Inicializar buscador (con debounce de 250 ms)
// ------------------------------------------------------------
function initBuscador() {
  const input = document.getElementById('busqueda-input');
  if (!input) return;

  // Poner el valor de la URL al cargar
  if (filtrosActivos.busqueda) input.value = filtrosActivos.busqueda;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      filtrosActivos.busqueda = input.value;
      actualizarURL();
      renderizarCatalogo();
    }, 250);
  });
}

// ------------------------------------------------------------
//  Punto de entrada
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('catalogo-grid')) return; // sólo corre en la página del catálogo

  leerFiltrosURL();
  initFiltrosCategorias();
  initBuscador();
  renderizarCatalogo();
});
