from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from dotenv import load_dotenv
import google.generativeai as genai
import requests
from datetime import datetime, timedelta
import json
from io import BytesIO

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure APIs
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
NESSIE_API_KEY = os.getenv('NESSIE_API_KEY')
PORT = int(os.getenv('PORT', 3001))

# Initialize Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# In-memory session storage (use Redis in production)
sessions = {}

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
    return """You are a professional financial advisor for MoneyTalks, a personal CFO platform.

Your role:
- Provide clear, actionable financial advice
- Be conversational but professional
- Keep responses concise (2-3 sentences for voice)
- Use specific numbers from the user's data
- Be encouraging but honest about financial situations

Response style:
- Natural, conversational tone suitable for voice
- Avoid jargon unless necessary
- Use "you" and "your" to personalize
- Give specific recommendations, not generic advice

DO NOT:
- Use emojis or playful language
- Make promises about returns or outcomes
- Give investment advice beyond general guidance
- Be overly formal or robotic
"""

def ask_gemini(user_message, conversation_history=None):
    """Send message to Gemini with context"""
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
        
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        print(f"Gemini error: {e}")
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
    
    if session_id in sessions:
        session = sessions[session_id]
        # Generate summary
        summary_prompt = "Provide a brief 2-sentence summary of our conversation and next steps."
        summary = ask_gemini(summary_prompt, session["conversation_history"])
        
        # Clean up session
        del sessions[session_id]
        
        return jsonify({
            "summary": summary,
            "ended_at": datetime.now().isoformat()
        })
    
    return jsonify({"error": "Session not found"}), 404

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

