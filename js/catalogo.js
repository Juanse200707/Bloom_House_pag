// ============================================================
//  ARCHIVO DEL CATÁLOGO - BLOOM HOUSE
// ============================================================
//  ¿Qué hace este archivo? Maneja la página principal
//  (index.html), donde se ven los productos. Se encarga de:
//    1. Traer los productos, floristerías y reseñas
//    2. Mostrar las tarjetas de productos
//    3. Filtrar y ordenar (por categoría, tipo, precio, etc.)
//    4. Marcar productos como favoritos (♥)
//    5. Mostrar el detalle de un producto y publicar reseñas
//
//  IMPORTANTE: este archivo usa funciones del archivo principal
//  (llamarApi, buscarElemento, formatearMoneda, textoEstrellas,
//  leerSesionActual, mostrarAviso, agregarProductoCarrito, y las
//  listas localidades, tiposDeFlores y categoriasDisponibles).
//  Por eso, en el HTML, el archivo principal debe cargarse ANTES.
// ============================================================


// ============================================================
//  PARTE 1: VARIABLES DEL CATÁLOGO
// ============================================================

// Estas listas empiezan vacías y se llenan cuando llegan los datos.
// Se usa "let" porque su valor va a cambiar.
let listaProductos = [];
let listaEmpresas = [];
let listaResenas = [];

// Categoría elegida en las "pastillas" (botones redondos de arriba).
// Vacío ('') significa "todas".
let categoriaSeleccionada = '';

// Lista de ids de productos favoritos, guardada en el navegador.
// Si todavía no hay ninguno, empieza como lista vacía [].
const favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');


// ============================================================
//  PARTE 2: CREAR LAS OPCIONES DE LOS FILTROS
// ============================================================
//  Convierte una lista en las opciones de un menú desplegable.
//  - "titulo" es la primera opción (ej: "Todas las localidades").
//  - Cada elemento de la lista puede ser un texto simple ("Rosas")
//    o un objeto con { valor, texto } (cuando lo que se ve es
//    distinto de lo que se guarda, como el nombre de una empresa y su id).
//  El "??" significa: "usa lo de la izquierda; si no existe, usa lo de la derecha".
// ============================================================
const crearOpciones = (titulo, lista) =>
    `<option value="">${titulo}</option>` +
    lista.map(item => `<option value="${item.valor ?? item}">${item.texto ?? item}</option>`).join('');


