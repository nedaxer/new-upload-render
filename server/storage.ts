import { users, userFavorites, userPreferences, notifications, adminTransactions, userBalances, currencies, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

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
  
  // Admin management
  getAllUsers(): Promise<User[]>;
  deleteUser(userId: number): Promise<boolean>;
  addFundsToUser(adminId: number, userId: number, cryptoSymbol: string, network: string, usdAmount: number, cryptoAmount: number, sendAddress: string): Promise<boolean>;
  getAdminTransactions(adminId: number): Promise<any[]>;
  
  // Notifications management
  createNotification(userId: number, type: string, title: string, message: string, cryptoSymbol?: string, amount?: number, address?: string, txHash?: string, timestamp?: string): Promise<void>;
  getUserNotifications(userId: number): Promise<any[]>;
  markNotificationAsRead(notificationId: number): Promise<void>;
  
  // Balance management
  getUserBalance(userId: number, currencySymbol: string): Promise<number>;
  updateUserBalance(userId: number, currencySymbol: string, amount: number): Promise<void>;
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

  // Admin management methods (stub implementations for MemStorage)
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async deleteUser(userId: number): Promise<boolean> {
    return this.users.delete(userId);
  }

  async addFundsToUser(adminId: number, userId: number, cryptoSymbol: string, network: string, usdAmount: number, cryptoAmount: number, sendAddress: string): Promise<boolean> {
    return true;
  }

  async getAdminTransactions(adminId: number): Promise<any[]> {
    return [];
  }

  async createNotification(userId: number, type: string, title: string, message: string, cryptoSymbol?: string, amount?: number, address?: string, txHash?: string, timestamp?: string): Promise<void> {
    // Stub implementation
  }

  async getUserNotifications(userId: number): Promise<any[]> {
    return [];
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    // Stub implementation
  }

  async getUserBalance(userId: number, currencySymbol: string): Promise<number> {
    return 0;
  }

  async updateUserBalance(userId: number, currencySymbol: string, amount: number): Promise<void> {
    // Stub implementation
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
    const insertResult = await db
      .insert(users)
      .values(insertUser);
    
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

  // Admin management methods
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(userId: number): Promise<boolean> {
    try {
      await db.delete(users).where(eq(users.id, userId));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async addFundsToUser(adminId: number, userId: number, cryptoSymbol: string, network: string, usdAmount: number, cryptoAmount: number, sendAddress: string): Promise<boolean> {
    try {
      // Add to user's USD balance (virtual funds stored as USD)
      await this.updateUserBalance(userId, 'USD', usdAmount);

      // Record admin transaction
      await db.insert(adminTransactions).values({
        adminId,
        targetUserId: userId,
        type: 'add_funds',
        cryptoSymbol,
        network,
        usdAmount,
        cryptoAmount,
        sendAddress,
        status: 'completed'
      });

      // Create notification for user
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + '(UTC)';
      const txHash = this.generateTxHash();
      
      await this.createNotification(
        userId,
        'deposit',
        'Deposit Confirmed',
        `Dear valued Nedaxer trader,\nYour deposit has been confirmed.\nDeposit amount: ${cryptoAmount.toFixed(8)} ${cryptoSymbol}\nDeposit address: ${sendAddress}\nTimestamp: ${timestamp}`,
        cryptoSymbol,
        cryptoAmount,
        sendAddress,
        txHash,
        timestamp
      );

      return true;
    } catch (error) {
      console.error('Error adding funds to user:', error);
      return false;
    }
  }

  private generateTxHash(): string {
    const chars = '0123456789abcdef';
    let result = '0x';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async getAdminTransactions(adminId: number): Promise<any[]> {
    const result = await db
      .select({
        id: adminTransactions.id,
        targetUserId: adminTransactions.targetUserId,
        type: adminTransactions.type,
        cryptoSymbol: adminTransactions.cryptoSymbol,
        network: adminTransactions.network,
        usdAmount: adminTransactions.usdAmount,
        cryptoAmount: adminTransactions.cryptoAmount,
        sendAddress: adminTransactions.sendAddress,
        status: adminTransactions.status,
        createdAt: adminTransactions.createdAt,
        targetUserUsername: users.username,
        targetUserEmail: users.email
      })
      .from(adminTransactions)
      .leftJoin(users, eq(adminTransactions.targetUserId, users.id))
      .where(eq(adminTransactions.adminId, adminId))
      .orderBy(desc(adminTransactions.createdAt));

    return result;
  }

  // Notifications management
  async createNotification(userId: number, type: string, title: string, message: string, cryptoSymbol?: string, amount?: number, address?: string, txHash?: string, timestamp?: string): Promise<void> {
    await db.insert(notifications).values({
      userId,
      type,
      title,
      message,
      cryptoSymbol,
      amount,
      address,
      txHash,
      timestamp
    });
  }

  async getUserNotifications(userId: number): Promise<any[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  // Balance management
  async getUserBalance(userId: number, currencySymbol: string): Promise<number> {
    // First get currency ID
    const currency = await db
      .select({ id: currencies.id })
      .from(currencies)
      .where(eq(currencies.symbol, currencySymbol))
      .limit(1);

    if (currency.length === 0) {
      // Create currency if it doesn't exist
      const [newCurrency] = await db
        .insert(currencies)
        .values({
          symbol: currencySymbol,
          name: currencySymbol,
          type: 'fiat',
          isActive: true
        })
        .execute();
      
      return 0;
    }

    const balance = await db
      .select({ balance: userBalances.balance })
      .from(userBalances)
      .where(and(
        eq(userBalances.userId, userId),
        eq(userBalances.currencyId, currency[0].id)
      ))
      .limit(1);

    return balance.length > 0 ? balance[0].balance : 0;
  }

  async updateUserBalance(userId: number, currencySymbol: string, amount: number): Promise<void> {
    // First get or create currency
    let currency = await db
      .select({ id: currencies.id })
      .from(currencies)
      .where(eq(currencies.symbol, currencySymbol))
      .limit(1);

    if (currency.length === 0) {
      const [newCurrency] = await db
        .insert(currencies)
        .values({
          symbol: currencySymbol,
          name: currencySymbol,
          type: 'fiat',
          isActive: true
        })
        .execute();
      
      currency = [{ id: newCurrency.insertId as number }];
    }

    const currencyId = currency[0].id;

    // Check if balance exists
    const existingBalance = await db
      .select()
      .from(userBalances)
      .where(and(
        eq(userBalances.userId, userId),
        eq(userBalances.currencyId, currencyId)
      ))
      .limit(1);

    if (existingBalance.length > 0) {
      // Update existing balance
      const newBalance = existingBalance[0].balance + amount;
      await db
        .update(userBalances)
        .set({ 
          balance: newBalance,
          updatedAt: new Date()
        })
        .where(and(
          eq(userBalances.userId, userId),
          eq(userBalances.currencyId, currencyId)
        ));
    } else {
      // Create new balance
      await db
        .insert(userBalances)
        .values({
          userId,
          currencyId,
          balance: amount
        });
    }
  }
}

// Using MySQL storage with your free database
export const storage = new MySQLStorage();
