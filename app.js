// Atrapamos todos los elementos de nuestra interfaz
const videoCamara = document.getElementById('videoCamara');
const lienzoOculto = document.getElementById('lienzoOculto');
const botonEscanear = document.getElementById('botonEscanear');
const textoDetectadoPantalla = document.getElementById('textoDetectadoPantalla');
const entradaSerie = document.getElementById('entradaSerie');
const botonValidarManual = document.getElementById('botonValidarManual');

const contenedorResultado = document.getElementById('contenedorResultado');
const tituloResultado = document.getElementById('tituloResultado');
const mensajeResultado = document.getElementById('mensajeResultado');

const btnTabCamara = document.getElementById('btnTabCamara');
const btnTabManual = document.getElementById('btnTabManual');
const seccionCamara = document.getElementById('seccionCamara');
const seccionManual = document.getElementById('seccionManual');

// === AQUÍ DEBES PONER LOS NÚMEROS DE SERIE DEL LOTE SINIESTRADO ===
// Como solo los robados en el avión están anulados, el OCR buscará estas coincidencias exactas.
// Si pones solo "SERIE B", vas a bloquear billetes que legalmente sí valen.
const lotesInvalidosBCB = [
    "SERIE B",     // Por ahora dejamos el caso general para pruebas
    "67500000",    // Rango de ejemplo de inhabilitados de Bs10
    "8090011000",  // Ejemplo Bs20
]; 

let flujoVideo = null;

// --- CONTROL DE PESTAÑAS (TABS) ---
btnTabCamara.addEventListener('click', () => {
    cambiarPestana(seccionCamara, seccionManual, btnTabCamara, btnTabManual);
    iniciarCamara();
});

btnTabManual.addEventListener('click', () => {
    cambiarPestana(seccionManual, seccionCamara, btnTabManual, btnTabCamara);
    detenerCamara(); // No gastamos batería en modo manual
});

function cambiarPestana(mostrar, ocultar, btnActivar, btnDesactivar) {
    mostrar.classList.remove('oculta');
    ocultar.classList.add('oculta');
    btnActivar.classList.add('activa');
    btnDesactivar.classList.remove('activa');
    contenedorResultado.classList.add('oculta'); // Limpiamos alertas viejas
}

// --- CÁMARA (WEBRTC) ---
async function iniciarCamara() {
    try {
        // Pedimos acceso a la cámara trasera del celular (environment)
        flujoVideo = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        videoCamara.srcObject = flujoVideo;
    } catch (error) {
        textoDetectadoPantalla.innerText = "Error de cámara. Asegúrate de dar permisos HTTPS.";
        console.error("Permisos de cámara denegados:", error);
    }
}

function detenerCamara() {
    if (flujoVideo) {
        flujoVideo.getTracks().forEach(pista => pista.stop());
    }
}

// Arrancamos la cámara al cargar por primera vez
iniciarCamara();

// --- SISTEMA DE VALIDACIÓN CENTRAL ---
function pintarResultado(esInvalido) {
    contenedorResultado.className = ""; // Limpiamos todo
    
    if (esInvalido) {
        contenedorResultado.classList.add('invalido');
        tituloResultado.innerText = "BILLETE INHABILITADO ❌";
        mensajeResultado.innerText = "Cuidado: Este número coincide con el lote siniestrado y reportado por el BCB.";
    } else {
        contenedorResultado.classList.add('valido');
        tituloResultado.innerText = "BILLETE VÁLIDO ✅";
        mensajeResultado.innerText = "No se encontraron coincidencias en la base inhabilitada.";
    }
}

function chequearContraBase(textoLeido) {
    // Limpiamos espacios y pasamos a mayúsculas para evitar fallos tontos del usuario o el OCR
    const textoNormalizado = textoLeido.toUpperCase().replace(/\s+/g, '');
    
    // Si alguna cadena de nuestro array 'lotesInvalidosBCB' está dentro de lo que leyó el OCR
    const hayCoincidencia = lotesInvalidosBCB.some(serieMala => 
        textoNormalizado.includes(serieMala.replace(/\s+/g, ''))
    );
    
    pintarResultado(hayCoincidencia);
}

// --- ESCANEO CON IA (TESSERACT.JS) ---
botonEscanear.addEventListener('click', async () => {
    textoDetectadoPantalla.innerText = "Procesando imagen (no muevas el billete)...";
    contenedorResultado.classList.add('oculta');

    // Sacamos "foto" del video y la mandamos al canvas oculto
    const contexto = lienzoOculto.getContext('2d');
    lienzoOculto.width = videoCamara.videoWidth;
    lienzoOculto.height = videoCamara.videoHeight;
    contexto.drawImage(videoCamara, 0, 0, lienzoOculto.width, lienzoOculto.height);
    
    const fotoBase64 = lienzoOculto.toDataURL('image/png');

    try {
        // Magia del OCR
        const resultadoOCR = await Tesseract.recognize(fotoBase64, 'spa');
        const textoObtenido = resultadoOCR.data.text;
        
        // --- AQUÍ ESTÁ EL DEBUG QUE PEDÍAS ---
        // Le mostramos al usuario exactamente qué letras pescó la IA para que vea si falló
        textoDetectadoPantalla.innerText = textoObtenido || "No logré enfocar texto claro. Intenta otra vez.";
        
        // Validamos el texto
        chequearContraBase(textoObtenido);
    } catch (error) {
        textoDetectadoPantalla.innerText = "Fallo fatal en el escáner Tesseract.";
        console.error("Error OCR:", error);
    }
});

// --- ENTRADA MANUAL ---
botonValidarManual.addEventListener('click', () => {
    const valorEscrito = entradaSerie.value;
    
    if (valorEscrito.trim() === "") {
        alert("¡Oye! Primero escribe la serie del billete.");
        return;
    }
    
    chequearContraBase(valorEscrito);
});
