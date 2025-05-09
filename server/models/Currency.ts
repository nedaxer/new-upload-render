import mongoose, { Document } from 'mongoose';
const { Schema, model } = mongoose;

// Interface representing a Currency document
export interface ICurrency extends Document {
  symbol: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
}

// Create the schema
const currencySchema = new Schema<ICurrency>(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Export the Currency model (ensuring it's only defined once)
export const Currency = mongoose.models.Currency || model<ICurrency>('Currency', currencySchema);