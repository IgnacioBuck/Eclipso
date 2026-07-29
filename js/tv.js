// DICCIONARIO DE SERIES Y CANALES LOCALES PARA TV EN VIVO
const seriesTV = [
    {
        num: "01",
        id: "theoffice",
        nombre: "Canal 01: The Office 24/7",
        desc: "Maratón ininterrumpido de The Office.",
        imdb: "tt0386676",
        viewKey: "E4YZ5l7meDrqFf0qh7HHF0m57qeUQkDYzkgvlfBtzcY",
        player: "vimeus_serie",
        duracionMin: 22, // Duración de cada capítulo en minutos
        temporadas: [6, 22, 23, 14, 26, 26, 27, 24, 23] // Cantidad de capítulos por temporada
    },
    {
        num: "02",
        id: "tn_noticias",
        nombre: "Canal 02: TN (Todo Noticias) en Vivo",
        desc: "Señal de noticias Todo Noticias las 24 horas.",
        player: "youtube_live",
        youtubeUrl: "https://www.youtube.com/embed/live_stream?channel=UC42220pI3A94_U-T2o4E_lA&autoplay=1"
    },
    {
        num: "03",
        id: "c5n_noticias",
        nombre: "Canal 03: C5N Noticias en Vivo",
        desc: "Señal de noticias 24 horas en directo.",
        player: "youtube_live",
        youtubeUrl: "https://www.youtube.com/embed/live_stream?channel=UC42220pI3A94_U-T2o4E_lA&autoplay=1"
    },
    {
        num: "04",
        id: "friends",
        nombre: "Canal 04: Friends 24/7",
        desc: "Transmisión continua de Friends.",
        imdb: "tt0108778",
        player: "moviesapi",
        duracionMin: 22,
        temporadas: [24, 24, 25, 24, 24, 25, 24, 24, 24, 18]
    },
    {
        num: "05",
        id: "strangerthings",
        nombre: "Canal 05: Stranger Things",
        desc: "Emisión continua de Hawkins.",
        imdb: "tt4574334",
        viewKey: "E4YZ5l7meDrqFf0qh7HHF0m57qeUQkDYzkgvlfBtzcY",
        player: "vimeus_serie",
        duracionMin: 50,
        temporadas: [8, 9, 8, 9, 8]
    }
];

let canalActualIndex = 0;
let temporizadorSiguienteCap = null;

// Guardar en memoria el capitulo y temporada actual que se esta reproduciendo
let capActualEstado = { temporada: 1, episodio: 1 };

// FUNCION DE ENCENDIDO INICIAL
function encenderTV() {
    const overlay = document.getElementById("tvOverlay");
    if (overlay) {
        overlay.style.display = "none";
    }
    sintonizarCanal(0);
}

// 1. CALCULAR CAPÍTULO INICIAL SEGÚN LA HORA ACTUAL DEL DÍA
function calcularCapituloInicial(canal) {
    const ahora = new Date();
    const minutosDelDia = (ahora.getHours() * 60) + ahora.getMinutes();
    const bloqueActual = Math.floor(minutosDelDia / canal.duracionMin);

    let listaEpisodios = [];
    canal.temporadas.forEach((totalCaps, indexTemp) => {
        for (let ep = 1; ep <= totalCaps; ep++) {
            listaEpisodios.push({ temporada: indexTemp + 1, episodio: ep });
        }
    });

    const indiceCapitulo = bloqueActual % listaEpisodios.length;
    return listaEpisodios[indiceCapitulo];
}

// 2. AVANZAR AL SIGUIENTE CAPÍTULO DE FORMA SECUENCIAL (Temporada 1 Ep 1 -> Ep 2...)
function obtenerSiguienteCapitulo(canal, tempActual, epActual) {
    const totalCapsEnTemp = canal.temporadas[tempActual - 1];

    // Si aún quedan episodios en esta temporada, pasa al siguiente episodio
    if (epActual < totalCapsEnTemp) {
        return { temporada: tempActual, episodio: epActual + 1 };
    } 
    // Si terminó la temporada, pasa al capítulo 1 de la siguiente temporada
    else if (tempActual < canal.temporadas.length) {
        return { temporada: tempActual + 1, episodio: 1 };
    } 
    // Si terminó toda la serie, vuelve a empezar desde la Temporada 1 Capítulo 1
    else {
        return { temporada: 1, episodio: 1 };
    }
}

