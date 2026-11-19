// ============================================================
//  ARCHIVO DEL PANEL DE GESTIÓN - BLOOM HOUSE
// ============================================================
//  ¿Qué hace este archivo? Maneja la página "panel.html", a la
//  que solo entran las floristerías y el administrador. Desde
//  aquí se pueden:
//    1. Ver un resumen de ventas, pedidos y stock
//    2. Crear, editar, habilitar y eliminar productos
//    3. Cambiar el estado de los pedidos
//    4. (Solo el administrador) ver y eliminar usuarios
//
//  IMPORTANTE: este archivo usa funciones del archivo principal
//  (como leerSesionActual, llamarApi, buscarElemento, formatearMoneda
//  y mostrarAviso). Por eso, en panel.html, el archivo principal
//  debe cargarse ANTES que este.
// ============================================================


// ============================================================
//  PARTE 1: VALIDAR QUE LA PERSONA PUEDA ENTRAR
// ============================================================

// Revisamos quién tiene la sesión iniciada (o null si nadie).
const sesionActual = leerSesionActual();

// Si no hay sesión, o la persona es un cliente, no puede estar aquí:
// la mandamos a la página de inicio de sesión.
if (!sesionActual || sesionActual.rol === 'cliente') {
    location.href = 'autenticacion.html';
    // "throw new Error" detiene el resto del código, para que no se
    // ejecute nada más mientras se hace el cambio de página.
    throw new Error('Acceso no autorizado');
}


// ============================================================
//  PARTE 2: LLENAR LOS MENÚS DESPLEGABLES DEL FORMULARIO
// ============================================================
//  El formulario de productos tiene tres menús desplegables
//  (categoría, tipo de flor y localidad). Aquí se llenan con
//  las listas que están en el archivo principal.
// ============================================================

// Repetimos lo mismo para cada uno de los tres campos.
["categoria", "tipo", "localidad"].forEach(nombreCampo => {
    // Buscamos el menú desplegable por su atributo name (ej: name="categoria").
    const select = buscarElemento("[name=" + nombreCampo + "]");

    // Solo si existe en la página (por si en otra página no está).
    if (select) {
        // Elegimos qué lista corresponde a cada campo.
        const opciones = nombreCampo === "categoria" ? categoriasDisponibles :
                         nombreCampo === "tipo" ? tiposDeFlores :
                         localidades;

        // Convertimos cada elemento de la lista en una <option> (una opción del menú).
        select.innerHTML = opciones.map(opcion => `<option>${opcion}</option>`).join("");
    }
});


// ============================================================
//  PARTE 3: VARIABLES DEL PANEL
// ============================================================

// true si quien entró es el administrador, false si es una floristería.
const esAdministrador = sesionActual.rol === 'admin';

// Guarda el producto que se está editando en este momento.
// Si vale null, significa que se está creando uno nuevo.
// Se usa "let" porque su valor va cambiando.
let productoEnEdicion = null;

// Guardará la ventana emergente (modal) del formulario de producto.
let modalProducto;


