import { Message } from '@/app/lib/hooks/useChat';

// Model context window sizes (in tokens, approximate)
export const MODEL_CONTEXT_LIMITS = {
  'gemini-2.5-flash': 1048576,        // 1M tokens
  'gemini-2.5-pro': 1048576,          // 1M tokens
  'gemini-2.0-flash': 1048576,        // 1M tokens
  'gemini-flash-latest': 1048576,     // 1M tokens
  'gemini-pro-latest': 1048576,       // 1M tokens
  'gemini-1.5-flash-latest': 1048576, // Legacy support
  'gemini-1.5-pro-latest': 2097152,   // Legacy support
  'gemini-1.0-pro': 32768,            // 32K tokens
  'gemini-pro': 32768,                // Alternative name
  'gemini-1.5-flash': 1048576,        // Legacy support
  'gemini-1.5-pro': 2097152,          // Legacy support
  'gpt-3.5-turbo': 4096,
  'gpt-4': 8192,
  'gpt-4-turbo': 128000,
  'gpt-4o': 128000,
  'claude-3-haiku': 200000,
  'claude-3-sonnet': 200000,
  'claude-3-opus': 200000,
} as const;

export type ModelType = keyof typeof MODEL_CONTEXT_LIMITS;

/**
 * Estimate token count for a message
 * Rough estimation: ~4 characters per token for English text
 */
export function estimateTokenCount(text: string): number {
  // Basic token estimation
  // More sophisticated tokenization could use tiktoken library
  return Math.ceil(text.length / 4);
}

/**
 * Calculate total tokens for a conversation
 */
export function calculateConversationTokens(messages: Message[], systemPrompt = ''): number {
  let totalTokens = 0;
  
  // Add system prompt tokens
  if (systemPrompt) {
    totalTokens += estimateTokenCount(systemPrompt);
  }
  
  // Add message tokens with role overhead
  messages.forEach((message) => {
    // Add ~4 tokens overhead per message for role, name, etc.
    totalTokens += estimateTokenCount(message.content) + 4;
  });
  
  // Add conversation overhead (~10-20 tokens)
  totalTokens += 15;
  
  return totalTokens;
}

/**
 * Trim messages to fit within context window
 * Preserves system message and recent context
 */
export function trimMessagesForContext(
  messages: Message[],
  modelType: ModelType = 'gpt-3.5-turbo',
  systemPrompt = '',
  reserveTokens = 1000 // Reserve tokens for response
): Message[] {
  const contextLimit = MODEL_CONTEXT_LIMITS[modelType];
  const maxTokens = contextLimit - reserveTokens;
  
  if (messages.length === 0) return [];
  
  // Always keep the last message (user's current input)
  const trimmedMessages = [...messages];
  let currentTokens = calculateConversationTokens(trimmedMessages, systemPrompt);
  
  // If we're already within limits, return all messages
  if (currentTokens <= maxTokens) {
    return trimmedMessages;
  }
  
  // Strategy: Remove messages from the middle, keeping recent context
  // Always preserve the first user message and recent conversation
  const recentMessages = Math.min(6, messages.length); // Keep last 6 messages
  const recentContext = messages.slice(-recentMessages);
  
  // If just recent messages fit, use them
  const recentTokens = calculateConversationTokens(recentContext, systemPrompt);
  if (recentTokens <= maxTokens) {
    return recentContext;
  }
  
  // If even recent messages are too long, trim from the beginning of recent context
  let messagesToInclude = recentContext;
  currentTokens = recentTokens;
  
  while (currentTokens > maxTokens && messagesToInclude.length > 1) {
    // Remove the oldest message from current selection
    messagesToInclude = messagesToInclude.slice(1);
    currentTokens = calculateConversationTokens(messagesToInclude, systemPrompt);
  }
  
  return messagesToInclude;
}

/**
 * Smart context management that preserves important messages
 */
