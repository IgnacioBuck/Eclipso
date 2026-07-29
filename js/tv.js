const seriesTV = [
    {
        num: "01",
        id: "theoffice",
        nombre: "Canal 01: The Office 24/7",
        desc: "Maratón ininterrumpido de The Office.",
        imdb: "tt0386676",
        viewKey: "E4YZ5l7meDrqFf0qh7HHF0m57qeUQkDYzkgvlfBtzcY",
        player: "vimeus_serie",
        duracionMin: 22,
        temporadas: [6, 22, 23, 14, 26, 26, 27, 24, 23]
    },
    {
        num: "02",
        id: "tn_noticias",
        nombre: "Canal 02: TN (Todo Noticias) en Vivo",
        desc: "Señal de noticias Todo Noticias las 24 horas.",
        player: "youtube_live",
        youtubeUrl: "https://www.youtube.com/embed/cb12KmMMDJA?autoplay=1"
    },
    {
        num: "03",
        id: "c5n_noticias",
        nombre: "Canal 03: C5N Noticias en Vivo",
        desc: "Señal de noticias 24 horas en directo.",
        player: "youtube_live",
        youtubeUrl: "https://www.youtube.com/embed/A4yjB85WbEo?autoplay=1"
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

// FUNCION DE ENCENDIDO INICIAL
function encenderTV() {
    const overlay = document.getElementById("tvOverlay");
    if (overlay) {
        overlay.style.display = "none";
    }
    sintonizarCanal(0);
}

// 1. CALCULAR CAPÍTULO ACTUAL SEGÚN LA HORA DEL RELOJ
function calcularCapituloActual(canal) {
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

// 2. GENERAR URL DEL IFRAME
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

// 3. DIBUJAR LA LISTA DE CANALES EN EL SIDEBAR
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

// 4. SINTONIZAR CANAL
function sintonizarCanal(index) {
    canalActualIndex = index;
    const canal = seriesTV[index];

    let videoUrl = "";
    let textoDetalle = canal.desc;

    if (canal.player !== "youtube_live") {
        const capInfo = calcularCapituloActual(canal);
        videoUrl = obtenerUrlVideo(canal, capInfo.temporada, capInfo.episodio);
        textoDetalle = `${canal.desc} — Viendo: Temp ${capInfo.temporada} | Cap ${capInfo.episodio}`;

        if (temporizadorSiguienteCap) clearTimeout(temporizadorSiguienteCap);
        const msParaSiguiente = canal.duracionMin * 60 * 1000;
        temporizadorSiguienteCap = setTimeout(() => {
            sintonizarCanal(canalActualIndex);
        }, msParaSiguiente);
    } else {
        videoUrl = obtenerUrlVideo(canal);
        if (temporizadorSiguienteCap) clearTimeout(temporizadorSiguienteCap);
    }

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