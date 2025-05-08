import { Schema, model, Document, Types } from 'mongoose';

export interface IBalance extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  usdBalance: number;
  btcBalance: number;
  ethBalance: number;
  bnbBalance: number;
  usdtBalance: number;
  updatedAt: Date;
}

const balanceSchema = new Schema<IBalance>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  usdBalance: { type: Number, default: 0 },
  btcBalance: { type: Number, default: 0 },
  ethBalance: { type: Number, default: 0 },
  bnbBalance: { type: Number, default: 0 },
  usdtBalance: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook to update the updatedAt field
balanceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Balance = model<IBalance>('Balance', balanceSchema);