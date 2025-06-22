import mongoose, { Document, Schema, model } from 'mongoose';

export interface IUser extends Document {
  uid: string; // 10-digit mixed number UID
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
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

// Function to generate a unique 10-digit mixed number UID
export const generateUID = async (): Promise<string> => {
  let uid: string;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate 10-digit mixed number (starts with a number 1-9, then 9 more digits)
    uid = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    
    // Check if this UID already exists
    const existingUser = await User.findOne({ uid });
    if (!existingUser) {
      isUnique = true;
    }
  }
  
  return uid!;
};

// Export the User model
export const User = mongoose.models.User || model<IUser>('User', userSchema);