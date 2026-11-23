// ============================================================
//  producto.js — Página de detalle de un producto
//  Depende de: main.js (WA_NUMERO, CATEGORIA_LABEL, ICONO_WA,
//              datoPlaca, tarjetaProducto) y productos.js (PRODUCTOS)
// ============================================================

function obtenerIdURL() {
  return parseInt(new URLSearchParams(window.location.search).get('id'), 10);
}

// ------------------------------------------------------------
//  Renderizar el detalle del producto
// ------------------------------------------------------------
function renderizarDetalle() {
  const contenedor = document.getElementById('producto-detalle');
  if (!contenedor) return;

  const producto = PRODUCTOS.find(p => p.id === obtenerIdURL());

  if (!producto) {
    contenedor.innerHTML = `
      <div class="producto-no-encontrado">
        <h1>Producto no encontrado</h1>
        <p>El producto que buscas no existe o ya no está disponible.</p>
        <a href="catalogo.html" class="btn btn-rojo">Ver catálogo completo</a>
      </div>
    `;
    return;
  }

  // Título de la página y breadcrumb dinámico
  document.title = `${producto.nombre} | Equipos Ruba`;
  const bcProducto = document.getElementById('bc-producto');
  if (bcProducto) bcProducto.textContent = producto.nombre;

  const categoria = CATEGORIA_LABEL[producto.categoria] || producto.categoria;
  const placa     = datoPlaca(producto);

  const mensaje = encodeURIComponent(
    `Hola, me interesa cotizar: *${producto.nombre}*${producto.modelo ? ` (Mod. ${producto.modelo})` : ''}. ¿Me pueden dar más información?`
  );
  const urlWA = `https://wa.me/${WA_NUMERO}?text=${mensaje}`;

  const precioHTML = producto.precio
    ? `<span class="detalle-precio">$${producto.precio.toLocaleString('es-MX')}<span class="detalle-precio-nota"> MXN</span></span>`
    : `<span class="detalle-precio-consultar">Precio a consultar — escríbenos para cotizar.</span>`;

  const specsHTML = Object.entries(producto.especificaciones || {}).map(([k, v]) => `
    <tr>
      <th scope="row">${k}</th>
      <td>${v}</td>
    </tr>
  `).join('');

  contenedor.innerHTML = `
    <div class="detalle-media">
      <div class="producto-media">
        <span class="placa ${placa.valor.length > 9 ? 'placa-larga' : ''}">
          <span class="placa-valor ${placa.valor.length > 9 ? 'largo' : ''}">${placa.valor}</span>
          <span class="placa-dato">${placa.dato}</span>
        </span>
        <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.remove()">
      </div>
    </div>

    <div class="detalle-info">
      <p class="detalle-cat">
        ${categoria}${producto.modelo ? ` <span class="producto-modelo">Mod. ${producto.modelo}</span>` : ''}
      </p>
      <h1 class="detalle-nombre">${producto.nombre}</h1>
      <p class="detalle-desc">${producto.descripcion}</p>

      <div class="detalle-cta">
        ${precioHTML}
        <a href="${urlWA}" class="btn btn-rojo btn-wa-grande" target="_blank" rel="noopener">
          ${ICONO_WA} Cotizar por WhatsApp
        </a>
      </div>

      ${specsHTML ? `
        <div class="especificaciones">
          <h2>Especificaciones técnicas</h2>
          <table class="specs-tabla">
            <tbody>${specsHTML}</tbody>
          </table>
        </div>
      ` : ''}
    </div>
  `;
}

// ------------------------------------------------------------
//  Renderizar productos relacionados (misma categoría)
// ------------------------------------------------------------
function renderizarRelacionados() {
  const id = obtenerIdURL();
  const producto = PRODUCTOS.find(p => p.id === id);
  if (!producto) return;

  const seccion    = document.getElementById('seccion-relacionados');
  const contenedor = document.getElementById('productos-relacionados');
  if (!seccion || !contenedor) return;

  const relacionados = PRODUCTOS
    .filter(p => p.categoria === producto.categoria && p.id !== id)
    .slice(0, 3);

  if (!relacionados.length) {
    seccion.hidden = true;
    return;
  }

  contenedor.innerHTML = relacionados.map(tarjetaProducto).join('');
}

// ------------------------------------------------------------
//  Punto de entrada
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  renderizarDetalle();
  renderizarRelacionados();
});