// 3. GENERAR URL DEL IFRAME
function obtenerUrlVideo(canal, temp, ep) {
    if (canal.player === "youtube_live") {
        return canal.youtubeUrl;
    } else if (canal.player === "vimeus_serie") {
        return `https://vimeus.com/e/serie?imdb=${canal.imdb}&se=${temp}&ep=${ep}&view_key=${canal.viewKey}&autoplay=1`;
    } else if (canal.player === "moviesapi") {
        return `https://moviesapi.to/tv/${canal.imdb}-${temp}-${ep}?autoplay=1`;
    }
    return "";
}

// 4. DIBUJAR LA LISTA DE CANALES EN EL SIDEBAR
function cargarListaCanales() {
    const lista = document.getElementById("channelList");
    if (!lista) return;
    lista.innerHTML = "";

    seriesTV.forEach((canal, index) => {
        const li = document.createElement("li");
        li.className = `channel-item ${index === canalActualIndex ? 'active' : ''}`;
        li.onclick = () => sintonizarCanal(index);

        li.innerHTML = `
            <span class="channel-badge">${canal.num}</span>
            <div class="channel-details">
                <h4>${canal.nombre}</h4>
                <span>${canal.desc}</span>
            </div>
        `;
        lista.appendChild(li);
    });
}

// 5. SINTONIZAR CANAL Y PROGRAMAR EL CAMBIO AUTOMÁTICO
function sintonizarCanal(index, esSiguienteAutomatico = false) {
    canalActualIndex = index;
    const canal = seriesTV[index];

    let videoUrl = "";
    let textoDetalle = canal.desc;

    // Si es un canal de serie (The Office, Friends, etc.)
    if (canal.player !== "youtube_live") {
        
        // Si el usuario acaba de cambiar de canal, calcula qué capítulo le toca por la hora
        if (!esSiguienteAutomatico) {
            capActualEstado = calcularCapituloInicial(canal);
        } else {
            // Si el capítulo anterior terminó solo, calcula cuál es el SIGUIENTE capítulo
            capActualEstado = obtenerSiguienteCapitulo(canal, capActualEstado.temporada, capActualEstado.episodio);
        }

        videoUrl = obtenerUrlVideo(canal, capActualEstado.temporada, capActualEstado.episodio);
        textoDetalle = `${canal.desc} — Viendo: Temp ${capActualEstado.temporada} | Cap ${capActualEstado.episodio}`;

        // Cancelar temporizadores anteriores
        if (temporizadorSiguienteCap) clearTimeout(temporizadorSiguienteCap);

        // Programar la carga del SIGUIENTE capítulo cuando pase el tiempo del actual (en ms)
        const msParaSiguiente = canal.duracionMin * 60 * 1000;
        
        temporizadorSiguienteCap = setTimeout(() => {
            // Llama a la función avisando que es un pase automático (esSiguienteAutomatico = true)
            sintonizarCanal(canalActualIndex, true);
        }, msParaSiguiente);

    } else {
        // Si es un canal de noticias de YouTube
        videoUrl = obtenerUrlVideo(canal);
        if (temporizadorSiguienteCap) clearTimeout(temporizadorSiguienteCap);
    }

    // Actualizar elementos HTML
    const player = document.getElementById("tvPlayer");
    const titulo = document.getElementById("currentChannelTitle");
    const desc = document.getElementById("currentChannelDesc");

    if (player) player.src = videoUrl;
    if (titulo) titulo.textContent = canal.nombre;
    if (desc) desc.textContent = textoDetalle;

    cargarListaCanales();
}

window.onload = () => {
    cargarListaCanales();
};