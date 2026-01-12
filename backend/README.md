# Amazon Business API Sandbox Backend

## Setup

1. Kopiere `.env.example` zu `.env` und trage deine Amazon-API-Zugangsdaten ein:

   - AMAZON_CLIENT_ID
   - AMAZON_CLIENT_SECRET
   - AMAZON_REFRESH_TOKEN
   - AMAZON_REGION (z.B. eu)
   - AMAZON_API_BASE_URL (z.B. https://sandbox.eu.business-api.amazon.com)

2. Installiere die Abhängigkeiten:

   ```bash
   cd backend
   npm install
   ```

3. Starte das Backend:

   ```bash
   npm run amazon-sandbox
   ```

Das Backend läuft dann auf http://localhost:3001 und stellt z.B. `/api/documents` bereit (siehe Beispiel in `src/amazonBusinessApi.ts`).

## Hinweise

- Das Access Token ist nur 1 Stunde gültig und wird automatisch erneuert.
- Die Sandbox-API liefert statische, simulierte Antworten.
- Weitere Endpunkte können nach Bedarf ergänzt werden.

## Links

- [Amazon Business API Sandbox Doku](https://developer-docs.amazon.com/amazon-business/docs/amazon-business-api-sandbox)
- [Document API static sandbox guide](https://developer-docs.amazon.com/amazon-business/docs/document-api-static-sandbox-guide)
