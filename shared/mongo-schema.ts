import { z } from "zod";

// MongoDB User schema for validation
export const mongoUserSchema = z.object({
  uid: z.string().max(10),
  username: z.string().min(1).max(255),
  email: z.string().email().max(255),
  password: z.string().min(6),
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  profilePicture: z.string().optional(),
  favorites: z.array(z.string()).default([]),
  preferences: z.object({
    lastSelectedPair: z.string().optional(),
    lastSelectedCrypto: z.string().optional(),
    lastSelectedTab: z.string().optional(),
  }).optional(),
  verificationCode: z.string().optional(),
  verificationCodeExpires: z.date().optional(),
  resetPasswordCode: z.string().optional(),
  resetPasswordCodeExpires: z.date().optional(),
  isVerified: z.boolean().default(false),
  isAdmin: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
});

// Insert schema for user creation (omit auto-generated fields)
export const insertMongoUserSchema = mongoUserSchema.omit({
  uid: true,
  createdAt: true,
  verificationCode: true,
  verificationCodeExpires: true,
  resetPasswordCode: true,
  resetPasswordCodeExpires: true,
});

// Types for MongoDB user operations
export type MongoUser = z.infer<typeof mongoUserSchema>;
export type InsertMongoUser = z.infer<typeof insertMongoUserSchema>;

// User data type for API responses (without sensitive fields)
export const userDataSchema = z.object({
  _id: z.string(),
  uid: z.string(),
  username: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  profilePicture: z.string().optional(),
  favorites: z.array(z.string()).default([]),
  preferences: z.object({
    lastSelectedPair: z.string().optional(),
    lastSelectedCrypto: z.string().optional(),
    lastSelectedTab: z.string().optional(),
  }).optional(),
  isVerified: z.boolean(),
  isAdmin: z.boolean(),
  createdAt: z.date(),
});

export type UserData = z.infer<typeof userDataSchema>;