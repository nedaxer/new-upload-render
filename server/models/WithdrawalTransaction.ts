import mongoose, { Schema, Document } from 'mongoose';

export interface IWithdrawalTransaction extends Document {
  _id: string;
  userId: string;
  adminId: string;
  cryptoSymbol: string;
  cryptoName: string;
  chainType: string;
  networkName: string;
  withdrawalAddress: string;
  usdAmount: number;
  cryptoAmount: number;
  cryptoPrice: number;
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalTransactionSchema = new Schema<IWithdrawalTransaction>({
  userId: { type: String, required: true, index: true },
  adminId: { type: String, required: true },
  cryptoSymbol: { type: String, required: true },
  cryptoName: { type: String, required: true },
  chainType: { type: String, required: true },
  networkName: { type: String, required: true },
  withdrawalAddress: { type: String, required: true },
  usdAmount: { type: Number, required: true },
  cryptoAmount: { type: Number, required: true },
  cryptoPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'failed'], default: 'confirmed' },
  transactionHash: { type: String },
}, {
  timestamps: true
});

export const WithdrawalTransaction = mongoose.model<IWithdrawalTransaction>('WithdrawalTransaction', WithdrawalTransactionSchema);