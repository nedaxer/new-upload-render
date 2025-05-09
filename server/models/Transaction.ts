import mongoose from 'mongoose';
const { Schema, model, Document, Types } = mongoose;

// Interface representing a Transaction document
export interface ITransaction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  currencyId: string;
  type: string; // 'buy', 'sell', 'deposit', 'withdrawal', 'staking', 'unstaking', 'credit'
  status: string; // 'pending', 'completed', 'failed'
  amount: number;
  price: number;
  fee: number;
  txHash?: string;
  createdAt: Date;
}

// Create the schema
const transactionSchema = new Schema<ITransaction>(
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
    type: {
      type: String,
      required: true,
      enum: ['buy', 'sell', 'deposit', 'withdrawal', 'staking', 'unstaking', 'credit'],
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    amount: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      default: 0,
    },
    txHash: {
      type: String,
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

// Export the Transaction model (ensuring it's only defined once)
export const Transaction = mongoose.models.Transaction || model<ITransaction>('Transaction', transactionSchema);