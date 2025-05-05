import { connectToDatabase } from './mongodb';
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
}

export class MongoStorage implements IMongoStorage {
  constructor() {
    // Ensure database connection when storage is initialized
    this.initializeConnection();
  }

  private async initializeConnection() {
    await connectToDatabase();
    console.log('MongoDB storage ready');
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
      const newUser = new User({
        username: userData.username,
        email: userData.email,
        password: userData.password, // In a real app, you'd hash this
        firstName: userData.firstName,
        lastName: userData.lastName,
        isVerified: false,
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
}

// Export an instance of MongoDB storage
export const mongoStorage = new MongoStorage();
