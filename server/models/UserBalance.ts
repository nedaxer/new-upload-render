import mongoose, { Document, Schema, model } from 'mongoose';

export interface IUserBalance extends Document {
  userId: mongoose.Types.ObjectId;
  usdBalance: number; // Main balance in USD
  updatedAt: Date;
  createdAt: Date;
}

const userBalanceSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    usdBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create a unique index for user balances
userBalanceSchema.index({ userId: 1 }, { unique: true });

// Export the UserBalance model
export const UserBalance = mongoose.models.UserBalance || model<IUserBalance>('UserBalance', userBalanceSchema);