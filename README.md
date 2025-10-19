# MoneyTalks (Hack Tx 2025)

Voice-first AI financial advisor with live speech recognition, Gemini-powered answers, optional TTS (ElevenLabs), and Nessie demo data.

## Prerequisites

- Node 18+
- Python 3.10+
- Chrome/Edge (for Web Speech API)

## Frontend (Vite)

```
npm i
npm run dev                 # http://localhost:5173
```

Key routes:
- `/` Advisor: voice-to-text, send to AI, full transcript, TTS reply
- `/voice-test` Voice test: minimal mic test (live + final transcript)

## Backend (Flask)

Environment:
```
cd backend
cp example.env .env
# then set in .env:
# GEMINI_API_KEY=...
# ELEVENLABS_API_KEY=...        # needed for TTS
# NESSIE_API_KEY=...            # optional (spending summary)
```

Install & run:
```
python3 -m pip install -r requirements.txt
python3 server.py              # http://localhost:3001
```

If you plan to use Computer Use features later:
```
python3 -m pip install --upgrade google-genai playwright
python3 -m playwright install chromium
```

Troubleshooting google namespace pollution:
```
python3 -m pip uninstall -y google
python3 -m pip install --upgrade google-generativeai google-genai
```

## Wiring (how the app works)

- Speech recognition: `src/hooks/useSpeechRecognition.ts` wraps the Web Speech API for interim/final transcripts.
- Advisor page (`src/pages/AdvisorCall.tsx`):
  - Tap mic → live interim text appears → stop to finalize
  - Click "Send to Advisor" → creates session if needed → POSTs to backend `/api/advisor/chat`
  - AI response is appended to the transcript and spoken (TTS) if key is present

## Backend endpoints

- `POST /api/advisor/start-session` → `{ session_id, welcome_message, financial_summary? }`
- `POST /api/advisor/chat`          → `{ response, timestamp }`
- `POST /api/advisor/synthesize-speech` → audio blob (ElevenLabs)
- `POST /api/advisor/generate-goals`    → `{ goals, based_on }`
- `POST /api/advisor/end-session`       → `{ summary, ended_at }`
- `GET  /health`                        → basic status flags

## Run the whole stack (dev)

1) Backend:
```
cd backend
python3 -m pip install -r requirements.txt
python3 server.py
```

2) Frontend:
```
# new terminal at repo root
npm i
npm run dev
```

Open `http://localhost:5173`.

## Usage (step-by-step)

1. Open the Advisor tab (`/`).
2. If prompted, click "Request Microphone Access" and Allow.
3. Tap the mic, speak your question, stop.
4. Click "Send to Advisor" to send recognized text to the backend.
5. See the AI reply in the transcript; hear it via TTS if configured.

## Common issues

- Mic blocked / NotAllowedError: Click the lock icon → Microphone → Allow → refresh.
- No speech recognition: Use Chrome/Edge; Safari is not supported.
- Backend import error: Uninstall `google` package; install `google-genai` and `google-generativeai`.
- TTS silent: Verify `ELEVENLABS_API_KEY` and that the backend logs show 200 responses.

## Repo layout

- `src/pages/AdvisorCall.tsx`  Simplified advisor with voice-to-text → AI → TTS
- `src/pages/VoiceTest.tsx`    Minimal voice test page
- `src/hooks/useSpeechRecognition.ts`  Web Speech wrapper
- `src/services/advisorApiService.ts`  Frontend→Flask API client
- `backend/server.py`          Flask API (Gemini, ElevenLabs, Nessie integration)

