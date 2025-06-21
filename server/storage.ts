import { users, userFavorites, userPreferences, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  setVerificationCode(userId: number, code: string, expiresAt: Date): Promise<void>;
  verifyUser(userId: number, code: string): Promise<boolean>;
  markUserAsVerified(userId: number): Promise<void>;
  updateUserProfile(userId: number, updates: Partial<User>): Promise<void>;
  
  // Favorites functionality
  getUserFavorites(userId: number): Promise<string[]>;
  addUserFavorite(userId: number, symbol: string): Promise<void>;
  removeUserFavorite(userId: number, symbol: string): Promise<void>;
  
  // Preferences functionality
  getUserPreferences(userId: number): Promise<any>;
  updateUserPreferences(userId: number, updates: any): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    const user: User = { 
      id,
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      verificationCode: null, 
      verificationCodeExpires: null,
      isVerified: false, 
      createdAt: now,
      isAdmin: false,
      kycStatus: "pending",
      phone: null,
      country: null,
      totalPortfolioValue: 0,
      riskLevel: "moderate",
      referralCode: null,
      referredBy: null,
      profilePicture: null
    };
    this.users.set(id, user);
    return user;
  }

  async setVerificationCode(userId: number, code: string, expiresAt: Date): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.verificationCode = code;
      user.verificationCodeExpires = expiresAt;
      this.users.set(userId, user);
    }
  }

  async verifyUser(userId: number, code: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;
    
    // Check if code is valid and not expired
    if (user.verificationCode !== code) return false;
    if (user.verificationCodeExpires && user.verificationCodeExpires < new Date()) return false;
    
    return true;
  }

  async markUserAsVerified(userId: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.isVerified = true;
      user.verificationCode = null;
      user.verificationCodeExpires = null;
      this.users.set(userId, user);
    }
  }

  async updateUserProfile(userId: number, updates: Partial<User>): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      Object.assign(user, updates);
      this.users.set(userId, user);
    }
  }

  async getUserFavorites(userId: number): Promise<string[]> {
    // In memory storage, use a simple array
    return [];
  }

  async addUserFavorite(userId: number, symbol: string): Promise<void> {
    // In memory storage - not implemented for simplicity
  }

  async removeUserFavorite(userId: number, symbol: string): Promise<void> {
    // In memory storage - not implemented for simplicity
  }

  async getUserPreferences(userId: number): Promise<any> {
    return {
      lastSelectedPair: 'BTCUSDT',
      preferredCurrency: 'USD',
      theme: 'dark',
      language: 'en'
    };
  }

  async updateUserPreferences(userId: number, updates: any): Promise<void> {
    // In memory storage - not implemented for simplicity
  }
}

export class PostgresStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Insert the user into the database
    const result = await db.insert(users).values(insertUser);
    
    // For MySQL, we need to get the inserted user by username or email since insertId handling can be tricky
    // We'll use email as it's unique and always provided
    const newUser = await db.select().from(users).where(eq(users.email, insertUser.email)).limit(1);
    
    if (!newUser[0]) {
      throw new Error('Failed to create user - could not retrieve newly created user');
    }
    
    return newUser[0];
  }

  async setVerificationCode(userId: number, code: string, expiresAt: Date): Promise<void> {
    await db.update(users)
      .set({ 
        verificationCode: code, 
        verificationCodeExpires: expiresAt 
      })
      .where(eq(users.id, userId));
  }

  async verifyUser(userId: number, code: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    // Check if code is valid and not expired
    if (user.verificationCode !== code) return false;
    if (user.verificationCodeExpires && user.verificationCodeExpires < new Date()) return false;
    
    return true;
  }

  async markUserAsVerified(userId: number): Promise<void> {
    await db.update(users)
      .set({ 
        isVerified: true,
        verificationCode: null,
        verificationCodeExpires: null 
      })
      .where(eq(users.id, userId));
  }

  async updateUserProfile(userId: number, updates: Partial<User>): Promise<void> {
    await db.update(users)
      .set(updates)
      .where(eq(users.id, userId));
  }

  async getUserFavorites(userId: number): Promise<string[]> {
    try {
      const favorites = await db
        .select({ symbol: userFavorites.symbol })
        .from(userFavorites)
        .where(eq(userFavorites.userId, userId));
      
      return favorites.map(f => f.symbol);
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      return [];
    }
  }

  async addUserFavorite(userId: number, symbol: string): Promise<void> {
    try {
      // Check if favorite already exists
      const existing = await db
        .select()
        .from(userFavorites)
        .where(and(eq(userFavorites.userId, userId), eq(userFavorites.symbol, symbol)));
      
      if (existing.length === 0) {
        await db
          .insert(userFavorites)
          .values({ userId, symbol });
      }
    } catch (error) {
      console.error('Error adding user favorite:', error);
    }
  }

  async removeUserFavorite(userId: number, symbol: string): Promise<void> {
    try {
      await db
        .delete(userFavorites)
        .where(and(eq(userFavorites.userId, userId), eq(userFavorites.symbol, symbol)));
    } catch (error) {
      console.error('Error removing user favorite:', error);
    }
  }

  async getUserPreferences(userId: number): Promise<any> {
    try {
      const [prefs] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId));
      
      if (!prefs) {
        // Create default preferences for new users
        const defaultPrefs = {
          userId,
          lastSelectedPair: 'BTCUSDT',
          preferredCurrency: 'USD',
          theme: 'dark',
          language: 'en'
        };
        
        await db
          .insert(userPreferences)
          .values(defaultPrefs);
        
        return defaultPrefs;
      }
      
      return prefs;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return {
        lastSelectedPair: 'BTCUSDT',
        preferredCurrency: 'USD',
        theme: 'dark',
        language: 'en'
      };
    }
  }

  async updateUserPreferences(userId: number, updates: any): Promise<void> {
    try {
      // Check if preferences exist
      const existing = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId));
      
      if (existing.length === 0) {
        // Create new preferences
        await db
          .insert(userPreferences)
          .values({ userId, ...updates });
      } else {
        // Update existing preferences
        await db
          .update(userPreferences)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(userPreferences.userId, userId));
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }
}

// Using MemStorage for now
// Will implement MongoDB storage in a separate step
export const storage = new PostgresStorage();
