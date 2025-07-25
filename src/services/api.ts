const API_BASE_URL = 'http://localhost:8080';

export interface AIResponse {
  content: string;
}

export interface AIError {
  error: string;
}

export const generateText = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData: AIError = await response.json();
      throw new Error(errorData.error || 'Failed to generate text');
    }

    const data: AIResponse = await response.json();
    return data.content || 'No content generated';
  } catch (error) {
    console.error('API Error:', error);
    if (error instanceof Error) {
      throw new Error(`AI Service Error: ${error.message}`);
    }
    throw new Error('Unknown error occurred while generating text');
  }
};