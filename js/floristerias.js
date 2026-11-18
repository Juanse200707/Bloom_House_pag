// Cargar información de las floristerías
(async function cargarFloristerias() {
    let listaEmpresas, listaProductos, listaResenas;

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
        return;
    }

    // Mostrar cantidad de floristerías
    const resumen = buscarElemento('#resumen');
    if (resumen) {
        resumen.textContent = `${listaEmpresas.length} floristerías artesanales verificadas en toda Colombia`;
    }

    // Mostrar tarjetas de floristerías
    const lista = buscarElemento('#lista');
    if (lista) {
        lista.innerHTML = listaEmpresas.map(empresa => {
            const productosEmpresa = listaProductos.filter(producto => producto.empresaId === empresa.id);
            const resenasEmpresa = listaResenas.filter(resena =>
                productosEmpresa.some(producto => producto.id === resena.productoId)
            );

            return `
                <div class="col-md-6">
                    <a class="text-decoration-none text-reset" href="index.html?empresa=${empresa.id}">
                        <div class="card h-100 position-relative">
                            <img src="${crearImagenPlaceholder(empresa.nombre)}" class="card-img-top" alt="${empresa.nombre}">
                            ${empresa.verificada ? `
                                <span class="badge bg-light text-dark position-absolute top-0 end-0 m-2">
                                    Verificada
                                </span>
                            ` : ''}
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <h5>${empresa.nombre}</h5>
                                    <small>${textoEstrellas(resenasEmpresa)}</small>
                                </div>
                                <p class="text-muted mb-2">
                                    ${empresa.localidad || ''}, ${empresa.ciudad || ''}
                                </p>
                                <div class="mb-2">
                                    ${(empresa.especialidades || []).map(especialidad => `
                                        <span class="badge text-bg-secondary me-1">
                                            ${especialidad}
                                        </span>
                                    `).join('')}
                                </div>
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
})();
