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
  
  // Admin functions
  searchUsers(query: string): Promise<IUser[]>;
  addFundsToUser(userId: string, amount: number): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  getUserBalance(userId: string): Promise<number>;
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
      console.log('MongoStorage: getUserByUsername called with:', username);
      console.log('User model available:', !!User);
      const result = await User.findOne({ username });
      console.log('MongoStorage: getUserByUsername result:', result ? 'FOUND' : 'NOT FOUND');
      return result;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      console.log('MongoStorage: getUserByEmail called with:', email);
      console.log('User model available:', !!User);
      const result = await User.findOne({ email });
      console.log('MongoStorage: getUserByEmail result:', result ? 'FOUND' : 'NOT FOUND');
      return result;
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
  async updateUserPreferences(userId: string, preferences: { 
    lastSelectedPair?: string; 
    lastSelectedCrypto?: string; 
    lastSelectedTab?: string;
    chartSettings?: any;
  }): Promise<void> {
    try {
      const updateData: any = {};
      
      if (preferences.lastSelectedPair !== undefined) {
        updateData['preferences.lastSelectedPair'] = preferences.lastSelectedPair;
      }
      if (preferences.lastSelectedCrypto !== undefined) {
        updateData['preferences.lastSelectedCrypto'] = preferences.lastSelectedCrypto;
      }
      if (preferences.lastSelectedTab !== undefined) {
        updateData['preferences.lastSelectedTab'] = preferences.lastSelectedTab;
      }
      if (preferences.chartSettings !== undefined) {
        updateData['preferences.chartSettings'] = {
          ...preferences.chartSettings,
          lastUpdated: Date.now()
        };
      }

      await User.findByIdAndUpdate(userId, {
        $set: updateData
      });
      
      console.log('User preferences updated in MongoDB:', { userId, preferences: Object.keys(updateData) });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  async getUserPreferences(userId: string): Promise<{ 
    lastSelectedPair?: string; 
    lastSelectedCrypto?: string; 
    lastSelectedTab?: string;
    chartSettings?: any;
  } | null> {
    try {
      const user = await User.findById(userId).select('preferences');
      const preferences = user?.preferences || {};
      
      console.log('Retrieved user preferences from MongoDB:', { userId, preferences });
      
      return {
        lastSelectedPair: preferences.lastSelectedPair,
        lastSelectedCrypto: preferences.lastSelectedCrypto, 
        lastSelectedTab: preferences.lastSelectedTab,
        chartSettings: preferences.chartSettings
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  // Admin functions implementation
  async searchUsers(query: string): Promise<IUser[]> {
    try {
      const { User } = await import('./models/User');
      
      // Create a regex for case-insensitive search
      const searchRegex = new RegExp(query, 'i');
      
      const users = await User.find({
        $or: [
          { username: searchRegex },
          { email: searchRegex },
          { uid: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex }
        ]
      }).select('-password -verificationCode -verificationExpires -resetPasswordCode -resetPasswordExpires').limit(20);

      // Get balance for each user
      const usersWithBalance = await Promise.all(
        users.map(async (user) => {
          const balance = await this.getUserBalance(user._id.toString());
          return {
            _id: user._id.toString(),
            uid: user.uid,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            favorites: user.favorites || [],
            preferences: user.preferences || {},
            isVerified: user.isVerified,
            isAdmin: user.isAdmin,
            createdAt: user.createdAt,
            balance: balance || 0
          };
        })
      );

      return usersWithBalance;
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  }

  async addFundsToUser(userId: string, amount: number): Promise<void> {
    try {
      const { User } = await import('./models/User');
      
      console.log(`Adding $${amount} to user ${userId}`);
      
      // Get current user and balance
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const currentBalance = user.balance || 0;
      const newBalance = currentBalance + amount;
      
      // Update user's balance in User collection (primary source)
      await User.findByIdAndUpdate(userId, { 
        balance: newBalance 
      }, { new: true });
      
      console.log(`User ${userId} balance updated: $${currentBalance} → $${newBalance}`);
      
    } catch (error) {
      console.error('Error adding funds to user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await User.findByIdAndDelete(userId);
      console.log(`User ${userId} deleted successfully`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getUserBalance(userId: string): Promise<number> {
    try {
      const user = await User.findById(userId).select('balance');
      return user?.balance || 0;
    } catch (error) {
      console.error('Error getting user balance:', error);
      return 0;
    }
  }
}

// Export an instance of MongoDB storage
export const mongoStorage = new MongoStorage();
