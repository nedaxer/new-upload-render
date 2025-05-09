import { Request, Response, Router } from "express";
import { db } from "../db";
import { z } from "zod";
import { 
  users, 
  currencies, 
  userBalances
} from "@shared/schema";
import { tradingService } from "../services/trading.service";
import { stakingService } from "../services/staking.service";

const userRouter = Router();

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required" 
    });
  }
  next();
};

// Get user dashboard data
userRouter.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Get user balances
    const balances = await tradingService.getAllUserBalances(userId);
    
    // Get recent transactions
    const transactions = await tradingService.getUserTransactionsDetailed(userId, 10);
    
    // Get active staking positions
    const stakingPositions = await stakingService.getUserStakingPositions(userId);
    
    // Calculate total portfolio value in USD
    let totalPortfolioValue = 0;
    for (const balance of balances) {
      if (balance.currency.symbol === 'USD') {
        totalPortfolioValue += balance.balance;
      } else {
        // Use trading service to get latest price and calculate USD value
        try {
          const price = await tradingService.getLatestPrice(balance.currencyId);
          totalPortfolioValue += balance.balance * price;
        } catch (error) {
          console.error(`Error getting price for ${balance.currency.symbol}:`, error);
        }
      }
    }
    
    // Calculate staking earnings
    let totalStakingEarnings = 0;
    for (const position of stakingPositions) {
      totalStakingEarnings += position.accumulatedRewards;
    }
    
    return res.status(200).json({
      success: true,
      data: {
        balances,
        transactions,
        stakingPositions,
        totalPortfolioValue,
        totalStakingEarnings
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard data"
    });
  }
});

// Get user balances
userRouter.get("/balances", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const balances = await tradingService.getAllUserBalances(userId);
    
    return res.status(200).json({
      success: true,
      data: balances
    });
  } catch (error) {
    console.error("Error fetching balances:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load balances"
    });
  }
});

// Get transaction history
userRouter.get("/transactions", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Parse limit and offset from query parameters
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const transactions = await tradingService.getUserTransactionsDetailed(userId, limit, offset);
    
    return res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load transaction history"
    });
  }
});

// Get staking positions
userRouter.get("/staking", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const stakingPositions = await stakingService.getUserStakingPositions(userId);
    
    return res.status(200).json({
      success: true,
      data: stakingPositions
    });
  } catch (error) {
    console.error("Error fetching staking positions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load staking positions"
    });
  }
});

// Get available staking rates
userRouter.get("/staking/rates", requireAuth, async (req, res) => {
  try {
    const rates = await stakingService.getAvailableStakingRates();
    
    return res.status(200).json({
      success: true,
      data: rates
    });
  } catch (error) {
    console.error("Error fetching staking rates:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load staking rates"
    });
  }
});

export default userRouter;