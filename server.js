const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: '*/*' }));

// Local token.json ka path
const TOKEN_FILE_PATH = path.join(__dirname, 'token.json');

// Updated Premium Headers (Naye Basic Auth aur Datadog details ke saath)
const HARDCODED_PREMIUM_DATA = {
    "authorization": "Basic c3Z2MHkyZWV4aW53c25rbGhwbW86WGhBYkVwZE92LUhpaHFsWHVzYUY0TENKMEFsMm1DbkE=",
    "x-datadog-trace-id": "234403364880216080",
    "x-datadog-parent-id": "207278277123603508",
    "x-datadog-origin": "rum",
    "x-datadog-tags": "_dd.p.tid=6aa6fc8800000000,_dd.p.rsid=52c7918d-4da3-4503-a1ec-43f12e19a823",
    "x-datadog-sampling-priority": "0",
    "traceparent": "00-6aa6fc88000000000340c49e51d77010-207278277123603508-00",
    "tracestate": "dd=p:207278277123603508;s:0;o:rum",
    "etp-anonymous-id": "085f6419-9b93-4d6a-ad92-4cea2d0f9ee0",
    "content-type": "application/x-www-form-urlencoded",
    "accept-encoding": "gzip",
    "cookie": "__cf_bm=vqUgjzQLGQFyF1FJcj3NQTxtQETjUQd_A7J7t5dSbNE-1789328478.814273-1.0.1.1-nFD2QAd3an7O0_wB_Glcqvd2bu2EsRD4m55Odkqep6njwsbHLcYlwWh9.0MLdNNdhTEJFecgcKNiJ4uSmwGrQLS_vXunC4F3l7KjuH_dtVuAW83osrvpGlASFN92jr1B3hWzCZcD.Q5bA8OwZwSOSA; cr_exp=bb38a5c7-b23e-5867-99d8-8bb5fe96d7b7bb38a5c7-b23e-5867-99d8-8bb5fe96d7b7; __cf_bm=iL8LSVZKQlwzbFYMsgWQgJKiC0G4ejYcvjpNthZV4vo-1789328478.1901655-1.0.1.1-DE7zonEYbhqrfa7HLV6SLnqfbAXPNo13Fns2ejoOqBsaApCBOJa7MiecL0Ophl1LFXUG5ejIGCglH.k1lzQAc7Pu0unUo3QBEMvQs0S8dYlXe2zLol1YocnnmUSBbs80OgcJfdNHtJR4SFEgWbzZUQ",
    "user-agent": "Crunchyroll/3.117.0 Android/16 okhttp/5.3.2"
};

const HARDCODED_REFRESH_BODY = "refresh_token=9572f80f-4d20-4b4a-b35f-e60d6618991d&grant_type=refresh_token&scope=offline_access&device_id=85b7fea8-707a-4848-872e-a1729babc3bd&device_name=I2407&device_type=Motorola+Moto+G60";

const ORIGINAL_SERVER_URL = "https://www.crunchyroll.com";

app.get('/ping', (req, res) => {
    res.status(200).send("Server is alive and running!");
});

app.all('*', async (req, res) => {
    if (req.url === '/ping') return;

    try {
        console.log(`[Proxy] Request: ${req.method} ${req.url}`);

        let payloadData = req.body;
        let reqHeaders = { ...HARDCODED_PREMIUM_DATA };

        // 1. App se aane wali body ko URL Encoded String me convert karo
        if (typeof payloadData === 'object' && payloadData !== null) {
            payloadData = querystring.stringify(payloadData);
        }

        // 2. Token request par body payload setting
        if (req.method === 'POST' && req.url.includes('/auth/v1/token')) {
            payloadData = HARDCODED_REFRESH_BODY;
        }

        // 3. Crunchyroll Real Server call
        const response = await axios({
            method: req.method,
            url: `${ORIGINAL_SERVER_URL}${req.url}`,
            headers: reqHeaders,
            data: payloadData,
            validateStatus: () => true 
        });

        // 4. Token reply ko intercept karke token.json return karna
        if (req.url.includes('/auth/v1/token')) {
            console.log(`[Token Request] Real server code: ${response.status}. Forwarding token.json to App.`);

            return fs.readFile(TOKEN_FILE_PATH, 'utf8', (err, data) => {
                if (err) {
                    console.error("[Error] token.json nahi mili:", err);
                    return res.status(500).json({ error: "Local token.json missing" });
                }

                try {
                    const jsonData = JSON.parse(data);
                    res.setHeader('Content-Type', 'application/json');
                    return res.status(200).json(jsonData);
                } catch (jsonErr) {
                    console.error("[Error] Invalid JSON syntax in token.json:", jsonErr);
                    return res.status(500).json({ error: "Invalid JSON in token.json" });
                }
            });
        }

        // Send regular response for other routes
        res.status(response.status).send(response.data);

    } catch (error) {
        res.status(500).json({ error: "Proxy Error", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy Server running on port ${PORT}`);

    const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    
    setInterval(() => {
        axios.get(`${SELF_URL}/ping`)
            .then(() => console.log("[Anti-Sleep] Ping sent successfully!"))
            .catch(() => {});
    }, 300000);
});
