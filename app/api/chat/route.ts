import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { memoryService } from '@/app/lib/memory';
import { auth } from '@clerk/nextjs/server';
import { 
  trimMessagesForContext, 
  createContextSummary, 
  getContextInfo,
  type ModelType 
} from '@/app/lib/contextWindow';

export async function POST(req: Request) {
  try {
    console.log('=== Chat API Request ===');
    const { messages, userId, model = 'gemini-2.5-flash', images = [] } = await req.json();
    console.log('Messages:', messages?.length, 'Model:', model);
    
    // Get user ID from Clerk auth if not provided
    let currentUserId = userId;
    if (!currentUserId) {
      try {
        const { userId: clerkUserId } = await auth();
        currentUserId = clerkUserId;
      } catch (error) {
        console.warn('Could not get user ID from Clerk auth');
      }
    }

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    let contextualMemories = '';
    
    // If we have a user ID, get contextual memories
    if (currentUserId && latestMessage?.role === 'user') {
      contextualMemories = await memoryService.getContextualMemories(
        currentUserId, 
        latestMessage.content
      );
    }

    // Enhanced system prompt with memory context
    let systemPrompt = `You are a helpful AI assistant. Provide thoughtful, accurate responses to user questions.

IMPORTANT FORMATTING RULES:
- Always use proper markdown formatting in your responses
- For code snippets, use triple backticks with the language identifier (e.g., \`\`\`python, \`\`\`javascript, \`\`\`typescript, \`\`\`bash, etc.)
- For inline code, use single backticks
- Use headers (##, ###) to organize information
- Use bullet points (-) or numbered lists (1., 2., 3.) for lists
- Use **bold** for emphasis and *italic* for secondary emphasis
- For tables, use markdown table syntax
- For links, use [text](url) format
- For blockquotes, use > at the start of lines

Example code block format:
\`\`\`language
code here
\`\`\`

${contextualMemories ? `You have access to the following context from previous conversations with this user:${contextualMemories}

Use this context to provide more personalized and relevant responses. Reference previous conversations when appropriate, but don't mention that you're using stored memories unless specifically asked.` : ''}

Always be helpful, accurate, and maintain context from the conversation history.`;

    // Context window management
    const modelType = model as ModelType;
    const contextInfo = getContextInfo(messages, modelType, systemPrompt);
    
    let processedMessages = messages;
    let contextSummary = '';
    
  // If we need to trim messages due to context window limits
  if (contextInfo.needsTrimming || contextInfo.totalTokens > contextInfo.maxTokens) {
    console.log(`Context window utilization: ${contextInfo.utilization.toFixed(1)}% (${contextInfo.totalTokens}/${contextInfo.maxTokens} tokens)`);
    
    // Find messages that will be truncated
    const trimmedMessages = trimMessagesForContext(messages, modelType, systemPrompt);
    const truncatedMessages = messages.slice(0, messages.length - trimmedMessages.length);      if (truncatedMessages.length > 0) {
        contextSummary = createContextSummary(truncatedMessages);
        // Add context summary to system prompt
        systemPrompt = `${systemPrompt}

${contextSummary}`;
      }
      
      processedMessages = trimmedMessages;
      
      console.log(`Trimmed conversation: ${messages.length} -> ${processedMessages.length} messages`);
    }

    // Define types for processed images
    interface ProcessedImage {
      mimeType: string;
      base64: string;
      [key: string]: unknown;
    }

    // Prepare messages with images for vision models
    const formattedMessages = processedMessages.map((message: { role: 'user' | 'assistant'; content: string; images?: ProcessedImage[] }) => {
      if (message.role === 'user' && message.images && message.images.length > 0) {
        // For vision-enabled models, format message with images
        const content = [
          { type: 'text', text: message.content },
          ...message.images.map((image: ProcessedImage) => ({
            type: 'image',
            image: `data:${image.mimeType};base64,${image.base64}`,
          }))
        ];
        return { role: message.role, content };
      }
      return {
        role: message.role,
        content: message.content,
      };
    });

    // Add images to the latest message if provided
    if (images && images.length > 0 && processedMessages.length > 0) {
      const lastMessageIndex = formattedMessages.length - 1;
      const lastMessage = formattedMessages[lastMessageIndex];
      
      if (lastMessage.role === 'user') {
        if (Array.isArray(lastMessage.content)) {
          // Already has content array, add images
          lastMessage.content.push(
            ...images.map((image: ProcessedImage) => ({
              type: 'image',
              image: `data:${image.mimeType};base64,${image.base64}`,
            }))
          );
        } else {
          // Convert to content array with text and images
          lastMessage.content = [
            { type: 'text', text: lastMessage.content as string },
            ...images.map((image: ProcessedImage) => ({
              type: 'image',
              image: `data:${image.mimeType};base64,${image.base64}`,
            }))
          ];
        }
      }
    }

    console.log('Calling Gemini with model:', model);
    console.log('Formatted messages count:', formattedMessages.length);
    
    const result = await streamText({
      model: google(model),
      messages: formattedMessages,
      system: systemPrompt,
      onFinish: async (result) => {
        console.log('Response finished, text length:', result.text?.length);
        // Store the conversation in memory after completion
        if (currentUserId && latestMessage?.role === 'user') {
          await memoryService.processConversation(
            currentUserId,
            latestMessage.content,
            result.text
          );
        }
      },
    });
    
    console.log('Streaming response created successfully');

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
