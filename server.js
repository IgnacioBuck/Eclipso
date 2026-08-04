const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/proxy', async (req, res) => {
    const streamUrl = req.query.url;

    if (!streamUrl) {
        return res.status(400).send('Error: Falta el parámetro ?url=');
    }

    try {
        const response = await axios({
            method: 'get',
            url: streamUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://google.com',
                'Accept': '*/*'
            },
            timeout: 15000
        });

        // Asignación correcta de encabezados para video
        if (streamUrl.includes('.m3u8')) {
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        } else if (streamUrl.includes('.ts')) {
            res.setHeader('Content-Type', 'video/mp2t');
        }

        response.data.pipe(res);

    } catch (error) {
        console.error('Error cargando la señal:', error.message);
        res.status(500).send('Error al conectar con la transmisión');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy listo en: http://localhost:${PORT}`);
});