// Load environment variables
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import axios from "axios";
import fetch, { Headers } from "node-fetch";

const app = express();
app.use(express.json());

// Environment variables
const {
  AMAZON_CLIENT_ID,
  AMAZON_CLIENT_SECRET,
  AMAZON_REFRESH_TOKEN,
  AMAZON_REGION = "eu",
  AMAZON_API_BASE_URL = "https://sandbox.eu.business-api.amazon.com",
} = process.env;

if (!AMAZON_CLIENT_ID || !AMAZON_CLIENT_SECRET || !AMAZON_REFRESH_TOKEN) {
  throw new Error("Missing Amazon API credentials in environment variables");
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

// Retrieve and cache access token
async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", AMAZON_REFRESH_TOKEN!);
  params.append("client_id", AMAZON_CLIENT_ID!);
  params.append("client_secret", AMAZON_CLIENT_SECRET!);
  const response = await axios.post(
    "https://api.amazon.com/auth/O2/token",
    params,
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  cachedToken = response.data.access_token;
  tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000; // 1 min buffer
  return cachedToken;
}

// GET /api/reports - Retrieve example reports from Amazon Business API Sandbox
app.get("/api/reports", async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return res.status(500).json({ error: "No access token received" });
    }
    const headers = new Headers();
    // Amazon SP-API expects the LWA token in the x-amz-access-token header
    headers.append("x-amz-access-token", accessToken);
    headers.append("Content-Type", "application/json");
    headers.append("User-Agent", "MyApp/1.0 (Language=NodeJS)");
    const url = `${AMAZON_API_BASE_URL}/reports/2021-09-30/reports?reportTypes=FEE_DISCOUNTS_REPORT,GET_AFN_INVENTORY_DATA&processingStatuses=IN_QUEUE,IN_PROGRESS`;
    const response = await fetch(url, { method: "GET", headers });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(`Status ${response.status}`);
      (error as any).response = { data };
      throw error;
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message, details: err.response?.data });
  }
});

// Start the Express server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Amazon Business API Sandbox backend running on port ${PORT}`);
});
