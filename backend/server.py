from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from dotenv import load_dotenv
import google.generativeai as genai
import requests
from datetime import datetime, timedelta
import json
from io import BytesIO
import time
import threading

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Explicit CORS headers for local dev (8080/5173)
@app.after_request
def add_cors_headers(response):
    try:
        origin = request.headers.get('Origin', '')
        allowed_origins = {
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:8080',
            'http://127.0.0.1:8080',
        }
        if origin in allowed_origins:
            response.headers['Access-Control-Allow-Origin'] = origin
        else:
            response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Vary'] = 'Origin'
        response.headers['Access-Control-Allow-Credentials'] = 'false'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    finally:
        return response

# Configure APIs
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
NESSIE_API_KEY = os.getenv('NESSIE_API_KEY')
PORT = int(os.getenv('PORT', 3001))

# Initialize Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Use gemini-2.0-flash (fast and reliable)
    model = genai.GenerativeModel('gemini-2.0-flash')
else:
    model = None
    print("WARNING: No Gemini API key found!")

# In-memory session storage (use Redis in production)
sessions = {}

# Constants for screen dimensions
SCREEN_WIDTH = 1440
SCREEN_HEIGHT = 900

# Strict import for Computer Use (required)
# Guard google-genai imports to avoid ImportError if namespace is polluted by 'google' pkg
try:
    from google import genai as genai_client
    from google.genai import types
    from google.genai.types import Content, Part
    _genai2_available = True
except Exception as _e:
    genai_client = None  # type: ignore
    types = None  # type: ignore
    Content = None  # type: ignore
    Part = None  # type: ignore
    _genai2_available = False

try:
    from playwright.sync_api import sync_playwright
    _playwright_available = True
except Exception as _e:
    sync_playwright = None  # type: ignore
    _playwright_available = False

# Validate Computer Use presence at startup
computer_use_available: bool = False
try:
    if _genai2_available and types is not None and hasattr(types, "ComputerUse") and hasattr(types, "Environment") and _playwright_available:
        computer_use_available = True
        print("✓ Computer Use dependencies loaded successfully")
    else:
        raise ImportError(
            "Computer Use prerequisites missing (google-genai types or Playwright). "
            "Run: pip install --upgrade google-genai playwright && python -m playwright install chromium"
        )
except Exception as e:
    computer_use_available = False
    print(f"WARNING: Computer Use not available: {e}")

# ============================================================================
# NESSIE API HELPERS
# ============================================================================

def get_nessie_accounts():
    """Fetch accounts from Nessie API"""
    url = f"http://api.nessieisreal.com/accounts?key={NESSIE_API_KEY}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Nessie API error: {e}")
        return []

def get_nessie_transactions(account_id):
    """Fetch transactions for an account"""
    url = f"http://api.nessieisreal.com/accounts/{account_id}/purchases?key={NESSIE_API_KEY}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Nessie transactions error: {e}")
        return []

def calculate_spending_summary():
    """Calculate spending summary from Nessie data"""
    accounts = get_nessie_accounts()
    
    if not accounts:
        # Return mock data if API fails
        return {
            "total_spending": 3247.82,
            "budget_limit": 3750.00,
            "budget_adherence": 87,
            "savings_rate": 32,
            "top_categories": [
                {"category": "Housing", "amount": 1200},
                {"category": "Food", "amount": 450},
                {"category": "Transport", "amount": 280}
            ]
        }
    
    # Process real data
    total_spending = 0
    categories = {}
    
    for account in accounts:
        account_id = account.get('_id')
        transactions = get_nessie_transactions(account_id)
        
        for txn in transactions:
            amount = txn.get('amount', 0)
            category = txn.get('category', 'Other')
            total_spending += amount
            categories[category] = categories.get(category, 0) + amount
    
    return {
        "total_spending": round(total_spending, 2),
        "budget_limit": 3750.00,
        "budget_adherence": int((total_spending / 3750.00) * 100),
        "top_categories": [{"category": k, "amount": v} for k, v in sorted(categories.items(), key=lambda x: x[1], reverse=True)[:3]]
    }

