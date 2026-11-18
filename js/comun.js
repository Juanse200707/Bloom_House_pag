const datosIniciales = {
  usuarios: [
    { id: 1, nombre: "Admin Bloom", email: "admin@bloom.co", password: "c0beb5f783db35ccd7991a69ecdd6af2e0d1c5e9f0b98e46672d3fe08bd89e29", rol: "admin" },
    { id: 2, nombre: "Flores del Valle", email: "empresa@bloom.co", password: "c0beb5f783db35ccd7991a69ecdd6af2e0d1c5e9f0b98e46672d3fe08bd89e29", rol: "empresa", empresaId: 1 },
    { id: 3, nombre: "Ana Cliente", email: "cliente@bloom.co", password: "c0beb5f783db35ccd7991a69ecdd6af2e0d1c5e9f0b98e46672d3fe08bd89e29", rol: "cliente" }
  ],
  empresas: [
    { id: 1, nombre: "Flores del Valle", localidad: "Chapinero", ciudad: "Bogotá", especialidades: ["Ramos nupciales", "Decoración eventos"], desde: 2018, verificada: true, whatsapp: "573001112233" },
    { id: 2, nombre: "La Orquídea Dorada", localidad: "El Poblado", ciudad: "Medellín", especialidades: ["Orquídeas", "Plantas tropicales"], desde: 2015, verificada: true, whatsapp: "573004445566" },
    { id: 3, nombre: "Casa Florentina", localidad: "Granada", ciudad: "Cali", especialidades: ["Bouquet artesanal", "Flores secas"], desde: 2020, verificada: true, whatsapp: "573007778899" },
    { id: 4, nombre: "Bloom & Co", localidad: "Alto Prado", ciudad: "Barranquilla", especialidades: ["Bodas de lujo", "Centros de mesa"], desde: 2021, verificada: true, whatsapp: "573001230000" }
  ],
  productos: [
    { id: 1, nombre: "Corona Fúnebre Clásica", empresaId: 1, categoria: "Coronas", tipo: "Mixtas", localidad: "Chapinero", precio: 180000, precioAnterior: 0, etiqueta: "", stock: 10, activo: true, descripcion: "Corona clásica para homenajes.", imagen: "imagenes/corona.png" },
    { id: 2, nombre: "Ramo de Rosas Rojas Premium", empresaId: 1, categoria: "Ramos", tipo: "Rosas", localidad: "Chapinero", precio: 85000, precioAnterior: 110000, etiqueta: "Más vendido", stock: 12, activo: true, descripcion: "Ramo premium de rosas rojas frescas.", imagen: "imagenes/rosas.png" },
    { id: 3, nombre: "Jardín Miniatura Suculentas", empresaId: 2, categoria: "Plantas", tipo: "Suculentas", localidad: "El Poblado", precio: 48000, precioAnterior: 0, etiqueta: "", stock: 9, activo: true, descripcion: "Pequeño jardín de suculentas.", imagen: "imagenes/suculentas.png" },
    { id: 4, nombre: "Arreglo Tropical Silvestre", empresaId: 2, categoria: "Arreglos", tipo: "Mixtas", localidad: "El Poblado", precio: 65000, precioAnterior: 0, etiqueta: "", stock: 7, activo: true, descripcion: "Arreglo con flores tropicales.", imagen: "imagenes/tropical.png" },
    { id: 5, nombre: "Ramo Silvestre Colombiano", empresaId: 3, categoria: "Ramos", tipo: "Mixtas", localidad: "Granada", precio: 55000, precioAnterior: 0, etiqueta: "", stock: 6, activo: true, descripcion: "Ramo con flores silvestres de Colombia.", imagen: "imagenes/silvestre.png" },
    { id: 6, nombre: "Bouquet Primavera Pastel", empresaId: 3, categoria: "Ramos", tipo: "Tulipanes", localidad: "Granada", precio: 72000, precioAnterior: 0, etiqueta: "Nuevo", stock: 8, activo: true, descripcion: "Bouquet en tonos pastel.", imagen: "imagenes/pastel.png" },
    { id: 7, nombre: "Centro de Mesa Bodas", empresaId: 4, categoria: "Eventos", tipo: "Girasoles", localidad: "Alto Prado", precio: 150000, precioAnterior: 180000, etiqueta: "Oferta", stock: 4, activo: true, descripcion: "Centro de mesa elegante para bodas.", imagen: "imagenes/bodas.png" },
    { id: 8, nombre: "Rosas Ecuatorianas XL", empresaId: 4, categoria: "Ramos", tipo: "Rosas", localidad: "Alto Prado", precio: 95000, precioAnterior: 0, etiqueta: "", stock: 0, activo: true, descripcion: "Rosas grandes de Ecuador.", imagen: "imagenes/ecuatorianas.png" }
  ],
  resenas: [
    { id: 1, productoId: 2, usuario: "Ana Cliente", estrellas: 5, texto: "Hermosas y frescas." }
  ],
  pedidos: [],
  mensajes: []
};

