// ============================================================
//  ARCHIVO PRINCIPAL DE JAVASCRIPT - BLOOM HOUSE
// ============================================================
//  ¿Qué hace este archivo? Es el "cerebro" compartido de todas
//  las páginas. Se encarga de:
//    1. Guardar los datos de la tienda (usuarios, productos, pedidos...)
//    2. Simular una base de datos usando el navegador (localStorage)
//    3. Manejar el inicio de sesión
//    4. Manejar el carrito de compras
//    5. Dibujar el menú, el pie de página y las ventanas emergentes
//    6. Traducir la página a inglés con Google Translate
//
//  Idea clave: localStorage es una "cajita" que el navegador
//  tiene para guardar información, aunque cierres la página.
// ============================================================


// ============================================================
//  PARTE 1: DATOS INICIALES (nuestra "base de datos" de ejemplo)
// ============================================================
//  Son los datos con los que arranca la tienda la primera vez.
//  Cada lista (usuarios, empresas, productos...) es como una
//  tabla de Excel: cada línea { ... } es una fila.
// ============================================================
const datosIniciales = {

  // ---- USUARIOS: las personas que pueden entrar a la página ----
  // rol puede ser: "admin" (administrador), "empresa" (floristería) o "cliente".
  // password NO es la contraseña real: es una versión "revuelta"
  // (hash SHA-256) para que no se vea la clave original.
  // empresaId: indica a qué floristería pertenece un usuario "empresa".
  usuarios: [
    { id: 1, nombre: "Laura Ramirez", email: "laura.ramirez@bloomhouse.com", password: "4d8fcd038af46e9c783a8b3f39a8ee1c40ce91e107066420506a0c0408af8823", rol: "admin" },
    { id: 2, nombre: "Carlos Mendoza", email: "carlos.mendoza@bloomhouse.com", password: "314bae9d371415d8d6a71e5de39c828ce068001814bf7b94c22de4ff73eadbc7", rol: "empresa", empresaId: 1 },
    { id: 3, nombre: "Marta Gonzalez", email: "marta.gonzalez@bloomhouse.com", password: "8c4627beee9205c0584b4581e01a8335c3216a8de54017e8bd3caf79767c83e7", rol: "empresa", empresaId: 2 },
    { id: 4, nombre: "Andres Rojas", email: "andres.rojas@bloomhouse.com", password: "27668e2edbc083c0e0437373526f3eb9f2da756ff63d573f3a3a132be1760523", rol: "empresa", empresaId: 3 },
    { id: 5, nombre: "Camila Torres", email: "camila.torres@correo.com", password: "bcccd093c88423736c6356ad54e9002c2fb7e5423b83a29719acf2f23d2abcf9", rol: "cliente" },
    { id: 6, nombre: "Santiago Perez", email: "santiago.perez@correo.com", password: "2cf967d40957b69f3a67fdf7e32a383a675f490f861b008221c88603e930fe7d", rol: "cliente" },
    { id: 7, nombre: "Valentina Gomez", email: "valentina.gomez@correo.com", password: "1a947815f6e96cb905a694ad9b40b90cab28bf764916d38fcedf887c0eb1a7fb", rol: "cliente" },
    { id: 8, nombre: "Daniel Castro", email: "daniel.castro@correo.com", password: "83a9d822af1cfb147a451d063d57e31c6454d6f67d772fe61333f438466a3d67", rol: "cliente" },
    { id: 9, nombre: "Mariana Lopez", email: "mariana.lopez@correo.com", password: "a9825684e4802cde7d1d5f2368d2a7d10456bcea0e3759a540e5771d895ba99e", rol: "cliente" },
    { id: 10, nombre: "Felipe Vargas", email: "felipe.vargas@correo.com", password: "6f66c87bb972efab443257c977175e963fbcacd4004893c2242b646369cb6cd0", rol: "cliente" },
    { id: 11, nombre: "Natalia Ortiz", email: "natalia.ortiz@correo.com", password: "ea07e460a469bc5eae3d0c9fc5cb2ad447c3c2bd472dae79c999322890efa8de", rol: "cliente" },
    { id: 12, nombre: "Jorge Salazar", email: "jorge.salazar@correo.com", password: "a03da7f4f951af7b82d8148dc2aea84a6bcbc02e24d24d3361ea292ed0c29949", rol: "cliente" }
  ],

  // ---- EMPRESAS: las floristerías aliadas que venden en la plataforma ----
  // whatsapp: número para contactarlas. imagen: ruta del logo.
  empresas: [
    { id: 1, nombre: "Flores del Valle", localidad: "Kennedy", ciudad: "Bogotá", especialidades: [], desde: null, verificada: true, whatsapp: "573101234501", imagen: "imagenes/FloresdelValle.png" },
    { id: 2, nombre: "Jardin de Aurora", localidad: "Kennedy", ciudad: "Bogotá", especialidades: [], desde: null, verificada: true, whatsapp: "573101234502", imagen: "imagenes/JardinAurora.png" },
    { id: 3, nombre: "Petalos y Colores", localidad: "Kennedy", ciudad: "Bogotá", especialidades: [], desde: null, verificada: true, whatsapp: "573101234503", imagen: "imagenes/PetalosColores.png" }
  ],

  // ---- PRODUCTOS: lo que se vende en la tienda ----
  // empresaId: de qué floristería es el producto (se relaciona con "empresas").
  // precioAnterior: precio antes de un descuento (0 = sin descuento).
  // stock: cuántas unidades quedan disponibles.
  // activo: true = se muestra en la tienda, false = oculto.
  productos: [
    { id: 1, nombre: "Ramo de 12 rosas rojas", empresaId: 1, categoria: "Ramos", tipo: "Rosas", localidad: "Kennedy", precio: 85000, precioAnterior: 0, etiqueta: "", stock: 20, activo: true, descripcion: "Docena de rosas rojas frescas con follaje y papel kraft", imagen: "imagenes/Ramo12rosasrojas.png" },
    { id: 2, nombre: "Ramo de girasoles", empresaId: 1, categoria: "Ramos", tipo: "Girasoles", localidad: "Kennedy", precio: 60000, precioAnterior: 0, etiqueta: "", stock: 15, activo: true, descripcion: "Seis girasoles grandes con gypsophila y lazo amarillo", imagen: "imagenes/Ramogirasoles.png" },
    { id: 3, nombre: "Caja de tulipanes", empresaId: 1, categoria: "Arreglos florales", tipo: "Tulipanes", localidad: "Kennedy", precio: 95000, precioAnterior: 0, etiqueta: "", stock: 8, activo: true, descripcion: "Caja redonda con diez tulipanes de colores mezclados", imagen: "imagenes/CajaTulipanes.png" },
    { id: 4, nombre: "Orquidea phalaenopsis", empresaId: 1, categoria: "Plantas", tipo: "Orquídeas", localidad: "Kennedy", precio: 120000, precioAnterior: 0, etiqueta: "", stock: 6, activo: true, descripcion: "Orquidea blanca de dos varas en matera de ceramica", imagen: "imagenes/Orquideaphalaenopsis.png" },
    { id: 5, nombre: "Corona de claveles", empresaId: 1, categoria: "Eventos y duelo", tipo: "Claveles", localidad: "Kennedy", precio: 150000, precioAnterior: 0, etiqueta: "", stock: 0, activo: true, descripcion: "Corona funebre de claveles blancos y rojos con cinta", imagen: "imagenes/Coronaclaveles.png" },
    { id: 6, nombre: "Bouquet de lirios blancos", empresaId: 2, categoria: "Ramos", tipo: "Lirios", localidad: "Kennedy", precio: 78000, precioAnterior: 0, etiqueta: "", stock: 12, activo: true, descripcion: "Ramo de lirios blancos con eucalipto", imagen: "imagenes/Bouquetliriosblancos.png" },
    { id: 7, nombre: "Caja de rosas y margaritas", empresaId: 2, categoria: "Arreglos florales", tipo: "Mixtas", localidad: "Kennedy", precio: 88000, precioAnterior: 0, etiqueta: "", stock: 10, activo: true, descripcion: "Caja rectangular con rosas rosadas y margaritas", imagen: "imagenes/Cajarosasmargaritas.png" },
    { id: 8, nombre: "Suculenta decorativa", empresaId: 2, categoria: "Plantas", tipo: "Suculenta", localidad: "Kennedy", precio: 25000, precioAnterior: 0, etiqueta: "", stock: 30, activo: true, descripcion: "Suculenta en matera pequena de barro", imagen: "imagenes/Suculentadecorativa.png" },
    { id: 9, nombre: "Arreglo de gerberas", empresaId: 2, categoria: "Arreglos florales", tipo: "Gerberas", localidad: "Kennedy", precio: 70000, precioAnterior: 0, etiqueta: "", stock: 14, activo: true, descripcion: "Arreglo multicolor de gerberas en canasta", imagen: "imagenes/Arreglogerberas.png" },
    { id: 10, nombre: "Centro de mesa para eventos", empresaId: 2, categoria: "Eventos y duelo", tipo: "Mixtas", localidad: "Kennedy", precio: 110000, precioAnterior: 0, etiqueta: "", stock: 5, activo: true, descripcion: "Centro de mesa con flores mixtas para ocho personas", imagen: "imagenes/Centromesaparaeventos.png" },
    { id: 11, nombre: "Ramo de margaritas", empresaId: 3, categoria: "Ramos", tipo: "Margaritas", localidad: "Kennedy", precio: 45000, precioAnterior: 0, etiqueta: "", stock: 25, activo: true, descripcion: "Ramo de margaritas blancas con papel de colores", imagen: "imagenes/Ramomargaritas.png" },
    { id: 12, nombre: "Hortensias azules en canasta", empresaId: 3, categoria: "Arreglos florales", tipo: "Hortensias", localidad: "Kennedy", precio: 98000, precioAnterior: 0, etiqueta: "", stock: 7, activo: true, descripcion: "Canasta con tres hortensias azules", imagen: "imagenes/Hortensiasazulescanasta.png" },
    { id: 13, nombre: "Ramo mixto primaveral", empresaId: 3, categoria: "Ramos", tipo: "Mixtas", localidad: "Kennedy", precio: 65000, precioAnterior: 0, etiqueta: "", stock: 18, activo: true, descripcion: "Ramo con flores de temporada en tonos pastel", imagen: "imagenes/Ramomixtoprimaveral.png" },
    { id: 14, nombre: "Anturio rojo", empresaId: 3, categoria: "Plantas", tipo: "Anturio", localidad: "Kennedy", precio: 55000, precioAnterior: 0, etiqueta: "", stock: 0, activo: false, descripcion: "Anturio rojo en matera plastica decorada", imagen: "imagenes/Anturiorojo.png" },
    { id: 15, nombre: "Arreglo navideno", empresaId: 3, categoria: "Arreglos florales", tipo: "Mixtas", localidad: "Kennedy", precio: 105000, precioAnterior: 0, etiqueta: "", stock: 12, activo: true, descripcion: "Arreglo de rosas rojas y pino para la temporada decembrina", imagen: "imagenes/Arreglonavideno.png" }
  ],

  // ---- RESEÑAS: opiniones de los clientes sobre los productos ----
  // productoId: a qué producto corresponde. estrellas: calificación de 1 a 5.
  resenas: [
    { id: 1, productoId: 1, usuario: "Camila Torres", estrellas: 5, texto: "Las rosas llegaron frescas y bien empacadas" },
    { id: 2, productoId: 2, usuario: "Camila Torres", estrellas: 4, texto: "Muy bonitos los girasoles, duraron una semana" },
    { id: 3, productoId: 7, usuario: "Santiago Perez", estrellas: 5, texto: "La caja llego perfecta, justo como en la foto" },
    { id: 4, productoId: 11, usuario: "Valentina Gomez", estrellas: 4, texto: "Buen precio y las margaritas llegaron frescas" },
    { id: 5, productoId: 6, usuario: "Valentina Gomez", estrellas: 5, texto: "Los lirios huelen delicioso, muy recomendados" },
    { id: 6, productoId: 4, usuario: "Daniel Castro", estrellas: 5, texto: "La orquidea es hermosa y llego muy bien cuidada" },
    { id: 7, productoId: 9, usuario: "Mariana Lopez", estrellas: 3, texto: "Bonitas, pero algunas gerberas llegaron muy abiertas" }
  ],

  // ---- PEDIDOS: las compras que han hecho los clientes ----
  // usuarioId: quién compró. items: lista de productos del pedido
  //   (cant = cantidad comprada).
  // estado puede ser: registrado, en proceso, listo, entregado o cancelado.
  pedidos: [
    { id: 1, usuarioId: 5, items: [{ productoId: 1, nombre: "Ramo de 12 rosas rojas", empresaId: 1, cant: 1, precio: 85000 }, { productoId: 2, nombre: "Ramo de girasoles", empresaId: 1, cant: 1, precio: 60000 }], total: 145000, pago: "Pse", estado: "entregado", fecha: "2026-10-05T10:15:00" },
    { id: 2, usuarioId: 6, items: [{ productoId: 7, nombre: "Caja de rosas y margaritas", empresaId: 2, cant: 1, precio: 88000 }], total: 88000, pago: "TarjetaCredito", estado: "entregado", fecha: "2026-10-09T15:40:00" },
    { id: 3, usuarioId: 7, items: [{ productoId: 11, nombre: "Ramo de margaritas", empresaId: 3, cant: 2, precio: 45000 }, { productoId: 6, nombre: "Bouquet de lirios blancos", empresaId: 2, cant: 1, precio: 78000 }], total: 168000, pago: "TarjetaDebito", estado: "entregado", fecha: "2026-10-14T09:20:00" },
    { id: 4, usuarioId: 8, items: [{ productoId: 4, nombre: "Orquidea phalaenopsis", empresaId: 1, cant: 1, precio: 120000 }], total: 120000, pago: "BilleterasBancarias", estado: "entregado", fecha: "2026-10-20T11:05:00" },
    { id: 5, usuarioId: 9, items: [{ productoId: 9, nombre: "Arreglo de gerberas", empresaId: 2, cant: 2, precio: 70000 }], total: 140000, pago: "Pse", estado: "entregado", fecha: "2026-10-27T16:30:00" },
    { id: 6, usuarioId: 10, items: [{ productoId: 12, nombre: "Hortensias azules en canasta", empresaId: 3, cant: 1, precio: 98000 }, { productoId: 8, nombre: "Suculenta decorativa", empresaId: 2, cant: 1, precio: 25000 }], total: 123000, pago: "TarjetaCredito", estado: "listo", fecha: "2026-11-03T13:10:00" },
    { id: 7, usuarioId: 11, items: [{ productoId: 10, nombre: "Centro de mesa para eventos", empresaId: 2, cant: 1, precio: 110000 }], total: 110000, pago: "PagoEfectivo", estado: "en proceso", fecha: "2026-11-08T08:45:00" },
    { id: 8, usuarioId: 12, items: [{ productoId: 13, nombre: "Ramo mixto primaveral", empresaId: 3, cant: 2, precio: 65000 }], total: 130000, pago: "Pse", estado: "registrado", fecha: "2026-11-12T17:25:00" },
    { id: 9, usuarioId: 5, items: [{ productoId: 3, nombre: "Caja de tulipanes", empresaId: 1, cant: 1, precio: 95000 }], total: 95000, pago: "TarjetaCredito", estado: "cancelado", fecha: "2026-11-14T10:00:00" },
    { id: 10, usuarioId: 6, items: [{ productoId: 15, nombre: "Arreglo navideno", empresaId: 3, cant: 1, precio: 105000 }, { productoId: 11, nombre: "Ramo de margaritas", empresaId: 3, cant: 1, precio: 45000 }], total: 150000, pago: "TarjetaDebito", estado: "registrado", fecha: "2026-11-16T12:30:00" }
  ],

  // ---- MENSAJES: empieza vacío, se llena cuando alguien escribe ----
  mensajes: []
};


