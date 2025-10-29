/**
 * Approximate token counter for OpenAI-style models
 * This is a rough estimate - actual token count may vary
 * 
 * Rules of thumb:
 * - 1 token ≈ 4 characters in English
 * - 1 token ≈ ¾ words
 * - 100 tokens ≈ 75 words
 */

export function estimateTokenCount(text: string): number {
  if (!text) return 0;

  // Remove extra whitespace
  const cleaned = text.trim();
  
  // Count words
  const words = cleaned.split(/\s+/).length;
  
  // Estimate: ~1.3 tokens per word (accounts for punctuation, special chars)
  const estimate = Math.ceil(words * 1.3);
  
  return estimate;
}

export function estimateMessagesTokenCount(messages: { role: string; content: string }[]): number {
  let total = 0;
  
  for (const message of messages) {
    // Add tokens for message structure (role, etc.) - roughly 4 tokens per message
    total += 4;
    
    // Add content tokens
    total += estimateTokenCount(message.content);
  }
  
  // Add base overhead
  total += 3;
  
  return total;
}

export function getTokenColorClass(tokenCount: number): string {
  if (tokenCount < 2000) {
    return 'text-green-600 dark:text-green-400';
  } else if (tokenCount < 6000) {
    return 'text-yellow-600 dark:text-yellow-400';
  } else if (tokenCount < 12000) {
    return 'text-orange-600 dark:text-orange-400';
  } else {
    return 'text-red-600 dark:text-red-400';
  }
}

