import { MemoryClient } from 'mem0ai';

// Initialize Mem0 client
let memoryClient: MemoryClient | null = null;

const initializeMemoryClient = () => {
  if (!memoryClient && process.env.MEM0_API_KEY) {
    memoryClient = new MemoryClient({
      apiKey: process.env.MEM0_API_KEY,
    });
  }
  return memoryClient;
};

export interface UserMemory {
  id?: string;
  text: string;
  metadata?: {
    category?: string;
    timestamp?: string;
    chatId?: string;
  };
}

interface MemoryResponse {
  id: string;
  text?: string;
  memory?: string;
  metadata?: Record<string, unknown>;
}

export class MemoryService {
  private client: MemoryClient | null;
  
  constructor() {
    this.client = initializeMemoryClient();
  }

  /**
   * Add a new memory for a user
   */
  async addMemory(userId: string, message: string, metadata?: Record<string, unknown>): Promise<void> {
    if (!this.client) {
      console.warn('Mem0 client not initialized - skipping memory addition');
      return;
    }

    try {
      await this.client.add([
        {
          role: 'user',
          content: message,
        }
      ], {
        user_id: userId,
        metadata: {
          timestamp: new Date().toISOString(),
          ...metadata,
        },
      });
      console.log(`Memory added for user ${userId}`);
    } catch (error) {
      console.error('Failed to add memory:', error);
      // Don't throw - memory should be optional and not break chat
    }
  }

  /**
   * Search memories for a user
   */
  async searchMemories(userId: string, query: string, limit: number = 10): Promise<UserMemory[]> {
    if (!this.client) {
      console.warn('Mem0 client not initialized - returning empty memories');
      return [];
    }

    try {
      const response = await this.client.search(query, {
        user_id: userId,
        limit,
      });
      
      return response.map((memory: MemoryResponse) => ({
        id: memory.id,
        text: memory.text || memory.memory || '',
        metadata: memory.metadata || {},
      }));
    } catch (error) {
      console.error('Failed to search memories:', error);
      return [];
    }
  }

  /**
   * Get all memories for a user
   */
  async getUserMemories(userId: string, limit: number = 50): Promise<UserMemory[]> {
    if (!this.client) {
      console.warn('Mem0 client not initialized - returning empty memories');
      return [];
    }

    try {
      const response = await this.client.getAll({
        user_id: userId,
        limit,
      });
      
      return response.map((memory: MemoryResponse) => ({
        id: memory.id,
        text: memory.text || memory.memory || '',
        metadata: memory.metadata || {},
      }));
    } catch (error) {
      console.error('Failed to get user memories:', error);
      return [];
    }
  }

  /**
   * Delete a specific memory
   */
  async deleteMemory(memoryId: string): Promise<void> {
    if (!this.client) {
      console.warn('Mem0 client not initialized - skipping memory deletion');
      return;
    }

    try {
      await this.client.delete(memoryId);
      console.log(`Memory ${memoryId} deleted`);
    } catch (error) {
      console.error('Failed to delete memory:', error);
    }
  }

  /**
   * Update user context with relevant memories
   */
  async getContextualMemories(userId: string, currentMessage: string): Promise<string> {
    if (!this.client) {
      return '';
    }

    try {
      // Search for relevant memories based on current message
      const relevantMemories = await this.searchMemories(userId, currentMessage, 5);
      
      if (relevantMemories.length === 0) {
        return '';
      }

      // Format memories into context
      const memoryContext = relevantMemories
        .map(memory => `- ${memory.text}`)
        .join('\n');

      return `\n\nRelevant context from previous conversations:\n${memoryContext}`;
    } catch (error) {
      console.error('Failed to get contextual memories:', error);
      return '';
    }
  }

  /**
   * Extract and store important information from conversation
   */
  async processConversation(userId: string, userMessage: string, assistantMessage: string, chatId?: string): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      // Extract key information from the conversation
      const conversationText = `User: ${userMessage}\nAssistant: ${assistantMessage}`;
      
      // Add the conversation to memory
      await this.addMemory(userId, conversationText, {
        type: 'conversation',
        chatId,
        userMessage,
        assistantMessage,
      });

      // If the user message contains personal information, preferences, or important facts
      // we can extract and store them separately
      if (this.containsPersonalInfo(userMessage)) {
        await this.addMemory(userId, userMessage, {
          type: 'personal_info',
          chatId,
        });
      }
    } catch (error) {
      console.error('Failed to process conversation for memory:', error);
    }
  }

  /**
   * Simple heuristic to detect personal information
   */
  private containsPersonalInfo(message: string): boolean {
    const personalKeywords = [
      'my name is', 'i am', 'i work', 'i like', 'i prefer', 'i love', 'i hate',
      'my favorite', 'i study', 'i live', 'my job', 'my hobby', 'i enjoy',
      'remember that', 'keep in mind', 'note that', 'important to know'
    ];
    
    const lowerMessage = message.toLowerCase();
    return personalKeywords.some(keyword => lowerMessage.includes(keyword));
  }
}

// Export singleton instance
export const memoryService = new MemoryService();
