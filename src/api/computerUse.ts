/**
 * Computer Use API Client
 * Integrates with Gemini Computer Use API for car recommendations
 */

const API_BASE_URL = 'http://localhost:3001';

export interface CarRecommendation {
  make: string;
  model: string;
  year: number;
  price: number;
  condition: 'New' | 'Used';
  description: string;
}

export interface CarRecommendationsResponse {
  success: boolean;
  budget: number;
  results: {
    raw_text: string;
    recommendations: CarRecommendation[];
    success: boolean;
  };
  timestamp: string;
  error?: string;
}

/**
 * Get Toyota car recommendations based on budget
 */
export async function getCarRecommendations(budget: number): Promise<CarRecommendationsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/advisor/car-recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ budget }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching car recommendations:', error);
    throw error;
  }
}


