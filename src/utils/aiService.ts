import { Message } from '../types';

export interface AIResponse {
  content: string;
  error?: string;
}

export const sendMessageToAI = async (
  messages: Message[],
  apiKey: string,
  modelId: string,
  provider: 'openai' | 'openrouter'
): Promise<AIResponse> => {
  try {
    const endpoint = provider === 'openai'
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://openrouter.ai/api/v1/chat/completions';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = window.location.origin;
      headers['X-Title'] = 'AI Chatbot';
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: modelId,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || 'No response generated',
    };
  } catch (error) {
    return {
      content: '',
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};

export const validateApiKey = async (
  apiKey: string,
  provider: 'openai' | 'openrouter'
): Promise<boolean> => {
  if (!apiKey || apiKey.trim().length === 0) {
    return false;
  }

  try {
    const endpoint = provider === 'openai'
      ? 'https://api.openai.com/v1/models'
      : 'https://openrouter.ai/api/v1/models';

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`,
    };

    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = window.location.origin;
    }

    const response = await fetch(endpoint, { headers });
    return response.ok;
  } catch {
    return false;
  }
};
