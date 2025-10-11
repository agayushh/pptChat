# AI Response Troubleshooting Guide

## Changes Made

### 1. Enhanced Response Parsing in useChat Hook
Updated `/app/lib/hooks/useChat.ts` to handle multiple streaming formats:
- Vercel AI SDK format (`0:` prefix)
- Server-Sent Events format (`data:` prefix)
- Direct JSON format

### 2. Added Logging to Chat API
Added console logs in `/app/api/chat/route.ts` to help debug:
- Request details (message count, model)
- Gemini API call
- Response streaming

### 3. Created Test Endpoints
- `/api/test-gemini` - Tests basic Gemini API connectivity
- `/api/test-stream` - Tests streaming response format

## How to Test

### Step 1: Start the Server
```bash
cd /home/ayush/Desktop/pptchat
pnpm dev
```

### Step 2: Test Gemini API (Should work)
Open in browser or use curl:
```bash
curl http://localhost:3000/api/test-gemini
```

Expected response:
```json
{"success":true,"message":"Hello, API key is working!","status":"Gemini API key is working correctly!"}
```

### Step 3: Test Streaming
Open in browser:
```
http://localhost:3000/api/test-stream
```

You should see "Hello World!" streamed back.

### Step 4: Test Chat UI
1. Open `http://localhost:3000/chat` in your browser
2. Try sending a message
3. Check the browser console (F12) for any errors
4. Check the terminal running `pnpm dev` for server logs

## What to Look For

### Browser Console (F12 → Console)
Look for errors like:
- Network errors
- Parsing errors
- "Skipping line:" messages (from the improved parser)

### Server Terminal
Look for logs like:
```
=== Chat API Request ===
Messages: 1 Model: gemini-2.5-flash
Calling Gemini with model: gemini-2.5-flash
Formatted messages count: 1
Streaming response created successfully
```

## Common Issues & Solutions

### Issue 1: No Response in UI
**Symptom**: Message sends but no AI response appears

**Possible Causes**:
1. Streaming format mismatch
2. Response not being parsed correctly
3. Network issue

**Check**:
- Browser console for "Skipping line:" messages
- Server logs for "Streaming response created successfully"
- Network tab in browser DevTools (F12 → Network)

### Issue 2: Error Messages
**Symptom**: Error displayed in chat

**Check**:
- Server terminal for detailed error
- Verify GOOGLE_GENERATIVE_AI_API_KEY is set correctly
- Test with `/api/test-gemini` endpoint

### Issue 3: Slow/No Streaming
**Symptom**: Response appears all at once or very slowly

**Possible Causes**:
1. Buffering in the network layer
2. Frontend not reading stream properly

**Solution**:
- The improved parser in useChat.ts should handle this
- Check if chunks are being logged in browser console

## Testing in Browser

1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Send a chat message**
4. **Look for**:
   - "Skipping line:" messages (shows what's being received)
   - Any error messages
   - Network requests to `/api/chat`

5. **Go to Network tab**
6. **Filter by "chat"**
7. **Click on the `/api/chat` request**
8. **Check**:
   - Status code (should be 200)
   - Response tab (should show streaming data)
   - Timing (should show streaming, not all at once)

## Current Configuration

- **Model**: gemini-2.5-flash
- **API Key**: Set in .env.local as GOOGLE_GENERATIVE_AI_API_KEY
- **Context Window**: 1M tokens
- **Streaming**: Enabled via Vercel AI SDK

## Next Steps if Still Not Working

1. Share the browser console errors
2. Share the server terminal logs when sending a message
3. Test the `/api/test-stream` endpoint and share what you see
4. Check Network tab in browser DevTools for the actual response data
