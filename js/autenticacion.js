// Determinar el tipo de cuenta según la URL
const parametroTipo = new URLSearchParams(location.search).get('tipo');
const tipoCuenta = ['empresa', 'admin'].includes(parametroTipo) ? parametroTipo : 'cliente';

// Actualizar el título de la página
const tituloElemento = buscarElemento('#titulo');
if (tituloElemento) {
    tituloElemento.textContent = {
        cliente: 'Acceso de cliente',
        empresa: 'Acceso de floristería aliada',
        admin: 'Acceso de administrador'
    }[tipoCuenta];
}

// Cargar las localidades en el formulario de registro
const selectLocalidad = buscarElemento('[name=localidad]');
if (selectLocalidad) {
    selectLocalidad.innerHTML = localidades.map(localidad => `<option>${localidad}</option>`).join('');
}

// Mostrar u ocultar campos exclusivos para empresas
document.querySelectorAll('.solo-empresa').forEach(elemento => {
    elemento.classList.toggle('d-none', tipoCuenta !== 'empresa');
});

// Ocultar el botón de registro para administradores
if (tipoCuenta === 'admin') {
    const botonRegistro = buscarElemento('#breg');
    if (botonRegistro) botonRegistro.classList.add('d-none');
}

// Iniciar sesión
const formularioLogin = buscarElemento('#login');
if (formularioLogin) {
    formularioLogin.onsubmit = async function (evento) {
        evento.preventDefault();

        const correo = buscarElemento('#le').value;
        const contrasena = buscarElemento('#lp').value;
        const hashContrasena = await hashearContrasena(contrasena);

        const usuariosEncontrados = await llamarApi(
            `/usuarios?email=${encodeURIComponent(correo)}&password=${hashContrasena}`
        );

        if (!usuariosEncontrados.length || usuariosEncontrados[0].rol !== tipoCuenta) {
            mostrarAviso('Credenciales inválidas para este tipo de cuenta', 'danger');
            return;
        }

        localStorage.setItem('jwt', generarTokenAcceso(usuariosEncontrados[0]));
        location.href = tipoCuenta === 'cliente' ? 'index.html' : 'panel.html';
    };
}

// Registrar una nueva cuenta
const formularioRegistro = buscarElemento('#registro');
if (formularioRegistro) {
    formularioRegistro.onsubmit = async function (evento) {
        evento.preventDefault();

        const formulario = evento.target;

        // Verificar si el correo ya está registrado
        const existentes = await llamarApi('/usuarios?email=' + encodeURIComponent(formulario.email.value));
        if (existentes.length) {
            mostrarAviso('Ese correo ya está registrado', 'danger');
            return;
        }

        // Validar longitud de la contraseña
        if (formulario.password.value.length < 8) {
            mostrarAviso('La contraseña debe tener mínimo 8 caracteres', 'danger');
            return;
        }

        // Verificar aceptación de términos
        if (!formulario.terminos.checked) {
            mostrarAviso('Debes aceptar los términos y condiciones', 'warning');
            return;
        }

        // Crear el objeto de usuario
        const nuevoUsuario = {
            nombre: formulario.nombre.value,
            email: formulario.email.value,
            password: await hashearContrasena(formulario.password.value),
            rol: tipoCuenta
        };

        // Si es una empresa, crear también el registro de empresa
        if (tipoCuenta === 'empresa') {
            const empresaCreada = await llamarApi('/empresas', {
                method: 'POST',
                body: {
                    nombre: formulario.nombre.value,
                    localidad: formulario.localidad.value,
                    ciudad: formulario.ciudad.value,
                    whatsapp: formulario.whatsapp.value,
                    especialidades: [],
                    desde: new Date().getFullYear(),
                    verificada: false
                }
            });
            nuevoUsuario.empresaId = empresaCreada.id;
        }

        // Guardar el usuario
        await llamarApi('/usuarios', {
            method: 'POST',
            body: nuevoUsuario
        });

        mostrarAviso('Registro exitoso. Ahora puedes iniciar sesión.');
        formulario.reset();
    };
}
