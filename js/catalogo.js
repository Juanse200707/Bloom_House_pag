// Datos del catálogo
let listaProductos = [];
let listaEmpresas = [];
let listaResenas = [];
let categoriaSeleccionada = '';

const favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');

// Crear opciones para los selects de filtros
const crearOpciones = (titulo, lista) =>
    `<option value="">${titulo}</option>` +
    lista.map(item => `<option value="${item.valor ?? item}">${item.texto ?? item}</option>`).join('');

// Cargar productos, empresas y reseñas
async function iniciarCatalogo() {
    try {
        [listaProductos, listaEmpresas, listaResenas] = await Promise.all([
            llamarApi('/productos?activo=true'),
            llamarApi('/empresas'),
            llamarApi('/resenas')
        ]);
    } catch (error) {
        const lista = buscarElemento('#lista');
        if (lista) {
            lista.innerHTML = `
                <div class="alert alert-danger">
                    No se pudo conectar con el servidor simulado (JSON Server).
                    Ejecuta <code>npm run api</code> y recarga la página.
                </div>
            `;
        }
        return;
    }

    // Cargar opciones de los filtros
    const selectLocalidad = buscarElemento('#localidad');
    if (selectLocalidad) {
        selectLocalidad.innerHTML = crearOpciones('Todas las localidades', localidades);
    }

    const selectEmpresa = buscarElemento('#empresa');
    if (selectEmpresa) {
        selectEmpresa.innerHTML = crearOpciones(
            'Todas las empresas',
            listaEmpresas.map(empresa => ({ valor: empresa.id, texto: empresa.nombre }))
        );
    }

    const selectTipo = buscarElemento('#tipo');
    if (selectTipo) {
        selectTipo.innerHTML = crearOpciones('Todos los tipos', tiposDeFlores);
    }

    const selectDisponibilidad = buscarElemento('#disp');
    if (selectDisponibilidad) {
        selectDisponibilidad.innerHTML = crearOpciones('Disponibilidad', [
            { valor: '1', texto: 'Disponible' },
            { valor: '0', texto: 'Agotado' }
        ]);
    }

    // Seleccionar empresa desde la URL si viene como parámetro
    const empresaEnUrl = new URLSearchParams(location.search).get('empresa');
    if (empresaEnUrl && selectEmpresa) {
        selectEmpresa.value = empresaEnUrl;
    }

    // Filtrar por categoría al hacer clic en las pastillas
    const contenedorPills = buscarElemento('#pills');
    if (contenedorPills) {
        contenedorPills.onclick = function (evento) {
            if (evento.target.dataset.categoria !== undefined) {
                categoriaSeleccionada = evento.target.dataset.categoria;
                mostrarProductos();
            }
        };
    }

    // Actualizar resultados al cambiar los filtros
    const filtros = buscarElemento('#filtros');
    if (filtros) {
        filtros.oninput = mostrarProductos;
    }

    mostrarProductos();

    // Enfocar la búsqueda si se accede desde el enlace correspondiente
    if (location.hash === '#buscar') {
        const buscador = buscarElemento('#q');
        if (buscador) buscador.focus();
    }
}

// Obtener reseñas de un producto
const obtenerResenasProducto = idProducto =>
    listaResenas.filter(resena => resena.productoId === idProducto);

