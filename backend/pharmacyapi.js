const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

app.get('/getpharmacies', async (req, res) => {
    try {
        const response = await fetch('bursa veri platformu nobet-eczane veri seti urlsi');

        if (!response.ok) {
            throw new Error('Veri alınamadı');
        }

        const rawData = await response.text();
        const cleanedData = rawData.trim();
		
        const jsonData = JSON.parse(cleanedData);

        res.json(jsonData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

const PORT = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`API dinleniyor: http://localhost:${port}`);
});
