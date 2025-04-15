import { users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
      ...insertUser, 
      id, 
      isVerified: false, 
      verificationCode: null, 
      verificationCodeExpires: null,
      createdAt: now
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
    const result = await db.insert(users).values(insertUser).returning();
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
}

// Use PostgresStorage since we now have a PostgreSQL database
export const storage = new MemStorage();
