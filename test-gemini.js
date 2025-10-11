// Simple test script to verify Gemini integration
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

async function testGemini() {
  try {
    console.log('Testing Gemini integration...');
    
    const result = await streamText({
      model: google('gemini-2.5-flash'),
      messages: [
        { role: 'user', content: 'Say "Hello from Gemini!" and nothing else.' }
      ],
    });

    console.log('Stream created, reading response...');
    
    let fullText = '';
    for await (const chunk of result.textStream) {
      fullText += chunk;
      console.log('Chunk:', chunk);
    }
    
    console.log('Full response:', fullText);
    
  } catch (error) {
    console.error('Error testing Gemini:', error);
  }
}

testGemini();
