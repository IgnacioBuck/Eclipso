export async function handler(event, context) {
    // 1. Manejo de CORS para permitir solicitudes desde cualquier dominio
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    // Responder a las peticiones OPTIONS preflight de los navegadores
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // 2. Extraer la URL original recibida como parámetro ?url=...
    const targetUrl = event.queryStringParameters.url;

    if (!targetUrl) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Falta el parámetro ?url=' })
        };
    }

    try {
        // 3. Hacer la petición al canal IPTV simulando un navegador
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        // 4. Copiar los encabezados de respuesta para enviárselos al reproductor HLS
        const responseHeaders = {
            ...headers,
            'Content-Type': response.headers.get('content-type') || 'application/vnd.apple.mpegurl'
        };

        const bodyData = await response.arrayBuffer();
        const base64Data = Buffer.from(bodyData).toString('base64');

        return {
            statusCode: response.status,
            headers: responseHeaders,
            body: base64Data,
            isBase64Encoded: true
        };
    } catch (error) {
        console.error('Error en el proxy Netlify:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error al conectar con el stream original', detail: error.message })
        };
    }
}