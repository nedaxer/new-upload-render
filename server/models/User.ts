import mongoose, { Document, Schema, model } from 'mongoose';

export interface IUser extends Document {
  uid: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  favorites?: string[];
  preferences?: {
    lastSelectedPair?: string;
    lastSelectedCrypto?: string;
    lastSelectedTab?: string;
  };
  verificationCode?: string;
  verificationCodeExpires?: Date;
  resetPasswordCode?: string;
  resetPasswordCodeExpires?: Date;
  isVerified: boolean;
  isAdmin?: boolean;
  createdAt: Date;
}

const userSchema = new Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    favorites: {
      type: [String],
      default: [],
    },
    preferences: {
      lastSelectedPair: String,
      lastSelectedCrypto: String,
      lastSelectedTab: String,
    },
    verificationCode: {
      type: String,
      default: null,
    },
    verificationCodeExpires: {
      type: Date,
      default: null,
    },
    resetPasswordCode: {
      type: String,
      default: null,
    },
    resetPasswordCodeExpires: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
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

// Create indexes for faster lookups
userSchema.index({ uid: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

// Export the User model
export const User = mongoose.models.User || model<IUser>('User', userSchema);