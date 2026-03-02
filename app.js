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

// === BASE DE DATOS DE RANGOS INHABILITADOS DEL BCB ===
// Transcritos de las tablas oficiales (Cortes de Bs 10, Bs 20 y Bs 50)
const rangosSiniestrados = [
    // CORTE Bs 10
    { min: 77100001, max: 77550000, corte: 10 },
    { min: 78000001, max: 78450000, corte: 10 },
    { min: 78900001, max: 96350000, corte: 10 },
    { min: 96350001, max: 96800000, corte: 10 },
    { min: 96800001, max: 97250000, corte: 10 },
    { min: 98150001, max: 98600000, corte: 10 },
    { min: 104900001, max: 105350000, corte: 10 },
    { min: 105350001, max: 105800000, corte: 10 },
    { min: 106700001, max: 107150000, corte: 10 },
    { min: 107600001, max: 108050000, corte: 10 },
    { min: 108050001, max: 108500000, corte: 10 },
    { min: 109400001, max: 109850000, corte: 10 },

    // CORTE Bs 20
    { min: 87280145, max: 91646549, corte: 20 },
    { min: 96650001, max: 97100000, corte: 20 },
    { min: 99800001, max: 100250000, corte: 20 },
    { min: 100250001, max: 100700000, corte: 20 },
    { min: 109250001, max: 109700000, corte: 20 },
    { min: 110600001, max: 111050000, corte: 20 },
    { min: 111050001, max: 111500000, corte: 20 },
    { min: 111950001, max: 112400000, corte: 20 },
    { min: 112400001, max: 112850000, corte: 20 },
    { min: 112850001, max: 113300000, corte: 20 },
    { min: 114200001, max: 114650000, corte: 20 },
    { min: 114650001, max: 115100000, corte: 20 },
    { min: 115100001, max: 115550000, corte: 20 },
    { min: 118700001, max: 119150000, corte: 20 },
    { min: 119150001, max: 119600000, corte: 20 },
    { min: 120500001, max: 120950000, corte: 20 },

    // CORTE Bs 50
    { min: 67250001, max: 67700000, corte: 50 },
    { min: 69050001, max: 69500000, corte: 50 },
    { min: 69500001, max: 69950000, corte: 50 },
    { min: 69950001, max: 70400000, corte: 50 },
    { min: 70400001, max: 70850000, corte: 50 },
    { min: 70850001, max: 71300000, corte: 50 },
    { min: 76310012, max: 85139995, corte: 50 },
    { min: 86400001, max: 86850000, corte: 50 },
    { min: 90900001, max: 91350000, corte: 50 },
    { min: 91800001, max: 92250000, corte: 50 }
];

let flujoVideo = null;

// --- CONTROL DE PESTAÑAS (TABS) ---
btnTabCamara.addEventListener('click', () => {
    cambiarPestana(seccionCamara, seccionManual, btnTabCamara, btnTabManual);
    iniciarCamara();
});

btnTabManual.addEventListener('click', () => {
    cambiarPestana(seccionManual, seccionCamara, btnTabManual, btnTabCamara);
    detenerCamara(); 
});

function cambiarPestana(mostrar, ocultar, btnActivar, btnDesactivar) {
    mostrar.classList.remove('oculta');
    ocultar.classList.add('oculta');
    btnActivar.classList.add('activa');
    btnDesactivar.classList.remove('activa');
    contenedorResultado.classList.add('oculta'); 
}

// --- CÁMARA (WEBRTC) ---
async function iniciarCamara() {
    try {
        flujoVideo = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        videoCamara.srcObject = flujoVideo;
    } catch (error) {
        textoDetectadoPantalla.innerText = "Error de cámara. Asegúrate de dar permisos HTTPS.";
    }
}

function detenerCamara() {
    if (flujoVideo) {
        flujoVideo.getTracks().forEach(pista => pista.stop());
    }
}

iniciarCamara();

// --- SISTEMA DE VALIDACIÓN MATEMÁTICA ---
function pintarResultado(rangoEncontrado) {
    contenedorResultado.className = ""; 
    
    if (rangoEncontrado) {
        contenedorResultado.classList.add('invalido');
        tituloResultado.innerText = "BILLETE INHABILITADO ❌";
        mensajeResultado.innerText = `Cuidado: El número pertenece al rango anulado de billetes de Bs ${rangoEncontrado.corte}.`;
    } else {
        contenedorResultado.classList.add('valido');
        tituloResultado.innerText = "BILLETE VÁLIDO ✅";
        mensajeResultado.innerText = "El número no pertenece a los rangos siniestrados del BCB.";
    }
}

function chequearContraBase(textoLeido) {
    // 1. Extraemos todos los bloques de números del texto detectado usando Expresiones Regulares
    // Buscamos secuencias que tengan al menos 7 u 8 dígitos juntos
    const numerosEncontrados = textoLeido.match(/\d{7,10}/g);
    
    if (!numerosEncontrados) {
        contenedorResultado.className = "invalido";
        tituloResultado.innerText = "ERROR DE LECTURA ⚠️";
        mensajeResultado.innerText = "No se logró detectar un número de serie claro. Intenta enfocar mejor o usar el modo manual.";
        return;
    }

    let rangoInvalidoDetectado = null;

    // 2. Iteramos los números que encontró el OCR
    for (let numeroStr of numerosEncontrados) {
        const numero = parseInt(numeroStr, 10);
        
        // 3. Revisamos si el número cae matemáticamente dentro de algún rango
        const coincidencia = rangosSiniestrados.find(rango => numero >= rango.min && numero <= rango.max);
        
        if (coincidencia) {
            rangoInvalidoDetectado = coincidencia;
            break; // Si encontramos uno inhabilitado, paramos de buscar
        }
    }
    
    pintarResultado(rangoInvalidoDetectado);
}

// --- ESCANEO CON IA (TESSERACT.JS) ---
botonEscanear.addEventListener('click', async () => {
    textoDetectadoPantalla.innerText = "Procesando imagen (no muevas el billete)...";
    contenedorResultado.classList.add('oculta');

    const contexto = lienzoOculto.getContext('2d');
    lienzoOculto.width = videoCamara.videoWidth;
    lienzoOculto.height = videoCamara.videoHeight;
    contexto.drawImage(videoCamara, 0, 0, lienzoOculto.width, lienzoOculto.height);
    
    const fotoBase64 = lienzoOculto.toDataURL('image/png');

    try {
        const resultadoOCR = await Tesseract.recognize(fotoBase64, 'spa');
        const textoObtenido = resultadoOCR.data.text;
        
        // Imprimir en pantalla el debug
        textoDetectadoPantalla.innerText = textoObtenido || "No logré enfocar texto claro.";
        
        chequearContraBase(textoObtenido);
    } catch (error) {
        textoDetectadoPantalla.innerText = "Fallo en el escáner.";
    }
});

// --- ENTRADA MANUAL ---
botonValidarManual.addEventListener('click', () => {
    const valorEscrito = entradaSerie.value;
    
    if (valorEscrito.trim() === "") {
        alert("Escribe el número de serie.");
        return;
    }
    
    // Le pasamos el texto igual que si viniera de la cámara
    chequearContraBase(valorEscrito);
});
