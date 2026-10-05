# Afghan Freelance — Base44 Dev Environment

## What this app is
A React 19 + Vite 8 SPA with an Express backend (`server.ts`) that serves Vite in middleware mode. The single `app` service handles both API routes (`/api/*`) and the frontend. All data is in-memory (no database).

## Running it
```
docker compose -f docker-compose.base44.yml up -d --build
```
The compose file uses `node:22-slim`, bind-mounts the repo, runs `npm install` then `npm run dev` (`tsx server.ts`). Port 3000 is the only exposed port.

## Key details
- **No lockfile**: `npm install --legacy-peer-deps` (not `npm ci`) runs on every container start. The `--legacy-peer-deps` flag is required because Vite 8 wants esbuild `^0.27` while `package.json` pins esbuild `^0.25`.
- **No database / no external services required**: The app boots with zero credentials. HesabPay defaults to demo/sandbox mode; Firebase is optional; `GEMINI_API_KEY` is in `.env.example` but not actually imported anywhere in the code.
- **Vite in middleware mode**: `server.ts` creates a Vite dev server with `middlewareMode: true` and mounts it on Express. HMR websocket and dev asset requests go through the Express server. `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` is passed bare so Vite accepts the preview's external hostname.
- **Healthcheck**: `GET /api/health` returns `{ status: 'ok' }`.
- **RTL / i18n**: The app is a Persian/Dari/RTL marketplace (`dir="rtl"` in `index.html`). Language and currency contexts manage UI state.

## Verifying it works
```
curl http://localhost:3000/api/health   # → {"status":"ok",...}
curl http://localhost:3000/             # → HTML with <div id="root">
```

## Optional secrets (all in `/run/base44/app.env`, none required to boot)
- `GEMINI_API_KEY` — Google AI Studio key (not yet used in code)
- `HESABPAY_API_KEY` / `HESABPAY_WEBHOOK_SECRET` — payment gateway
- `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` — cloud persistence
