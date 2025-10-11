# Migration from OpenAI to Google Gemini

This document outlines the changes made to convert the project from OpenAI GPT models to Google Gemini.

## Key Changes

### 1. Dependencies

**Before:**
```json
"@ai-sdk/openai": "^2.0.48"
```

**After:**
```json
"@ai-sdk/google": "^2.0.20"
```

### 2. Environment Variables

**Before:**
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

**After:**
```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
```

### 3. Code Changes

**Before:**
```typescript
import { openai } from '@ai-sdk/openai';

const result = await streamText({
  model: openai('gpt-3.5-turbo'),
  messages,
  system: 'You are a helpful assistant.',
});
```

**After:**
```typescript
import { google } from '@ai-sdk/google';

const result = await streamText({
  model: google('gemini-2.5-flash'),
  messages,
  system: 'You are a helpful assistant.',
});
```

### 4. Model Context Windows

Updated context window limits for Gemini models:
- `gemini-2.5-flash`: 1M tokens
- `gemini-2.5-pro`: 1M tokens  
- `gemini-2.0-flash`: 1M tokens

### 5. Default Models

Changed default models throughout the application:
- Chat API: `gemini-2.5-flash`
- Context indicators: `gemini-2.5-flash`
- useChat hook: `gemini-2.5-flash`

## Available Gemini Models

- **gemini-2.5-flash**: Latest fast, efficient model for most use cases
- **gemini-2.5-pro**: Most capable model for complex tasks
- **gemini-2.0-flash**: Fast model with good performance

## Setup Instructions

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Get Google AI API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env.local`:
     ```bash
     GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
     ```

3. **Test the integration:**
   ```bash
   curl http://localhost:3000/api/test-gemini
   ```

## Benefits of Gemini

## Benefits of Gemini

- **Large Context**: 1M+ tokens vs 32K-128K for GPT models
- **Latest Technology**: Gemini 2.5 with state-of-the-art reasoning
- **Cost-Effective**: Generally more affordable than OpenAI models
- **Vision Support**: Built-in image understanding capabilities
- **Fast Performance**: Optimized inference speeds with Flash models

## Migration Checklist

- [x] Updated package.json dependencies
- [x] Replaced OpenAI imports with Google imports
- [x] Updated model names throughout codebase
- [x] Updated context window configurations
- [x] Updated environment variable references
- [x] Updated documentation
- [x] Created test endpoint for Gemini
- [x] Updated default model configurations
