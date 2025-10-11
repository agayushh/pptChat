import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/mongodb'
import User from '@/app/lib/models/User'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const user = await User.findOne({ clerkId: userId })

    if (!user) {
      return NextResponse.json({ chats: [] })
    }

    return NextResponse.json({ chats: user.chats || [] })
  } catch (error) {
    console.error('Error fetching user chats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chats } = await request.json()

    await connectDB()
    
    const user = await User.findOne({ clerkId: userId })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    user.chats = chats
    await user.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving user chats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
