import { db } from '@/db';
import { chatsTable, userTable } from '@/db/schema/schema';
import { auth, currentUser } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const user = await currentUser();
  if(!user){
    return NextResponse.json({
      message: "User not found",
    }, {
      status: 404
    })
  }
  const chats = await db.select().from(chatsTable).where(eq(chatsTable.userId, user.id));
  try {
    return NextResponse.json({
      message: "Chats fetched successfully",
      chats: chats
    }, {
      status: 200
    })
  } catch (error) {
    return NextResponse.json({
      message: "Error while fetching chats",
      error: error
    }, {
      status: 500
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    
  } catch (error) {
    
  }
}
