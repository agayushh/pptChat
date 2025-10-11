import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export async function GET() {
  try {
    console.log('=== Simple Test ===');
    
    const result = await streamText({
      model: google('gemini-2.5-flash'),
      messages: [
        { role: 'user', content: 'Say "Hello World!" and nothing else.' }
      ],
    });

    console.log('Stream created successfully');
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Test error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
