// ============================================================
//  ARCHIVO DE AUTENTICACIÓN - BLOOM HOUSE
// ============================================================
//  ¿Qué hace este archivo? Maneja la página "autenticacion.html",
//  donde las personas inician sesión o crean una cuenta.
//
//  La misma página sirve para 3 tipos de cuenta:
//    - cliente   -> autenticacion.html?tipo=cliente
//    - empresa   -> autenticacion.html?tipo=empresa  (floristería aliada)
//    - admin     -> autenticacion.html?tipo=admin
//
//  El tipo se lee desde la dirección (URL) de la página. Por eso,
//  cuando alguien elige su tipo de cuenta en la ventana "Mi Cuenta",
//  llega aquí con el tipo ya puesto en el enlace.
//
//  IMPORTANTE: este archivo usa funciones del archivo principal
//  (buscarElemento, llamarApi, hashearContrasena, generarTokenAcceso,
//  mostrarAviso y la lista localidades). Por eso, en el HTML, el
//  archivo principal debe cargarse ANTES que este.
// ============================================================


// ============================================================
//  PARTE 1: SABER QUÉ TIPO DE CUENTA ES
// ============================================================

// Leemos el valor de "tipo" que viene en la URL.
// Ejemplo: en "autenticacion.html?tipo=empresa" el resultado es "empresa".
const parametroTipo = new URLSearchParams(location.search).get('tipo');

// Solo aceptamos 'empresa' o 'admin'. Si viene cualquier otra cosa
// (o nada), asumimos que es un 'cliente'.
const tipoCuenta = ['empresa', 'admin'].includes(parametroTipo) ? parametroTipo : 'cliente';


// ============================================================
//  PARTE 2: AJUSTAR LA PÁGINA SEGÚN EL TIPO DE CUENTA
// ============================================================

// Cambiamos el título de la página según el tipo de cuenta.
// Es como un diccionario: buscamos el texto que corresponde a tipoCuenta.
const tituloElemento = buscarElemento('#titulo');
if (tituloElemento) {
    tituloElemento.textContent = {
        cliente: 'Acceso de cliente',
        empresa: 'Acceso de floristería aliada',
        admin: 'Acceso de administrador'
    }[tipoCuenta];
}

// Llenamos el menú desplegable de localidades del formulario de registro
// con la lista que está en el archivo principal.
const selectLocalidad = buscarElemento('[name=localidad]');
if (selectLocalidad) {
    selectLocalidad.innerHTML = localidades.map(localidad => `<option>${localidad}</option>`).join('');
}

// Hay campos del registro que solo les sirven a las floristerías
// (como ciudad y WhatsApp). Tienen la clase "solo-empresa".
// - Si la cuenta es de empresa: se muestran.
// - Si no: se ocultan (la clase "d-none" significa "no mostrar").
// toggle(clase, condición) agrega la clase si la condición es verdadera
// y la quita si es falsa.
document.querySelectorAll('.solo-empresa').forEach(elemento => {
    elemento.classList.toggle('d-none', tipoCuenta !== 'empresa');
});

// Los administradores NO pueden crear cuenta desde aquí (solo iniciar sesión),
// así que ocultamos el botón de registro.
if (tipoCuenta === 'admin') {
    const botonRegistro = buscarElemento('#breg');
    if (botonRegistro) botonRegistro.classList.add('d-none');
}


