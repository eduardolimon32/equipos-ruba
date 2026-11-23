// ============================================================
//  main.js — Equipos Ruba
//  Tarjetas de producto, menú móvil y conteo de categorías.
//  Depende de productos.js (PRODUCTOS), que se carga antes.
// ============================================================

// Número de WhatsApp: 52 (México) + 10 dígitos, sin espacios
const WA_NUMERO = '524492601458';

// Nombres de categoría como se muestran en la página
const CATEGORIA_LABEL = {
  rampas:      'Rampas',
  llantas:     'Llantas y balanceo',
  alineacion:  'Alineación y suspensión',
  gatos:       'Gatos y grúas',
  herramienta: 'Herramienta',
  equipo:      'Equipo para taller',
  paquetes:    'Paquetes',
};

const ICONO_WA = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35z"/><path d="M12 0C5.37 0 0 5.37 0 12c0 2.14.56 4.14 1.54 5.87L.06 23.89a.5.5 0 00.61.61l6.01-1.48A11.95 11.95 0 0012 24c6.63 0 12-5.37 12-12S18.63 0 12 0zm0 22c-1.95 0-3.77-.53-5.33-1.44l-.38-.23-3.94.97.97-3.94-.23-.38A9.94 9.94 0 012 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z"/></svg>`;

// ------------------------------------------------------------
//  Placa de capacidad: el dato más importante del producto
//  "3 toneladas" → "3 t", "100 litros" → "100 L".
//  Si no hay capacidad, usa la primera especificación.
// ------------------------------------------------------------
function datoPlaca(producto) {
  const specs = producto.especificaciones || {};
  const claveCap = Object.keys(specs).find(k => k.toLowerCase().startsWith('capacidad'));

  if (claveCap) {
    const valor = specs[claveCap]
      .replace(/\s*toneladas?/i, ' t')
      .replace(/\s*litros?/i, ' L')
      .replace(/\s*kg/i, ' kg');
    return { valor, dato: claveCap };
  }

  const [clave, valor] = Object.entries(specs)[0] || ['', ''];
  return { valor, dato: clave };
}

// ------------------------------------------------------------
//  HTML de una tarjeta (la usan la portada y el catálogo)
// ------------------------------------------------------------
function tarjetaProducto(producto) {
  const mensaje = encodeURIComponent(
    `Hola, me interesa cotizar: *${producto.nombre}*${producto.modelo ? ` (Mod. ${producto.modelo})` : ''}. ¿Me pueden dar más información?`
  );
  const urlWA      = `https://wa.me/${WA_NUMERO}?text=${mensaje}`;
  const urlDetalle = `producto.html?id=${producto.id}`;
  const categoria  = CATEGORIA_LABEL[producto.categoria] || producto.categoria;
  const placa      = datoPlaca(producto);
  const precio     = producto.precio
    ? `<span class="producto-precio">$${producto.precio.toLocaleString('es-MX')}</span>`
    : `<span class="producto-precio consultar">Precio a consultar</span>`;

  // Si la foto no existe todavía, se quita y queda visible la placa
  return `
    <article class="producto">
      <a href="${urlDetalle}" class="producto-media" tabindex="-1" aria-hidden="true">
        <span class="placa ${placa.valor.length > 9 ? 'placa-larga' : ''}">
          <span class="placa-valor ${placa.valor.length > 9 ? 'largo' : ''}">${placa.valor}</span>
          <span class="placa-dato">${placa.dato}</span>
        </span>
        <img src="${producto.imagen}" alt="" loading="lazy" onerror="this.remove()">
      </a>
      <div class="producto-cuerpo">
        <p class="producto-cat">${categoria}${producto.modelo ? ` <span class="producto-modelo">Mod. ${producto.modelo}</span>` : ''}</p>
        <h3 class="producto-nombre"><a href="${urlDetalle}">${producto.nombre}</a></h3>
        <p class="producto-desc">${producto.descripcion}</p>
        <div class="producto-pie">
          ${precio}
          <a href="${urlWA}" class="btn btn-rojo btn-chico" target="_blank" rel="noopener">
            ${ICONO_WA} Cotizar
          </a>
        </div>
      </div>
    </article>
  `;
}

// ------------------------------------------------------------
//  Portada: productos destacados
// ------------------------------------------------------------
function renderizarDestacados() {
  const contenedor = document.getElementById('productos-destacados');
  if (!contenedor) return;
  // Máximo 4 en la portada para que la fila quede completa; el resto está en el catálogo
  contenedor.innerHTML = PRODUCTOS.filter(p => p.destacado).slice(0, 4).map(tarjetaProducto).join('');
}

// ------------------------------------------------------------
//  Portada: cuántos productos hay en cada categoría
// ------------------------------------------------------------
function contarCategorias() {
  document.querySelectorAll('[data-cuenta]').forEach(el => {
    const n = PRODUCTOS.filter(p => p.categoria === el.dataset.cuenta).length;
    el.textContent = n === 1 ? '1 producto' : `${n} productos`;
  });
}

// ------------------------------------------------------------
//  Menú móvil
// ------------------------------------------------------------
function initMenuMovil() {
  const boton = document.getElementById('nav-hamburguesa');
  const menu  = document.getElementById('nav-menu');
  if (!boton || !menu) return;

  const cambiar = abierto => {
    menu.classList.toggle('abierto', abierto);
    boton.classList.toggle('activo', abierto);
    boton.setAttribute('aria-expanded', String(abierto));
    boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  };

  boton.addEventListener('click', () => cambiar(!menu.classList.contains('abierto')));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => cambiar(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cambiar(false); });
}

// ------------------------------------------------------------
//  Marcar la página actual en el menú
// ------------------------------------------------------------
function marcarNavActivo() {
  const pagina = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a').forEach(link => {
    if (link.getAttribute('href') === pagina) {
      link.classList.add('activo');
      link.setAttribute('aria-current', 'page');
    }
  });
}

// ------------------------------------------------------------
//  Portada: el logo del menú aparece hasta que el logo grande
//  del hero sale de la pantalla (así no se ven dos logos juntos)
// ------------------------------------------------------------
function initLogoMenu() {
  const logoHero = document.querySelector('.hero-logo');
  const logoMenu = document.querySelector('.nav-logo');
  if (!logoHero || !logoMenu) return;

  logoMenu.classList.add('oculto');
  new IntersectionObserver(([entrada]) => {
    logoMenu.classList.toggle('oculto', entrada.isIntersecting);
  }, { rootMargin: '-80px 0px 0px 0px' }).observe(logoHero);
}

document.addEventListener('DOMContentLoaded', () => {
  initMenuMovil();
  initLogoMenu();
  marcarNavActivo();
  renderizarDestacados();
  contarCategorias();
});
