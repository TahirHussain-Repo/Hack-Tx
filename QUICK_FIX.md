# 🔧 Quick Fix for Computer Use Connection Error

## The Problem

You're seeing: `Failed to load resource: net::ERR_CONNECTION_RESET` when trying to get car recommendations.

**Root Cause:** The backend is crashing due to missing dependencies or incorrect imports.

## The Solution (5 minutes)

### Step 1: Reinstall Dependencies

**On Windows (PowerShell as Administrator):**
```powershell
cd backend
pip install -r requirements.txt
python -m playwright install chromium
```

**Or use the script:**
```powershell
cd backend
.\install_computer_use.bat
```

**On Mac/Linux:**
```bash
cd backend
pip install -r requirements.txt
python -m playwright install chromium
```

**Or use the script:**
```bash
cd backend
chmod +x install_computer_use.sh
./install_computer_use.sh
```

### Step 2: Verify Installation

```bash
python -c "from google import genai; from playwright.sync_api import sync_playwright; print('✓ All imports OK')"
```

You should see: `✓ All imports OK`

### Step 3: Restart Backend

Kill the current backend process (Ctrl+C) and restart:

```bash
cd backend
python server.py
```

Look for this message:
```
✓ Computer Use dependencies loaded successfully
```

If you see:
```
⚠ Computer Use not available: [error message]
```

Then the dependencies aren't installed correctly. Go back to Step 1.

### Step 4: Test the Frontend

1. Refresh your browser
2. Go to the Plan page
3. Click "Find Toyota Cars for Me"
4. Wait 30-60 seconds

The backend should show:
```
==================================================
Received car recommendation request with budget: $XXX
==================================================

Searching for Toyota cars with budget: $XXX
Starting Playwright...
Navigating to Google...
Goal: Search on Google Shopping...

--- Turn 1 ---
Thinking...
  -> Executing: type_text_at
...
```

## Still Having Issues?

### Issue: "Module 'google.genai' not found"

**Fix:**
```bash
pip uninstall google-genai google-generativeai -y
pip install google-generativeai==0.3.2 google-genai==0.3.0
```

### Issue: "Playwright executable not found"

**Fix (Windows):**
```powershell
python -m playwright install --force chromium
```

**Fix (Mac/Linux):**
```bash
# Install system dependencies first
sudo apt-get update
sudo apt-get install -y libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libgbm1

# Then install Playwright
python -m playwright install chromium
```

### Issue: Backend starts but crashes on request

**Check:**
1. Your `.env` file has a valid `GEMINI_API_KEY`
2. You have internet connection
3. Port 3001 is not blocked by firewall

**Test API key:**
```bash
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('Key:', os.getenv('GEMINI_API_KEY')[:20] + '...')"
```

### Issue: "Browser process failed to launch"

This means Playwright can't start Chromium.

**Fix (Windows):**
```powershell
# Run as Administrator
python -m playwright install-deps chromium
python -m playwright install chromium
```

**Fix (Mac):**
```bash
# May need to allow in Security & Privacy settings
python -m playwright install chromium
```

**Fix (Linux):**
```bash
# Install all system dependencies
sudo apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2

python -m playwright install chromium
```

## Verify Everything Works

**Test the API directly:**

```bash
# Make sure backend is running, then in another terminal:
curl -X POST http://localhost:3001/health
```

Should return: `{"status": "healthy", ...}`

**Test Computer Use endpoint:**

```bash
curl -X POST http://localhost:3001/api/advisor/car-recommendations \
  -H "Content-Type: application/json" \
  -d "{\"budget\": 25000}"
```

Should return JSON with car recommendations after 30-60 seconds.

## Debug Mode

To see what's happening, enable visual mode:

**Edit `backend/server.py` line 336:**
```python
# Change from:
browser = playwright_instance.chromium.launch(headless=True)

# To:
browser = playwright_instance.chromium.launch(headless=False)
```

This will show the browser window so you can see what the AI is doing!

## Backend Logs

When you click the button, you should see in the backend terminal:

```
==================================================
Received car recommendation request with budget: $18000
==================================================

Searching for Toyota cars with budget: $18000
Starting Playwright...
Navigating to Google...
Goal: Search on Google Shopping for used or new Toyota cars...

--- Turn 1 ---
Thinking...
  -> Executing: type_text_at
...
```

If you see errors instead, copy them and check against the fixes above.

## Need More Help?

1. **Check the detailed logs** in the backend terminal
2. **Enable debug mode** (see above) to watch the browser
3. **Test each component separately:**
   - Can you import the modules?
   - Can you start Playwright?
   - Can you call the Gemini API?

## Quick Reference

| Problem | Solution |
|---------|----------|
| Connection reset | Reinstall dependencies |
| Module not found | `pip install -r requirements.txt` |
| Browser won't start | `python -m playwright install chromium` |
| API key invalid | Check `.env` file |
| Still broken | Try debug mode (headless=False) |

---

**After fixing, your flow should be:**

✅ Backend starts → Shows "✓ Computer Use dependencies loaded"
✅ Click button → Loading spinner appears
✅ Wait 30-60s → Results appear
✅ Success! 🎉

