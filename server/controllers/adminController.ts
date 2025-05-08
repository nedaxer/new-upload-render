import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Balance } from '../models/Balance';
import { Transaction } from '../models/Transaction';
import { Staking } from '../models/Staking';
import { connectToDatabase } from '../mongodb';
import { Types } from 'mongoose';

// Function to verify admin credentials
// In a real-world application, you would have a proper admin authentication system
async function verifyAdmin(username: string, password: string): Promise<boolean> {
  // For demo purposes, hard-coded admin credentials
  // In production, this should be changed to use a proper authentication system
  return username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD;
}

/**
 * Admin login
 */
export async function adminLogin(req: Request, res: Response) {
  try {
    // Validate request body
    const schema = z.object({
      username: z.string(),
      password: z.string()
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: result.error.format()
      });
    }

    const { username, password } = result.data;

    // Verify admin credentials
    const isAdmin = await verifyAdmin(username, password);

    if (!isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Set admin session
    req.session.isAdmin = true;

    return res.status(200).json({
      success: true,
      message: 'Admin login successful'
    });
  } catch (error) {
    console.error('Error in admin login:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during admin login'
    });
  }
}

/**
 * Admin middleware to check if user is admin
 */
export function requireAdmin(req: Request, res: Response, next: Function) {
  if (!req.session.isAdmin) {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required'
    });
  }
  next();
}

/**
 * Search for users by ID or email
 */
export async function searchUsers(req: Request, res: Response) {
  try {
    await connectToDatabase();
    
    // Get query parameters
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // Search for users by ID or email
    const searchQuery = String(query);
    const users = await User.find({
      $or: [
        { _id: searchQuery.match(/^[0-9a-fA-F]{24}$/) ? searchQuery : null },
        { email: new RegExp(searchQuery, 'i') }
      ]
    }).select('-password');
    
    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error searching for users:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while searching for users'
    });
  }
}

/**
 * Credit USD balance to a user
 */
export async function creditUserBalance(req: Request, res: Response) {
  try {
    // Validate request body
    const schema = z.object({
      userId: z.string(),
      amount: z.number().positive()
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: result.error.format()
      });
    }

    const { userId, amount } = result.data;
    
    // Connect to database
    await connectToDatabase();
    
    // Check if user exists
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get or create user balance
    let balance = await Balance.findOne({ userId });
    
    if (!balance) {
      balance = new Balance({
        userId,
        usdBalance: 0,
        btcBalance: 0,
        ethBalance: 0,
        bnbBalance: 0,
        usdtBalance: 0
      });
    }
    
    // Update USD balance
    balance.usdBalance += amount;
    await balance.save();
    
    return res.status(200).json({
      success: true,
      message: `Successfully credited $${amount.toFixed(2)} to user ${userId}`,
      newBalance: balance.usdBalance
    });
  } catch (error) {
    console.error('Error crediting user balance:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while crediting user balance'
    });
  }
}

/**
 * Get user activity and balances
 */
export async function getUserActivity(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if user exists
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user balance
    const balance = await Balance.findOne({ userId });
    
    // Get recent transactions
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get active staking positions
    const stakingPositions = await Staking.find({ userId, active: true });
    
    return res.status(200).json({
      success: true,
      user,
      balance: balance || {
        usdBalance: 0,
        btcBalance: 0,
        ethBalance: 0,
        bnbBalance: 0,
        usdtBalance: 0
      },
      recentTransactions: transactions,
      stakingPositions
    });
  } catch (error) {
    console.error('Error getting user activity:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while getting user activity'
    });
  }
}

/**
 * Update staking rates
 */
export async function updateStakingRates(req: Request, res: Response) {
  try {
    // Validate request body
    const schema = z.object({
      BTC: z.number().min(0).max(100),
      ETH: z.number().min(0).max(100),
      BNB: z.number().min(0).max(100),
      USDT: z.number().min(0).max(100)
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: result.error.format()
      });
    }

    const rates = result.data;
    
    // In a real application, you would update these in a database table
    // For this demo, we'll just return a success message since our rates are hardcoded
    
    return res.status(200).json({
      success: true,
      message: 'Staking rates updated successfully',
      rates
    });
  } catch (error) {
    console.error('Error updating staking rates:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating staking rates'
    });
  }
}