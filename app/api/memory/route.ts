import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { memoryService } from '@/app/lib/memory';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const memories = await memoryService.getUserMemories(userId);
    
    return Response.json({ 
      success: true,
      memories,
      count: memories.length
    });
  } catch (error) {
    console.error('Memory API GET error:', error);
    return Response.json(
      { error: 'Failed to fetch memories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, metadata } = await req.json();
    
    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    await memoryService.addMemory(userId, message, metadata);
    
    return Response.json({ 
      success: true,
      message: 'Memory added successfully'
    });
  } catch (error) {
    console.error('Memory API POST error:', error);
    return Response.json(
      { error: 'Failed to add memory' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { memoryId } = await req.json();
    
    if (!memoryId) {
      return Response.json({ error: 'Memory ID is required' }, { status: 400 });
    }

    await memoryService.deleteMemory(memoryId);
    
    return Response.json({ 
      success: true,
      message: 'Memory deleted successfully'
    });
  } catch (error) {
    console.error('Memory API DELETE error:', error);
    return Response.json(
      { error: 'Failed to delete memory' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();
    
    if (!query) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    const memories = await memoryService.searchMemories(userId, query);
    
    return Response.json({ 
      success: true,
      memories,
      query
    });
  } catch (error) {
    console.error('Memory API PUT error:', error);
    return Response.json(
      { error: 'Failed to search memories' },
      { status: 500 }
    );
  }
}
