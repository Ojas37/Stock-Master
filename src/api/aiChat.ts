import { fetchWithAuth, handleResponse } from './config';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  metadata?: {
    intent: string;
    rowsReturned: number;
  };
}

/**
 * Send a message to the AI chat assistant
 */
export const sendChatMessage = async (message: string): Promise<ChatResponse> => {
  try {
    const response = await fetchWithAuth('/api/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    return await handleResponse<ChatResponse>(response);
  } catch (error) {
    console.error('Send chat message error:', error);
    throw error;
  }
};

/**
 * Get suggested queries for the chat
 */
export const getChatSuggestions = async (): Promise<string[]> => {
  try {
    const response = await fetchWithAuth('/api/ai-chat/suggestions');
    const result = await handleResponse<{ success: boolean; suggestions: string[] }>(response);
    return result.suggestions;
  } catch (error) {
    console.error('Get chat suggestions error:', error);
    return [];
  }
};
