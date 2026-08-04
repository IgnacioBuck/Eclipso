const PROXY_SERVER = 'https://eclipso.onrender.com/proxy?url=';
let hlsInstance = null;

function reproducirCanal(urlOriginalCanal) {
    const video = document.getElementById('tv-player');

    if (hlsInstance) {
        hlsInstance.destroy();
    }

    if (Hls.isSupported()) {
        hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            xhrSetup: function (xhr, url) {
                // 1. Si la URL ya pasó por el proxy, la dejamos como está
                if (url.startsWith(PROXY_SERVER)) {
                    return;
                }

                let finalUrl = url;

                // 2. Si HLS armó una URL relativa hacia localhost:3000, le devolvemos su dominio de origen real
                if (url.includes('localhost:3000') || !url.startsWith('http')) {
                    try {
                        // Extraemos la ruta relativa limpia
                        const cleanPath = url.replace(/https?:\/\/localhost:3000\/?/, '');
                        // Resolvemos la URL completa con respecto a la URL original del canal
                        finalUrl = new URL(cleanPath, urlOriginalCanal).href;
                    } catch (e) {
                        console.error("Error al resolver la URL del fragmento:", e);
                    }
                }

                // 3. Abrimos la petición apuntando al proxy con la URL de origen real corregida
                const proxiedUrl = PROXY_SERVER + encodeURIComponent(finalUrl);
                xhr.open('GET', proxiedUrl, true);
            }
        });

        // Cargamos la URL del proxy para el manifiesto principal
        const initialUrl = PROXY_SERVER + encodeURIComponent(urlOriginalCanal);
        hlsInstance.loadSource(initialUrl);
        hlsInstance.attachMedia(video);

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(e => console.log("Autoplay bloqueado:", e));
        });

        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
                console.error("Error fatal en HLS:", data);
            }
        });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = PROXY_SERVER + encodeURIComponent(urlOriginalCanal);
        video.addEventListener('loadedmetadata', function () {
            video.play();
        });
    } else {
        alert("Tu navegador no soporta HLS.");
    }
}