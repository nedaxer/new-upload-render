import { Schema, model, Document, Types } from 'mongoose';

export interface IWallet extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  btcAddress: string;
  ethAddress: string;
  bnbAddress: string;
  usdtAddress: string;
  btcDerivationIndex: number;
  ethDerivationIndex: number;
  bnbDerivationIndex: number;
  usdDerivationIndex: number;
  createdAt: Date;
}

const walletSchema = new Schema<IWallet>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  btcAddress: { type: String, required: true },
  ethAddress: { type: String, required: true },
  bnbAddress: { type: String, required: true },
  usdtAddress: { type: String, required: true },
  btcDerivationIndex: { type: Number, required: true },
  ethDerivationIndex: { type: Number, required: true },
  bnbDerivationIndex: { type: Number, required: true },
  usdDerivationIndex: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Wallet = model<IWallet>('Wallet', walletSchema);