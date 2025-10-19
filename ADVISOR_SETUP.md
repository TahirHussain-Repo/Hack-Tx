# 🎙️ Fully Functional Advisor Setup Guide

## ✅ What's Now Working

Your Advisor Call screen is now **FULLY FUNCTIONAL** with:
- ✅ Real AI conversations (Gemini)
- ✅ Voice input (browser speech recognition)
- ✅ Voice output (ElevenLabs)
- ✅ Real financial data (Nessie API)
- ✅ Live transcription
- ✅ Multi-turn conversations

---

## 🚀 How to Use

### 1. Start the Backend
```bash
cd backend
python3 server.py
```

You should see:
```
╔═══════════════════════════════════════╗
║   MoneyTalks Advisor API Server      ║
╠═══════════════════════════════════════╣
║   Gemini:     ✓                      ║
║   ElevenLabs: ✓                      ║
║   Nessie:     ✓                      ║
╠═══════════════════════════════════════╣
║   Running on: http://localhost:3001  ║
╚═══════════════════════════════════════╝
```

### 2. Start the Frontend
```bash
# In another terminal
npm run dev
```

### 3. Use the Advisor

**Step 1:** Open `http://localhost:5173` (or your Vite port)

**Step 2:** Click "Start Advisor Session"
- Backend creates a session
- AI analyzes your financial data
- AI greets you with a personalized message
- AI voice speaks the greeting

**Step 3:** Click the Mic button
- Browser asks for microphone permission (allow it!)
- Waveform starts animating
- Speak your question clearly

**Step 4:** Watch it work!
- Your words appear live as you speak (interim transcript)
- When you stop, text is sent to AI
- AI analyzes with your financial context
- AI response appears in transcript
- AI speaks the response with voice

**Step 5:** Continue the conversation
- Click mic again for follow-up questions
- AI remembers the full conversation
- Context-aware responses

---

## 🎯 What You Can Ask

### Financial Questions:
- "How am I doing this month?"
- "What's my biggest spending category?"
- "Am I on track with my budget?"
- "How are my savings goals?"

### Advice & Analysis:
- "Should I cut back on dining out?"
- "When will I reach my Paris trip goal?"
- "What subscriptions should I cancel?"
- "Help me optimize my spending"

### Actions:
- "Generate new financial goals for me"
- "Analyze my spending patterns"
- "What should I focus on this month?"

---

## 🔧 Features Explained

### Real-Time Voice Flow:
```
You speak → Browser captures → Shows live text → 
Sends to backend → Gemini thinks → Returns answer → 
ElevenLabs speaks → You hear response
```

### AI Intelligence:
- **Context-aware**: AI knows your spending, goals, subscriptions
- **Conversational**: Remembers what you just asked
- **Actionable**: Gives specific advice, not generic tips
- **Data-driven**: Uses real numbers from your accounts

### Voice Features:
- **Live transcript**: See what you're saying in real-time
- **Natural voice**: AI responds with human-like speech
- **Visual feedback**: Waveform shows when listening
- **Error recovery**: Falls back gracefully if voice fails

---

## 🎨 Visual States

**Idle:**
- Gray waveform
- "Start Session" button visible
- No mic active

**Active Session:**
- Mic button enabled
- "Speak when ready" message
- Transcript panel shows history

**Listening:**
- Animated green waveform
- "Listening..." status
- Live text preview appears
- Pulsing mic icon

**Processing:**
- "Processing..." status
- Loading spinner on mic
- Sending to AI backend

**AI Speaking:**
- "AI Speaking..." badge
- Audio plays through speakers
- Text appears in transcript

---

## 🐛 Troubleshooting

**Mic doesn't work:**
- Make sure you allowed microphone permission
- Use Chrome or Edge browser
- Check browser console for errors

**No AI response:**
- Check backend is running on port 3001
- Check API keys in backend/.env
- Look at backend terminal for errors

**No voice output:**
- Check ElevenLabs API key
- Check backend logs
- Audio will still show as text if voice fails

**Connection errors:**
- Ensure backend is running
- Check CORS is enabled
- Verify port 3001 is not blocked

---

## 🎭 Demo Script

For testing or demoing:

1. Start session
2. Say: "How am I doing this month?"
3. AI responds with spending summary
4. Say: "What about my Paris trip goal?"
5. AI gives goal progress
6. Say: "Should I cancel any subscriptions?"
7. AI analyzes and recommends

---

## 🚀 Production Considerations

Before deploying:
- [ ] Add user authentication
- [ ] Store sessions in database (Redis)
- [ ] Rate limit API calls
- [ ] Add proper error logging
- [ ] Use environment-specific URLs
- [ ] Add analytics tracking
- [ ] Test on mobile browsers

---

## 📊 Architecture Flow

```
Frontend (React)
    ↓ User speaks
Browser Speech API (Free!)
    ↓ Text transcript
Backend API (Flask)
    ↓ Text + Context
Gemini AI
    ↓ Intelligent response
Backend
    ↓ Response text
ElevenLabs API
    ↓ Natural voice audio
Frontend
    ↓ Plays audio
User hears response
```

---

**You're all set! The Advisor is now a fully functional AI financial advisor with voice capabilities!** 🎉