# ============================================================================
# GEMINI AI HELPERS
# ============================================================================

def build_financial_context(user_id="default"):
    """Build comprehensive financial context for AI"""
    spending = calculate_spending_summary()
    
    context = f"""
User Financial Context:
- Total Spending This Month: ${spending['total_spending']}
- Budget Limit: ${spending['budget_limit']}
- Budget Adherence: {spending['budget_adherence']}%
- Top Spending Categories: {', '.join([f"{cat['category']} (${cat['amount']})" for cat in spending['top_categories']])}

Active Goals:
- Trip to Paris: $3,400 of $5,000 (68% complete)
- Emergency Fund: $4,500 of $10,000 (45% complete)
- New Laptop: $1,800 of $2,000 (90% complete)

Subscriptions:
- Netflix Premium: $19.99/month (renews Oct 28)
- Spotify Family: $16.99/month (renews Oct 30)
- Adobe Creative Cloud: $54.99/month (renews Nov 1)
"""
    return context

def get_system_prompt():
    """System prompt for the AI advisor"""
    return """You are a financial advisor. Give concise, helpful advice in 2-3 sentences. Be professional and conversational."""

def ask_gemini(user_message, conversation_history=None):
    """Send message to Gemini with context"""
    if not model:
        print("ERROR: Gemini model not initialized!")
        return "I apologize, but I'm having trouble connecting to the AI service. Please check the server configuration."
    
    try:
        # Build full context
        context = build_financial_context()
        system_prompt = get_system_prompt()
        
        # Build conversation
        full_prompt = f"{system_prompt}\n\n{context}\n\nUser: {user_message}\n\nAdvisor:"
        
        # Add conversation history if exists
        if conversation_history:
            history_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in conversation_history[-5:]])
            full_prompt = f"{system_prompt}\n\n{context}\n\nRecent Conversation:\n{history_text}\n\nUser: {user_message}\n\nAdvisor:"
        
        print(f"\n=== GEMINI REQUEST ===")
        print(f"User Message: {user_message}")
        
        response = model.generate_content(full_prompt)
        
        print(f"Gemini Response: {response.text[:100]}...")
        print(f"=== END REQUEST ===\n")
        
        return response.text
    except Exception as e:
        print(f"\n!!! GEMINI ERROR !!!")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print(f"!!! END ERROR !!!\n")
        return "I apologize, but I'm having trouble processing that right now. Could you try rephrasing your question?"

# ============================================================================
# ELEVENLABS HELPERS
# ============================================================================

def text_to_speech(text, voice_id="21m00Tcm4TlvDq8ikWAM"):
    """Convert text to speech using ElevenLabs"""
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    
    data = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        response.raise_for_status()
        return response.content
    except Exception as e:
        print(f"ElevenLabs error: {e}")
        return None

# ============================================================================
# COMPUTER USE HELPERS
# ============================================================================

def denormalize_x(x: int, screen_width: int) -> int:
    """Convert normalized x coordinate (0-1000) to actual pixel coordinate."""
    return int(x / 1000 * screen_width)

def denormalize_y(y: int, screen_height: int) -> int:
    """Convert normalized y coordinate (0-1000) to actual pixel coordinate."""
    return int(y / 1000 * screen_height)