// ============================================================
//  PARTE 3: ARRANCAR EL CATÁLOGO
// ============================================================
//  Trae los datos, llena los filtros y dibuja los productos.
// ============================================================
async function iniciarCatalogo() {

    // ---------- TRAER LOS DATOS ----------
    // Pedimos productos activos, empresas y reseñas AL MISMO TIEMPO.
    // try/catch: si algo falla, mostramos un mensaje en vez de dañar la página.
    try {
        [listaProductos, listaEmpresas, listaResenas] = await Promise.all([
            llamarApi('/productos?activo=true'),  // solo productos activos
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
        return;  // detenemos aquí, no tiene sentido seguir sin datos
    }

    // ---------- LLENAR LOS MENÚS DE FILTROS ----------
    // Cada bloque busca su menú en la página y, si existe, lo llena.

    // Filtro de localidad
    const selectLocalidad = buscarElemento('#localidad');
    if (selectLocalidad) {
        selectLocalidad.innerHTML = crearOpciones('Todas las localidades', localidades);
    }

    // Filtro de empresa: se ve el nombre, pero se guarda el id.
    const selectEmpresa = buscarElemento('#empresa');
    if (selectEmpresa) {
        selectEmpresa.innerHTML = crearOpciones(
            'Todas las empresas',
            listaEmpresas.map(empresa => ({ valor: empresa.id, texto: empresa.nombre }))
        );
    }

    // Filtro de tipo de flor
    const selectTipo = buscarElemento('#tipo');
    if (selectTipo) {
        selectTipo.innerHTML = crearOpciones('Todos los tipos', tiposDeFlores);
    }

    // Filtro de disponibilidad: '1' = con stock, '0' = agotado
    const selectDisponibilidad = buscarElemento('#disp');
    if (selectDisponibilidad) {
        selectDisponibilidad.innerHTML = crearOpciones('Disponibilidad', [
            { valor: '1', texto: 'Disponible' },
            { valor: '0', texto: 'Agotado' }
        ]);
    }

    // ---------- EMPRESA ELEGIDA DESDE LA URL ----------
    // Si llegamos desde la página de floristerías con un enlace como
    // "index.html?empresa=2", dejamos esa empresa ya seleccionada en el filtro.
    const empresaEnUrl = new URLSearchParams(location.search).get('empresa');
    if (empresaEnUrl && selectEmpresa) {
        selectEmpresa.value = empresaEnUrl;
    }

    // ---------- PASTILLAS DE CATEGORÍA ----------
    // Al hacer clic en una pastilla, guardamos su categoría y redibujamos.
    // "data-categoria" es un dato escondido en cada botón (ver mostrarProductos).
    const contenedorPills = buscarElemento('#pills');
    if (contenedorPills) {
        contenedorPills.onclick = function (evento) {
            // Solo reaccionamos si el clic fue sobre un botón con "data-categoria".
            if (evento.target.dataset.categoria !== undefined) {
                categoriaSeleccionada = evento.target.dataset.categoria;
                mostrarProductos();
            }
        };
    }

    // ---------- FILTROS EN VIVO ----------
    // "oninput" se activa cada vez que se escribe o cambia algo en los filtros,
    // y vuelve a dibujar los productos al instante.
    const filtros = buscarElemento('#filtros');
    if (filtros) {
        filtros.oninput = mostrarProductos;
    }

    // Dibujamos los productos por primera vez.
    mostrarProductos();

    // Si venimos del botón de la lupa del menú (enlace con "#buscar"),
    // ponemos el cursor listo para escribir en el buscador.
    if (location.hash === '#buscar') {
        const buscador = buscarElemento('#q');
        if (buscador) buscador.focus();
    }
}


// ============================================================
//  PARTE 4: RESEÑAS DE UN PRODUCTO
// ============================================================
// Devuelve solo las reseñas que pertenecen al producto indicado.
const obtenerResenasProducto = idProducto =>
    listaResenas.filter(resena => resena.productoId === idProducto);


// ============================================================
//  PARTE 5: MOSTRAR LOS PRODUCTOS
// ============================================================
//  Dibuja las pastillas y las tarjetas, aplicando los filtros y el
//  orden elegidos. Se vuelve a llamar cada vez que algo cambia.
// ============================================================
function mostrarProductos() {

    // ---------- DIBUJAR LAS PASTILLAS DE CATEGORÍA ----------
    // Creamos una pastilla por cada categoría, más una "Todos".
    // La pastilla elegida se ve azul (primary); las demás, con borde (outline).
    const contenedorPills = buscarElemento('#pills');
    if (contenedorPills) {
        contenedorPills.innerHTML = ['Todos', ...categoriasDisponibles].map(categoria => `
            <button class="btn btn-sm btn-${(categoria === 'Todos' ? '' : categoria) === categoriaSeleccionada ? 'primary' : 'outline-secondary'} rounded-pill" data-categoria="${categoria === 'Todos' ? '' : categoria}">
                ${categoria}
            </button>
        `).join('');
    }

    // ---------- FUNCIONES AYUDANTES ----------
    // Lee el valor de un campo de filtro por su id (o '' si no existe).
    const obtenerValor = id => buscarElemento('#' + id)?.value || '';

    // Texto del buscador en minúsculas, para buscar sin importar mayúsculas.
    const textoBusqueda = obtenerValor('q').toLowerCase();

    // Busca una empresa por su id.
    const buscarEmpresa = idEmpresa => listaEmpresas.find(empresa => empresa.id === idEmpresa);

    // ---------- FILTRAR Y ORDENAR ----------
    // Un producto se muestra solo si cumple TODAS estas condiciones (&&):
    //  1. Su nombre (o el de su floristería) contiene el texto buscado
    //  2. Coincide con la categoría elegida (si hay una)
    //  3. Coincide con la localidad elegida (si hay una)
    //  4. Es de la empresa elegida (si hay una)
    //  5. Es del tipo de flor elegido (si hay uno)
    //  6. Cumple la disponibilidad elegida (con stock / agotado)
    // Cuando un filtro está vacío ("!valor"), esa condición se salta.
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
        // Orden: 'asc' = precio de menor a mayor, 'desc' = de mayor a menor.
        // Si no se eligió ninguno, se ordena por cantidad de reseñas (los más comentados primero).
        const orden = obtenerValor('orden');
        if (orden === 'asc') return a.precio - b.precio;
        if (orden === 'desc') return b.precio - a.precio;
        return obtenerResenasProducto(b.id).length - obtenerResenasProducto(a.id).length;
    });

    // ---------- RESUMEN DE RESULTADOS ----------
    // Ejemplo: "12 productos · 3 floristerías colombianas"
    const resumen = buscarElemento('#resumen');
    if (resumen) {
        resumen.textContent = `${productosFiltrados.length} productos · ${listaEmpresas.length} floristerías colombianas`;
    }

    // ---------- DIBUJAR LAS TARJETAS DE PRODUCTOS ----------
    const lista = buscarElemento('#lista');
    if (lista) {
        lista.innerHTML = productosFiltrados.map(producto => {
            const empresa = buscarEmpresa(producto.empresaId);
            return `
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="card h-100 position-relative">

                        <!-- Imagen del producto. Al hacer clic abre el detalle.
                             Si no hay imagen o falla al cargar, se usa una imagen gris de relleno. -->
                        <div class="ratio ratio-4x3">
                            <img src="${producto.imagen || crearImagenPlaceholder(producto.nombre)}" 
                                 class="card-img-top" 
                                 role="button" 
                                 onclick="mostrarDetalle(${producto.id})" 
                                 alt="${producto.nombre}" 
                                 style="object-fit:cover"
                                 onerror="this.onerror=null; this.src='${crearImagenPlaceholder(producto.nombre)}'">
                        </div>

                        <!-- Etiqueta verde en la esquina (ej: "Nuevo"), solo si el producto tiene una -->
                        ${producto.etiqueta ? `
                            <span class="badge bg-success position-absolute top-0 start-0 m-2">
                                ${producto.etiqueta}
                            </span>
                        ` : ''}

                        <!-- Botón de favorito: ♥ si ya es favorito, ♡ si no -->
                        <button class="btn btn-light btn-sm position-absolute top-0 end-0 m-2" onclick="alternarFavorito(${producto.id})">
                            ${favoritos.includes(producto.id) ? '♥' : '♡'}
                        </button>

                        <!-- Capa semitransparente con el texto "Agotado" si no hay stock -->
                        ${producto.stock ? '' : `
                            <div class="ratio ratio-4x3 position-absolute top-0 start-0 w-100">
                                <div class="bg-light bg-opacity-75 d-flex align-items-center justify-content-center">
                                    Agotado
                                </div>
                            </div>
                        `}

                        <div class="card-body">
                            <!-- Nombre de la floristería y su ciudad -->
                            <small class="text-muted d-block">
                                ${empresa?.nombre || ''} · ${empresa?.ciudad || ''}
                            </small>

                            <!-- Nombre del producto -->
                            <h6>${producto.nombre}</h6>

                            <!-- Calificación promedio en estrellas -->
                            <small class="d-block mb-1">
                                ${textoEstrellas(obtenerResenasProducto(producto.id))}
                            </small>

                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <!-- Precio actual -->
                                    <b>${formatearMoneda(producto.precio)}</b>
                                    <!-- Precio anterior tachado, solo si hay descuento -->
                                    ${producto.precioAnterior ? `
                                        <br>
                                        <small class="text-decoration-line-through text-muted">
                                            ${formatearMoneda(producto.precioAnterior)}
                                        </small>
                                    ` : ''}
                                </div>
                                <!-- Botón del carrito: se desactiva (disabled) si no hay stock -->
                                <button class="btn btn-primary btn-sm rounded-circle" ${producto.stock ? '' : 'disabled'} onclick="agregarAlCarrito(${producto.id})">
                                    🛒
                                </button>
                            </div>

                            <!-- Enlace para escribirle a la floristería por WhatsApp -->
                            <a class="small d-block mt-2" target="_blank" href="https://wa.me/${empresa?.whatsapp || ''}">
                                Contactar por WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('') || '<p>No hay productos con esos filtros.</p>';  // mensaje si no hay resultados
    }
}


// ============================================================
//  PARTE 6: CARRITO Y FAVORITOS
// ============================================================

// Agrega un producto al carrito (botón 🛒 de la tarjeta).
// Busca el producto y el nombre de su floristería, y llama a la función
// del archivo principal que realmente lo agrega.
function agregarAlCarrito(idProducto) {
    const producto = listaProductos.find(item => item.id === idProducto);
    if (!producto) return;
    const empresa = listaEmpresas.find(emp => emp.id === producto.empresaId);
    agregarProductoCarrito(producto, empresa?.nombre || '');
}

// Marca o desmarca un producto como favorito (botón ♡ / ♥).
// - Si no estaba en favoritos, lo agrega.
// - Si ya estaba, lo quita.
// Luego guarda la lista en el navegador y redibuja las tarjetas.
function alternarFavorito(idProducto) {
    const indice = favoritos.indexOf(idProducto);
    if (indice < 0) {
        favoritos.push(idProducto);       // no estaba: agregar
    } else {
        favoritos.splice(indice, 1);      // estaba: quitar
    }
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    mostrarProductos();
}


// ============================================================
//  PARTE 7: DETALLE DEL PRODUCTO Y RESEÑAS
// ============================================================

// Abre una ventana emergente con el detalle del producto
// (al hacer clic en su imagen): descripción, reseñas y,
// si hay un cliente con sesión, el formulario para opinar.
function mostrarDetalle(idProducto) {
    const producto = listaProductos.find(item => item.id === idProducto);
    if (!producto) return;

    const sesion = leerSesionActual();
    const cuerpoModal = buscarElemento('#mb');  // el cuerpo de la ventana emergente
    if (cuerpoModal) {
        cuerpoModal.innerHTML = `
            <h5>${producto.nombre}</h5>

            <!-- Imagen grande, solo si el producto tiene una -->
            ${producto.imagen ? `<img src="${producto.imagen}" class="img-fluid rounded mb-3" alt="${producto.nombre}" style="max-height:280px;object-fit:cover;width:100%">` : ''}

            <p>${producto.descripcion || ''}</p>

            <h6>Reseñas</h6>
            <!-- Lista de reseñas. '★'.repeat(5) escribe ★★★★★ según las estrellas dadas. -->
            ${obtenerResenasProducto(idProducto).map(resena => `
                <p class="small mb-1">
                    <b>${resena.usuario}</b> ${'★'.repeat(resena.estrellas)}
                    <br>
                    ${resena.texto}
                </p>
            `).join('') || '<p class="small">Aún no hay reseñas.</p>'}

            <!-- Solo los CLIENTES con sesión pueden opinar. Los demás ven un mensaje. -->
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

    // Creamos y mostramos la ventana emergente.
    const modal = new bootstrap.Modal(buscarElemento('#md'));
    modal.show();
}

// Guarda la reseña que escribió el cliente (botón "Publicar").
async function publicarResena(idProducto) {
    // Leemos lo escrito. Si está vacío, no hacemos nada.
    const texto = buscarElemento('#textoResena')?.value;
    if (!texto) return;

    // Guardamos la reseña en la base de datos.
    // El "+" convierte las estrellas (texto) en número.
    const nuevaResena = await llamarApi('/resenas', {
        method: 'POST',
        body: {
            productoId: idProducto,
            usuario: leerSesionActual()?.nombre || 'Anónimo',
            estrellas: +buscarElemento('#estrellasResena').value,
            texto: texto
        }
    });

    // La agregamos también a la lista que tenemos en memoria,
    // para que aparezca sin tener que recargar la página.
    listaResenas.push(nuevaResena);

    // Cerramos la ventana emergente.
    const instanciaModal = bootstrap.Modal.getInstance(buscarElemento('#md'));
    if (instanciaModal) instanciaModal.hide();

    // Redibujamos (para actualizar el promedio de estrellas) y avisamos.
    mostrarProductos();
    mostrarAviso('Reseña publicada');
}


// ============================================================
//  ARRANQUE
// ============================================================
//  Se llama a iniciarCatalogo() una vez al final, para que al
//  abrir la página se cargue y dibuje todo desde el principio.
// ============================================================
iniciarCatalogo();