// ============================================================
//  ARCHIVO DE FLORISTERÍAS - BLOOM HOUSE
// ============================================================
//  ¿Qué hace este archivo? Maneja la página "floristerias.html",
//  donde se ven todas las floristerías aliadas en forma de tarjetas.
//  Cada tarjeta muestra:
//    - El nombre y si está verificada
//    - Su calificación promedio en estrellas
//    - Su localidad y ciudad
//    - Sus especialidades
//    - Cuántos productos tiene
//  Al hacer clic en una tarjeta, se abre el catálogo filtrado
//  con los productos de esa floristería.
//
//  IMPORTANTE: este archivo usa funciones del archivo principal
//  (llamarApi, buscarElemento, crearImagenPlaceholder y textoEstrellas).
//  Por eso, en el HTML, el archivo principal debe cargarse ANTES.
// ============================================================


// ============================================================
//  FUNCIÓN QUE SE EJECUTA SOLA
// ============================================================
//  Fíjate en la forma: (async function nombre() { ... })();
//  Los paréntesis del final () hacen que la función se ejecute
//  automáticamente apenas se carga el archivo. Así no hay que
//  llamarla desde ningún otro lado.
// ============================================================
(async function cargarFloristerias() {

    // Declaramos las tres listas aquí, vacías, para llenarlas después.
    let listaEmpresas, listaProductos, listaResenas;

    // ---------- TRAER LOS DATOS ----------
    // Pedimos empresas, productos y reseñas AL MISMO TIEMPO (así es más rápido).
    // try/catch: si algo falla, mostramos un mensaje en vez de dañar la página.
    try {
        [listaEmpresas, listaProductos, listaResenas] = await Promise.all([
            llamarApi('/empresas'),
            llamarApi('/productos'),
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

    // ---------- RESUMEN DE ARRIBA ----------
    // Escribe una frase con la cantidad de floristerías.
    // Ejemplo: "3 floristerías artesanales verificadas en toda Colombia"
    const resumen = buscarElemento('#resumen');
    if (resumen) {
        resumen.textContent = `${listaEmpresas.length} floristerías artesanales verificadas en toda Colombia`;
    }

    // ---------- DIBUJAR LAS TARJETAS DE FLORISTERÍAS ----------
    const lista = buscarElemento('#lista');
    if (lista) {
        // .map() crea una tarjeta por cada floristería; .join('') las une todas.
        lista.innerHTML = listaEmpresas.map(empresa => {

            // Productos que pertenecen a esta floristería.
            const productosEmpresa = listaProductos.filter(producto => producto.empresaId === empresa.id);

            // Reseñas de esta floristería: las reseñas no tienen empresa directa,
            // solo tienen el producto. Entonces nos quedamos con las reseñas
            // cuyo producto sea de esta floristería (.some = "alguno cumple").
            const resenasEmpresa = listaResenas.filter(resena =>
                productosEmpresa.some(producto => producto.id === resena.productoId)
            );

            return `
                <div class="col-md-6">
                    <!-- Toda la tarjeta es un enlace: lleva al catálogo con esta
                         floristería ya seleccionada en el filtro (?empresa=id) -->
                    <a class="text-decoration-none text-reset" href="index.html?empresa=${empresa.id}">
                        <div class="card h-100 position-relative">

                             <!-- Imagen de la floristería (si falla, se usa el relleno gris) -->
                             <img src="${empresa.imagen || crearImagenPlaceholder(empresa.nombre)}" class="card-img-top" alt="${empresa.nombre}" onerror="this.onerror=null; this.src='${crearImagenPlaceholder(empresa.nombre)}'">

                            <!-- Etiqueta "Verificada", solo si la empresa está verificada -->
                            ${empresa.verificada ? `
                                <span class="badge bg-light text-dark position-absolute top-0 end-0 m-2">
                                    Verificada
                                </span>
                            ` : ''}

                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <!-- Nombre y calificación promedio en estrellas -->
                                    <h5>${empresa.nombre}</h5>
                                    <small>${textoEstrellas(resenasEmpresa)}</small>
                                </div>

                                <!-- Ubicación. El "|| ''" evita que salga "undefined" si falta el dato. -->
                                <p class="text-muted mb-2">
                                    ${empresa.localidad || ''}, ${empresa.ciudad || ''}
                                </p>

                                <!-- Especialidades: una etiquetita gris por cada una.
                                     Si no tiene ninguna, no se muestra nada. -->
                                <div class="mb-2">
                                    ${(empresa.especialidades || []).map(especialidad => `
                                        <span class="badge text-bg-secondary me-1">
                                            ${especialidad}
                                        </span>
                                    `).join('')}
                                </div>

                                <!-- Cantidad de productos y año desde el que está en la plataforma -->
                                <small>
                                    ${productosEmpresa.length} productos · Desde ${empresa.desde || ''}
                                </small>
                            </div>
                        </div>
                    </a>
                </div>
            `;
        }).join('');
    }
})();  // <-- estos paréntesis finales hacen que la función se ejecute sola