// Mostrar productos del catálogo
function mostrarProductos() {
    const contenedorPills = buscarElemento('#pills');
    if (contenedorPills) {
        contenedorPills.innerHTML = ['Todos', ...categoriasDisponibles].map(categoria => `
            <button class="btn btn-sm btn-${(categoria === 'Todos' ? '' : categoria) === categoriaSeleccionada ? 'primary' : 'outline-secondary'} rounded-pill" data-categoria="${categoria === 'Todos' ? '' : categoria}">
                ${categoria}
            </button>
        `).join('');
    }

    const obtenerValor = id => buscarElemento('#' + id)?.value || '';
    const textoBusqueda = obtenerValor('q').toLowerCase();
    const buscarEmpresa = idEmpresa => listaEmpresas.find(empresa => empresa.id === idEmpresa);

    // Aplicar filtros y ordenar productos
    const productosFiltrados = listaProductos.filter(producto => {
        const empresa = buscarEmpresa(producto.empresaId);
        const nombreCompleto = (producto.nombre + (empresa?.nombre || '')).toLowerCase();
        return nombreCompleto.includes(textoBusqueda) &&
            (!categoriaSeleccionada || producto.categoria === categoriaSeleccionada) &&
            (!obtenerValor('localidad') || producto.localidad === obtenerValor('localidad')) &&
            (!obtenerValor('empresa') || producto.empresaId == obtenerValor('empresa')) &&
            (!obtenerValor('tipo') || producto.tipo === obtenerValor('tipo')) &&
            (!obtenerValor('disp') || (producto.stock > 0) == (obtenerValor('disp') === '1'));
    }).sort((a, b) => {
        const orden = obtenerValor('orden');
        if (orden === 'asc') return a.precio - b.precio;
        if (orden === 'desc') return b.precio - a.precio;
        return obtenerResenasProducto(b.id).length - obtenerResenasProducto(a.id).length;
    });

    // Mostrar cantidad de resultados
    const resumen = buscarElemento('#resumen');
    if (resumen) {
        resumen.textContent = `${productosFiltrados.length} productos · ${listaEmpresas.length} floristerías colombianas`;
    }

    // Mostrar tarjetas de productos
    const lista = buscarElemento('#lista');
    if (lista) {
        lista.innerHTML = productosFiltrados.map(producto => {
            const empresa = buscarEmpresa(producto.empresaId);
            return `
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="card h-100 position-relative">
                        <div class="ratio ratio-4x3">
                            <img src="${producto.imagen || crearImagenPlaceholder(producto.nombre)}" 
                                 class="card-img-top" 
                                 role="button" 
                                 onclick="mostrarDetalle(${producto.id})" 
                                 alt="${producto.nombre}" 
                                 style="object-fit:cover"
                                 onerror="this.onerror=null; this.src='${crearImagenPlaceholder(producto.nombre)}'">
                        </div>
                        ${producto.etiqueta ? `
                            <span class="badge bg-success position-absolute top-0 start-0 m-2">
                                ${producto.etiqueta}
                            </span>
                        ` : ''}
                        <button class="btn btn-light btn-sm position-absolute top-0 end-0 m-2" onclick="alternarFavorito(${producto.id})">
                            ${favoritos.includes(producto.id) ? '♥' : '♡'}
                        </button>
                        ${producto.stock ? '' : `
                            <div class="ratio ratio-4x3 position-absolute top-0 start-0 w-100">
                                <div class="bg-light bg-opacity-75 d-flex align-items-center justify-content-center">
                                    Agotado
                                </div>
                            </div>
                        `}
                        <div class="card-body">
                            <small class="text-muted d-block">
                                ${empresa?.nombre || ''} · ${empresa?.ciudad || ''}
                            </small>
                            <h6>${producto.nombre}</h6>
                            <small class="d-block mb-1">
                                ${textoEstrellas(obtenerResenasProducto(producto.id))}
                            </small>
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <b>${formatearMoneda(producto.precio)}</b>
                                    ${producto.precioAnterior ? `
                                        <br>
                                        <small class="text-decoration-line-through text-muted">
                                            ${formatearMoneda(producto.precioAnterior)}
                                        </small>
                                    ` : ''}
                                </div>
                                <button class="btn btn-primary btn-sm rounded-circle" ${producto.stock ? '' : 'disabled'} onclick="agregarAlCarrito(${producto.id})">
                                    🛒
                                </button>
                            </div>
                            <a class="small d-block mt-2" target="_blank" href="https://wa.me/${empresa?.whatsapp || ''}">
                                Contactar por WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('') || '<p>No hay productos con esos filtros.</p>';
    }
}

// Agregar producto al carrito
function agregarAlCarrito(idProducto) {
    const producto = listaProductos.find(item => item.id === idProducto);
    if (!producto) return;
    const empresa = listaEmpresas.find(emp => emp.id === producto.empresaId);
    agregarProductoCarrito(producto, empresa?.nombre || '');
}

// Agregar o quitar productos de favoritos
function alternarFavorito(idProducto) {
    const indice = favoritos.indexOf(idProducto);
    if (indice < 0) {
        favoritos.push(idProducto);
    } else {
        favoritos.splice(indice, 1);
    }
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    mostrarProductos();
}

// Mostrar detalles del producto
function mostrarDetalle(idProducto) {
    const producto = listaProductos.find(item => item.id === idProducto);
    if (!producto) return;

    const sesion = leerSesionActual();
    const cuerpoModal = buscarElemento('#mb');
    if (cuerpoModal) {
        cuerpoModal.innerHTML = `
            <h5>${producto.nombre}</h5>
            ${producto.imagen ? `<img src="${producto.imagen}" class="img-fluid rounded mb-3" alt="${producto.nombre}" style="max-height:280px;object-fit:cover;width:100%">` : ''}
            <p>${producto.descripcion || ''}</p>
            <h6>Reseñas</h6>
            ${obtenerResenasProducto(idProducto).map(resena => `
                <p class="small mb-1">
                    <b>${resena.usuario}</b> ${'★'.repeat(resena.estrellas)}
                    <br>
                    ${resena.texto}
                </p>
            `).join('') || '<p class="small">Aún no hay reseñas.</p>'}
            ${sesion?.rol === 'cliente' ? `
                <hr>
                <select id="estrellasResena" class="form-select mb-1">
                    ${[5, 4, 3, 2, 1].map(numero => `<option value="${numero}">${numero} ★</option>`).join('')}
                </select>
                <textarea id="textoResena" class="form-control mb-1" placeholder="Tu opinión"></textarea>
                <button class="btn btn-sm btn-primary" onclick="publicarResena(${idProducto})">
                    Publicar
                </button>
            ` : `
                <p class="small text-muted">
                    Inicia sesión como cliente para opinar.
                </p>
            `}
        `;
    }

    const modal = new bootstrap.Modal(buscarElemento('#md'));
    modal.show();
}

// Publicar reseña
async function publicarResena(idProducto) {
    const texto = buscarElemento('#textoResena')?.value;
    if (!texto) return;

    const nuevaResena = await llamarApi('/resenas', {
        method: 'POST',
        body: {
            productoId: idProducto,
            usuario: leerSesionActual()?.nombre || 'Anónimo',
            estrellas: +buscarElemento('#estrellasResena').value,
            texto: texto
        }
    });

    listaResenas.push(nuevaResena);

    const instanciaModal = bootstrap.Modal.getInstance(buscarElemento('#md'));
    if (instanciaModal) instanciaModal.hide();

    mostrarProductos();
    mostrarAviso('Reseña publicada');
}

// Iniciar el catálogo
iniciarCatalogo();
