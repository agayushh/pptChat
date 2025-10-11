import mongoose from 'mongoose';
import type { Chat } from '../hooks/useChat';

const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  avatar: {
    type: String,
  },
  chats: [{
    id: String,
    title: String,
    messages: [{
      id: String,
      role: String,
      content: String,
      createdAt: String,
    }],
    createdAt: String,
    updatedAt: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export interface IUser extends mongoose.Document {
  clerkId: string;
  email: string;
  firstName: string;
  lastName?: string;
  avatar?: string;
  chats: Chat[];
  createdAt: Date;
  updatedAt: Date;
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
