import { Schema, model, Document, Types } from 'mongoose';
import { CryptoCurrency } from './Transaction';

export interface IStaking extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  cryptoCurrency: CryptoCurrency;
  amount: number; // Amount in USD
  rewardRate: number; // Weekly reward percentage
  startDate: Date;
  lastRewardDate: Date;
  totalRewards: number; // Total rewards earned in USD
  active: boolean;
  endDate?: Date;
}

const stakingSchema = new Schema<IStaking>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cryptoCurrency: { 
    type: String, 
    enum: ['BTC', 'ETH', 'BNB', 'USDT'],
    required: true
  },
  amount: { type: Number, required: true },
  rewardRate: { type: Number, required: true }, // Weekly percentage rate
  startDate: { type: Date, default: Date.now },
  lastRewardDate: { type: Date, default: Date.now },
  totalRewards: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  endDate: { type: Date }
});

export const Staking = model<IStaking>('Staking', stakingSchema);