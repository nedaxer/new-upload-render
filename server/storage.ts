import { users, userFavorites, userPreferences, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { generateUID } from "./utils/uid";

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
  
  // Favorites management
  addFavorite(userId: number, cryptoPairSymbol: string, cryptoId: string): Promise<void>;
  removeFavorite(userId: number, cryptoPairSymbol: string): Promise<void>;
  getUserFavorites(userId: number): Promise<string[]>;
  
  // User preferences management
  updateUserPreferences(userId: number, preferences: { lastSelectedPair?: string; lastSelectedCrypto?: string; lastSelectedTab?: string }): Promise<void>;
  getUserPreferences(userId: number): Promise<{ lastSelectedPair?: string; lastSelectedCrypto?: string; lastSelectedTab?: string } | null>;
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
    
    // Generate a unique UID
    let uid = generateUID();
    // Ensure UID uniqueness in memory storage
    while (Array.from(this.users.values()).some(u => u.uid === uid)) {
      uid = generateUID();
    }
    
    const user: User = { 
      id,
      uid,
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

  // Favorites management - in-memory implementation
  async addFavorite(userId: number, cryptoPairSymbol: string, cryptoId: string): Promise<void> {
    // For in-memory storage, we'll just store in a simple Map
    const key = `${userId}_favorites`;
    const existing = (this as any)[key] || [];
    if (!existing.includes(cryptoPairSymbol)) {
      existing.push(cryptoPairSymbol);
      (this as any)[key] = existing;
    }
  }

  async removeFavorite(userId: number, cryptoPairSymbol: string): Promise<void> {
    const key = `${userId}_favorites`;
    const existing = (this as any)[key] || [];
    (this as any)[key] = existing.filter((symbol: string) => symbol !== cryptoPairSymbol);
  }

  async getUserFavorites(userId: number): Promise<string[]> {
    const key = `${userId}_favorites`;
    return (this as any)[key] || [];
  }

  // User preferences management - in-memory implementation
  async updateUserPreferences(userId: number, preferences: { lastSelectedPair?: string; lastSelectedCrypto?: string; lastSelectedTab?: string }): Promise<void> {
    const key = `${userId}_preferences`;
    (this as any)[key] = { ...(this as any)[key], ...preferences };
  }

  async getUserPreferences(userId: number): Promise<{ lastSelectedPair?: string; lastSelectedCrypto?: string; lastSelectedTab?: string } | null> {
    const key = `${userId}_preferences`;
    return (this as any)[key] || null;
  }
}

export class MySQLStorage implements IStorage {
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
    // Generate a unique UID
    let uid = generateUID();
    
    // Ensure UID uniqueness in database
    let existingUser = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    while (existingUser.length > 0) {
      uid = generateUID();
      existingUser = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    }
    
    const insertResult = await db
      .insert(users)
      .values({
        ...insertUser,
        uid
      });
    
    // Get the inserted user by ID since MySQL doesn't support returning
    const insertedId = (insertResult as any).insertId;
    const result = await db.select().from(users).where(eq(users.id, Number(insertedId))).limit(1);
    return result[0];
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

  // Favorites management
  async addFavorite(userId: number, cryptoPairSymbol: string, cryptoId: string): Promise<void> {
    // Check if favorite already exists
    const existing = await db
      .select()
      .from(userFavorites)
      .where(and(
        eq(userFavorites.userId, userId),
        eq(userFavorites.cryptoPairSymbol, cryptoPairSymbol)
      ))
      .limit(1);
    
    if (existing.length === 0) {
      await db
        .insert(userFavorites)
        .values({
          userId,
          cryptoPairSymbol,
          cryptoId
        });
    }
  }

  async removeFavorite(userId: number, cryptoPairSymbol: string): Promise<void> {
    await db
      .delete(userFavorites)
      .where(and(
        eq(userFavorites.userId, userId),
        eq(userFavorites.cryptoPairSymbol, cryptoPairSymbol)
      ));
  }

  async getUserFavorites(userId: number): Promise<string[]> {
    const result = await db
      .select({ cryptoPairSymbol: userFavorites.cryptoPairSymbol })
      .from(userFavorites)
      .where(eq(userFavorites.userId, userId));
    
    return result.map(row => row.cryptoPairSymbol);
  }

  // User preferences management
  async updateUserPreferences(userId: number, preferences: { lastSelectedPair?: string; lastSelectedCrypto?: string; lastSelectedTab?: string }): Promise<void> {
    const existing = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(userPreferences)
        .set(preferences)
        .where(eq(userPreferences.userId, userId));
    } else {
      await db
        .insert(userPreferences)
        .values({
          userId,
          ...preferences
        });
    }
  }

  async getUserPreferences(userId: number): Promise<{ lastSelectedPair?: string; lastSelectedCrypto?: string; lastSelectedTab?: string } | null> {
    const result = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const pref = result[0];
    return {
      lastSelectedPair: pref.lastSelectedPair || undefined,
      lastSelectedCrypto: pref.lastSelectedCrypto || undefined,
      lastSelectedTab: pref.lastSelectedTab || undefined
    };
  }
}

