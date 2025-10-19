// API Service for MoneyTalks Advisor Backend
// Connects React frontend to Python Flask backend

const API_BASE_URL = 'http://localhost:3001';

export interface AdvisorSession {
  session_id: string;
  welcome_message: string;
  financial_summary: {
    total_spending: number;
    budget_limit: number;
    budget_adherence: number;
    savings_rate?: number;
    top_categories?: Array<{
      category: string;
      amount: number;
    }>;
  };
}

export interface ChatResponse {
  response: string;
  timestamp: string;
}

export interface SpendingAnalysis {
  spending_summary: {
    total_spending: number;
    budget_limit: number;
    budget_adherence: number;
    top_categories: Array<{
      category: string;
      amount: number;
    }>;
  };
  ai_insights: string;
}

export interface GoalsResponse {
  goals: string;
  based_on: any;
}

export interface SessionSummary {
  summary: string;
  ended_at: string;
}

class AdvisorApiService {
  /**
   * Start a new advisor session
   */
  async startSession(userId: string = 'default'): Promise<AdvisorSession> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/advisor/start-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  /**
   * Send a message to the AI advisor
   */
  async sendMessage(sessionId: string, message: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/advisor/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Convert text to speech using ElevenLabs
   * Returns an audio blob that can be played
   */
  async synthesizeSpeech(text: string, voiceId?: string): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/advisor/synthesize-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice_id: voiceId || '21m00Tcm4TlvDq8ikWAM', // Default Rachel voice
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      throw error;
    }
  }

  /**
   * Get spending analysis with AI insights
   */
  async analyzeSpending(sessionId: string): Promise<SpendingAnalysis> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/advisor/analyze-spending`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing spending:', error);
      throw error;
    }
  }

  /**
   * Generate personalized financial goals
   */
  async generateGoals(sessionId: string): Promise<GoalsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/advisor/generate-goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating goals:', error);
      throw error;
    }
  }

  /**
   * End the advisor session
   */
  async endSession(sessionId: string): Promise<SessionSummary> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/advisor/end-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  /**
   * Check if backend is healthy
   */
  async healthCheck(): Promise<{
    status: string;
    gemini_configured: boolean;
    elevenlabs_configured: boolean;
    nessie_configured: boolean;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const advisorApi = new AdvisorApiService();

