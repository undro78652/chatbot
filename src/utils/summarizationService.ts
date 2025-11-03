import { v4 as uuidv4 } from 'uuid';
import { Conversation, Message, Summary } from '../types';
import { estimateMessagesTokenCount, estimateTokenCount } from './tokenCounter';
import { sendMessageToAI } from './aiService';

/**
 * Check if a conversation needs summarization based on token threshold
 * @param conversation - The conversation to check
 * @param threshold - Token count threshold to trigger summarization
 * @param keepRecentMessages - Number of recent messages to keep unsummarized
 * @returns True if summarization should be triggered
 */
export function shouldSummarize(
  conversation: Conversation,
  threshold: number,
  keepRecentMessages: number
): boolean {
  if (!conversation || !conversation.messages || conversation.messages.length === 0) {
    return false;
  }

  // Check if auto-summarization is disabled for this conversation
  if (conversation.autoSummarize === false) {
    return false;
  }

  const lastSummarizedIndex = conversation.lastSummarizedIndex || 0;
  const totalMessages = conversation.messages.length;

  // Need at least keepRecentMessages + some to summarize
  const availableToSummarize = totalMessages - lastSummarizedIndex - keepRecentMessages;
  if (availableToSummarize < 10) {
    // Not enough messages to summarize
    return false;
  }

  // Calculate total token count for messages that would be sent to API
  const summaryTokens = conversation.summaries
    ? conversation.summaries.reduce((sum, s) => sum + estimateTokenCount(s.content), 0)
    : 0;

  const unsummarizedMessages = conversation.messages.slice(lastSummarizedIndex);
  const unsummarizedTokens = estimateMessagesTokenCount(unsummarizedMessages);

  const totalTokens = summaryTokens + unsummarizedTokens;

  return totalTokens > threshold;
}

/**
 * Generate an AI summary of a set of messages
 * @param messages - Messages to summarize
 * @param apiKey - API key for the provider
 * @param modelId - Model ID to use for summarization
 * @param provider - AI provider
 * @param endpoint - Optional custom endpoint
 * @returns The generated summary content
 */
export async function generateSummary(
  messages: Message[],
  apiKey: string,
  modelId: string,
  provider: 'openai' | 'openrouter' | 'anthropic' | 'custom',
  endpoint?: string
): Promise<string> {
  // Build the summarization prompt
  const conversationText = messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  const summaryPrompt: Message = {
    id: `summary-prompt-${uuidv4()}`,
    role: 'user',
    content: `Please provide a concise summary of the following conversation, preserving all key facts, topics, decisions, and important context. Focus on what information would be most relevant for continuing this conversation:\n\n${conversationText}`,
    timestamp: Date.now(),
  };

  const systemMessage: Message = {
    id: `summary-system-${uuidv4()}`,
    role: 'system',
    content:
      'You are a conversation summarization assistant. Create brief, factual summaries that preserve essential context and information.',
    timestamp: Date.now(),
  };

  try {
    const response = await sendMessageToAI(
      [systemMessage, summaryPrompt],
      apiKey,
      modelId,
      provider,
      endpoint,
      0.3, // Low temperature for consistency
      400 // Max tokens for summary
    );

    if (response.error) {
      throw new Error(response.error);
    }

    return response.content;
  } catch (error) {
    console.error('Failed to generate summary:', error);
    // Fallback: Create a simple summary
    return `Conversation covering ${messages.length} messages. Topics discussed include various user questions and assistant responses.`;
  }
}

/**
 * Build the optimized context to send to the AI API
 * Includes summaries + recent unsummarized messages
 * @param conversation - The conversation
 * @param systemPrompt - The system prompt to use
 * @returns Array of messages optimized for API call
 */
export function buildContextForAPI(
  conversation: Conversation,
  systemPrompt: string
): Message[] {
  const contextMessages: Message[] = [];

  // Add system prompt
  const systemMessage: Message = {
    id: `sys-${uuidv4()}`,
    role: 'system',
    content: systemPrompt,
    timestamp: Date.now(),
  };
  contextMessages.push(systemMessage);

  // Add summary context if summaries exist
  if (conversation.summaries && conversation.summaries.length > 0) {
    const allSummaries = conversation.summaries
      .map((s, idx) => `[Summary ${idx + 1}]: ${s.content}`)
      .join('\n\n');

    const summaryContextMessage: Message = {
      id: `summary-context-${uuidv4()}`,
      role: 'system',
      content: `Previous conversation context:\n${allSummaries}`,
      timestamp: Date.now(),
    };
    contextMessages.push(summaryContextMessage);
  }

  // Add unsummarized messages (recent conversation)
  const startIndex = conversation.lastSummarizedIndex || 0;
  const recentMessages = conversation.messages.slice(startIndex);
  contextMessages.push(...recentMessages);

  return contextMessages;
}

/**
 * Create a Summary object from summarized messages
 * @param messageRange - [startIndex, endIndex] of messages that were summarized
 * @param summaryContent - The AI-generated summary text
 * @param originalMessages - The original messages that were summarized
 * @returns Summary object
 */
export function createSummary(
  messageRange: [number, number],
  summaryContent: string,
  originalMessages: Message[]
): Summary {
  // Calculate tokens saved
  const originalTokens = estimateMessagesTokenCount(originalMessages);
  const summaryTokens = estimateTokenCount(summaryContent);
  const tokensSaved = originalTokens - summaryTokens;

  return {
    id: `summary-${uuidv4()}`,
    content: summaryContent,
    messageRange,
    tokensSaved: Math.max(0, tokensSaved),
    timestamp: Date.now(),
  };
}

/**
 * Calculate total tokens that would be sent to API (including summaries)
 * @param conversation - The conversation
 * @returns Estimated token count
 */
export function calculateContextTokens(conversation: Conversation): number {
  let totalTokens = 0;

  // Add summary tokens
  if (conversation.summaries) {
    totalTokens += conversation.summaries.reduce(
      (sum, s) => sum + estimateTokenCount(s.content),
      0
    );
  }

  // Add unsummarized message tokens
  const startIndex = conversation.lastSummarizedIndex || 0;
  const unsummarizedMessages = conversation.messages.slice(startIndex);
  totalTokens += estimateMessagesTokenCount(unsummarizedMessages);

  // Add overhead for system messages (rough estimate)
  totalTokens += 50;

  return totalTokens;
}

