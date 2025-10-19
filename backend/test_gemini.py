import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

print(f"API Key (first 10 chars): {GEMINI_API_KEY[:10]}...")

try:
    genai.configure(api_key=GEMINI_API_KEY)
    
    # Try listing models
    print("\nAvailable models:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"  - {m.name}")
    
    # Try a simple generation
    print("\nTesting gemini-pro...")
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Say hello in one sentence")
    print(f"Response: {response.text}")
    print("\n✅ SUCCESS! Gemini is working!")
    
except Exception as e:
    print(f"\n❌ ERROR: {type(e).__name__}")
    print(f"Message: {str(e)}")

