// DICCIONARIO DE SERIES Y CANALES EN VIVO
const seriesTV = [
    {
        num: "01",
        id: "theoffice",
        nombre: "Canal 01: The Office 24/7",
        desc: "Maratón ininterrumpido y aleatorio de The Office.",
        imdb: "tt0386676",
        viewKey: "E4YZ5l7meDrqFf0qh7HHF0m57qeUQkDYzkgvlfBtzcY",
        player: "vimeus_serie",
        duracionMin: 22,
        // Lista con la cantidad de episodios de cada temporada (Temporada 1 a 9)
        temporadas: [6, 22, 23, 14, 26, 26, 27, 24, 23] 
    },
    {
        num: "02",
        id: "c5n_noticias",
        nombre: "Canal 02: C5N Noticias en Vivo",
        desc: "Señal de noticias 24 horas en directo.",
        player: "hls_stream",
        streamUrl: "https://canales-tvs.github.io/C5N/index.m3u8"
    },
    {
        num: "03",
        id: "tn_noticias",
        nombre: "Canal 03: TN (Todo Noticias) en Vivo",
        desc: "Señal de noticias Todo Noticias las 24 horas.",
        player: "hls_stream",
        streamUrl: "https://canales-tvs.github.io/TN/index.m3u8"
    },
    {
        num: "04",
        id: "friends",
        nombre: "Canal 04: Friends 24/7",
        desc: "Transmisión aleatoria de Friends.",
        imdb: "tt0108778",
        player: "moviesapi",
        duracionMin: 22,
        temporadas: [24, 24, 25, 24, 24, 25, 24, 24, 24, 18]
    }
];

let canalActualIndex = 0;
let temporizadorSiguienteCap = null;
let capActualEstado = { temporada: 1, episodio: 1 };
let hlsInstance = null;

// FUNCION DE ENCENDIDO INICIAL
function encenderTV() {
    const overlay = document.getElementById("tvOverlay");
    if (overlay) overlay.style.display = "none";
    sintonizarCanal(0);
}

// 1. GENERAR UN EPISODIO COMPLETAMENTE ALEATORIO
function obtenerCapituloAleatorio(canal) {
    // 1. Seleccionar una temporada al azar (1 a N)
    const totalTemporadas = canal.temporadas.length;
    const tempRandomIndex = Math.floor(Math.random() * totalTemporadas);
    const temporadaElegida = tempRandomIndex + 1;

    // 2. Seleccionar un episodio al azar dentro de esa temporada
    const totalEpisodiosEnTemp = canal.temporadas[tempRandomIndex];
    const episodioElegido = Math.floor(Math.random() * totalEpisodiosEnTemp) + 1;

    return {
        temporada: temporadaElegida,
        episodio: episodioElegido
    };
}

// 2. GENERAR URL DEL IFRAME SEGÚN EL SERVIDOR DE LA SERIE
function obtenerUrlVideo(canal, temp, ep) {
    if (canal.player === "vimeus_serie") {
        return `https://vimeus.com/e/serie?imdb=${canal.imdb}&se=${temp}&ep=${ep}&view_key=${canal.viewKey}&autoplay=1`;
    } else if (canal.player === "moviesapi") {
        return `https://moviesapi.to/tv/${canal.imdb}-${temp}-${ep}?autoplay=1`;
    }
    return "";
}

// 3. CARGAR LISTA DE CANALES EN EL SIDEBAR
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

// 4. SINTONIZAR CANAL Y PROGRAMAR EL PRÓXIMO EPISODIO ALEATORIO
function sintonizarCanal(index) {
    canalActualIndex = index;
    const canal = seriesTV[index];

    const iframePlayer = document.getElementById("tvPlayer");
    const hlsPlayer = document.getElementById("hlsPlayer");
    const titulo = document.getElementById("currentChannelTitle");
    const desc = document.getElementById("currentChannelDesc");

    // Limpiar reproducciones y temporizadores anteriores
    if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
    }
    if (temporizadorSiguienteCap) clearTimeout(temporizadorSiguienteCap);

    // --- CASO CANALES DE TRANSMISIÓN DIRECTA (.m3u8 / Noticias) ---
    if (canal.player === "hls_stream") {
        if (iframePlayer) {
            iframePlayer.style.display = "none";
            iframePlayer.src = "";
        }
        if (hlsPlayer) {
            hlsPlayer.style.display = "block";
            if (Hls.isSupported()) {
                hlsInstance = new Hls();
                hlsInstance.loadSource(canal.streamUrl);
                hlsInstance.attachMedia(hlsPlayer);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => hlsPlayer.play());
            } else if (hlsPlayer.canPlayType('application/vnd.apple.mpegurl')) {
                hlsPlayer.src = canal.streamUrl;
                hlsPlayer.play();
            }
        }

        if (titulo) titulo.textContent = canal.nombre;
        if (desc) desc.textContent = canal.desc;
    } 
    // --- CASO SERIES EN VIVO (The Office, Friends, etc.) ---
    else {
        if (hlsPlayer) {
            hlsPlayer.style.display = "none";
            hlsPlayer.pause();
        }
        if (iframePlayer) iframePlayer.style.display = "block";

        // Obtener un capítulo COMPLETAMENTE ALEATORIO cada vez que sintoniza o termina el anterior
        capActualEstado = obtenerCapituloAleatorio(canal);

        const videoUrl = obtenerUrlVideo(canal, capActualEstado.temporada, capActualEstado.episodio);
        if (iframePlayer) iframePlayer.src = videoUrl;

        if (titulo) titulo.textContent = canal.nombre;
        if (desc) desc.textContent = `${canal.desc} — Viendo: Temp ${capActualEstado.temporada} | Cap ${capActualEstado.episodio}`;

        // Programar el cambio automático aleatorio al terminar los minutos asignados (ej. 22 min)
        const msParaSiguiente = canal.duracionMin * 60 * 1000;
        temporizadorSiguienteCap = setTimeout(() => {
            sintonizarCanal(canalActualIndex); // Vuelve a ejecutar la función y elige un nuevo capítulo aleatorio
        }, msParaSiguiente);
    }

    cargarListaCanales();
}

window.onload = () => {
    cargarListaCanales();
};