// Validar sesión
const sesionActual = leerSesionActual();

if (!sesionActual || sesionActual.rol === 'cliente') {
    location.href = 'autenticacion.html';
    throw new Error('Acceso no autorizado');
}

// Cargar opciones de los formularios
["categoria", "tipo", "localidad"].forEach(nombreCampo => {
    const select = buscarElemento("[name=" + nombreCampo + "]");
    if (select) {
        const opciones = nombreCampo === "categoria" ? categoriasDisponibles :
                         nombreCampo === "tipo" ? tiposDeFlores :
                         localidades;
        select.innerHTML = opciones.map(opcion => `<option>${opcion}</option>`).join("");
    }
});

// Variables del panel
const esAdministrador = sesionActual.rol === 'admin';
let productoEnEdicion = null;
let modalProducto;

// Cargar información del panel
async function cargarPanel() {
    const titulo = buscarElemento('#titulo');
    if (titulo) {
        titulo.textContent = esAdministrador
            ? 'Panel de administración'
            : 'Panel de mi floristería';
    }

    const filtroEmpresa = esAdministrador ? '' : '?empresaId=' + sesionActual.empresaId;

    const [productos, pedidos, empresas] = await Promise.all([
        llamarApi('/productos' + filtroEmpresa),
        llamarApi('/pedidos'),
        llamarApi('/empresas')
    ]);

    // Filtrar pedidos según el rol
    const misPedidos = pedidos.filter(pedido =>
        esAdministrador || pedido.items.some(item => item.empresaId === sesionActual.empresaId)
    );

    // Calcular ventas
    const totalVentas = misPedidos.reduce((suma, pedido) =>
        suma + pedido.items
            .filter(item => esAdministrador || item.empresaId === sesionActual.empresaId)
            .reduce((subtotal, item) => subtotal + item.cant * item.precio, 0),
        0
    );

    // Generar tarjetas del informe
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

    const informe = buscarElemento('#informe');
    if (informe) {
        informe.innerHTML =
            crearTarjeta('Ventas', formatearMoneda(totalVentas)) +
            crearTarjeta('Pedidos', misPedidos.length) +
            crearTarjeta('Unidades en stock', productos.reduce((suma, producto) => suma + producto.stock, 0)) +
            crearTarjeta(esAdministrador ? 'Empresas' : 'Productos', esAdministrador ? empresas.length : productos.length);
    }

    // Mostrar productos
    const tablaProductos = buscarElemento('#tp');
    if (tablaProductos) {
        tablaProductos.innerHTML = productos.map(producto => `
            <tr>
                <td>${producto.nombre}</td>
                <td class="small">${producto.categoria} · ${producto.tipo} · ${producto.localidad}</td>
                <td>${formatearMoneda(producto.precio)}</td>
                <td>
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
                    <span class="badge bg-${producto.activo ? 'success' : 'secondary'}">
                        ${producto.activo ? 'Activo' : 'Deshabilitado'}
                    </span>
                </td>
                <td class="text-nowrap">
                    <button
                        class="btn btn-sm btn-outline-primary"
                        onclick='abrirFormularioProducto(${JSON.stringify(producto)})'
                    >
                        Editar
                    </button>
                    <button
                        class="btn btn-sm btn-outline-secondary"
                        onclick="actualizarProducto(${producto.id}, {activo: ${!producto.activo}})"
                    >
                        ${producto.activo ? 'Deshabilitar' : 'Habilitar'}
                    </button>
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

    // Mostrar pedidos
    const tablaPedidos = buscarElemento('#tped');
    if (tablaPedidos) {
        tablaPedidos.innerHTML = misPedidos.map(pedido => `
            <tr>
                <td>#${pedido.id}</td>
                <td>${pedido.items.map(item => item.nombre + ' x' + item.cant).join(', ')}</td>
                <td>${formatearMoneda(pedido.total)}</td>
                <td>
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
        `).join('') || '<tr><td>Sin pedidos</td></tr>';
    }

    // Mostrar opciones de administración
    if (esAdministrador) {
        const seccionAdmin = buscarElemento('#adm');
        if (seccionAdmin) seccionAdmin.classList.remove('d-none');

        const usuarios = await llamarApi('/usuarios');
        const tablaUsuarios = buscarElemento('#tu');
        if (tablaUsuarios) {
            tablaUsuarios.innerHTML = usuarios.map(usuario => `
                <tr>
                    <td>${usuario.nombre}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.rol}</td>
                    <td>
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

// Actualizar producto
async function actualizarProducto(idProducto, datos) {
    await llamarApi('/productos/' + idProducto, {
        method: 'PATCH',
        body: datos
    });
    cargarPanel();
}

// Eliminar producto
async function eliminarProducto(idProducto) {
    if (confirm('¿Eliminar producto?')) {
        await llamarApi('/productos/' + idProducto, {
            method: 'DELETE'
        });
        cargarPanel();
    }
}

// Eliminar usuario
async function eliminarUsuario(idUsuario) {
    if (confirm('¿Eliminar usuario?')) {
        await llamarApi('/usuarios/' + idUsuario, {
            method: 'DELETE'
        });
        cargarPanel();
    }
}

// Actualizar estado del pedido
async function actualizarEstadoPedido(idPedido, nuevoEstado) {
    await llamarApi('/pedidos/' + idPedido, {
        method: 'PATCH',
        body: { estado: nuevoEstado }
    });
    mostrarAviso('Estado actualizado');
}

// Abrir formulario de producto
function abrirFormularioProducto(producto) {
    productoEnEdicion = producto;
    if (!modalProducto) {
        modalProducto = new bootstrap.Modal(buscarElemento('#mf'));
    }

    const formulario = buscarElemento('#f');
    if (formulario) {
        formulario.reset();
        if (producto) {
            for (const campo in producto) {
                if (formulario[campo]) {
                    formulario[campo].value = producto[campo];
                }
            }
        }
    }

    modalProducto.show();
}

// Botón para crear un producto
const botonNuevo = buscarElemento('#nuevo');
if (botonNuevo) {
    botonNuevo.onclick = () => abrirFormularioProducto(null);
}

// Guardar producto
const formularioProducto = buscarElemento('#f');
if (formularioProducto) {
    formularioProducto.onsubmit = async function (evento) {
        evento.preventDefault();

        const datosFormulario = Object.fromEntries(new FormData(evento.target));
        datosFormulario.precio = +datosFormulario.precio;
        datosFormulario.stock = +datosFormulario.stock;

        if (productoEnEdicion) {
            await llamarApi('/productos/' + productoEnEdicion.id, {
                method: 'PATCH',
                body: datosFormulario
            });
        } else {
            await llamarApi('/productos', {
                method: 'POST',
                body: {
                    ...datosFormulario,
                    empresaId: sesionActual.empresaId || 1,
                    activo: true
                }
            });
        }

        if (modalProducto) modalProducto.hide();
        cargarPanel();
    };
}

// Iniciar panel
cargarPanel();
