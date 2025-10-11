import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function GET() {
  try {
    // Simple test to verify Gemini API key
    const result = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: 'Say "Hello, API key is working!" in one sentence.',
    });

    return Response.json({ 
      success: true, 
      message: result.text,
      status: 'Gemini API key is working correctly!'
    });
  } catch (error: unknown) {
    console.error('Gemini API test error:', error);
    return Response.json({ 
      success: false, 
      error: (error as Error).message,
      status: 'Gemini API key test failed'
    }, { status: 500 });
  }
}
