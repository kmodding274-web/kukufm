const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const app = express();

app.use(express.json());

const TOKEN_FILE = path.join(__dirname, 'saved_token.json');

let savedHeaders = {};
if (fs.existsSync(TOKEN_FILE)) {
    try {
        const data = fs.readFileSync(TOKEN_FILE, 'utf8');
        savedHeaders = JSON.parse(data);
        console.log("[Server 1] Purane saved headers successfully load ho gaye hain.");
    } catch (e) {
        console.log("[Server 1] File read karne mein error aaya.");
    }
}

// Dynamic Auto Update: Kisi bhi app ke saare headers automatically capture karke save karega
function autoUpdateHeaders(incomingHeaders) {
    try {
        const currentTimestamp = Math.floor(Date.now() / 1000).toString();

        // Har incoming header ko dynamically capture karein
        savedHeaders = {
            ...savedHeaders,      // Purane valid headers
            ...incomingHeaders,   // Kisi bhi app se aane wale naye saare headers
            'ts': currentTimestamp
        };

        // Standard proxy conflicts se bachne ke liye extra headers clean karein
        delete savedHeaders['host'];
        delete savedHeaders['content-length'];

        fs.writeFileSync(TOKEN_FILE, JSON.stringify(savedHeaders, null, 2));
        console.log("[Server 1] Naye incoming headers automatically save ho gaye hain!");
    } catch (e) {
        console.error("[Server 1] Headers update karte waqt error:", e.message);
    }
}

app.get('/get-token-file', (req, res) => {
    try {
        if (fs.existsSync(TOKEN_FILE)) {
            res.sendFile(TOKEN_FILE);
        } else {
            res.status(404).json({ error: "File abhi bani nahi hai!" });
        }
    } catch (e) {
        res.status(500).json({ error: "File bhejne mein error aaya" });
    }
});

const ORIGINAL_SERVER_URL = "https://ad.drxmas.online";

app.all('*', async (req, res, next) => {
    if (req.path === '/get-token-file') return next();

    try {
        console.log(`[Server 1] Request aayi: ${req.method} ${req.url}`);

        // Kisi bhi app ki request aate hi uske headers automatically capture honge
        autoUpdateHeaders(req.headers);

        const targetUrl = `${ORIGINAL_SERVER_URL}${req.url}`;
        const currentTimestamp = Math.floor(Date.now() / 1000).toString();
        
        const finalHeaders = {
            ...savedHeaders,
            'host': 'ad.drxmas.online',
            'ts': currentTimestamp
        };

        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: finalHeaders,
            data: req.body,
            validateStatus: () => true 
        });

        res.status(response.status).json(response.data);

    } catch (error) {
        res.status(500).json({ error: "Server 1 Proxy Error", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server 1 running on port ${PORT}`));
