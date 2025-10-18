# MoneyTalks Advisor API Backend

Simple Python Flask backend for the voice-first AI financial advisor.

## Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment Variables
```bash
# Copy the example file
cp example.env .env

# Edit .env and add your API keys
nano .env  # or use any text editor
```

### 3. Get API Keys

**Gemini API (Required)**
- Visit: https://makersuite.google.com/app/apikey
- Create a new API key
- Add to `.env`: `GEMINI_API_KEY=your_key_here`

**ElevenLabs API (Required for voice)**
- Visit: https://elevenlabs.io/
- Sign up for free account
- Get API key from settings
- Add to `.env`: `ELEVENLABS_API_KEY=your_key_here`

**Nessie API (Optional - mock data fallback)**
- Visit: http://api.nessieisreal.com/
- Register for API key
- Add to `.env`: `NESSIE_API_KEY=your_key_here`

### 4. Run the Server
```bash
python server.py
```

Server will start on `http://localhost:3001`

## API Endpoints

### `POST /api/advisor/start-session`
Start a new advisor session
```json
{
  "user_id": "optional_user_id"
}
```

### `POST /api/advisor/chat`
Send a message to the AI advisor
```json
{
  "session_id": "session_123456",
  "message": "How am I doing this month?"
}
```

### `POST /api/advisor/synthesize-speech`
Convert text to speech (returns audio file)
```json
{
  "text": "You're doing great this month!",
  "voice_id": "21m00Tcm4TlvDq8ikWAM"
}
```

### `POST /api/advisor/analyze-spending`
Get spending analysis with AI insights
```json
{
  "session_id": "session_123456"
}
```

### `POST /api/advisor/generate-goals`
Generate personalized financial goals
```json
{
  "session_id": "session_123456"
}
```

### `POST /api/advisor/end-session`
End the advisor session
```json
{
  "session_id": "session_123456"
}
```

## Features

✅ **Gemini AI Integration** - Intelligent, context-aware responses
✅ **ElevenLabs Voice Synthesis** - Natural voice output
✅ **Nessie API Integration** - Real financial data (with mock fallback)
✅ **Session Management** - Maintains conversation context
✅ **Financial Analysis** - Spending summaries and insights
✅ **Goal Generation** - Personalized financial goals

## Architecture

- **Flask** - Lightweight web framework
- **CORS enabled** - Works with React frontend
- **In-memory sessions** - Simple session storage (use Redis for production)
- **Error handling** - Graceful fallbacks for API failures

## Next Steps

1. Test the API with curl or Postman
2. Update frontend to call these endpoints
3. Add Web Speech API for voice input on frontend
4. Connect audio player to synthesize-speech endpoint

## Troubleshooting

**"Gemini API error"**
- Check your API key is correct
- Ensure you have quota remaining
- Verify the key has proper permissions

**"ElevenLabs error"**
- Check API key is valid
- Ensure you have credits remaining
- Try a different voice_id

**CORS errors**
- Server allows all origins in development
- Configure properly for production