// Cargar o inicializar la base de datos local
function obtenerBaseDatos() {
  const clave = "bloomHouseDatos_png";
  const guardada = localStorage.getItem(clave);
  if (guardada) {
    try { return JSON.parse(guardada); } catch { /* ignorar */ }
  }
  localStorage.setItem(clave, JSON.stringify(datosIniciales));
  return JSON.parse(JSON.stringify(datosIniciales));
}

function guardarBaseDatos(datos) {
  localStorage.setItem("bloomHouseDatos_png", JSON.stringify(datos));
}

// Simulador de API (reemplaza a json-server)
async function llamarApi(ruta, opciones = {}) {
  const metodo = (opciones.method || "GET").toUpperCase();
  const datos = obtenerBaseDatos();

  // Separar ruta y query
  const [rutaLimpia, queryString] = ruta.split("?");
  const partes = rutaLimpia.split("/").filter(Boolean);
  const coleccion = partes[0];
  const id = partes[1] ? Number(partes[1]) : null;

  if (!datos[coleccion]) datos[coleccion] = [];

  // GET
  if (metodo === "GET") {
    let lista = datos[coleccion];

    if (id) {
      const encontrado = lista.find(item => item.id === id);
      if (!encontrado) throw new Error("No encontrado");
      return encontrado;
    }

    // Filtros simples tipo ?activo=true&empresaId=1
    if (queryString) {
      const params = new URLSearchParams(queryString);
      lista = lista.filter(item => {
        for (const [clave, valor] of params.entries()) {
          const valorItem = item[clave];
          if (valor === "true") return valorItem === true;
          if (valor === "false") return valorItem === false;
          if (String(valorItem) !== valor) return false;
        }
        return true;
      });
    }
    return lista;
  }

  // POST
  if (metodo === "POST") {
    const nuevo = opciones.body || {};
    const maxId = datos[coleccion].reduce((max, item) => Math.max(max, item.id || 0), 0);
    nuevo.id = maxId + 1;
    datos[coleccion].push(nuevo);
    guardarBaseDatos(datos);
    return nuevo;
  }

  // PATCH
  if (metodo === "PATCH" && id) {
    const indice = datos[coleccion].findIndex(item => item.id === id);
    if (indice === -1) throw new Error("No encontrado");
    datos[coleccion][indice] = { ...datos[coleccion][indice], ...opciones.body };
    guardarBaseDatos(datos);
    return datos[coleccion][indice];
  }

  // DELETE
  if (metodo === "DELETE" && id) {
    datos[coleccion] = datos[coleccion].filter(item => item.id !== id);
    guardarBaseDatos(datos);
    return { ok: true };
  }

  throw new Error("Método o ruta no soportada");
}

// ============================================================
//  Utilidades generales
// ============================================================
const buscarElemento = selector => document.querySelector(selector);

const categoriasDisponibles = ['Ramos', 'Arreglos', 'Coronas', 'Eventos', 'Plantas'];
const tiposDeFlores = ['Rosas', 'Girasoles', 'Tulipanes', 'Orquídeas', 'Suculentas', 'Mixtas'];
const localidades = ['Chapinero', 'El Poblado', 'Granada', 'Alto Prado'];

const formatearMoneda = cantidad => '$' + Number(cantidad).toLocaleString('es-CO');

const crearImagenPlaceholder = texto => 'data:image/svg+xml,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
    <rect width="100%" height="100%" fill="#dee2e6"/>
    <text x="50%" y="50%" text-anchor="middle" fill="#6c757d" font-size="20">${texto || 'Imagen'}</text>
  </svg>
