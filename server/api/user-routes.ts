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

// Get user notifications
userRouter.get("/notifications", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Mock notifications - in production, you'd fetch from database
    const notifications = [
      {
        id: 1,
        type: 'system',
        title: 'Welcome to Nedaxer',
        message: 'Your account has been created successfully.',
        timestamp: new Date(),
        read: false
      },
      {
        id: 2,
        type: 'kyc',
        title: 'KYC Verification Required',
        message: 'Complete your identity verification to unlock full features.',
        timestamp: new Date(Date.now() - 3600000),
        read: false
      }
    ];
    
    return res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load notifications"
    });
  }
});

// Mark notification as read
userRouter.put("/notifications/:id/read", requireAuth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // In production, update notification in database
    console.log(`Marking notification ${notificationId} as read`);
    
    return res.status(200).json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read"
    });
  }
});

// Get notification count
userRouter.get("/notifications/count", requireAuth, async (req, res) => {
  try {
    // Mock unread count - in production, count from database
    const unreadCount = 2;
    
    return res.status(200).json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error("Error fetching notification count:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load notification count"
    });
  }
});

// Get KYC status
userRouter.get("/kyc/status", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Mock KYC status - in production, fetch from database
    const kycStatus = {
      isVerified: false,
      level: 0,
      status: 'pending',
      submittedAt: null,
      verifiedAt: null
    };
    
    return res.status(200).json({
      success: true,
      data: kycStatus
    });
  } catch (error) {
    console.error("Error fetching KYC status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load KYC status"
    });
  }
});

// Submit KYC verification
userRouter.post("/kyc/submit", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { documents, personalInfo } = req.body;
    
    // Validate required documents
    if (!documents.idFront || !documents.idBack || !documents.selfie) {
      return res.status(400).json({
        success: false,
        message: "All documents are required"
      });
    }
    
    // In production, save to database and trigger verification process
    console.log(`KYC submission for user ${userId}:`, {
      documentsReceived: Object.keys(documents),
      personalInfo
    });
    
    // Mock processing result
    const submissionResult = {
      submissionId: `KYC_${Date.now()}`,
      status: 'processing',
      estimatedProcessingTime: '24-48 hours',
      submittedAt: new Date()
    };
    
    return res.status(200).json({
      success: true,
      data: submissionResult,
      message: "KYC documents submitted successfully"
    });
  } catch (error) {
    console.error("Error submitting KYC:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit KYC verification"
    });
  }
});

export default userRouter;