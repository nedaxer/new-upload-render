import { Request, Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { buyCrypto, sellCrypto, getUserPortfolio } from '../services/tradingService';
import { getExchangeRates } from '../services/blockchainService';
import { Transaction } from '../models/Transaction';
import { Balance } from '../models/Balance';

/**
 * Buy cryptocurrency with USD
 */
export async function buyCryptocurrency(req: Request, res: Response) {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Validate request body
    const schema = z.object({
      currency: z.enum(['BTC', 'ETH', 'BNB', 'USDT']),
      usdAmount: z.number().positive()
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: result.error.format()
      });
    }

    const { currency, usdAmount } = result.data;

    // Convert session userId to ObjectId for MongoDB
    const userId = new Types.ObjectId(req.session.userId.toString());

    // Process the buy order
    const buyResult = await buyCrypto(userId.toString(), currency, usdAmount);

    if (!buyResult.success) {
      return res.status(400).json(buyResult);
    }

    return res.status(200).json(buyResult);
  } catch (error) {
    console.error('Error buying cryptocurrency:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your purchase'
    });
  }
}

/**
 * Sell cryptocurrency for USD
 */
export async function sellCryptocurrency(req: Request, res: Response) {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Validate request body
    const schema = z.object({
      currency: z.enum(['BTC', 'ETH', 'BNB', 'USDT']),
      cryptoAmount: z.number().positive()
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: result.error.format()
      });
    }

    const { currency, cryptoAmount } = result.data;

    // Convert session userId to ObjectId for MongoDB
    const userId = new Types.ObjectId(req.session.userId.toString());

    // Process the sell order
    const sellResult = await sellCrypto(userId.toString(), currency, cryptoAmount);

    if (!sellResult.success) {
      return res.status(400).json(sellResult);
    }

    return res.status(200).json(sellResult);
  } catch (error) {
    console.error('Error selling cryptocurrency:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your sale'
    });
  }
}

/**
 * Get current exchange rates
 */
export async function getCurrentRates(req: Request, res: Response) {
  try {
    const rates = await getExchangeRates();
    
    return res.status(200).json({
      success: true,
      rates
    });
  } catch (error) {
    console.error('Error getting exchange rates:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching exchange rates'
    });
  }
}

/**
 * Get user's portfolio (balances and their USD value)
 */
export async function getPortfolio(req: Request, res: Response) {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Convert session userId to ObjectId for MongoDB
    const userId = new Types.ObjectId(req.session.userId.toString());

    // Get portfolio data
    const portfolio = await getUserPortfolio(userId.toString());

    return res.status(200).json({
      success: true,
      portfolio
    });
  } catch (error) {
    console.error('Error getting user portfolio:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching your portfolio'
    });
  }
}

/**
 * Get user's transaction history
 */
export async function getTransactionHistory(req: Request, res: Response) {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Convert session userId to ObjectId for MongoDB
    const userId = new Types.ObjectId(req.session.userId.toString());

    // Optional query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;

    // Build query
    const query: any = { userId: userId.toString() };
    if (type) {
      query.type = type;
    }

    // Get transactions with pagination
    const skip = (page - 1) * limit;
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count total transactions for pagination
    const totalCount = await Transaction.countDocuments(query);

    return res.status(200).json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching your transaction history'
    });
  }
}

/**
 * Get user's balance information
 */
export async function getBalance(req: Request, res: Response) {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Convert session userId to ObjectId for MongoDB
    const userId = new Types.ObjectId(req.session.userId.toString());

    // Get user balance
    const balance = await Balance.findOne({ userId: userId.toString() });

    if (!balance) {
      return res.status(200).json({
        success: true,
        balance: {
          usdBalance: 0,
          btcBalance: 0,
          ethBalance: 0,
          bnbBalance: 0,
          usdtBalance: 0
        }
      });
    }

    return res.status(200).json({
      success: true,
      balance: {
        usdBalance: balance.usdBalance,
        btcBalance: balance.btcBalance,
        ethBalance: balance.ethBalance,
        bnbBalance: balance.bnbBalance,
        usdtBalance: balance.usdtBalance
      }
    });
  } catch (error) {
    console.error('Error getting user balance:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching your balance'
    });
  }
}