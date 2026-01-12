import dotenv from "dotenv";
dotenv.config();

import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

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

// Example endpoint: Get static sandbox document list
app.get("/api/documents", async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const result = await axios.get(
      `${AMAZON_API_BASE_URL}/documents/v1/documents`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        params: {
          // Add required sandbox params here if needed
        },
      }
    );
    res.json(result.data);
  } catch (err: any) {
    res.status(500).json({ error: err.message, details: err.response?.data });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Amazon Business API Sandbox backend running on port ${PORT}`);
});
