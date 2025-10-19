# Quick Setup Guide: Gemini Computer Use API

This is a quick reference for setting up the Toyota car recommendations feature powered by Gemini Computer Use API.

## 🚀 Quick Start (5 minutes)

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install Playwright Browser

```bash
python -m playwright install chromium
```

> This downloads Chromium browser (~300MB). It's needed for web automation.

### 3. Add Your Gemini API Key

```bash
# Copy the example env file
cp example.env .env
```

Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_key_here
```

**Get your API key here:** https://makersuite.google.com/app/apikey

### 4. Start the Backend

```bash
python server.py
```

You should see:
```
╔═══════════════════════════════════════╗
║   MoneyTalks Advisor API Server      ║
║   Gemini:     ✓                      ║
╚═══════════════════════════════════════╝
```

### 5. Start the Frontend (in another terminal)

```bash
cd ..
npm install  # if not already done
npm run dev
```

### 6. Test the Feature

1. Open the app in your browser
2. Complete onboarding (if not done) to get financial data
3. Navigate to the **Plan** page
4. Scroll down to the **"Toyota Cars Within Your Budget"** section
5. Click **"Find Toyota Cars for Me"**
6. Wait 30-60 seconds for AI-powered results!

## 📋 What You'll See

When you click the button, the Gemini Computer Use model will:

1. 🌐 Open a browser (headless - you won't see it)
2. 🔍 Search Google Shopping for Toyota cars
3. 📊 Filter by your calculated budget
4. 📝 Extract information about 4-5 cars
5. ✅ Display formatted results

## 💰 Budget Calculation

The app calculates your car budget as:
```
Budget = Leftover Monthly Income × 12 months × 3 years
```

For example:
- If you have $500/month leftover
- Car budget = $500 × 12 × 3 = **$18,000**

## 🛠️ Troubleshooting

### "Unable to fetch car recommendations"

**Check backend is running:**
```bash
curl http://localhost:3001/health
```

Should return: `{"status": "healthy", ...}`

**Check API key:**
- Verify it's set in `backend/.env`
- Try generating a new key from Google AI Studio

### Playwright Installation Failed

**On Windows:**
```bash
python -m playwright install chromium --force
```

**On macOS:**
```bash
python3 -m playwright install chromium
```

**On Linux:**
```bash
sudo apt-get update
sudo apt-get install -y libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libgbm1
python -m playwright install chromium
```

### Results Take Too Long

This is normal! Computer Use involves:
- AI analyzing screenshots
- Planning multiple steps
- Executing web navigation
- Extracting information

**Typical time: 30-60 seconds**

## 📁 Files Changed

This integration adds/modifies:

### Backend
- `backend/requirements.txt` - Added `google-genai` and `playwright`
- `backend/server.py` - Added Computer Use logic and endpoint
- `backend/example.env` - Added setup instructions
- `backend/COMPUTER_USE_SETUP.md` - Detailed setup guide

### Frontend
- `src/api/computerUse.ts` - New API client
- `src/pages/Plan.tsx` - Added car recommendations UI section

### Documentation
- `COMPUTER_USE_INTEGRATION.md` - Full technical documentation
- `SETUP_GEMINI_COMPUTER_USE.md` - This quick start guide

## 🔒 Security Notes

✅ **Safe Practices:**
- Browser runs in headless mode (no UI)
- Limited to Google Shopping searches
- Budget constraints prevent unbounded searches
- All actions logged for monitoring

⚠️ **Preview Feature:**
- Gemini Computer Use is in Preview
- May occasionally make mistakes
- Supervise important searches
- Don't use for sensitive data

## 📖 Learn More

- **Full Documentation:** See `COMPUTER_USE_INTEGRATION.md`
- **Detailed Setup:** See `backend/COMPUTER_USE_SETUP.md`
- **Gemini Docs:** https://ai.google.dev/gemini-api/docs/computer-use

## 🎯 Next Steps

Once it's working, you can:

1. **Customize the search:** Edit the prompt in `server.py` line 338
2. **Add more brands:** Modify the search to include Honda, Ford, etc.
3. **Better parsing:** Improve `parse_car_recommendations()` function
4. **Add filters:** Include year, mileage, features in the search
5. **Save favorites:** Let users save cars they like

## 💡 Example Prompts to Modify

In `backend/server.py`, line 338, you can customize the search:

```python
# Current prompt
USER_PROMPT = f"""Search on Google Shopping for used or new Toyota cars priced under ${budget_max:.0f}. 
Find 4-5 options with good ratings..."""

# Example: Focus on fuel efficiency
USER_PROMPT = f"""Search on Google Shopping for fuel-efficient Toyota hybrid cars priced under ${budget_max:.0f}. 
Find 4-5 options with best MPG ratings..."""

# Example: Family cars
USER_PROMPT = f"""Search on Google Shopping for Toyota SUVs and minivans suitable for families, priced under ${budget_max:.0f}. 
Find 4-5 options with good safety ratings..."""
```

## 🤝 Support

If you run into issues:

1. Check the backend console logs
2. Try the troubleshooting steps above
3. Review `backend/COMPUTER_USE_SETUP.md`
4. Open an issue with:
   - Error message
   - Backend console logs
   - Your OS and Python version

---

**Enjoy AI-powered car shopping! 🚗✨**


