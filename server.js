const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Naya Hardcoded Headers Data (Aapka diya hua naya JSON)
const HARDCODED_PREMIUM_DATA = {
    "authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InhRTUNIZ0JpVlg3NVliYkZBNmNoZ3ciLCJ0eXAiOiJKV1QifQ.eyJhbm9ueW1vdXNfaWQiOiIwODVmNjQxOS05YjkzLTRkNmEtYWQ5Mi00Y2VhMmQwZjllZTAiLCJiZW5lZml0cyI6WyJjYXRhbG9nIiwiY29uY3VycmVudF9zdHJlYW1zLjQiLCJjcl9iZW50byIsImNyX2Zhbl9wYWNrIiwiY3JfcHJlbWl1bSIsIm5vX2FkcyIsIm9mZmxpbmVfdmlld2luZyIsInNpbXVsY2FzdCJdLCJjbGllbnRfaWQiOiJjcl9hbmRyb2lkIiwiY2xpZW50X3RhZyI6IjMuMTE3LjAiLCJjb3VudHJ5IjoiSU4iLCJkZXZpY2VfaWQiOiJlZmVkYTM1My0xY2M0LTRiMDEtYjQzYi02NzNlYWZlMmUyZGUiLCJldHBfdXNlcl9pZCI6ImJiMzhhNWM3LWIyM2UtNTg2Ny05OWQ4LThiYjVmZTk2ZDdiNyIsImV4cCI6MTc4OTMyODgyMSwiZXh0ZW5kZWRfbWF0dXJpdHkiOnsiQVUiOiJSIDE4KyIsIkJSIjoiMTgiLCJJTiI6IkEiLCJLUiI6IjE5IiwiVU4iOiIxOCJ9LCJqdGkiOiI1MjAyY2Q0ZS0wMzRjLTQyNWEtOGIxOC1hNTZiM2U0NDQyYTUiLCJtYXR1cml0eSI6Ik0zIiwib2F1dGhfc2NvcGVzIjoiYWNjb3VudCBjb250ZW50IG1wIG9mZmxpbmVfYWNjZXNzIHBpbnMgcmV2aWV3cyB0YWxrYm94IHRlZW4tcHJvZmlsZSIsInByb2ZpbGVfaWQiOiJiYjM4YTVjNy1iMjNlLTU4NjctOTlkOC04YmI1ZmU5NmQ3YjciLCJwcm9maWxlX3R5cGUiOiJhZ2dyZXRzdWtvIiwicnRfaWQiOiJkYWpmb3R2aWZlaHZ1bmk5MjF1MCIsInNjb3BlcyI6eyJjciI6eyJhY2NfaWQiOiJiYjM4YTVjNy1iMjNlLTU4NjctOTlkOC04YmI1ZmU5NmQ3YjciLCJleHRfaWQiOiIxMjk0NzkxNDQ3In19LCJzdGF0dXOiOiJBQ1RJVkUiLCJ0bnQiOiJjciJ9.PK0faYf5FSkFS2Kd6FnTfMWnuLw957fH1ekSV1NTULgU1IlHe8TCa_6D3aPv4Mv80V0c_WnW8CbjIR1NFHG4rdMCtQmqI1OXO4Sk60pl0bcNrycaFtqQBRh5CaWqPTF4tQKC8frzjKc5OeJVYv7hP1er08Glet-visDNwNROCLAIWlZIlBNrP8CO85QMQn0AXy8BAIx7XSYhVS6bnFbBduqB_LlmyRTyYQVSdIRqfDpkgOkCoW1g6aHOu0FOEnD08j0RVduLtgRteocptcrx9ULbXZLxwhoFSNNZD4X9LT8CohlWlG5DfsEG38YF52mGpzp-DnpTuUqnjicR1jYlWw",
    "x-datadog-trace-id": "870665372041602390",
    "x-datadog-parent-id": "6260967113834424644",
    "x-datadog-origin": "rum",
    "x-datadog-tags": "_dd.p.tid=6aa6fc8900000000,_dd.p.rsid=52c7918d-4da3-4503-a1ec-43f12e19a823",
    "x-datadog-sampling-priority": "1",
    "traceparent": "00-6aa6fc89000000000c15398afac5e556-56e36c6b0280e944-01",
    "tracestate": "dd=s:1;p:56e36c6b0280e944;o:rum;t.rsid:52c7918d-4da3-4503-a1ec-43f12e19a823",
    "etp-anonymous-id": "085f6419-9b93-4d6a-ad92-4cea2d0f9ee0",
    "accept-encoding": "gzip",
    "cookie": "__cf_bm=vqUgjzQLGQFyF1FJcj3NQTxtQETjUQd_A7J7t5dSbNE-1789328478.814273-1.0.1.1-nFD2QAd3an7O0_wB_Glcqvd2bu2EsRD4m55Odkqep6njwsbHLcYlwWh9.0MLdNNdhTEJFecgcKNiJ4uSmwGrQLS_vXunC4F3l7KjuH_dtVuAW83osrvpGlASFN92jr1B3hWzCZcD.Q5bA8OwZwSOSA; cr_exp=bb38a5c7-b23e-5867-99d8-8bb5fe96d7b7bb38a5c7-b23e-5867-99d8-8bb5fe96d7b7; __cf_bm=iL8LSVZKQlwzbFYMsgWQgJKiC0G4ejYcvjpNthZV4vo-1789328478.1901655-1.0.1.1-DE7zonEYbhqrfa7HLV6SLnqfbAXPNo13Fns2ejoOqBsaApCBOJa7MiecL0Ophl1LFXUG5ejIGCglH.k1lzQAc7Pu0unUo3QBEMvQs0S8dYlXe2zLol1YocnnmUSBbs80OgcJfdNHtJR4SFEgWbzZUQ",
    "if-modified-since": "Sun, 13 Sep 2026 19:41:50 GMT",
    "user-agent": "Crunchyroll/3.117.0 Android/16 okhttp/5.3.2"
};

const ORIGINAL_SERVER_URL = "https://www.crunchyroll.com";

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
            'host': 'www.crunchyroll.com'
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
