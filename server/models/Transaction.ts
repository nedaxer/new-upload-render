import { Schema, model, Document, Types } from 'mongoose';

export type TransactionType = 'deposit' | 'buy' | 'sell' | 'stake' | 'unstake' | 'staking_reward';
export type CryptoCurrency = 'BTC' | 'ETH' | 'BNB' | 'USDT';

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  usdAmount: number;
  cryptoCurrency?: CryptoCurrency;
  exchangeRate?: number;
  txHash?: string;
  status: 'pending' | 'completed' | 'failed';
  details?: string;
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['deposit', 'buy', 'sell', 'stake', 'unstake', 'staking_reward'] 
  },
  amount: { type: Number, required: true },
  usdAmount: { type: Number, required: true },
  cryptoCurrency: { 
    type: String, 
    enum: ['BTC', 'ETH', 'BNB', 'USDT'],
    required: function() {
      return this.type !== 'staking_reward';
    }
  },
  exchangeRate: { type: Number },
  txHash: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'completed' 
  },
  details: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Transaction = model<ITransaction>('Transaction', transactionSchema);