`);

const obtenerTokenGuardado = () => localStorage.getItem('jwt');

const codificarBase64Url = objeto => {
  return btoa(unescape(encodeURIComponent(JSON.stringify(objeto))))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const generarTokenAcceso = usuario => {
  const cabecera = codificarBase64Url({ alg: 'HS256', typ: 'JWT' });
  const cuerpo = codificarBase64Url({
    sub: usuario.id,
    nombre: usuario.nombre,
    rol: usuario.rol,
    empresaId: usuario.empresaId,
    exp: Date.now() / 1000 + 3600
  });
  return cabecera + '.' + cuerpo + '.firma-simulada';
};

const leerSesionActual = () => {
  try {
    const token = obtenerTokenGuardado();
    if (!token) return null;
    const parte = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const datos = JSON.parse(decodeURIComponent(escape(atob(parte))));
    if (datos.exp < Date.now() / 1000) throw new Error();
    return datos;
  } catch {
    localStorage.removeItem('jwt');
    return null;
  }
};

const hashearContrasena = async texto => {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
};

const cerrarSesion = () => {
  localStorage.removeItem('jwt');
  location.href = 'index.html';
};

const mostrarAviso = (mensaje, tipo = 'success') => {
  const aviso = document.createElement('div');
  aviso.className = `alert alert-${tipo} position-fixed top-0 end-0 m-3 shadow`;
  aviso.style.zIndex = 2000;
  aviso.textContent = mensaje;
  document.body.append(aviso);
  setTimeout(() => aviso.remove(), 2500);
};

const textoEstrellas = lista => {
  if (!lista.length) return 'Sin reseñas';
  const promedio = lista.reduce((s, r) => s + r.estrellas, 0) / lista.length;
  return `★ ${promedio.toFixed(1)} (${lista.length})`;
};

// Carrito
const leerCarrito = () => JSON.parse(localStorage.getItem('carrito') || '[]');

const guardarCarrito = carrito => {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  refrescarCarrito();
};

function agregarProductoCarrito(producto, nombreEmpresa) {
  const carrito = leerCarrito();
  const existente = carrito.find(item => item.id === producto.id);
  if (existente) {
    if (existente.cantidad < producto.stock) existente.cantidad++;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      empresa: nombreEmpresa,
      empresaId: producto.empresaId,
      precio: producto.precio,
      stock: producto.stock,
      cantidad: 1,
      imagen: producto.imagen || ''
    });
  }
  guardarCarrito(carrito);
  mostrarAviso('Producto agregado al carrito');
}

const modificarCantidad = (idProducto, cambio) => {
  const carrito = leerCarrito();
  const item = carrito.find(el => el.id === idProducto);
  if (item) item.cantidad = Math.min(item.stock, item.cantidad + cambio);
  guardarCarrito(carrito.filter(el => el.cantidad > 0));
};

const sacarDelCarrito = idProducto => {
  guardarCarrito(leerCarrito().filter(el => el.id !== idProducto));
};

function refrescarCarrito() {
  const carrito = leerCarrito();
  const total = carrito.reduce((s, item) => s + item.cantidad * item.precio, 0);

  const contador = buscarElemento('#contadorCarrito');
  if (contador) contador.textContent = carrito.reduce((s, item) => s + item.cantidad, 0);

  const contenedor = buscarElemento('#contenidoCarrito');
  if (contenedor) {
    contenedor.innerHTML = carrito.map(item => `
      <div class="card mb-2">
        <div class="card-body d-flex gap-2">
          <img src="${crearImagenPlaceholder('')}" width="60" class="rounded" alt="">
          <div class="flex-grow-1">
            <div class="fw-semibold">${item.nombre}</div>
            <small class="text-muted">${item.empresa}</small>
            <div class="d-flex justify-content-between align-items-center mt-1">
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-secondary" onclick="modificarCantidad(${item.id}, -1)">−</button>
                <span class="btn disabled">${item.cantidad}</span>
                <button class="btn btn-outline-secondary" onclick="modificarCantidad(${item.id}, 1)">+</button>
              </div>
              <b>${formatearMoneda(item.precio * item.cantidad)}</b>
              <button class="btn btn-sm text-danger" onclick="sacarDelCarrito(${item.id})">🗑</button>
            </div>
          </div>
        </div>
      </div>
    `).join('') || '<p class="text-muted">Tu carrito está vacío.</p>';
  }

  const sub = buscarElemento('#subtotalCarrito');
  const tot = buscarElemento('#totalCarrito');
  if (sub) sub.textContent = formatearMoneda(total);
  if (tot) tot.textContent = formatearMoneda(total);
}

async function enviarPedido() {
  const sesion = leerSesionActual();
  const carrito = leerCarrito();
  if (!carrito.length) return;

  if (!sesion || sesion.rol !== 'cliente') {
    const off = bootstrap.Offcanvas.getInstance(buscarElemento('#carritoLateral'));
    if (off) off.hide();
    new bootstrap.Modal(buscarElemento('#modalCuenta')).show();
    return;
  }

  await llamarApi('/pedidos', {
    method: 'POST',
    body: {
      usuarioId: sesion.sub,
      items: carrito.map(item => ({
        productoId: item.id,
        nombre: item.nombre,
        empresaId: item.empresaId,
        cant: item.cantidad,
        precio: item.precio
      })),
      total: carrito.reduce((s, item) => s + item.cantidad * item.precio, 0),
      pago: buscarElemento('#metodoPago')?.value || 'Tarjeta',
      estado: 'registrado',
      fecha: new Date().toISOString()
    }
  });

  for (const item of carrito) {
    const producto = await llamarApi('/productos/' + item.id);
    await llamarApi('/productos/' + item.id, {
      method: 'PATCH',
      body: { stock: Math.max(0, producto.stock - item.cantidad) }
    });
  }

  guardarCarrito([]);
  mostrarAviso('¡Pedido registrado con éxito!');
  setTimeout(() => location.reload(), 800);
}

async function cargarNotificaciones(sesion) {
  if (!sesion) return [];
  const [pedidos, productos] = await Promise.all([
    llamarApi('/pedidos').catch(() => []),
    llamarApi('/productos').catch(() => [])
  ]);
  const alertas = [];

  if (sesion.rol === 'cliente') {
    pedidos.filter(p => p.usuarioId == sesion.sub)
      .forEach(p => alertas.push(['Pedido #' + p.id, 'Estado: ' + p.estado]));
  } else {
    const esPropio = id => sesion.rol === 'admin' || id === sesion.empresaId;
    pedidos.filter(p => p.items.some(i => esPropio(i.empresaId)))
      .forEach(p => alertas.push(['Nuevo pedido recibido', `Pedido #${p.id} — ${formatearMoneda(p.total)}`]));
    productos.filter(p => esPropio(p.empresaId) && p.stock <= 5)
      .forEach(p => alertas.push(['Alerta de stock mínimo', `${p.nombre}: ${p.stock} unidades.`]));
  }
  return alertas.reverse();
}

