const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Purane headers hata kar Naye Crunchyroll Headers add kar diye hain
const HARDCODED_PREMIUM_DATA = {
    "authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InhRTUNIZ0JpVlg3NVliYkZBNmNoZ3ciLCJ0eXAiOiJKV1QifQ.eyJhbm9ueW1vdXNfaWQiOiJlNjZjYTY0MC01MjgxLTQ3ZjEtODRiMC04Y2JlNjdkNGQyZDEiLCJiZW5lZml0cyI6WyJjYXRhbG9nIiwiY29uY3VycmVudF9zdHJlYW1zLjQiLCJjcl9iZW50byIsImNyX2Zhbl9wYWNrIiwiY3JfcHJlbWl1bSIsIm5vX2FkcyIsIm9mZmxpbmVfdmlld2luZyIsInNpbXVsY2FzdCJdLCJjbGllbnRfaWQiOiJjcl9hbmRyb2lkIiwiY2xpZW50X3RhZyI6IjMuMTE3LjAiLCJjb3VudHJ5IjoiSU4iLCJkZXZpY2VfaWQiOiIzYTljYTAzYS1iYzM5LTQ3M2UtYTAyMi1kYmU0YjMyOGI4ZDAiLCJldHBfdXNlcl9pZCI6ImJiMzhhNWM3LWIyM2UtNTg2Ny05OWQ4LThiYjVmZTk2ZDdiNyIsImV4cCI6MTc4OTMyMjgzOSwiZXh0ZW5kZWRfbWF0dXJpdHkiOnsiQVUiOiJSIDE4KyIsIkJSIjoiMTgiLCJJTiI6IkEiLCJLUiI6IjE5IiwiVU4iOiIxOCJ9LCJqdGkiOiJiN2Y0NjdhMC0xN2I5LTRmMDQtOGZhMy00MzhmZjFjNTVhN2QiLCJtYXR1cml0eSI6Ik0zIiwib2F1dGhfc2NvcGVzIjoiYWNjb3VudCBjb250ZW50IG1wIG9mZmxpbmVfYWNjZXNzIHBpbnMgcmV2aWV3cyB0YWxrYm94IHRlZW4tcHJvZmlsZSIsInByb2ZpbGVfaWQiOiJiYjM4YTVjNy1iMjNlLTU4NjctOTlkOC04YmI1ZmU5NmQ3YjciLCJwcm9maWxlX3R5cGUiOiJhZ2dyZXRzdWtvIiwicnRfaWQiOiJkYWplOXV2ZDI5Zm9xcnNucmdtMCIsInNjb3BlcyI6eyJjciI6eyJhY2NfaWQiOiJiYjM4YTVjNy1iMjNlLTU4NjctOTlkOC04YmI1ZmU5NmQ3YjciLCJleHRfaWQiOiIxMjk0NzkxNDQ3In19LCJzdGF0dXMiOiJBQ1RJVkUiLCJ0bnQiOiJjciJ9.HhYQH2K15GwU1fyKFLwXMRdjXa7ibP_edgI3d39vXTUlsx1QnzL-8QYDFJMzja4MRgeG-e7wnpnHT8Dozgi_Te9ifS3jM74BoV1STvln51y6QZsdZEDlKm66zjvQBPJ8Fn-S-Ho6MrryN-ZUpztXDCMox5GsSERI_z_BueoSHmx5JcPB8BEBeu6xjwwi_0Qfz4kvr2XqilFPom7FxL_FwS1LHc18M5kGLCE16ywKH0ss3E6mQcb29T6v-8IYdompapO6iIqKcooWkNIPKMtqRye_lst4glNHVU5HHiGkRjYmN8YRfDgZOJZKizT2puUEeYCxTaGvWqjhFKMgGrxaEA",
    "x-datadog-trace-id": "1899928285740048175",
    "x-datadog-parent-id": "1892452038510320794",
    "x-datadog-origin": "rum",
    "x-datadog-tags": "_dd.p.tid=6aa6e53400000000,_dd.p.rsid=b2013230-6824-4b73-b598-d880497c9c8d",
    "x-datadog-sampling-priority": "0",
    "traceparent": "00-6aa6e534000000001a5de6b5aa409f2f-1892452038510320794-00",
    "tracestate": "dd=p:1892452038510320794;s:0;o:rum",
    "etp-anonymous-id": "e66ca640-5281-47f1-84b0-8cbe67d4d2d1",
    "accept-encoding": "gzip",
    "cookie": "__cf_bm=WijbhyKcDUDAP0CuF2ewwSjfyo25V8QyMqQnW2kCXzE-1789322491.833075-1.0.1.1-oFY6l2TJJEV28XfEHXqPfMhakVQiJS4Kt6uKwy9cnLu1WzdywGBcO_wOFJ7o2MTJt83Mm_M1QT.WBG9Wr8mVaLp.MGzNzYXCutWuemv9EbEh8sQkTGZ4rkChHcit0I0VQ74zKHEnUcq1LHW7k76L7w; cr_exp=bb38a5c7-b23e-5867-99d8-8bb5fe96d7b7bb38a5c7-b23e-5867-99d8-8bb5fe96d7b7; __cf_bm=7rWyyZlsNqtzi6smBlcxWgCKJHERke2N1v962BohTFI-1789322470.4795668-1.0.1.1-z9qbnwqb3AiyQzdMtH.ygARPGOrKMTMiOwD7Fcn5xLV0_G9TiBLBLaJ.5bkQymVVtIpmdZCm6vDMhTBdm48VVboDMwX.eLpzHqRyjeyF_HgARkrlGSo2v_n4HCbcK8nK65S9WKuIgmTkTFVHesAuFQ",
    "user-agent": "Crunchyroll/3.117.0 Android/16 okhttp/5.3.2"
};

const ORIGINAL_SERVER_URL = "https://www.crunchyroll.com";

// Server alive rakhne ke liye health check
app.get('/ping', (req, res) => {
    res.status(200).send("Server is alive and running!");
});

app.all('*', async (req, res) => {
    if (req.url === '/ping') return;

    try {
        console.log(`[Proxy] Request: ${req.method} ${req.url}`);

        const response = await axios({
            method: req.method,
            url: `${ORIGINAL_SERVER_URL}${req.url}`,
            headers: HARDCODED_PREMIUM_DATA,
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
    console.log(`Proxy Server running on port ${PORT}`);

    const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    
    setInterval(() => {
        axios.get(`${SELF_URL}/ping`)
            .then(() => console.log("[Anti-Sleep] Ping sent successfully!"))
            .catch(() => {});
    }, 300000);
});