export function smartTrimMessages(
  messages: Message[],
  modelType: ModelType = 'gpt-3.5-turbo',
  systemPrompt = '',
  reserveTokens = 1000,
  options: {
    preserveSystemMessages?: boolean;
    preserveRecentCount?: number;
    preserveImportantKeywords?: string[];
  } = {}
): Message[] {
  const {
    preserveRecentCount = 4,
    preserveImportantKeywords = ['important', 'remember', 'key', 'crucial', 'note'],
  } = options;
  
  const contextLimit = MODEL_CONTEXT_LIMITS[modelType];
  const maxTokens = contextLimit - reserveTokens;
  
  if (messages.length === 0) return [];
  
  let currentTokens = calculateConversationTokens(messages, systemPrompt);
  
  // If within limits, return all messages
  if (currentTokens <= maxTokens) {
    return messages;
  }
  
  // Identify important messages
  const importantMessages = new Set<string>();
  
  // Mark messages with important keywords
  messages.forEach((message) => {
    const hasImportantKeyword = preserveImportantKeywords.some(keyword =>
      message.content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasImportantKeyword) {
      importantMessages.add(message.id);
    }
  });
  
  // Always preserve recent messages
  const recentMessageIds = new Set(
    messages.slice(-preserveRecentCount).map(m => m.id)
  );
  
  // Combine important and recent messages
  const preserveIds = new Set([...importantMessages, ...recentMessageIds]);
  
  // Build trimmed message list
  let candidateMessages = messages.filter(m => preserveIds.has(m.id));
  
  // If still too long, prioritize recent messages
  currentTokens = calculateConversationTokens(candidateMessages, systemPrompt);
  
  while (currentTokens > maxTokens && candidateMessages.length > 1) {
    // Find the oldest non-recent message to remove
    const oldestNonRecent = candidateMessages.find(m => !recentMessageIds.has(m.id));
    
    if (oldestNonRecent) {
      candidateMessages = candidateMessages.filter(m => m.id !== oldestNonRecent.id);
    } else {
      // If only recent messages remain, remove the oldest
      candidateMessages = candidateMessages.slice(1);
    }
    
    currentTokens = calculateConversationTokens(candidateMessages, systemPrompt);
  }
  
  // Ensure messages are in chronological order
  const messageOrder = new Map(messages.map((m, i) => [m.id, i]));
  candidateMessages.sort((a, b) => 
    (messageOrder.get(a.id) || 0) - (messageOrder.get(b.id) || 0)
  );
  
  return candidateMessages;
}

/**
 * Summarize truncated messages for context preservation
 */
export function createContextSummary(truncatedMessages: Message[]): string {
  if (truncatedMessages.length === 0) return '';
  
  const messageCount = truncatedMessages.length;
  const timespan = truncatedMessages.length > 0 ? 
    `from ${truncatedMessages[0].createdAt} to ${truncatedMessages[truncatedMessages.length - 1].createdAt}` : 
    'recent conversation';
  
  // Extract key topics and themes
  const allContent = truncatedMessages.map(m => m.content).join(' ');
  const topics = extractKeyTopics(allContent);
  
  return `[Previous conversation summary: ${messageCount} messages ${timespan}. ` +
    `Key topics discussed: ${topics.join(', ')}. This context was truncated to fit within token limits.]`;
}

/**
 * Extract key topics from conversation content
 */
function extractKeyTopics(content: string, maxTopics = 5): string[] {
  // Simple keyword extraction
  // In a real implementation, you might use NLP libraries
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });
  
  // Get most frequent meaningful words
  const stopWords = new Set([
    'this', 'that', 'with', 'have', 'will', 'from', 'they', 'know',
    'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when',
    'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over',
    'such', 'take', 'than', 'them', 'well', 'were', 'what'
  ]);
  
  const topics = Array.from(wordCount.entries())
    .filter(([word, count]) => !stopWords.has(word) && count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTopics)
    .map(([word]) => word);
  
  return topics;
}

/**
 * Get context window utilization info
 */
export function getContextInfo(
  messages: Message[],
  modelType: ModelType = 'gpt-3.5-turbo',
  systemPrompt = ''
): {
  totalTokens: number;
  maxTokens: number;
  utilization: number;
  remainingTokens: number;
  needsTrimming: boolean;
} {
  const totalTokens = calculateConversationTokens(messages, systemPrompt);
  const maxTokens = MODEL_CONTEXT_LIMITS[modelType];
  const utilization = (totalTokens / maxTokens) * 100;
  const remainingTokens = Math.max(0, maxTokens - totalTokens);
  const needsTrimming = totalTokens > maxTokens * 0.8; // Suggest trimming at 80%
  
  return {
    totalTokens,
    maxTokens,
    utilization,
    remainingTokens,
    needsTrimming,
  };
}