export class DatabaseStorage implements IStorage {
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
    // Generate a unique UID
    let uid = generateUID();
    
    // Ensure UID uniqueness in database
    let existingUser = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    while (existingUser.length > 0) {
      uid = generateUID();
      existingUser = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    }
    
    const result = await db
      .insert(users)
      .values({
        ...insertUser,
        uid
      })
      .returning();
    
    return result[0];
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

  // Favorites management
  async addFavorite(userId: number, cryptoPairSymbol: string, cryptoId: string): Promise<void> {
    try {
      await db.insert(userFavorites).values({
        userId,
        cryptoPairSymbol,
        cryptoId
      });
    } catch (error) {
      // Handle unique constraint violation (favorite already exists)
      console.log('Favorite already exists');
    }
  }

  async removeFavorite(userId: number, cryptoPairSymbol: string): Promise<void> {
    await db.delete(userFavorites)
      .where(and(
        eq(userFavorites.userId, userId),
        eq(userFavorites.cryptoPairSymbol, cryptoPairSymbol)
      ));
  }

  async getUserFavorites(userId: number): Promise<string[]> {
    const result = await db
      .select({ cryptoPairSymbol: userFavorites.cryptoPairSymbol })
      .from(userFavorites)
      .where(eq(userFavorites.userId, userId));

    return result.map(row => row.cryptoPairSymbol);
  }

  // User preferences management
  async updateUserPreferences(userId: number, preferences: { lastSelectedPair?: string; lastSelectedCrypto?: string; lastSelectedTab?: string }): Promise<void> {
    try {
      await db.insert(userPreferences).values({
        userId,
        lastSelectedPair: preferences.lastSelectedPair || null,
        lastSelectedCrypto: preferences.lastSelectedCrypto || null,
        lastSelectedTab: preferences.lastSelectedTab || null
      });
    } catch (error) {
      // If user preferences already exist, update them
      await db.update(userPreferences)
        .set({
          lastSelectedPair: preferences.lastSelectedPair || null,
          lastSelectedCrypto: preferences.lastSelectedCrypto || null,
          lastSelectedTab: preferences.lastSelectedTab || null
        })
        .where(eq(userPreferences.userId, userId));
    }
  }

  async getUserPreferences(userId: number): Promise<{ lastSelectedPair?: string; lastSelectedCrypto?: string; lastSelectedTab?: string } | null> {
    const result = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const pref = result[0];
    return {
      lastSelectedPair: pref.lastSelectedPair || undefined,
      lastSelectedCrypto: pref.lastSelectedCrypto || undefined,
      lastSelectedTab: pref.lastSelectedTab || undefined
    };
  }
}

// Import MongoDB storage
import { mongoStorage } from "./mongoStorage";

// Using MongoDB storage with Atlas
export const storage = mongoStorage;
