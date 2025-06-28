import mongoose, { Document, Schema, model } from 'mongoose';

export interface IUserSession extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  loginTime: Date;
  logoutTime?: Date;
  lastActivity: Date;
  duration: number; // in seconds
  ip: string;
  userAgent: string;
  isActive: boolean;
}

const userSessionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
    logoutTime: {
      type: Date,
      default: null,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number,
      default: 0,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient queries
userSessionSchema.index({ userId: 1, loginTime: -1 });
userSessionSchema.index({ sessionId: 1 }, { unique: true });
userSessionSchema.index({ isActive: 1, lastActivity: -1 });
userSessionSchema.index({ loginTime: -1 });

export const UserSession = mongoose.models.UserSession || model<IUserSession>('UserSession', userSessionSchema);