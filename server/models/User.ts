import mongoose from 'mongoose';

export interface IUser {
  _id: string;
  uid: string;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
  isAdmin: boolean;
  balance: number;
  profilePicture?: string;
  favorites?: string[];
  preferences?: {
    lastSelectedPair?: string;
    lastSelectedCrypto?: string;
    lastSelectedTab?: string;
  };
  verificationCode?: string;
  verificationExpiry?: Date;
  resetPasswordCode?: string;
  resetPasswordExpiry?: Date;
  lastActivity?: Date;
  onlineTime?: number; // Total online time in minutes
  sessionStart?: Date;
  isOnline?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new mongoose.Schema({
  uid: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  balance: { type: Number, default: 0 },
  profilePicture: String,
  favorites: [String],
  preferences: {
    lastSelectedPair: String,
    lastSelectedCrypto: String,
    lastSelectedTab: String
  },
  verificationCode: String,
  verificationExpiry: Date,
  resetPasswordCode: String,
  resetPasswordExpiry: Date,
  lastActivity: { type: Date, default: Date.now },
  onlineTime: { type: Number, default: 0 }, // Total online time in minutes
  sessionStart: Date,
  isOnline: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);