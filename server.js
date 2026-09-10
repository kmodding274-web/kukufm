const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Naya Hardcoded Headers Data (Aapka diya hua naya JSON)
const HARDCODED_PREMIUM_DATA = {
    "Cache-Control": "max-age=5",
    "content-type": "application/json",
    "client-country": "IN",
    "authorization": "jwt eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozOTQzMDcwMzgsImV4cCI6MTc4OTA1MTE5MCwic3ViX3Byb2ZpbGVfaWQiOjgxODI5MTQ5LCJ1bmlxdWVfaWQiOiI5MDg1Y2IzZi0xZTI0LTQzYmQtOGY3NS1jZWExMzFmMzNiMjMifQ.3fIZrZmP08g8gOeNpM7IByGlQ933YncBqWDR4x6t1vc5ykppFNSvnz1V1H5hpwUvE-dtI2EXzcUgraObCvh3IA",
    "install-source": "google_play",
    "lang": "english",
    "app-version": "50907",
    "user-agent": "kukufm-android-reels/5.9.7",
    "package-name": "com.vlv.aravali.reels",
    "build-number": "5090701",
    "os-version": "36",
    "accept-encoding": "gzip"
};

const ORIGINAL_SERVER_URL = "https://api.kukufm.com";

// Server zinda rakhne ke liye health check route
app.get('/ping', (req, res) => {
    res.status(200).send("Server is alive and running!");
});

app.all('*', async (req, res) => {
    if (req.url === '/ping') return;

    try {
        console.log(`[Proxy] Request aayi: ${req.method} ${req.url}`);

        const finalHeaders = {
            ...HARDCODED_PREMIUM_DATA,
            'host': 'api.kukufm.com'
        };

        const targetUrl = `${ORIGINAL_SERVER_URL}${req.url}`;

        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: finalHeaders,
            data: req.body,
            validateStatus: () => true 
        });

        res.status(response.status).json(response.data);

    } catch (error) {
        res.status(500).json({ error: "Proxy Error", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Hardcoded Proxy Server running on port ${PORT}`);

    // Self-Ping: Har 5 minute mein khud ke server ko request bhejega taaki sleep na ho
    const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    
    setInterval(() => {
        axios.get(`${SELF_URL}/ping`)
            .then(() => console.log("[Anti-Sleep] Self-ping sent successfully!"))
            .catch(() => {}); // Error ignore karne ke liye
    }, 300000); // 300,000 ms = 5 minutes
});
