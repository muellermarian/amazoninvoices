import dotenv from "dotenv";
dotenv.config();

import express from "express";
import axios from "axios";
import fetch, { Headers } from "node-fetch";

axios.defaults.headers.common["User-Agent"] = "MyApp/1.0";

const app = express();
app.use(express.json());

const {
  AMAZON_CLIENT_ID,
  AMAZON_CLIENT_SECRET,
  AMAZON_REFRESH_TOKEN,
  AMAZON_API_BASE_URL = "https://eu.business-api.amazon.com",
} = process.env;

if (!AMAZON_CLIENT_ID || !AMAZON_CLIENT_SECRET || !AMAZON_REFRESH_TOKEN) {
  throw new Error("Missing Amazon API credentials");
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }
  if (!AMAZON_REFRESH_TOKEN || !AMAZON_CLIENT_ID || !AMAZON_CLIENT_SECRET) {
    throw new Error("Missing Amazon API credentials");
  }
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", AMAZON_REFRESH_TOKEN);
  params.append("client_id", AMAZON_CLIENT_ID);
  params.append("client_secret", AMAZON_CLIENT_SECRET);

  const response = await axios.post(
    "https://api.amazon.com/auth/o2/token",
    params,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
  );

  cachedToken = response.data.access_token;
  tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;
  return cachedToken;
}
// OAuth Callback
app.get("/callback", (req, res) => {
  const { code, error } = req.query;
  if (error) {
    return res.send(
      `❌ Error: ${typeof error === "object" ? JSON.stringify(error) : error}`,
    );
  }
  res.send(`
    <h1>✅ Code erhalten!</h1>
    <p><strong>Code:</strong> ${typeof code === "object" ? JSON.stringify(code) : code}</p>
    <p>Kopiere diesen Code und sende:</p>
    <pre>curl -X POST https://deine-app.vercel.app/api/exchange-code \\
  -H "Content-Type: application/json" \\
  -d '{"code": "${typeof code === "object" ? JSON.stringify(code) : code}"}'</pre>
  `);
});

// Token Exchange
app.post("/api/exchange-code", async (req, res) => {
  try {
    const { code } = req.body;
    if (!AMAZON_CLIENT_ID || !AMAZON_CLIENT_SECRET) {
      throw new Error("Missing Amazon API credentials");
    }
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", String(code));
    params.append("client_id", AMAZON_CLIENT_ID);
    params.append("client_secret", AMAZON_CLIENT_SECRET);

    const tokenResponse = await axios.post(
      "https://api.amazon.com/auth/o2/token",
      params,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    res.json({
      refresh_token: tokenResponse.data.refresh_token,
      message: "Speichere refresh_token in .env!",
    });
  } catch (err: any) {
    res
      .status(500)
      .json({
        error:
          err?.response?.data ||
          (err instanceof Error ? err.message : String(err)),
      });
  }
});

// Create Report
app.post("/api/reports/create", async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("No access token available");
    const headers = new Headers();
    headers.append("x-amz-access-token", accessToken);
    headers.append("Content-Type", "application/json");
    headers.append("User-Agent", "MyApp/1.0");

    const reportBody = {
      reportType: "AB_PURCHASE_RECONCILIATION_REPORT",
      marketplaceIds: ["A1RKKUPIHCS9HS"],
    };

    const url = `${AMAZON_API_BASE_URL}/reports/2021-09-30/reports`;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(reportBody),
    });

    const data: any = await response.json();
    if (!response.ok) {
      throw new Error(`Status ${response.status}: ${JSON.stringify(data)}`);
    }

    res.json({ reportId: data.reportId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Report Status
app.get("/api/reports/status/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params;
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("No access token available");
    const headers = new Headers();
    headers.append("x-amz-access-token", accessToken);

    const url = `${AMAZON_API_BASE_URL}/reports/2021-09-30/reports/${reportId}`;
    const response = await fetch(url, { method: "GET", headers });
    const data: any = await response.json();

    if (!response.ok) {
      throw new Error(`Status ${response.status}: ${JSON.stringify(data)}`);
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
// Report Download
app.get("/api/reports/download/:reportDocumentId", async (req, res) => {
  try {
    const { reportDocumentId } = req.params;
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("No access token available");
    const headers = new Headers();
    headers.append("x-amz-access-token", accessToken);

    const url = `${AMAZON_API_BASE_URL}/reports/2021-09-30/documents/${reportDocumentId}`;
    const response = await fetch(url, { method: "GET", headers });
    const data: any = await response.json();

    if (!response.ok) {
      throw new Error(`Status ${response.status}: ${JSON.stringify(data)}`);
    }

    const downloadUrl = data.url;
    const downloadResponse = await fetch(downloadUrl);
    const csvContent = await downloadResponse.text();

    res.set("Content-Type", "text/csv");
    res.set("Content-Disposition", "attachment; filename=amazon-invoices.csv");
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

export default app;
