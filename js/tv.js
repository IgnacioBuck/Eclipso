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
                // 1. Si la petición ya viene formateada hacia nuestro proxy, no tocamos nada
                if (url.startsWith(PROXY_SERVER)) {
                    return;
                }

                let targetUrl = url;

                // 2. Resolvemos URLs relativas o locales contra la URL real del stream original
                try {
                    // Si no empieza con http:// o https:// (ej: rutas relativas o absolutas locales)
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        targetUrl = new URL(url, urlOriginalCanal).href;
                    } 
                    // Si el navegador intentó resolver la ruta contra el dominio actual (localhost, render, etc.)
                    else if (url.includes(window.location.host)) {
                        const cleanPath = url.replace(window.location.origin, '');
                        targetUrl = new URL(cleanPath, urlOriginalCanal).href;
                    }
                } catch (e) {
                    console.error("Error al resolver la URL del segmento:", e);
                }

                // 3. Redirigimos la petición al proxy con la URL destino bien construida
                const proxiedUrl = PROXY_SERVER + encodeURIComponent(targetUrl);
                xhr.open('GET', proxiedUrl, true);
            }
        });

        // Carga inicial del manifiesto
        const initialUrl = PROXY_SERVER + encodeURIComponent(urlOriginalCanal);
        hlsInstance.loadSource(initialUrl);
        hlsInstance.attachMedia(video);

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(e => console.log("Autoplay bloqueado por el navegador:", e));
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