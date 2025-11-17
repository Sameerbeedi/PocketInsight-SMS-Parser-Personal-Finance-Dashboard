## PocketInsight SMS Parser

PocketInsight is a 1-page React + Express demo that turns pasted bank / SMS alerts into categorized transactions with monthly and category insights. It ships with dummy sample data, automated tests, and single-command workflows so you can deploy it quickly to Replit, Render, or Vercel.

### Tech Stack
- **Frontend:** Vite + React 19, Recharts, Axios
- **Backend:** Node 20 + Express 5, date-fns
- **Testing:** Vitest (frontend) and Jest + Supertest (backend)

---

## Quick Start

```bash
# 1. Install dependencies for both services
npm run install:all

# 2. Start the API (defaults to http://localhost:4000)
npm run dev:server

# 3. In a second terminal, start the React dashboard (http://localhost:5173)
npm run dev:client
```

Each service works with a **single command** (`npm run dev:server` or `npm run dev:client`). When deploying, point your hosting provider at the appropriate script.

---

## Project Structure

```
server/      Express API (parsing + categorization + sample data)
client/      Vite React dashboard UI
sample-data/ Handy SMS snippets you can paste into the UI
```

### API Highlights
- `POST /api/parse` – send raw SMS text (string or array) and receive `transactions`, `insights`, and `reminders`. Optional `region` (e.g. `IN`, `SG`) enables locale-specific merchant/category rules, and each transaction returns confidence scores plus dictionary-normalized merchants.
- `GET /api/sample` – returns curated dummy alerts plus parsed output (perfect for demos). Accepts the same optional `region` query parameter.
- `GET /health` – lightweight uptime probe for Render/Replit health checks.

Under the hood the parser extracts:
1. Amounts (supports `Rs`, `INR`, `₹`, `SGD`, `USD` prefixes)
2. Merchant / counterparty names using regex + fuzzy dictionary matching (canonicalized names + confidence scores)
3. Date strings (multiple formats)
4. Direction (debit vs credit) + heuristic categories with region-aware keyword packs and merchant hints
5. Reminder candidates (payment requests, credit card dues, end-of-month bills) with inferred due dates

### Frontend Highlights
- Paste SMS text, or click **“Load sample data”** to autofill the curated dataset.
- Interactive cards for total spend, income, and net balance.
- Dedicated reminder tab that surfaces upcoming payment requests and card/bill dues with due-date badges.
- Monthly net-flow area chart + category pie chart.
- Ranked category list and recent-transactions table with message snippets.

---

## Configuration

| Service | Default Port | Command | Notes |
|---------|--------------|---------|-------|
| API     | `4000`       | `npm run dev:server` | Uses `nodemon` in dev; `npm run start:server` for production. |
| Client  | `5173`       | `npm run dev:client` | Set `VITE_API_BASE_URL` to point at your deployed API. |

Environment variables:
- `PORT` (server): overrides default 4000.
- `VITE_API_BASE_URL` (client): e.g. `https://your-render-api.onrender.com`.

---

## Sample Data

- UI button **“Load sample data”** calls `/api/sample`.
- `server/src/sampleMessages.js` powers the API response, including synthetic payment requests and credit-card due alerts so the reminder UI lights up instantly.
- `sample-data/messages.txt` is a copy you can paste manually for demos.

---

## Testing & Quality

```bash
# Backend tests (Jest + Supertest)
npm run test:server

# Frontend unit tests (Vitest)
npm run test:client

# Lint React code
npm run lint:client
```

CI-style aggregate command: `npm test` (runs both suites sequentially).

---

## Deployment Notes

- **Replit:** Create two repls or use the new multi-process template. Set the run command to `npm run dev:server` (backend) and `npm run dev:client` (frontend) or build + serve static assets via `npm run build:client`.
- **Render:** Deploy `server/` as a web service (`npm run start:server`). Deploy `client/` as a static site (`npm run build:client` as build command, `dist` as publish dir) and configure `VITE_API_BASE_URL`.
- **Vercel:** Deploy only the React client; add `VITE_API_BASE_URL` in project settings pointing to your hosted API (Render/Replit). For a single Vercel deployment, you can also convert the Express API into Vercel functions later.

---

## Troubleshooting

- **CORS errors:** ensure the backend URL in `VITE_API_BASE_URL` includes protocol (`https://`), and the backend is reachable.
- **No transactions detected:** confirm each SMS line contains an INR/Rs amount and keywords like “debited” or “credited”.
- **Charts empty:** run the parser or load sample data; charts require at least one parsed transaction.

Enjoy building with PocketInsight! Feel free to extend the parser rules, plug in live SMS sources, or add persistence for real-world finance tracking.

