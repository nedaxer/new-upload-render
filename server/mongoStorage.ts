// MongoDB models and types
import { User, IUser } from './models/User';
import { InsertUser } from '@shared/schema';

// Storage interface for MongoDB implementation
export interface IMongoStorage {
  getUser(id: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  createUser(user: InsertUser): Promise<IUser>;
  setVerificationCode(userId: string, code: string, expiresAt: Date): Promise<void>;
  verifyUser(userId: string, code: string): Promise<boolean>;
  markUserAsVerified(userId: string): Promise<void>;
  setResetPasswordCode(userId: string, code: string, expiresAt: Date): Promise<void>;
  verifyResetPasswordCode(userId: string, code: string): Promise<boolean>;
  updatePassword(userId: string, newPassword: string): Promise<boolean>;
}

export class MongoStorage implements IMongoStorage {
  constructor() {
    // No need to connect in constructor - app.ts already connects
    console.log('MongoDB storage initialized');
  }

  async getUser(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id);
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    try {
      return await User.findOne({ username });
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email });
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  async createUser(userData: InsertUser): Promise<IUser> {
    try {
      // Import auth service
      const { authService } = await import('./services/auth.service');
      
      // Hash the password
      const hashedPassword = await authService.hashPassword(userData.password);
      
      const newUser = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword, // Store hashed password
        firstName: userData.firstName,
        lastName: userData.lastName,
        isVerified: true, // Set users as verified by default
      });
      
      return await newUser.save();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async setVerificationCode(userId: string, code: string, expiresAt: Date): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        verificationCode: code,
        verificationCodeExpires: expiresAt,
      });
    } catch (error) {
      console.error('Error setting verification code:', error);
      throw error;
    }
  }

  async verifyUser(userId: string, code: string): Promise<boolean> {
    try {
      const user = await User.findById(userId);
      if (!user) return false;

      // Check if code is valid and not expired
      if (user.verificationCode !== code) return false;
      if (user.verificationCodeExpires && user.verificationCodeExpires < new Date()) return false;

      return true;
    } catch (error) {
      console.error('Error verifying user:', error);
      return false;
    }
  }

  async markUserAsVerified(userId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      });
    } catch (error) {
      console.error('Error marking user as verified:', error);
      throw error;
    }
  }
  
  async setResetPasswordCode(userId: string, code: string, expiresAt: Date): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        resetPasswordCode: code,
        resetPasswordCodeExpires: expiresAt,
      });
    } catch (error) {
      console.error('Error setting reset password code:', error);
      throw error;
    }
  }
  
  async verifyResetPasswordCode(userId: string, code: string): Promise<boolean> {
    try {
      const user = await User.findById(userId);
      if (!user) return false;
      
      // Check if code is valid and not expired
      if (user.resetPasswordCode !== code) return false;
      if (user.resetPasswordCodeExpires && user.resetPasswordCodeExpires < new Date()) return false;
      
      return true;
    } catch (error) {
      console.error('Error verifying reset password code:', error);
      return false;
    }
  }
  
  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      // Import auth service to hash the new password
      const { authService } = await import('./services/auth.service');
      
      // Hash the new password
      const hashedPassword = await authService.hashPassword(newPassword);
      
      // Update the user's password and clear the reset code
      await User.findByIdAndUpdate(userId, {
        password: hashedPassword,
        resetPasswordCode: null,
        resetPasswordCodeExpires: null,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  }
}

// Export an instance of MongoDB storage
export const mongoStorage = new MongoStorage();