async function montarInterfazComun() {
  const sesion = leerSesionActual();
  const notificaciones = await cargarNotificaciones(sesion).catch(() => []);
  const activa = archivo => location.pathname.endsWith(archivo) ? 'active' : '';

  const enlace = (href, texto) =>
    `<li class="nav-item"><a class="nav-link ${activa(href)}" href="${href}">${texto}</a></li>`;

  const nav = buscarElemento('#nav');
  if (nav) {
    nav.innerHTML = `
      <nav class="navbar navbar-expand-lg bg-body-tertiary border-bottom sticky-top">
        <div class="container">
          <a class="navbar-brand fw-bold" href="index.html">🌸 Bloom House</a>
          <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#menuNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="menuNav">
            <ul class="navbar-nav mx-auto">
              ${enlace('index.html', 'Marketplace')}
              ${enlace('floristerias.html', 'Floristerías')}
              ${enlace('nosotros.html', 'Nosotros')}
            </ul>
            <div class="d-flex align-items-center gap-2">
              <a class="btn btn-sm" href="index.html#buscar">🔍</a>
              <div class="dropdown">
                <button class="btn btn-sm dropdown-toggle" data-bs-toggle="dropdown">🌐 ES</button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#">Español</a></li>
                  <li><a class="dropdown-item" href="#">English</a></li>
                </ul>
              </div>
              <div class="dropdown">
                <button class="btn btn-sm position-relative" data-bs-toggle="dropdown">
                  🔔 ${notificaciones.length ? `<span class="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle">${notificaciones.length}</span>` : ''}
                </button>
                <div class="dropdown-menu dropdown-menu-end p-0" style="min-width:300px">
                  <div class="p-2 fw-semibold border-bottom">Notificaciones <span class="badge bg-primary">${notificaciones.length}</span></div>
                  ${notificaciones.slice(0, 5).map(n => `
                    <div class="p-2 border-bottom">
                      <div class="fw-semibold small">${n[0]}</div>
                      <div class="small text-muted">${n[1]}</div>
                    </div>
                  `).join('') || '<div class="p-2 small">Sin notificaciones</div>'}
                  <a class="d-block text-center small p-2" href="${sesion && sesion.rol !== 'cliente' ? 'panel.html' : '#'}">Ver todas</a>
                </div>
              </div>
              <button class="btn btn-sm position-relative" data-bs-toggle="offcanvas" data-bs-target="#carritoLateral">
                🛒 <span id="contadorCarrito" class="badge rounded-pill bg-warning text-dark position-absolute top-0 start-100 translate-middle">0</span>
              </button>
              ${sesion ? `
                <div class="dropdown">
                  <button class="btn btn-primary btn-sm rounded-pill dropdown-toggle" data-bs-toggle="dropdown">${sesion.nombre}</button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    ${sesion.rol !== 'cliente' ? '<li><a class="dropdown-item" href="panel.html">Mi panel</a></li>' : ''}
                    <li><button class="dropdown-item" onclick="cerrarSesion()">Cerrar sesión</button></li>
                  </ul>
                </div>
              ` : `
                <button class="btn btn-primary btn-sm rounded-pill" data-bs-toggle="modal" data-bs-target="#modalCuenta">Mi Cuenta</button>
              `}
            </div>
          </div>
        </div>
      </nav>
    `;
  }

  const pie = buscarElemento('#pie');
  if (pie) {
    pie.innerHTML = `
      <footer class="bg-dark text-white-50 mt-5 py-4">
        <div class="container">
          <div class="row g-3">
            <div class="col-md-3">
              <h5 class="text-white">🌸 Bloom House</h5>
              <small>Marketplace y red de distribución floral colombiana.</small>
            </div>
            <div class="col-6 col-md-3">
              <h6 class="text-warning">Plataforma</h6>
              <ul class="list-unstyled small">
                <li><a class="link-light" href="index.html">Marketplace</a></li>
                <li><a class="link-light" href="floristerias.html">Floristerías aliadas</a></li>
                <li><a class="link-light" href="panel.html">Panel de gestión</a></li>
                <li><a class="link-light" href="nosotros.html">Nosotros</a></li>
              </ul>
            </div>
            <div class="col-6 col-md-3">
              <h6 class="text-warning">Institucional</h6>
              <ul class="list-unstyled small">
                <li><a class="link-light" href="terminos.html">Términos y Condiciones</a></li>
                <li>Política de privacidad</li>
                <li>Política de devoluciones</li>
                <li>Preguntas frecuentes</li>
              </ul>
            </div>
            <div class="col-md-3">
              <h6 class="text-warning">Contacto</h6>
              <ul class="list-unstyled small">
                <li>+57 300 123 4567</li>
                <li>hola@bloomhouse.co</li>
                <li>Lun-Vie 8:00–18:00 COT</li>
              </ul>
            </div>
          </div>
          <hr>
          <small>© 2026 Bloom House S.A.S. · Bogotá, Colombia</small>
        </div>
      </footer>
    `;
  }

  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal fade" id="modalCuenta">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Acceder a Bloom House</h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted">Selecciona tu tipo de cuenta para continuar</p>
            <div class="list-group">
              <a class="list-group-item list-group-item-action" href="autenticacion.html?tipo=cliente"><b>Cliente</b><br><small>Compra flores y realiza pedidos a domicilio</small></a>
              <a class="list-group-item list-group-item-action" href="autenticacion.html?tipo=empresa"><b>Floristería Aliada</b><br><small>Gestiona tu tienda y catálogo de productos</small></a>
              <a class="list-group-item list-group-item-action" href="autenticacion.html?tipo=admin"><b>Administrador</b><br><small>Acceso completo al sistema de gestión</small></a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="offcanvas offcanvas-end" id="carritoLateral">
      <div class="offcanvas-header">
        <h5>Mi Carrito</h5>
        <button class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body" id="contenidoCarrito"></div>
      <div class="p-3 border-top">
        <div class="d-flex justify-content-between"><span>Subtotal</span><span id="subtotalCarrito"></span></div>
        <div class="d-flex justify-content-between"><span>Domicilio</span><span class="text-success">Gratis</span></div>
        <div class="d-flex justify-content-between fw-bold my-2"><span>Total</span><span id="totalCarrito"></span></div>
        <select id="metodoPago" class="form-select mb-2">
          <option>Tarjeta</option><option>PSE</option><option>Contra entrega</option>
        </select>
        <button class="btn btn-primary w-100" onclick="enviarPedido()">Finalizar pedido</button>
      </div>
    </div>
  `);

  refrescarCarrito();
}

document.addEventListener('DOMContentLoaded', montarInterfazComun);