// ============================================================
//  PARTE 2: BASE DE DATOS EN EL NAVEGADOR
// ============================================================

// Esta función "abre" la base de datos.
// - Si ya hay datos guardados en localStorage, los usa.
// - Si no hay (primera vez que se abre la página), guarda los
//   datosIniciales y los devuelve.
function obtenerBaseDatos() {
  const clave = "bloomHouseDatos_v4"; // nombre de la "cajita" donde se guarda todo
  const guardada = localStorage.getItem(clave);
  if (guardada) {
    // JSON.parse convierte el texto guardado de vuelta en datos que JavaScript entiende.
    // try/catch evita que la página se dañe si el texto guardado está corrupto.
    try { return JSON.parse(guardada); } catch { /* ignorar */ }
  }
  // JSON.stringify convierte los datos en texto para poder guardarlos.
  localStorage.setItem(clave, JSON.stringify(datosIniciales));
  // Devolvemos una copia para no modificar los datos originales.
  return JSON.parse(JSON.stringify(datosIniciales));
}

// Guarda los datos actualizados (por ejemplo, después de crear un pedido).
function guardarBaseDatos(datos) {
  localStorage.setItem("bloomHouseDatos_v4", JSON.stringify(datos));
}

// ------------------------------------------------------------
//  Simulador de API
// ------------------------------------------------------------
//  Una "API" es como un mesero: tú le pides algo ("dame los
//  productos") y él lo busca y te lo trae. Esta función hace
//  ese papel, pero usando localStorage en vez de un servidor
//  real (antes se usaba json-server).
//
//  Se usa así:
//    llamarApi('/productos')                      -> trae todos los productos
//    llamarApi('/productos/3')                    -> trae solo el producto 3
//    llamarApi('/productos?activo=true')          -> trae los productos activos
//    llamarApi('/pedidos', {method:'POST', body}) -> crea un pedido nuevo
//    llamarApi('/productos/3', {method:'PATCH', body}) -> modifica el producto 3
//    llamarApi('/productos/3', {method:'DELETE'}) -> borra el producto 3
// ------------------------------------------------------------
async function llamarApi(ruta, opciones = {}) {
  // Qué acción se pide: GET (leer), POST (crear), PATCH (modificar) o DELETE (borrar).
  // Si no se indica, se asume GET.
  const metodo = (opciones.method || "GET").toUpperCase();
  const datos = obtenerBaseDatos();

  // Separamos la ruta de los filtros. Ejemplo:
  // "/productos?activo=true"  ->  ruta: "/productos"  y  filtros: "activo=true"
  const [rutaLimpia, queryString] = ruta.split("?");
  const partes = rutaLimpia.split("/").filter(Boolean);
  const coleccion = partes[0];                      // por ejemplo "productos"
  const id = partes[1] ? Number(partes[1]) : null;  // por ejemplo 3 (si lo hay)

  // Si la colección no existe todavía, la creamos vacía.
  if (!datos[coleccion]) datos[coleccion] = [];

  // ---------- GET: LEER datos ----------
  if (metodo === "GET") {
    let lista = datos[coleccion];

    // Si pidieron un id específico, buscamos solo ese elemento.
    if (id) {
      const encontrado = lista.find(item => item.id === id);
      if (!encontrado) throw new Error("No encontrado");
      return encontrado;
    }

    // Filtros simples tipo ?activo=true&empresaId=1
    // Solo dejamos los elementos que cumplan TODOS los filtros.
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

  // ---------- POST: CREAR un elemento nuevo ----------
  if (metodo === "POST") {
    const nuevo = opciones.body || {};
    // Buscamos el id más alto que existe y le sumamos 1 para el nuevo.
    const maxId = datos[coleccion].reduce((max, item) => Math.max(max, item.id || 0), 0);
    nuevo.id = maxId + 1;
    datos[coleccion].push(nuevo);
    guardarBaseDatos(datos);
    return nuevo;
  }

  // ---------- PATCH: MODIFICAR un elemento existente ----------
  if (metodo === "PATCH" && id) {
    const indice = datos[coleccion].findIndex(item => item.id === id);
    if (indice === -1) throw new Error("No encontrado");
    // Mezclamos los datos viejos con los nuevos (los nuevos pisan a los viejos).
    datos[coleccion][indice] = { ...datos[coleccion][indice], ...opciones.body };
    guardarBaseDatos(datos);
    return datos[coleccion][indice];
  }

  // ---------- DELETE: BORRAR un elemento ----------
  if (metodo === "DELETE" && id) {
    // Nos quedamos con todos los elementos MENOS el que tiene ese id.
    datos[coleccion] = datos[coleccion].filter(item => item.id !== id);
    guardarBaseDatos(datos);
    return { ok: true };
  }

  // Si la acción no es ninguna de las anteriores, avisamos del error.
  throw new Error("Método o ruta no soportada");
}


// ============================================================
//  PARTE 3: UTILIDADES GENERALES
// ============================================================
//  Funciones pequeñas que se reutilizan en toda la página.
// ============================================================

// Atajo para buscar un elemento en la página por su selector CSS.
// Ejemplo: buscarElemento('#nav') encuentra el elemento con id="nav".
const buscarElemento = selector => document.querySelector(selector);


// ------------------------------------------------------------
//  TRADUCTOR AUTOMÁTICO DE GOOGLE
// ------------------------------------------------------------

// Devuelve el idioma actual ('EN' o 'ES') leyendo una cookie.
// Una cookie es un pequeño dato que el navegador recuerda.
// Google guarda ahí el idioma con el formato "googtrans=/es/en".
const idiomaActual = () => document.cookie.includes('googtrans=/es/en') ? 'EN' : 'ES';

// Carga el traductor de Google en la página.
function cargarTraductor() {
  // Si ya lo cargamos antes, no lo hacemos otra vez.
  if (document.getElementById('google_translate_element')) return;

  // Creamos una cajita donde Google pondrá su traductor.
  // La movemos fuera de la pantalla (left:-9999px) para que no se vea.
  const caja = document.createElement('div');
  caja.id = 'google_translate_element';
  caja.style.cssText = 'position:absolute; left:-9999px;';
  document.body.append(caja);

  // Google llamará a esta función cuando termine de cargar.
  // Aquí le decimos: la página está en español y puede traducirse a español o inglés.
  window.iniciarTraductor = () => {
    new google.translate.TranslateElement({
      pageLanguage: 'es',
      includedLanguages: 'es,en',
      autoDisplay: false
    }, 'google_translate_element');
  };

  // Descargamos el programa del traductor desde los servidores de Google.
  const script = document.createElement('script');
  script.src = 'https://translate.google.com/translate_a/element.js?cb=iniciarTraductor';
  // Si falla (sin internet o bloqueado), se muestra un mensaje en la consola (F12).
  script.onerror = () => console.error('No se pudo cargar Google Translate (bloqueado o sin internet)');
  document.body.append(script);
}

// Cambia el idioma. La usan los botones "Español" e "English" del menú.
// Guarda el idioma elegido en una cookie y recarga la página para aplicarlo.
function cambiarIdioma(codigo) {
  document.cookie = `googtrans=/es/${codigo}; path=/`;
  location.reload();
}


// ------------------------------------------------------------
//  LISTAS DE OPCIONES
// ------------------------------------------------------------
// Estas listas se usan para llenar menús desplegables y filtros
// (por ejemplo, el filtro de categorías en el marketplace).
const categoriasDisponibles = ['Ramos', 'Arreglos florales', 'Plantas', 'Detalles y regalos', 'Eventos y duelo'];
const tiposDeFlores = ['Rosas', 'Girasoles', 'Tulipanes', 'Orquídeas', 'Claveles', 'Lirios', 'Gerberas', 'Margaritas', 'Hortensias', 'Mixtas', 'Suculenta', 'Anturio'];
const localidades = ['Kennedy'];


// ------------------------------------------------------------
//  FORMATO DE DINERO
// ------------------------------------------------------------
// Convierte un número en dinero con formato colombiano.
// Ejemplo: 85000 -> "$85.000"
const formatearMoneda = cantidad => '$' + Number(cantidad).toLocaleString('es-CO');


// ------------------------------------------------------------
//  IMAGEN DE RELLENO
// ------------------------------------------------------------
// Crea una imagen gris con un texto, para usar cuando no hay
// una foto real. Está hecha con SVG (dibujo en código), así que
// no necesita ningún archivo de imagen.
const crearImagenPlaceholder = texto => 'data:image/svg+xml,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
    <rect width="100%" height="100%" fill="#dee2e6"/>
    <text x="50%" y="50%" text-anchor="middle" fill="#6c757d" font-size="20">${texto || 'Imagen'}</text>
  </svg>
`);


// ------------------------------------------------------------
//  SESIÓN E INICIO DE SESIÓN (usando un "token")
// ------------------------------------------------------------
//  Un token es como una manilla de entrada a un evento: prueba
//  que ya iniciaste sesión. Se guarda en localStorage con el
//  nombre "jwt". OJO: aquí es una versión de práctica (la firma
//  es simulada), no es seguridad real de una página en producción.
// ------------------------------------------------------------

// Lee el token guardado en el navegador (o null si no hay).
const obtenerTokenGuardado = () => localStorage.getItem('jwt');

// Convierte un objeto en texto codificado en Base64URL
// (un formato seguro para guardar y mover datos dentro de un token).
const codificarBase64Url = objeto => {
  return btoa(unescape(encodeURIComponent(JSON.stringify(objeto))))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

// Crea el token cuando alguien inicia sesión.
// Un token tiene 3 partes separadas por puntos: cabecera.cuerpo.firma
const generarTokenAcceso = usuario => {
  const cabecera = codificarBase64Url({ alg: 'HS256', typ: 'JWT' });
  const cuerpo = codificarBase64Url({
    sub: usuario.id,          // id del usuario
    nombre: usuario.nombre,
    rol: usuario.rol,         // admin, empresa o cliente
    empresaId: usuario.empresaId,
    exp: Date.now() / 1000 + 3600  // vence en 1 hora (3600 segundos)
  });
  return cabecera + '.' + cuerpo + '.firma-simulada';
};

// Revisa si hay una sesión activa y devuelve los datos de la persona
// (nombre, rol, etc.). Devuelve null si no hay sesión o ya venció.
const leerSesionActual = () => {
  try {
    const token = obtenerTokenGuardado();
    if (!token) return null;
    // Tomamos la parte del medio (el cuerpo) y la decodificamos.
    const parte = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const datos = JSON.parse(decodeURIComponent(escape(atob(parte))));
    // Si ya pasó la hora de vencimiento, lanzamos un error para limpiar.
    if (datos.exp < Date.now() / 1000) throw new Error();
    return datos;
  } catch {
    // Token dañado o vencido: lo borramos y no hay sesión.
    localStorage.removeItem('jwt');
    return null;
  }
};

// "Revuelve" una contraseña con SHA-256 para compararla con la guardada.
// Así nunca se guarda ni se compara la contraseña en texto normal.
const hashearContrasena = async texto => {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
};

// Cierra la sesión: borra el token y manda a la página de inicio.
const cerrarSesion = () => {
  localStorage.removeItem('jwt');
  location.href = 'index.html';
};


// ------------------------------------------------------------
//  AVISOS EMERGENTES
// ------------------------------------------------------------
// Muestra un mensajito en la esquina superior derecha que
// desaparece solo a los 2,5 segundos.
// tipo puede ser: 'success' (verde), 'warning' (amarillo), 'danger' (rojo)...
const mostrarAviso = (mensaje, tipo = 'success') => {
  const aviso = document.createElement('div');
  aviso.className = `alert alert-${tipo} position-fixed top-0 end-0 m-3 shadow`;
  aviso.style.zIndex = 2000;  // para que quede por encima de todo
  aviso.textContent = mensaje;
  document.body.append(aviso);
  setTimeout(() => aviso.remove(), 2500);  // 2500 milisegundos = 2,5 segundos
};


// ------------------------------------------------------------
//  ESTRELLAS DE LAS RESEÑAS
// ------------------------------------------------------------
// Recibe una lista de reseñas y devuelve un texto con el promedio.
// Ejemplo: "★ 4.5 (2)" = promedio de 4.5 estrellas entre 2 reseñas.
const textoEstrellas = lista => {
  if (!lista.length) return 'Sin reseñas';
  const promedio = lista.reduce((s, r) => s + r.estrellas, 0) / lista.length;
  return `★ ${promedio.toFixed(1)} (${lista.length})`;
};


// ============================================================
//  PARTE 4: CARRITO DE COMPRAS
// ============================================================
//  El carrito se guarda en localStorage con el nombre "carrito",
//  así no se pierde si recargas la página.
// ============================================================

// Lee el carrito guardado. Si está vacío, devuelve una lista vacía [].
const leerCarrito = () => JSON.parse(localStorage.getItem('carrito') || '[]');

// Guarda el carrito y actualiza lo que se ve en pantalla.
const guardarCarrito = carrito => {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  refrescarCarrito();
};

// Agrega un producto al carrito.
// - Si el producto ya está, le suma 1 a la cantidad (sin pasar del stock).
// - Si no está, lo agrega nuevo con cantidad 1.
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

// Sube o baja la cantidad de un producto (los botones + y −).
// cambio = 1 suma uno, cambio = -1 resta uno.
// Nunca pasa del stock, y si la cantidad llega a 0, el producto se quita.
const modificarCantidad = (idProducto, cambio) => {
  const carrito = leerCarrito();
  const item = carrito.find(el => el.id === idProducto);
  if (item) item.cantidad = Math.min(item.stock, item.cantidad + cambio);
  guardarCarrito(carrito.filter(el => el.cantidad > 0));
};

// Quita un producto del carrito (el botón de la caneca 🗑).
const sacarDelCarrito = idProducto => {
  guardarCarrito(leerCarrito().filter(el => el.id !== idProducto));
};

// Vuelve a dibujar el carrito en pantalla con los datos actuales:
// el numerito del icono, la lista de productos y los totales.
function refrescarCarrito() {
  const carrito = leerCarrito();
  // Total = suma de (cantidad × precio) de cada producto.
  const total = carrito.reduce((s, item) => s + item.cantidad * item.precio, 0);

  // Numerito rojo/amarillo sobre el icono del carrito (cantidad total de productos).
  const contador = buscarElemento('#contadorCarrito');
  if (contador) contador.textContent = carrito.reduce((s, item) => s + item.cantidad, 0);

  // Lista de productos dentro del panel lateral del carrito.
  const contenedor = buscarElemento('#contenidoCarrito');
  if (contenedor) {
    // .map() crea un bloque de HTML por cada producto; .join('') los une.
    // Si el carrito está vacío, se muestra el mensaje después del ||.
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

  // Escribimos el subtotal y el total en la parte de abajo del carrito.
  const sub = buscarElemento('#subtotalCarrito');
  const tot = buscarElemento('#totalCarrito');
  if (sub) sub.textContent = formatearMoneda(total);
  if (tot) tot.textContent = formatearMoneda(total);
}

// Se ejecuta al presionar "Finalizar pedido".
// 1. Revisa que haya productos y que el usuario sea un cliente con sesión.
// 2. Crea el pedido en la base de datos.
// 3. Descuenta el stock de cada producto comprado.
// 4. Vacía el carrito y recarga la página.
async function enviarPedido() {
  const sesion = leerSesionActual();
  const carrito = leerCarrito();

  // Si el carrito está vacío, no hacemos nada.
  if (!carrito.length) return;

  // Si no hay sesión (o no es cliente): cerramos el carrito y abrimos
  // la ventana "Mi Cuenta" para que inicie sesión.
  if (!sesion || sesion.rol !== 'cliente') {
    const off = bootstrap.Offcanvas.getInstance(buscarElemento('#carritoLateral'));
    if (off) off.hide();
    new bootstrap.Modal(buscarElemento('#modalCuenta')).show();
    return;
  }

  // Paso 2: creamos el pedido (POST = crear algo nuevo).
  await llamarApi('/pedidos', {
    method: 'POST',
    body: {
      usuarioId: sesion.sub,  // quién compra
      items: carrito.map(item => ({
        productoId: item.id,
        nombre: item.nombre,
        empresaId: item.empresaId,
        cant: item.cantidad,
        precio: item.precio
      })),
      total: carrito.reduce((s, item) => s + item.cantidad * item.precio, 0),
      pago: buscarElemento('#metodoPago')?.value || 'Tarjeta',  // método elegido
      estado: 'registrado',
      fecha: new Date().toISOString()  // fecha y hora actuales
    }
  });

  // Paso 3: por cada producto comprado, restamos las unidades vendidas del stock.
  // Math.max(0, ...) evita que el stock quede en negativo.
  for (const item of carrito) {
    const producto = await llamarApi('/productos/' + item.id);
    await llamarApi('/productos/' + item.id, {
      method: 'PATCH',
      body: { stock: Math.max(0, producto.stock - item.cantidad) }
    });
  }

  // Paso 4: vaciamos el carrito, avisamos y recargamos tras 0,8 segundos.
  guardarCarrito([]);
  mostrarAviso('¡Pedido registrado con éxito!');
  setTimeout(() => location.reload(), 800);
}


// ============================================================
//  PARTE 5: NOTIFICACIONES (la campanita 🔔)
// ============================================================
//  Arma la lista de avisos según quién inició sesión:
//   - Cliente: ve el estado de sus pedidos.
//   - Empresa/admin: ve los pedidos nuevos y los productos con poco stock.
// ============================================================
async function cargarNotificaciones(sesion) {
  // Si no hay sesión, no hay notificaciones.
  if (!sesion) return [];

  // Pedimos pedidos y productos al mismo tiempo (Promise.all los trae en paralelo).
  // Si algo falla, usamos una lista vacía en vez de dañar la página.
  const [pedidos, productos] = await Promise.all([
    llamarApi('/pedidos').catch(() => []),
    llamarApi('/productos').catch(() => [])
  ]);
  const alertas = [];

  if (sesion.rol === 'cliente') {
    // Cliente: solo sus propios pedidos y en qué estado van.
    pedidos.filter(p => p.usuarioId == sesion.sub)
      .forEach(p => alertas.push(['Pedido #' + p.id, 'Estado: ' + p.estado]));
  } else {
    // Empresa o admin: "esPropio" dice si algo le pertenece.
    // El admin ve todo; una empresa solo lo suyo.
    const esPropio = id => sesion.rol === 'admin' || id === sesion.empresaId;

    // Pedidos que incluyen productos de esa empresa.
    pedidos.filter(p => p.items.some(i => esPropio(i.empresaId)))
      .forEach(p => alertas.push(['Nuevo pedido recibido', `Pedido #${p.id} — ${formatearMoneda(p.total)}`]));

    // Productos con 5 unidades o menos: alerta de stock bajo.
    productos.filter(p => esPropio(p.empresaId) && p.stock <= 5)
      .forEach(p => alertas.push(['Alerta de stock mínimo', `${p.nombre}: ${p.stock} unidades.`]));
  }

  // .reverse() invierte el orden para ver primero lo más reciente.
  return alertas.reverse();
}


