// DICCIONARIO DE CANALES Y SERIES
const seriesTV = [
    {
        num: "01",
        id: "theoffice",
        nombre: "Canal 01: The Office 24/7",
        desc: "Maratón ininterrumpido y aleatorio de The Office.",
        imdb: "tt0386676",
        viewKey: "E4YZ5l7meDrqFf0qh7HHF0m57qeUQkDYzkgvlfBtzcY",
        player: "vimeus_serie",
        duracionMin: 20,
        temporadas: [6, 22, 23, 14, 26, 26, 27, 24, 23]
    },
    {
        num: "02",
        id: "c5n_noticias",
        nombre: "Canal 02: C5N Noticias en Vivo",
        desc: "Señal de noticias 24 horas en directo.",
        player: "iframe_stream",
        // Embed oficial directo de la transmisión de C5N
        streamUrl: "https://www.youtube-nocookie.com/embed/live_stream?channel=UC42220pI3A94_U-T2o4E_lA&autoplay=1&mute=1"
    },
    {
        num: "03",
        id: "tn_noticias",
        nombre: "Canal 03: TN (Todo Noticias) en Vivo",
        desc: "Señal de noticias Todo Noticias las 24 horas.",
        player: "iframe_stream",
        // Embed oficial directo de la transmisión de TN
        streamUrl: "https://www.youtube-nocookie.com/embed/live_stream?channel=UC913L1lB2LscTfP_y0_uX4g&autoplay=1&mute=1"
    },
    {
        num: "04",
        id: "friends",
        nombre: "Canal 04: Friends 24/7",
        desc: "Transmisión aleatoria de Friends.",
        imdb: "tt0108778",
        player: "moviesapi",
        duracionMin: 20,
        temporadas: [24, 24, 25, 24, 24, 25, 24, 24, 24, 18]
    }
];

let canalActualIndex = 0;
let temporizadorSiguienteCap = null;

// FUNCION DE ENCENDIDO INICIAL
function encenderTV() {
    const overlay = document.getElementById("tvOverlay");
    if (overlay) overlay.style.display = "none";
    sintonizarCanal(0);
}

// GENERAR EPISODIO ALEATORIO PARA SERIES
function obtenerCapituloAleatorio(canal) {
    const totalTemporadas = canal.temporadas.length;
    const tempRandomIndex = Math.floor(Math.random() * totalTemporadas);
    const temporadaElegida = tempRandomIndex + 1;

    const totalEpisodiosEnTemp = canal.temporadas[tempRandomIndex];
    const episodioElegido = Math.floor(Math.random() * totalEpisodiosEnTemp) + 1;

    return { temporada: temporadaElegida, episodio: episodioElegido };
}

// GENERAR URL DEL IFRAME SEGÚN EL TIPO DE REPRODUCTOR
function obtenerUrlVideo(canal) {
    if (canal.player === "vimeus_serie") {
        const cap = obtenerCapituloAleatorio(canal);
        return {
            url: `https://vimeus.com/e/serie?imdb=${canal.imdb}&se=${cap.temporada}&ep=${cap.episodio}&view_key=${canal.viewKey}&autoplay=1`,
            detalle: `Viendo: Temp ${cap.temporada} | Cap ${cap.episodio}`
        };
    } else if (canal.player === "moviesapi") {
        const cap = obtenerCapituloAleatorio(canal);
        return {
            url: `https://moviesapi.to/tv/${canal.imdb}-${cap.temporada}-${cap.episodio}?autoplay=1`,
            detalle: `Viendo: Temp ${cap.temporada} | Cap ${cap.episodio}`
        };
    } else if (canal.player === "iframe_stream") {
        return {
            url: canal.streamUrl,
            detalle: canal.desc
        };
    }
    return { url: "", detalle: "" };
}

// CARGAR LISTA DE CANALES EN EL SIDEBAR
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

// SINTONIZAR CANAL
function sintonizarCanal(index) {
    canalActualIndex = index;
    const canal = seriesTV[index];

    const iframePlayer = document.getElementById("tvPlayer");
    const hlsPlayer = document.getElementById("hlsPlayer");
    const titulo = document.getElementById("currentChannelTitle");
    const desc = document.getElementById("currentChannelDesc");

    // Ocultar reproductor nativo <video> para evitar bloqueos
    if (hlsPlayer) {
        hlsPlayer.style.display = "none";
        hlsPlayer.pause();
    }

    if (temporizadorSiguienteCap) clearTimeout(temporizadorSiguienteCap);

    // Activar Iframe principal
    if (iframePlayer) {
        iframePlayer.style.display = "block";
        const videoData = obtenerUrlVideo(canal);
        iframePlayer.src = videoData.url;

        if (titulo) titulo.textContent = canal.nombre;
        if (desc) desc.textContent = `${canal.desc} — ${videoData.detalle}`;

        // Si es una serie, programar el cambio de capítulo aleatorio
        if (canal.duracionMin) {
            const msParaSiguiente = canal.duracionMin * 60 * 1000;
            temporizadorSiguienteCap = setTimeout(() => {
                sintonizarCanal(canalActualIndex);
            }, msParaSiguiente);
        }
    }

    cargarListaCanales();
}

window.onload = () => {
    cargarListaCanales();
};