// ============================================================
//  PARTE 3: INICIAR SESIÓN
// ============================================================
//  Cuando la persona presiona el botón de entrar, se ejecuta
//  esta función. Pasos:
//    1. Toma el correo y la contraseña escritos
//    2. "Revuelve" la contraseña (hash) para compararla
//    3. Busca un usuario que coincida
//    4. Si coincide, guarda la sesión y cambia de página
// ============================================================
const formularioLogin = buscarElemento('#login');
if (formularioLogin) {
    formularioLogin.onsubmit = async function (evento) {
        // Evita que la página se recargue sola al enviar el formulario.
        evento.preventDefault();

        // Leemos lo que la persona escribió en los campos.
        const correo = buscarElemento('#le').value;       // campo del correo
        const contrasena = buscarElemento('#lp').value;   // campo de la contraseña

        // Convertimos la contraseña en su versión "revuelta" (hash SHA-256),
        // porque en la base de datos nunca se guarda la contraseña normal.
        const hashContrasena = await hashearContrasena(contrasena);

        // Buscamos usuarios que tengan ese correo Y esa contraseña revuelta.
        // encodeURIComponent protege los caracteres especiales del correo (como @ o +).
        const usuariosEncontrados = await llamarApi(
            `/usuarios?email=${encodeURIComponent(correo)}&password=${hashContrasena}`
        );

        // Falla si:
        //  - no se encontró ningún usuario (correo o contraseña incorrectos), o
        //  - el usuario existe pero es de otro tipo (por ejemplo, un cliente
        //    intentando entrar por la puerta de administrador).
        if (!usuariosEncontrados.length || usuariosEncontrados[0].rol !== tipoCuenta) {
            mostrarAviso('Credenciales inválidas para este tipo de cuenta', 'danger');
            return;  // detenemos aquí
        }

        // Todo bien: creamos el token (la "manilla de entrada") y lo guardamos.
        localStorage.setItem('jwt', generarTokenAcceso(usuariosEncontrados[0]));

        // Mandamos a la persona a su página:
        // - clientes -> tienda (index.html)
        // - empresas y admin -> panel de gestión (panel.html)
        location.href = tipoCuenta === 'cliente' ? 'index.html' : 'panel.html';
    };
}


// ============================================================
//  PARTE 4: REGISTRAR UNA CUENTA NUEVA
// ============================================================
//  Cuando la persona presiona "Registrarse", se ejecuta esta función.
//  Antes de crear la cuenta, hace 3 revisiones:
//    1. Que el correo no esté ya registrado
//    2. Que la contraseña tenga mínimo 8 caracteres
//    3. Que haya aceptado los términos y condiciones
// ============================================================
const formularioRegistro = buscarElemento('#registro');
if (formularioRegistro) {
    formularioRegistro.onsubmit = async function (evento) {
        // Evita que la página se recargue sola.
        evento.preventDefault();

        // "formulario" es el formulario completo; desde él podemos leer cada campo
        // por su nombre (por ejemplo formulario.email.value).
        const formulario = evento.target;

        // ---------- REVISIÓN 1: ¿el correo ya existe? ----------
        const existentes = await llamarApi('/usuarios?email=' + encodeURIComponent(formulario.email.value));
        if (existentes.length) {
            mostrarAviso('Ese correo ya está registrado', 'danger');
            return;
        }

        // ---------- REVISIÓN 2: contraseña de al menos 8 caracteres ----------
        if (formulario.password.value.length < 8) {
            mostrarAviso('La contraseña debe tener mínimo 8 caracteres', 'danger');
            return;
        }

        // ---------- REVISIÓN 3: ¿aceptó los términos? ----------
        // "checked" es true si la casilla está marcada.
        if (!formulario.terminos.checked) {
            mostrarAviso('Debes aceptar los términos y condiciones', 'warning');
            return;
        }

        // ---------- CREAR LOS DATOS DEL USUARIO ----------
        // Guardamos la contraseña ya "revuelta" (hash), nunca la normal.
        const nuevoUsuario = {
            nombre: formulario.nombre.value,
            email: formulario.email.value,
            password: await hashearContrasena(formulario.password.value),
            rol: tipoCuenta   // cliente o empresa
        };

        // ---------- SI ES UNA FLORISTERÍA: crear también su empresa ----------
        // Una floristería necesita dos registros: el usuario (para entrar)
        // y la empresa (con sus datos de negocio). Se enlazan con empresaId.
        if (tipoCuenta === 'empresa') {
            const empresaCreada = await llamarApi('/empresas', {
                method: 'POST',
                body: {
                    nombre: formulario.nombre.value,
                    localidad: formulario.localidad.value,
                    ciudad: formulario.ciudad.value,
                    whatsapp: formulario.whatsapp.value,
                    especialidades: [],
                    desde: new Date().getFullYear(),  // año actual
                    verificada: false   // empieza sin verificar, hasta que se revise
                }
            });
            // Guardamos el id de la empresa recién creada en el usuario, para enlazarlos.
            nuevoUsuario.empresaId = empresaCreada.id;
        }

        // ---------- GUARDAR EL USUARIO ----------
        await llamarApi('/usuarios', {
            method: 'POST',
            body: nuevoUsuario
        });

        // Avisamos que salió bien y limpiamos el formulario.
        mostrarAviso('Registro exitoso. Ahora puedes iniciar sesión.');
        formulario.reset();
    };
}