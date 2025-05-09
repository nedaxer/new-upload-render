import mongoose, { Document } from 'mongoose';
const { Schema, model } = mongoose;

// Interface representing a UserBalance document
export interface IUserBalance extends Document {
  userId: mongoose.Types.ObjectId;
  currencyId: string;
  amount: number;
  updatedAt: Date;
  createdAt: Date;
}

// Create the schema
const userBalanceSchema = new Schema<IUserBalance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    currencyId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for userId and currencyId to ensure uniqueness
userBalanceSchema.index({ userId: 1, currencyId: 1 }, { unique: true });

// Export the UserBalance model (ensuring it's only defined once)
export const UserBalance = mongoose.models.UserBalance || model<IUserBalance>('UserBalance', userBalanceSchema);