// ============================================================
//  PARTE 4: CARGAR Y DIBUJAR TODO EL PANEL
// ============================================================
//  Esta es la función más importante: trae los datos y los dibuja
//  en pantalla (tarjetas, tablas, etc.). Se vuelve a llamar cada
//  vez que algo cambia, para que la pantalla siempre esté al día.
// ============================================================
async function cargarPanel() {

    // ---------- TÍTULO ----------
    // El título cambia según quién entró.
    const titulo = buscarElemento('#titulo');
    if (titulo) {
        titulo.textContent = esAdministrador
            ? 'Panel de administración'
            : 'Panel de mi floristería';
    }

    // ---------- FILTRO DE PRODUCTOS ----------
    // El administrador ve todos los productos. Una floristería solo ve los suyos,
    // por eso se agrega "?empresaId=..." para filtrar.
    const filtroEmpresa = esAdministrador ? '' : '?empresaId=' + sesionActual.empresaId;

    // Pedimos los productos, pedidos y empresas AL MISMO TIEMPO (así es más rápido).
    // Promise.all espera a que lleguen los tres y los guarda en esas 3 variables.
    const [productos, pedidos, empresas] = await Promise.all([
        llamarApi('/productos' + filtroEmpresa),
        llamarApi('/pedidos'),
        llamarApi('/empresas')
    ]);

    // ---------- MOSTRAR LA FLORISTERÍA DE LA CUENTA ----------
    // Solo para floristerías (el administrador no tiene una empresa propia).
    if (!esAdministrador) {
        // Buscamos entre todas las empresas la que le corresponde a esta cuenta.
        const miEmpresa = empresas.find(
            empresa => empresa.id === sesionActual.empresaId
        );

        // Buscamos la cajita donde mostrar el nombre de la floristería.
        let infoEmpresa = buscarElemento('#infoEmpresa');

        // Si no existe todavía, la creamos y la pegamos justo debajo del título.
        if (!infoEmpresa) {
            infoEmpresa = document.createElement('div');
            infoEmpresa.id = 'infoEmpresa';
            titulo.insertAdjacentElement('afterend', infoEmpresa);
        }

        // Le damos estilo (clases de Bootstrap) a la cajita.
        infoEmpresa.className = 'info-floristeria alert bg-light border-start border-success border-4 shadow-sm mt-3';

        // Escribimos el contenido: un icono de flor y el nombre de la floristería.
        // Si por alguna razón no se encuentra, mostramos "Floristería no encontrada".
        infoEmpresa.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <div class="icono-floristeria">
                    <i class="bi bi-flower1"></i>
                </div>
                <div>
                    <small class="text-muted d-block">Tu floristería</small>
                    <strong class="text-dark">
                        ${miEmpresa ? miEmpresa.nombre : 'Floristería no encontrada'}
                    </strong>
                </div>
            </div>
        `;
    }

    // ---------- FILTRAR PEDIDOS SEGÚN EL ROL ----------
    // El administrador ve todos los pedidos. Una floristería solo ve los
    // pedidos que incluyen al menos un producto suyo (.some = "alguno cumple").
    const misPedidos = pedidos.filter(pedido =>
        esAdministrador || pedido.items.some(item => item.empresaId === sesionActual.empresaId)
    );

    // ---------- CALCULAR EL TOTAL DE VENTAS ----------
    // Recorremos cada pedido y sumamos (cantidad × precio) de cada producto.
    // Una floristería solo suma sus propios productos, aunque el pedido tenga
    // productos de otras floristerías.
    const totalVentas = misPedidos.reduce((suma, pedido) =>
        suma + pedido.items
            .filter(item => esAdministrador || item.empresaId === sesionActual.empresaId)
            .reduce((subtotal, item) => subtotal + item.cant * item.precio, 0),
        0
    );

    // ---------- TARJETAS DEL INFORME (resumen de arriba) ----------
    // Función que crea una tarjetita con un título pequeño y un valor grande.
    const crearTarjeta = (tituloTarjeta, valor) => `
        <div class="col-6 col-md-3">
            <div class="card text-center">
                <div class="card-body">
                    <small>${tituloTarjeta}</small>
                    <h4>${valor}</h4>
                </div>
            </div>
        </div>
    `;

    // Dibujamos las 4 tarjetas: ventas, pedidos, unidades en stock, y
    // empresas (si es admin) o productos (si es floristería).
    const informe = buscarElemento('#informe');
    if (informe) {
        informe.innerHTML =
            crearTarjeta('Ventas', formatearMoneda(totalVentas)) +
            crearTarjeta('Pedidos', misPedidos.length) +
            crearTarjeta('Unidades en stock', productos.reduce((suma, producto) => suma + producto.stock, 0)) +
            crearTarjeta(esAdministrador ? 'Empresas' : 'Productos', esAdministrador ? empresas.length : productos.length);
    }

    // ---------- TABLA DE PRODUCTOS ----------
    // Por cada producto se crea una fila (<tr>) con sus datos y botones.
    const tablaProductos = buscarElemento('#tp');
    if (tablaProductos) {
        tablaProductos.innerHTML = productos.map(producto => `
            <tr>
                <td>${producto.nombre}</td>
                <td class="small">${producto.categoria} · ${producto.tipo} · ${producto.localidad}</td>
                <td>${formatearMoneda(producto.precio)}</td>
                <td>
                    <!-- Casilla para cambiar el stock directamente.
                         Al cambiar el número, se guarda solo (onchange).
                         El "+" en "+this.value" convierte el texto en número. -->
                    <input
                        type="number"
                        min="0"
                        value="${producto.stock}"
                        class="form-control form-control-sm"
                        style="width:80px"
                        onchange="actualizarProducto(${producto.id}, {stock: +this.value})"
                    >
                </td>
                <td>
                    <!-- Etiqueta verde si el producto está activo, gris si no -->
                    <span class="badge bg-${producto.activo ? 'success' : 'secondary'}">
                        ${producto.activo ? 'Activo' : 'Deshabilitado'}
                    </span>
                </td>
                <td class="text-nowrap">
                    <!-- Botón Editar: abre el formulario con los datos de este producto -->
                    <button
                        class="btn btn-sm btn-outline-primary"
                        onclick='abrirFormularioProducto(${JSON.stringify(producto)})'
                    >
                        Editar
                    </button>
                    <!-- Botón Habilitar/Deshabilitar: cambia "activo" a lo contrario de lo que es ahora -->
                    <button
                        class="btn btn-sm btn-outline-secondary"
                        onclick="actualizarProducto(${producto.id}, {activo: ${!producto.activo}})"
                    >
                        ${producto.activo ? 'Deshabilitar' : 'Habilitar'}
                    </button>
                    <!-- Botón Eliminar: borra el producto (antes pide confirmación) -->
                    <button
                        class="btn btn-sm btn-outline-danger"
                        onclick="eliminarProducto(${producto.id})"
                    >
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // ---------- TABLA DE PEDIDOS ----------
    const tablaPedidos = buscarElemento('#tped');
    if (tablaPedidos) {
        tablaPedidos.innerHTML = misPedidos.map(pedido => `
            <tr>
                <td>#${pedido.id}</td>
                <!-- Lista de productos del pedido, ej: "Ramo de girasoles x2, Suculenta x1" -->
                <td>${pedido.items.map(item => item.nombre + ' x' + item.cant).join(', ')}</td>
                <td>${formatearMoneda(pedido.total)}</td>
                <td>
                    <!-- Menú para cambiar el estado del pedido. Al elegir uno, se guarda solo.
                         El estado actual aparece ya seleccionado ("selected"). -->
                    <select
                        class="form-select form-select-sm"
                        onchange="actualizarEstadoPedido(${pedido.id}, this.value)"
                    >
                        ${['registrado', 'en proceso', 'listo', 'entregado'].map(estado => `
                            <option ${estado === pedido.estado ? 'selected' : ''}>
                                ${estado}
                            </option>
                        `).join('')}
                    </select>
                </td>
            </tr>
        `).join('') || '<tr><td>Sin pedidos</td></tr>';  // si no hay pedidos, muestra este mensaje
    }

    // ---------- SECCIÓN SOLO PARA EL ADMINISTRADOR ----------
    if (esAdministrador) {
        // La sección de administración viene oculta en el HTML (clase "d-none").
        // Aquí se la quitamos para que se vea.
        const seccionAdmin = buscarElemento('#adm');
        if (seccionAdmin) seccionAdmin.classList.remove('d-none');

        // Traemos todos los usuarios y los mostramos en una tabla.
        const usuarios = await llamarApi('/usuarios');
        const tablaUsuarios = buscarElemento('#tu');
        if (tablaUsuarios) {
            tablaUsuarios.innerHTML = usuarios.map(usuario => `
                <tr>
                    <td>${usuario.nombre}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.rol}</td>
                    <td>
                        <!-- El botón Eliminar aparece solo si el usuario NO es admin
                             (así no se puede borrar a un administrador por accidente) -->
                        ${usuario.rol !== 'admin' ? `
                            <button
                                class="btn btn-sm btn-outline-danger"
                                onclick="eliminarUsuario(${usuario.id})"
                            >
                                Eliminar
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `).join('');
        }
    }
}


// ============================================================
//  PARTE 5: ACCIONES (lo que pasa al presionar los botones)
// ============================================================
//  Todas siguen el mismo patrón:
//    1. Hacen el cambio en la base de datos (con llamarApi)
//    2. Vuelven a dibujar el panel (cargarPanel) para ver el cambio
// ============================================================

// Cambia uno o varios datos de un producto.
// Ejemplos de uso:
//   actualizarProducto(3, {stock: 10})     -> cambia solo el stock
//   actualizarProducto(3, {activo: false}) -> lo deshabilita
// PATCH significa "modificar solo estos datos y dejar el resto igual".
async function actualizarProducto(idProducto, datos) {
    await llamarApi('/productos/' + idProducto, {
        method: 'PATCH',
        body: datos
    });
    cargarPanel();
}

// Elimina un producto, pero antes pregunta "¿Eliminar producto?".
// confirm() muestra una ventanita con Aceptar y Cancelar.
async function eliminarProducto(idProducto) {
    if (confirm('¿Eliminar producto?')) {
        await llamarApi('/productos/' + idProducto, {
            method: 'DELETE'
        });
        cargarPanel();
    }
}

// Elimina un usuario, también pidiendo confirmación antes.
async function eliminarUsuario(idUsuario) {
    if (confirm('¿Eliminar usuario?')) {
        await llamarApi('/usuarios/' + idUsuario, {
            method: 'DELETE'
        });
        cargarPanel();
    }
}

// Cambia el estado de un pedido (registrado, en proceso, listo, entregado).
// Aquí no se llama cargarPanel() porque el menú ya muestra el estado elegido;
// solo se muestra un aviso verde de confirmación.
async function actualizarEstadoPedido(idPedido, nuevoEstado) {
    await llamarApi('/pedidos/' + idPedido, {
        method: 'PATCH',
        body: { estado: nuevoEstado }
    });
    mostrarAviso('Estado actualizado');
}


// ============================================================
//  PARTE 6: FORMULARIO PARA CREAR / EDITAR PRODUCTOS
// ============================================================

// Abre la ventana emergente (modal) del formulario.
// - Si recibe un producto: es para EDITAR, y llena el formulario con sus datos.
// - Si recibe null: es para CREAR uno nuevo, y deja el formulario vacío.
function abrirFormularioProducto(producto) {
    // Guardamos cuál producto se está editando (o null si es uno nuevo).
    productoEnEdicion = producto;

    // Creamos la ventana emergente solo la primera vez que se necesita.
    if (!modalProducto) {
        modalProducto = new bootstrap.Modal(buscarElemento('#mf'));
    }

    const formulario = buscarElemento('#f');
    if (formulario) {
        // Primero limpiamos el formulario (por si tenía datos de antes).
        formulario.reset();

        // Si estamos editando, llenamos cada campo con el dato del producto.
        // "for (const campo in producto)" recorre cada dato: nombre, precio, stock...
        // Solo se llena si en el formulario existe un campo con ese mismo nombre.
        if (producto) {
            for (const campo in producto) {
                if (formulario[campo]) {
                    formulario[campo].value = producto[campo];
                }
            }
        }
    }

    // Mostramos la ventana.
    modalProducto.show();
}

// Botón "Nuevo producto": abre el formulario vacío (null = producto nuevo).
const botonNuevo = buscarElemento('#nuevo');
if (botonNuevo) {
    botonNuevo.onclick = () => abrirFormularioProducto(null);
}

// Guarda el producto cuando se envía el formulario (al presionar "Guardar").
const formularioProducto = buscarElemento('#f');
if (formularioProducto) {
    formularioProducto.onsubmit = async function (evento) {
        // Evita que la página se recargue sola al enviar el formulario.
        evento.preventDefault();

        // Reunimos todo lo que se escribió en el formulario en un solo objeto.
        const datosFormulario = Object.fromEntries(new FormData(evento.target));

        // Los formularios entregan todo como texto; el "+" lo convierte en número.
        datosFormulario.precio = +datosFormulario.precio;
        datosFormulario.stock = +datosFormulario.stock;

        if (productoEnEdicion) {
            // Estamos EDITANDO: modificamos el producto que ya existe.
            await llamarApi('/productos/' + productoEnEdicion.id, {
                method: 'PATCH',
                body: datosFormulario
            });
        } else {
            // Estamos CREANDO: agregamos un producto nuevo.
            // Se le asigna la floristería de quien está conectado (o la 1 si es admin)
            // y se deja activo desde el inicio.
            await llamarApi('/productos', {
                method: 'POST',
                body: {
                    ...datosFormulario,   // los "..." copian todos los datos del formulario
                    empresaId: sesionActual.empresaId || 1,
                    activo: true
                }
            });
        }

        // Cerramos la ventana y actualizamos el panel para ver el cambio.
        if (modalProducto) modalProducto.hide();
        cargarPanel();
    };
}


// ============================================================
//  ARRANQUE
// ============================================================
//  Se llama a cargarPanel() una vez al final, para que al abrir
//  la página se dibuje todo desde el principio.
// ============================================================
cargarPanel();