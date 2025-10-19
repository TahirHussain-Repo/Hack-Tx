# Gemini Computer Use API Setup Guide

This guide will help you set up the Gemini Computer Use API for the Toyota car recommendations feature.

## Overview

The Gemini Computer Use API enables the AI to interact with web browsers to search for and extract information about cars that fit within your budget. This feature uses:

- **Gemini 2.5 Computer Use Preview** model
- **Playwright** for browser automation
- **Python Flask** backend

## Prerequisites

- Python 3.8 or higher
- Valid Gemini API key
- Internet connection

## Installation Steps

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- `google-genai` - Gemini API client with Computer Use support
- `playwright` - Browser automation library
- Other required packages

### 2. Install Playwright Browsers

After installing the Python packages, you need to install the browser binaries:

```bash
python -m playwright install chromium
```

This downloads and installs the Chromium browser that Playwright will use for automation.

### 3. Configure Environment Variables

Copy `example.env` to `.env` and add your Gemini API key:

```bash
cp example.env .env
```

Edit `.env` and add your key:
```
GEMINI_API_KEY=your_actual_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### 4. Start the Backend Server

```bash
python server.py
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

## How It Works

1. **User Request**: User clicks "Find Toyota Cars for Me" in the Plan page
2. **Budget Calculation**: Frontend calculates affordable car budget based on leftover monthly income
3. **API Call**: Frontend sends budget to `/api/advisor/car-recommendations`
4. **Browser Automation**: 
   - Server launches headless Chromium browser
   - Navigates to Google
   - Gemini Computer Use model "sees" the page via screenshots
   - AI generates actions (clicks, typing, scrolling)
   - Server executes actions via Playwright
5. **Data Extraction**: AI extracts car information from search results
6. **Response**: Structured car recommendations sent back to frontend

## API Endpoint

### POST `/api/advisor/car-recommendations`

**Request Body:**
```json
{
  "budget": 25000
}
```

**Response:**
```json
{
  "success": true,
  "budget": 25000,
  "results": {
    "raw_text": "Here are 4-5 Toyota cars within your budget...",
    "recommendations": [],
    "success": true
  },
  "timestamp": "2025-10-19T12:00:00.000Z"
}
```

## Security Considerations

⚠️ **Important**: The Computer Use model is in preview and should be used with caution.

- **Sandboxed Environment**: The browser runs in headless mode with limited permissions
- **Budget Limits**: Set reasonable budget limits to prevent expensive searches
- **Rate Limiting**: Consider adding rate limits in production
- **User Confirmation**: The built-in safety system may require user confirmation for certain actions
- **Monitoring**: All actions are logged for debugging and auditing

## Troubleshooting

### Playwright Installation Issues

If `playwright install` fails:

```bash
# Try with sudo/administrator privileges
sudo python -m playwright install chromium

# Or install system dependencies first (Linux)
sudo apt-get install -y libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libgbm1
```

### API Key Issues

If you get authentication errors:
- Verify your API key is correct in `.env`
- Check that the key has Computer Use API access enabled
- Ensure you're using the latest `google-genai` package

### Timeout Issues

If searches take too long:
- Increase the `turn_limit` in `server.py` (default: 15)
- Check your internet connection
- Try with a simpler search query

### Browser Crashes

If the browser crashes:
- Check available system memory
- Try running in non-headless mode for debugging: `launch(headless=False)`
- Check Playwright logs

## Performance

- **Average Search Time**: 30-60 seconds
- **Browser Resources**: ~200-300MB RAM
- **Network Usage**: Depends on search results

## Development Tips

### Enable Visual Debugging

Change `headless=False` in `server.py`:

```python
browser = playwright.chromium.launch(headless=False)
```

This lets you see what the AI is doing in real-time.

### Add Custom Actions

Extend `execute_function_calls()` to support more actions:

```python
elif fname == "your_custom_action":
    # Your implementation
    pass
```

### Improve Parsing

Update `parse_car_recommendations()` to extract structured data:

```python
def parse_car_recommendations(text: str):
    # Use regex or LLM to extract structured data
    cars = extract_car_data(text)
    return {
        "raw_text": text,
        "recommendations": cars,
        "success": True
    }
```

## Resources

- [Gemini Computer Use Documentation](https://ai.google.dev/gemini-api/docs/computer-use)
- [Playwright Documentation](https://playwright.dev/python/)
- [Google AI Studio](https://makersuite.google.com/)

## Support

For issues or questions:
- Check the logs in the backend terminal
- Review the Gemini API documentation
- Open an issue in the project repository