def execute_function_calls(candidate, page, screen_width, screen_height):
    """Execute Computer Use function calls using Playwright"""
    results = []
    function_calls = []
    
    for part in candidate.content.parts:
        if part.function_call:
            function_calls.append(part.function_call)

    for function_call in function_calls:
        action_result = {}
        fname = function_call.name
        args = function_call.args
        print(f"  -> Executing: {fname}")

        try:
            if fname == "open_web_browser":
                pass  # Already open
            elif fname == "click_at":
                actual_x = denormalize_x(args["x"], screen_width)
                actual_y = denormalize_y(args["y"], screen_height)
                page.mouse.click(actual_x, actual_y)
            elif fname == "type_text_at":
                actual_x = denormalize_x(args["x"], screen_width)
                actual_y = denormalize_y(args["y"], screen_height)
                text = args["text"]
                press_enter = args.get("press_enter", False)

                page.mouse.click(actual_x, actual_y)
                page.keyboard.press("Control+A")
                page.keyboard.press("Backspace")
                page.keyboard.type(text)
                if press_enter:
                    page.keyboard.press("Enter")
            elif fname == "scroll_document":
                direction = args.get("direction", "down")
                if direction == "down":
                    page.mouse.wheel(0, 500)
                elif direction == "up":
                    page.mouse.wheel(0, -500)
            elif fname == "navigate":
                url = args.get("url")
                page.goto(url)
            elif fname == "wait_5_seconds":
                time.sleep(5)
            elif fname == "go_back":
                page.go_back()
            else:
                print(f"Warning: Unimplemented function {fname}")

            # Wait for potential navigations/renders
            page.wait_for_load_state(timeout=5000)
            time.sleep(1)

        except Exception as e:
            print(f"Error executing {fname}: {e}")
            action_result = {"error": str(e)}

        results.append((fname, action_result))

    return results

def get_function_responses(page, results):
    """Capture environment state after action execution"""
    screenshot_bytes = page.screenshot(type="png")
    current_url = page.url
    function_responses = []
    
    for name, result in results:
        response_data = {"url": current_url}
        response_data.update(result)
        function_responses.append(
            types.FunctionResponse(
                name=name,
                response=response_data,
                parts=[types.FunctionResponsePart(
                        inline_data=types.FunctionResponseBlob(
                            mime_type="image/png",
                            data=screenshot_bytes))
                ]
            )
        )
    return function_responses

def search_cars_with_computer_use(budget_max: float):
    """
    Use Gemini Computer Use API to search for Toyota cars within budget.
    Returns a list of car recommendations.
    """
    if not computer_use_available:
        return {
            "error": "Computer Use dependencies not installed. Run: pip install google-genai playwright && playwright install chromium",
            "recommendations": [],
            "success": False
        }
    
    print(f"Searching for Toyota cars with budget: ${budget_max}")
    
    playwright_instance = None
    browser = None
    
    try:
        # Initialize the Computer Use client
        computer_client = genai_client.Client(api_key=GEMINI_API_KEY)
        
        # Setup Playwright
        print("Starting Playwright...")
        playwright_instance = sync_playwright().start()
        browser = playwright_instance.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": SCREEN_WIDTH, "height": SCREEN_HEIGHT})
        page = context.new_page()
        
        # Go to initial page
        print("Navigating to Google...")
        page.goto("https://www.google.com", wait_until="networkidle", timeout=30000)
        time.sleep(2)
        
        # Configure the model (Computer Use required, no fallback)
        config = types.GenerateContentConfig(
            tools=[types.Tool(computer_use=types.ComputerUse(
                environment=types.Environment.ENVIRONMENT_BROWSER
            ))],
        )
        
        # Initial screenshot
        initial_screenshot = page.screenshot(type="png")
        
        # Create search prompt
        USER_PROMPT = f"""Search on Google Shopping for used or new Toyota cars priced under ${budget_max:.0f}. 
Find 4-5 options with good ratings. For each car, extract:
- Make and Model
- Year
- Price
- Condition (New/Used)
- Brief description or key features

Format the results as a clear, structured list."""
        
        print(f"Goal: {USER_PROMPT}")
        
        contents = [
            Content(role="user", parts=[
                Part(text=USER_PROMPT),
                Part.from_bytes(data=initial_screenshot, mime_type='image/png')
            ])
        ]
        
        # Agent Loop
        turn_limit = 15
        final_text = ""
        
        for i in range(turn_limit):
            print(f"\n--- Turn {i+1} ---")
            print("Thinking...")
            
            try:
                response = computer_client.models.generate_content(
                    model='gemini-2.5-computer-use-preview-10-2025',
                    contents=contents,
                    config=config,
                )
                
                candidate = response.candidates[0]
                contents.append(candidate.content)
                
                has_function_calls = any(part.function_call for part in candidate.content.parts)
                
                if not has_function_calls:
                    text_response = " ".join([part.text for part in candidate.content.parts if part.text])
                    print("Agent finished:", text_response)
                    final_text = text_response
                    break
                
                print("Executing actions...")
                results = execute_function_calls(candidate, page, SCREEN_WIDTH, SCREEN_HEIGHT)
                
                print("Capturing state...")
                function_responses = get_function_responses(page, results)
                
                contents.append(
                    Content(role="user", parts=[Part(function_response=fr) for fr in function_responses])
                )
            except Exception as turn_error:
                print(f"Error in turn {i+1}: {turn_error}")
                # Try to continue with next turn
                if i == turn_limit - 1:
                    raise
        
        # Parse the final response
        cars = parse_car_recommendations(final_text)
        return cars
        
    except Exception as e:
        print(f"Computer Use error: {e}")
        import traceback
        traceback.print_exc()
        return {
            "error": str(e),
            "recommendations": [],
            "success": False
        }
    finally:
        # Cleanup
        print("Cleaning up browser...")
        try:
            if browser:
                browser.close()
        except:
            pass
        try:
            if playwright_instance:
                playwright_instance.stop()
        except:
            pass

