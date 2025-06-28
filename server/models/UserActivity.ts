import mongoose, { Document, Schema, model } from 'mongoose';

export interface IUserActivity extends Document {
  userId: mongoose.Types.ObjectId;
  activityType: 'login' | 'logout' | 'page_view' | 'trade' | 'deposit' | 'withdrawal' | 'transfer';
  details: {
    page?: string;
    ip?: string;
    userAgent?: string;
    amount?: number;
    currency?: string;
    description?: string;
  };
  timestamp: Date;
}

const userActivitySchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activityType: {
      type: String,
      enum: ['login', 'logout', 'page_view', 'trade', 'deposit', 'withdrawal', 'transfer'],
      required: true,
    },
    details: {
      page: String,
      ip: String,
      userAgent: String,
      amount: Number,
      currency: String,
      description: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient queries
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ activityType: 1, timestamp: -1 });
userActivitySchema.index({ timestamp: -1 });

export const UserActivity = mongoose.models.UserActivity || model<IUserActivity>('UserActivity', userActivitySchema);