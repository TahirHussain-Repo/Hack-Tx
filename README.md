# Hack Tx

Hack Tx 2025 Project Hub

## Nessie Setup

### Backend

```
cd server
cp .env.example .env        # paste NESSIE_KEY here
npm i
npm run dev                 # starts on http://localhost:5179
```

### Frontend

```
# from repo root
npm i                       # if needed
npm run dev                 # ensure VITE_API_BASE points to the proxy
```

## Gemini Chat Advisor

### Configure API keys

1. Get a Google AI Studio API key (Gemini).
2. In `server/`, copy the example file and add your keys:

```
cd server
cp .env.example .env
# open server/.env and set
# NESSIE_KEY=...
# GEMINI_API_KEY=...
# (optional) GEMINI_MODEL=gemini-1.5-flash
```

### Run servers

```
cd server
npm i
npm run dev                 # starts proxy on http://localhost:5179

# new terminal at repo root
npm run dev                 # Vite UI (defaults to http://localhost:8080)
```

Ensure `CORS_ORIGIN` in `server/.env` includes `http://localhost:8080` (and 5173 if you switch ports).

### Use Chat Advisor

- Visit the **Chat Advisor** tab.
- Start a conversation; messages are sent to `/api/chat/completions` and answered by Gemini.
- If you see “Gemini is not configured”, double-check `GEMINI_API_KEY` and restart the proxy.

### Notes

- API calls stay server-side; the browser never sees your API keys.
- Customize prompts and default summaries in `server/index.ts` near the `/api/chat/completions` route.

### How to test

- Visit the Nessie demo page (sidebar → "Nessie Demo").
- Select an account from the rendered buttons to load its activity.
- Create a deposit and a purchase; confirm they show up after submission.
- Create a bill and verify it persists.
- Use the demo controls to hit public endpoints (branches, ATMs, merchants) and confirm data loads.
