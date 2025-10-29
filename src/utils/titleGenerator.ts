/**
 * Generate a conversation title from the first user message
 * Uses simple heuristics to create a short, descriptive title
 */

export function generateConversationTitle(firstMessage: string): string {
  if (!firstMessage || firstMessage.trim().length === 0) {
    return 'New Conversation';
  }

  // Clean the message
  const cleaned = firstMessage.trim();
  
  // If message is short enough, use it as is (up to 50 chars)
  if (cleaned.length <= 50) {
    return cleaned;
  }

  // Extract first sentence or question
  const sentences = cleaned.split(/[.!?]+/);
  const firstSentence = sentences[0].trim();

  if (firstSentence.length <= 50) {
    return firstSentence;
  }

  // Truncate to first 47 characters and add ellipsis
  return firstSentence.substring(0, 47) + '...';
}

