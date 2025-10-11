import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function GET() {
  try {
    // Simple test to verify OpenAI API key
    const result = await generateText({
      model: openai('gpt-3.5-turbo'),
      prompt: 'Say "Hello, API key is working!" in one sentence.',
    });

    return Response.json({ 
      success: true, 
      message: result.text,
      status: 'OpenAI API key is working correctly!'
    });
  } catch (error: unknown) {
    console.error('OpenAI API test error:', error);
    return Response.json({ 
      success: false, 
      error: (error as Error).message,
      status: 'OpenAI API key test failed'
    }, { status: 500 });
  }
}