def parse_car_recommendations(text: str):
    """Parse the AI response to extract structured car data"""
    # This is a simple parser - in production you'd want more robust parsing
    # For now, return the raw text formatted nicely
    return {
        "raw_text": text,
        "recommendations": [],
        "success": True
    }

# ============================================================================
# API ROUTES
# ============================================================================

@app.route('/', methods=['GET'])
def home():
    """Welcome page"""
    return jsonify({
        "message": "MoneyTalks Advisor API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "start_session": "POST /api/advisor/start-session",
            "chat": "POST /api/advisor/chat",
            "synthesize_speech": "POST /api/advisor/synthesize-speech",
            "analyze_spending": "POST /api/advisor/analyze-spending",
            "generate_goals": "POST /api/advisor/generate-goals",
            "end_session": "POST /api/advisor/end-session"
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "gemini_configured": bool(GEMINI_API_KEY),
        "elevenlabs_configured": bool(ELEVENLABS_API_KEY),
        "nessie_configured": bool(NESSIE_API_KEY)
    })

@app.route('/api/advisor/start-session', methods=['POST'])
def start_session():
    """Initialize a new advisor session"""
    data = request.json
    user_id = data.get('user_id', 'default')
    
    # Create session
    session_id = f"session_{datetime.now().timestamp()}"
    sessions[session_id] = {
        "user_id": user_id,
        "started_at": datetime.now().isoformat(),
        "conversation_history": [],
        "context": build_financial_context(user_id)
    }
    
    # Generate welcome message
    welcome_message = ask_gemini("Generate a brief, professional greeting for a user starting a financial advisor session. Include a quick overview of their current financial status.")
    
    if not welcome_message:
        welcome_message = "Hello. I'm your MoneyTalks advisor. I've reviewed your recent financial activity. How can I help you today?"
    
    sessions[session_id]["conversation_history"].append({
        "role": "advisor",
        "content": welcome_message,
        "timestamp": datetime.now().isoformat()
    })
    
    return jsonify({
        "session_id": session_id,
        "welcome_message": welcome_message,
        "financial_summary": calculate_spending_summary()
    })

