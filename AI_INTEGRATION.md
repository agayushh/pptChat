# ChatGPT Clone with Vercel AI SDK

This is a modern ChatGPT clone built with Next.js, featuring real-time AI responses powered by the Vercel AI SDK.

## Features

- **🔐 Authentication**: Powered by Clerk with sign-in/sign-up
- **🗄️ Database**: MongoDB Atlas for storing chats and user data  
- **🤖 AI Integration**: Vercel AI SDK with OpenAI GPT-3.5-turbo
- **💬 Real-time Chat**: Streaming AI responses with live updates
- **🎨 Modern UI**: Pixel-perfect ChatGPT-inspired interface
- **📱 Responsive**: Works on all devices
- **⚡ Fast**: Built with Next.js 15 and optimized for performance

## AI SDK Integration

### Setup

1. **Install Dependencies**:
   ```bash
   pnpm add ai @ai-sdk/openai
   ```

2. **Environment Variables**:
   Add your OpenAI API key to `.env.local`:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **API Route** (`app/api/chat/route.ts`):
   ```typescript
   import { openai } from '@ai-sdk/openai';
   import { streamText } from 'ai';

   export async function POST(req: Request) {
     const { messages } = await req.json();

     const result = await streamText({
       model: openai('gpt-3.5-turbo'),
       messages,
       system: 'You are a helpful AI assistant.',
     });

     return result.toTextStreamResponse();
   }
   ```

### Key Features

- **🔄 Streaming Responses**: Real-time AI text generation
- **💾 Chat Persistence**: All conversations saved to MongoDB
- **⚡ Optimistic UI**: Instant message display with streaming updates
- **🎯 Error Handling**: Graceful fallbacks and user feedback
- **🏷️ Auto Titles**: Smart chat naming from first messages

### Chat Management

The app includes a comprehensive chat management system:

- **Multiple Chats**: Create and switch between conversations
- **Auto-save**: Conversations automatically saved to database
- **Real-time Updates**: Live streaming of AI responses
- **Message History**: Full conversation persistence
- **Smart Titles**: Auto-generated chat names

## Getting Started

1. **Clone and Install**:
   ```bash
   git clone <repository>
   cd pptchat
   pnpm install
   ```

2. **Environment Setup**:
   - Copy `.env.local.example` to `.env.local`
   - Add your API keys (Clerk, MongoDB, OpenAI)

3. **Run Development Server**:
   ```bash
   pnpm run dev
   ```

4. **Open**: Navigate to [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework**: Next.js 15.5.4
- **AI**: Vercel AI SDK + OpenAI GPT-3.5-turbo
- **Authentication**: Clerk
- **Database**: MongoDB Atlas
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Architecture

```
app/
├── api/
│   ├── chat/           # AI streaming endpoint
│   └── user/           # User data management
├── components/
│   ├── ChatSidebar.tsx # Navigation and chat list
│   ├── ChatWindow.tsx  # Message display area
│   └── Composer.tsx    # Message input interface
├── lib/
│   ├── hooks/
│   │   └── useChat.ts  # Chat state management + AI integration
│   └── models/         # Database schemas
└── chat/
    └── page.tsx        # Main chat interface
```

## AI Response Flow

1. **User Input**: Message typed in Composer component
2. **Optimistic Update**: User message immediately displayed
3. **API Call**: Streaming request to `/api/chat` endpoint
4. **Real-time Updates**: AI response streams back token by token
5. **Persistence**: Complete conversation saved to MongoDB
6. **Auto-sync**: Chat history synchronized across sessions

## Customization

### Model Configuration

Edit `app/api/chat/route.ts` to change AI model or settings:

```typescript
const result = await streamText({
  model: openai('gpt-4'), // Change model
  temperature: 0.7,       // Adjust creativity
  maxTokens: 1000,        // Set response length
  // ... other options
});
```

### System Prompt

Customize the AI behavior by modifying the system message:

```typescript
system: 'You are a helpful coding assistant specialized in web development.'
```

## Deployment

Ready for deployment on Vercel, Netlify, or any Node.js hosting platform.

**Note**: Remember to set your environment variables in production!

## License

MIT License - Feel free to use and modify as needed.
