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
  updateUserProfile(userId: string, updates: Partial<IUser>): Promise<void>;
  
  // Favorites management
  addFavorite(userId: string, cryptoPairSymbol: string, cryptoId: string): Promise<void>;
  removeFavorite(userId: string, cryptoPairSymbol: string): Promise<void>;
  getUserFavorites(userId: string): Promise<string[]>;
  
  // User preferences management
  updateUserPreferences(userId: string, preferences: { lastSelectedPair?: string; lastSelectedCrypto?: string; lastSelectedTab?: string }): Promise<void>;
  getUserPreferences(userId: string): Promise<{ lastSelectedPair?: string; lastSelectedCrypto?: string; lastSelectedTab?: string } | null>;
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
      // Import auth service and UID utility
      const { authService } = await import('./services/auth.service');
      const { generateUID } = await import('./utils/uid');
      
      // Hash the password
      const hashedPassword = await authService.hashPassword(userData.password);
      
      // Generate unique UID
      let uid = generateUID();
      let isUidUnique = false;
      let attempts = 0;
      
      // Ensure UID is unique (max 10 attempts)
      while (!isUidUnique && attempts < 10) {
        const existingUser = await User.findOne({ uid });
        if (!existingUser) {
          isUidUnique = true;
        } else {
          uid = generateUID();
          attempts++;
        }
      }
      
      if (!isUidUnique) {
        throw new Error('Failed to generate unique UID after 10 attempts');
      }
      
      const newUser = new User({
        uid,
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

  async updateUserProfile(userId: string, updates: Partial<IUser>): Promise<void> {
    try {
      console.log('MongoDB updateUserProfile called:', { userId, updates: Object.keys(updates) });
      
      const updateData: any = {};
      
      if (updates.username) updateData.username = updates.username;
      if (updates.firstName) updateData.firstName = updates.firstName;  
      if (updates.lastName) updateData.lastName = updates.lastName;
      if (updates.profilePicture !== undefined) updateData.profilePicture = updates.profilePicture;
      
      await User.findByIdAndUpdate(userId, updateData, { new: true });
      console.log('Profile updated successfully in MongoDB for user:', userId);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Favorites management - stored as array in user document
  async addFavorite(userId: string, cryptoPairSymbol: string, cryptoId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { favorites: cryptoPairSymbol }
      });
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }

  async removeFavorite(userId: string, cryptoPairSymbol: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        $pull: { favorites: cryptoPairSymbol }
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }

  async getUserFavorites(userId: string): Promise<string[]> {
    try {
      const user = await User.findById(userId).select('favorites');
      return user?.favorites || [];
    } catch (error) {
      console.error('Error getting user favorites:', error);
      return [];
    }
  }

  // User preferences management - stored as embedded document
  async updateUserPreferences(userId: string, preferences: { lastSelectedPair?: string; lastSelectedCrypto?: string; lastSelectedTab?: string }): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        $set: { preferences }
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  async getUserPreferences(userId: string): Promise<{ lastSelectedPair?: string; lastSelectedCrypto?: string; lastSelectedTab?: string } | null> {
    try {
      const user = await User.findById(userId).select('preferences');
      return user?.preferences || null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }
}

// Export an instance of MongoDB storage
export const mongoStorage = new MongoStorage();
