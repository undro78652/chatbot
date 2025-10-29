import { Message } from '../types';

export interface AIResponse {
  content: string;
  error?: string;
}

export const sendMessageToAI = async (
  messages: Message[],
  apiKey: string,
  modelId: string,
  provider: 'openai' | 'openrouter' | 'anthropic' | 'custom',
  customEndpoint?: string,
  temperature?: number,
  maxTokens?: number
): Promise<AIResponse> => {
  try {
    let endpoint: string;

    if (provider === 'custom' && customEndpoint) {
      endpoint = customEndpoint;
    } else if (provider === 'openai') {
      endpoint = 'https://api.openai.com/v1/chat/completions';
    } else if (provider === 'anthropic') {
      endpoint = 'https://api.anthropic.com/v1/messages';
    } else {
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Anthropic uses x-api-key header, others use Authorization Bearer
    if (provider === 'anthropic') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = window.location.origin;
      headers['X-Title'] = 'AI Chatbot';
    }

    // Anthropic API has a different request format
    const requestBody = provider === 'anthropic' ? {
      model: modelId,
      max_tokens: maxTokens || 1024,
      messages: messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      // Anthropic expects system prompt separately
      system: messages.find(m => m.role === 'system')?.content,
      ...(temperature !== undefined && { temperature }),
    } : {
      model: modelId,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: temperature ?? 0.7,
      ...(maxTokens && { max_tokens: maxTokens }),
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Anthropic response format is different
    const content = provider === 'anthropic'
      ? data.content?.[0]?.text || 'No response generated'
      : data.choices?.[0]?.message?.content || 'No response generated';
    
    return { content };
  } catch (error) {
    return {
      content: '',
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};

export const validateApiKey = async (
  apiKey: string,
  provider: 'openai' | 'openrouter' | 'anthropic'
): Promise<boolean> => {
  if (!apiKey || apiKey.trim().length === 0) {
    return false;
  }

  try {
    let endpoint: string;
    const headers: Record<string, string> = {};

    if (provider === 'openai') {
      endpoint = 'https://api.openai.com/v1/models';
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider === 'anthropic') {
      endpoint = 'https://api.anthropic.com/v1/messages';
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      headers['Content-Type'] = 'application/json';
      // For validation, send a minimal request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });
      return response.ok || response.status === 401; // 401 means key format is recognized
    } else { // openrouter
      endpoint = 'https://openrouter.ai/api/v1/models';
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['HTTP-Referer'] = window.location.origin;
    }

    const response = await fetch(endpoint, { headers });
    return response.ok;
  } catch {
    return false;
  }
};
