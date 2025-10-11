import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import connectDB from '@/app/lib/mongodb'
import User from '@/app/lib/models/User'

export async function POST() {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ clerkId: userId })

    if (existingUser) {
      return NextResponse.json({ user: existingUser })
    }

    // Create new user
    const newUser = new User({
      clerkId: userId,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      avatar: user.imageUrl || '',
      chats: [],
    })

    await newUser.save()

    return NextResponse.json({ user: newUser })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