@app.route('/api/advisor/chat', methods=['POST'])
def chat():
    """Handle chat messages"""
    data = request.json
    session_id = data.get('session_id')
    user_message = data.get('message')
    
    if not session_id or session_id not in sessions:
        return jsonify({"error": "Invalid session"}), 400
    
    if not user_message:
        return jsonify({"error": "No message provided"}), 400
    
    # Get session
    session = sessions[session_id]
    
    # Add user message to history
    session["conversation_history"].append({
        "role": "user",
        "content": user_message,
        "timestamp": datetime.now().isoformat()
    })
    
    # Get AI response
    ai_response = ask_gemini(user_message, session["conversation_history"])
    
    # Add AI response to history
    session["conversation_history"].append({
        "role": "advisor",
        "content": ai_response,
        "timestamp": datetime.now().isoformat()
    })
    
    return jsonify({
        "response": ai_response,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/advisor/synthesize-speech', methods=['POST'])
def synthesize_speech():
    """Convert text to speech"""
    data = request.json
    text = data.get('text')
    voice_id = data.get('voice_id', '21m00Tcm4TlvDq8ikWAM')  # Default Rachel voice
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    audio_data = text_to_speech(text, voice_id)
    
    if not audio_data:
        return jsonify({"error": "Failed to generate speech"}), 500
    
    # Return audio as file
    return send_file(
        BytesIO(audio_data),
        mimetype='audio/mpeg',
        as_attachment=False,
        download_name='speech.mp3'
    )

@app.route('/api/advisor/analyze-spending', methods=['POST'])
def analyze_spending():
    """Get spending analysis with AI insights"""
    data = request.json
    session_id = data.get('session_id')
    
    spending_summary = calculate_spending_summary()
    
    # Get AI analysis
    analysis_prompt = f"Analyze this spending data and provide 2-3 key insights: {json.dumps(spending_summary)}"
    ai_insights = ask_gemini(analysis_prompt)
    
    return jsonify({
        "spending_summary": spending_summary,
        "ai_insights": ai_insights
    })

@app.route('/api/advisor/generate-goals', methods=['POST'])
def generate_goals():
    """Generate personalized financial goals"""
    data = request.json
    session_id = data.get('session_id')
    
    spending_summary = calculate_spending_summary()
    
    # Get AI goal recommendations
    goals_prompt = f"Based on this financial data {json.dumps(spending_summary)}, suggest 3 realistic savings goals with specific amounts and timeframes."
    ai_goals = ask_gemini(goals_prompt)
    
    return jsonify({
        "goals": ai_goals,
        "based_on": spending_summary
    })

@app.route('/api/advisor/end-session', methods=['POST'])
def end_session():
    """End advisor session"""
    data = request.json
    session_id = data.get('session_id')
    
    if not session_id:
        return jsonify({"error": "No session_id provided"}), 400
    
    if session_id in sessions:
        session = sessions[session_id]
        # Generate summary
        summary_prompt = "Provide a brief 2-sentence summary of our conversation and next steps."
        summary = ask_gemini(summary_prompt, session["conversation_history"])
        
        # Clean up session - use pop to avoid KeyError
        sessions.pop(session_id, None)
        
        return jsonify({
            "summary": summary,
            "ended_at": datetime.now().isoformat()
        })
    
    # Session already ended or doesn't exist - return success anyway
    return jsonify({
        "summary": "Session ended.",
        "ended_at": datetime.now().isoformat()
    })

@app.route('/api/advisor/car-recommendations', methods=['POST', 'OPTIONS'])
def get_car_recommendations():
    """Get Toyota car recommendations using Computer Use API"""
    if request.method == 'OPTIONS':
        # Preflight response
        resp = jsonify({"ok": True})
        resp.status_code = 204
        return resp
    data = request.json
    budget = data.get('budget', 30000)
    
    print(f"\n{'='*50}")
    print(f"Received car recommendation request with budget: ${budget}")
    print(f"{'='*50}\n")
    
    # Run Computer Use (this will take 30-60 seconds)
    try:
        result = search_cars_with_computer_use(budget)
        
        # Check if there was an error in the result
        if isinstance(result, dict) and result.get('error'):
            return jsonify({
                "success": False,
                "error": result['error'],
                "budget": budget
            }), 500
        
        return jsonify({
            "success": True,
            "budget": budget,
            "results": result,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Error in car recommendations: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}",
            "budget": budget
        }), 500

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    print(f"""
    ╔═══════════════════════════════════════╗
    ║   MoneyTalks Advisor API Server      ║
    ╠═══════════════════════════════════════╣
    ║   Gemini:     {'✓' if GEMINI_API_KEY else '✗'}                      ║
    ║   ElevenLabs: {'✓' if ELEVENLABS_API_KEY else '✗'}                      ║
    ║   Nessie:     {'✓' if NESSIE_API_KEY else '✗'}                      ║
    ╠═══════════════════════════════════════╣
    ║   Running on: http://localhost:{PORT}  ║
    ╚═══════════════════════════════════════╝
    """)
    
    app.run(debug=True, port=PORT, host='0.0.0.0')