// ============================================================
//  PARTE 6: INTERFAZ COMÚN (menú, pie de página y ventanas)
// ============================================================
//  Esta función dibuja las partes que se repiten en TODAS las
//  páginas. Así no hay que copiar el menú en cada archivo HTML:
//  cada página solo necesita tener <div id="nav"></div> y
//  <div id="pie"></div> y este código los llena.
// ============================================================
async function montarInterfazComun() {
  const sesion = leerSesionActual();  // ¿quién está logueado? (o null)
  const notificaciones = await cargarNotificaciones(sesion).catch(() => []);

  // Marca con "active" el enlace de la página donde estamos
  // (para que se vea resaltado en el menú).
  const activa = archivo => location.pathname.endsWith(archivo) ? 'active' : '';

  // Atajo para crear cada enlace del menú.
  const enlace = (href, texto) =>
    `<li class="nav-item"><a class="nav-link ${activa(href)}" href="${href}">${texto}</a></li>`;

  // ---------- BARRA DE NAVEGACIÓN (menú de arriba) ----------
  const nav = buscarElemento('#nav');
  if (nav) {
    nav.innerHTML = `
      <nav class="navbar navbar-expand-lg bg-body-tertiary border-bottom sticky-top">
        <div class="container">
          <!-- Logo y nombre de la marca -->
          <a class="navbar-brand d-flex align-items-center gap-2" href="index.html"><img src="imagenes/logo.png" alt="" class="logo-marca" onerror="this.style.display='none'"> Bloom House</a>

          <!-- Botón de "hamburguesa" que aparece en celulares -->
          <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#menuNav">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="menuNav">
            <!-- Enlaces principales del menú -->
            <ul class="navbar-nav mx-auto">
              ${enlace('index.html', 'Marketplace')}
              ${enlace('floristerias.html', 'Floristerías')}
              ${enlace('nosotros.html', 'Nosotros')}
            </ul>

            <div class="d-flex align-items-center gap-2">
              <!-- Botón de búsqueda -->
              <a class="btn btn-sm" href="index.html#buscar"><i class="bi bi-search"></i></a>

              <!-- Menú de idioma: llama a cambiarIdioma() con 'es' o 'en' -->
              <div class="dropdown">
                <button class="btn btn-sm dropdown-toggle" data-bs-toggle="dropdown"><i class="bi bi-globe2"></i> ES</button>
                <ul class="dropdown-menu">
                <li><button class="dropdown-item" onclick="cambiarIdioma('es')">Español</button></li>
                <li><button class="dropdown-item" onclick="cambiarIdioma('en')">English</button></li>
               </ul>
              </div>

              <!-- Campanita de notificaciones -->
              <div class="dropdown">
                <button class="btn btn-sm position-relative" data-bs-toggle="dropdown">
                 <i class="bi bi-bell"></i> ${notificaciones.length ? `<span class="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle">${notificaciones.length}</span>` : ''}
                </button>
                <div class="dropdown-menu dropdown-menu-end p-0" style="min-width:300px">
                  <div class="p-2 fw-semibold border-bottom">Notificaciones <span class="badge bg-primary">${notificaciones.length}</span></div>
                  <!-- Mostramos máximo las 5 notificaciones más recientes -->
                  ${notificaciones.slice(0, 5).map(n => `
                    <div class="p-2 border-bottom">
                      <div class="fw-semibold small">${n[0]}</div>
                      <div class="small text-muted">${n[1]}</div>
                    </div>
                  `).join('') || '<div class="p-2 small">Sin notificaciones</div>'}
                  <!-- "Ver todas" lleva al panel solo si NO es cliente -->
                  <a class="d-block text-center small p-2" href="${sesion && sesion.rol !== 'cliente' ? 'panel.html' : '#'}">Ver todas</a>
                </div>
              </div>

              <!-- Botón del carrito: abre el panel lateral #carritoLateral -->
              <button class="btn btn-sm position-relative" data-bs-toggle="offcanvas" data-bs-target="#carritoLateral">
               <i class="bi bi-cart3"></i> <span id="contadorCarrito" class="badge rounded-pill bg-warning text-dark position-absolute top-0 start-100 translate-middle">0</span>
              </button>

              <!-- Si hay sesión: muestra el nombre con un menú. Si no: botón "Mi Cuenta" -->
              ${sesion ? `
                <div class="dropdown">
                  <button class="btn btn-primary btn-sm rounded-pill dropdown-toggle" data-bs-toggle="dropdown">${sesion.nombre}</button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <!-- "Mi panel" solo lo ven empresas y admin, no los clientes -->
                    ${sesion.rol !== 'cliente' ? '<li><a class="dropdown-item" href="panel.html">Mi panel</a></li>' : ''}
                    <li><button class="dropdown-item" onclick="cerrarSesion()">Cerrar sesión</button></li>
                  </ul>
                </div>
              ` : `
                <button class="btn btn-primary btn-sm rounded-pill text-dark" data-bs-toggle="modal" data-bs-target="#modalCuenta">Mi Cuenta</button>
              `}
            </div>
          </div>
        </div>
      </nav>
    `;
  }

  // ---------- PIE DE PÁGINA (footer) ----------
  const pie = buscarElemento('#pie');
  if (pie) {
    pie.innerHTML = `
      <footer class="bg-dark text-white-50 mt-5 py-4">
        <div class="container">
          <div class="row g-3">
            <!-- Columna 1: marca y descripción -->
            <div class="col-md-3">
             <h5 class="text-white d-flex align-items-center gap-2"><img src="imagenes/logo.png" alt="" class="logo-marca" onerror="this.style.display='none'"> Bloom House</h5>
              <small>Marketplace y red de distribución floral colombiana.</small>
            </div>
            <!-- Columna 2: enlaces de la plataforma -->
            <div class="col-6 col-md-3">
              <h6 class="text-warning">Plataforma</h6>
              <ul class="list-unstyled small">
                <li><a class="link-light" href="index.html">Marketplace</a></li>
                <li><a class="link-light" href="floristerias.html">Floristerías aliadas</a></li>
                <li><a class="link-light" href="panel.html">Panel de gestión</a></li>
                <li><a class="link-light" href="nosotros.html">Nosotros</a></li>
              </ul>
            </div>
            <!-- Columna 3: información legal -->
            <div class="col-6 col-md-3">
              <h6 class="text-warning">Institucional</h6>
              <ul class="list-unstyled small">
                <li><a class="link-light" href="terminos.html">Términos y Condiciones</a></li>
                <li>Política de privacidad</li>
                <li>Política de devoluciones</li>
                <li>Preguntas frecuentes</li>
              </ul>
            </div>
            <!-- Columna 4: datos de contacto -->
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

  // ---------- VENTANAS EMERGENTES (se agregan al final de la página) ----------
  document.body.insertAdjacentHTML('beforeend', `
    <!-- Ventana "Acceder a Bloom House": elegir tipo de cuenta -->
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

    <!-- Panel lateral del carrito -->
    <div class="offcanvas offcanvas-end" id="carritoLateral">
      <div class="offcanvas-header">
        <h5>Mi Carrito</h5>
        <button class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <!-- Aquí refrescarCarrito() escribe los productos -->
      <div class="offcanvas-body" id="contenidoCarrito"></div>
      <div class="p-3 border-top">
        <div class="d-flex justify-content-between"><span>Subtotal</span><span id="subtotalCarrito"></span></div>
        <div class="d-flex justify-content-between"><span>Domicilio</span><span class="text-success">Gratis</span></div>
        <div class="d-flex justify-content-between fw-bold my-2"><span>Total</span><span id="totalCarrito"></span></div>
        <!-- Método de pago -->
        <select id="metodoPago" class="form-select mb-2">
          <option>Tarjeta</option><option>PSE</option><option>Contra entrega</option>
        </select>
        <button class="btn btn-primary w-100" onclick="enviarPedido()">Finalizar pedido</button>
      </div>
    </div>
  `);

  // Dibujamos el carrito con los datos actuales y activamos el traductor.
  refrescarCarrito();
  cargarTraductor();
}

// ============================================================
//  ARRANQUE
// ============================================================
//  "DOMContentLoaded" significa: "cuando la página termine de
//  cargar". En ese momento se ejecuta montarInterfazComun() y
//  se dibuja todo. ¡Esta línea debe aparecer UNA sola vez!
// ============================================================
document.addEventListener('DOMContentLoaded', montarInterfazComun);