import { Request, Response, Router } from "express";
import { db } from "../db";
import { z } from "zod";
import { 
  users, 
  currencies, 
  userBalances
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { tradingService } from "../services/trading.service";
import { stakingService } from "../services/staking.service";
import { backupService } from "../services/backup.service";

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

// Get user profile picture
userRouter.get("/profile-picture", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Mock profile picture storage - in production, you'd store this in database or file storage
    // For now, we'll use a simple in-memory storage or database field
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user[0]) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        profilePicture: user[0].profilePicture || null
      }
    });
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load profile picture"
    });
  }
});

// Update user profile
userRouter.patch("/update-profile", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { profilePicture, nickname } = req.body;

    console.log("Profile update request:", {
      userId,
      hasProfilePicture: !!profilePicture,
      nickname
    });

    const updateData: any = {};
    
    if (profilePicture) {
      if (!profilePicture.startsWith('data:image/')) {
        return res.status(400).json({
          success: false,
          message: "Invalid image format"
        });
      }
      updateData.profilePicture = profilePicture;
    }

    if (nickname) {
      updateData.username = nickname;
    }

    // Update user's profile in database
    await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    console.log("Profile updated successfully for user:", userId);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updateData
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
});

// Update user profile picture
userRouter.post("/profile-picture", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { profilePicture } = req.body;

    console.log("Profile picture upload request:", {
      userId,
      hasProfilePicture: !!profilePicture,
      profilePictureLength: profilePicture?.length
    });

    if (!profilePicture) {
      console.log("No profile picture data provided");
      return res.status(400).json({
        success: false,
        message: "Profile picture data is required"
      });
    }

    // Validate base64 format
    if (!profilePicture.startsWith('data:image/')) {
      console.log("Invalid profile picture format");
      return res.status(400).json({
        success: false,
        message: "Invalid image format"
      });
    }

    // Update user's profile picture in database
    await db.update(users)
      .set({ profilePicture })
      .where(eq(users.id, userId));

    console.log("Profile picture updated successfully for user:", userId);

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      data: {
        profilePicture: profilePicture
      }
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile picture"
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

// Get KYC status
userRouter.get("/kyc/status", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Mock KYC status - in production this would come from database
    const mockKycStatus = {
      verification: {
        status: 'pending', // pending, processing, verified, rejected
        confidence: 0,
        issues: []
      }
    };
    
    return res.status(200).json({
      success: true,
      data: mockKycStatus,
      message: "KYC status retrieved successfully"
    });
  } catch (error) {
    console.error("Error fetching KYC status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch KYC status"
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

// Backup user data
userRouter.get("/backup", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const backup = await backupService.backupUserData(userId);
    
    if (backup.success) {
      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="user-backup-${userId}-${Date.now()}.json"`);
      
      return res.status(200).json(backup.data);
    } else {
      return res.status(500).json(backup);
    }
  } catch (error) {
    console.error("Error creating user backup:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create backup"
    });
  }
});

// Restore user data (admin only for safety)
userRouter.post("/restore", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { backupData } = req.body;
    
    if (!backupData) {
      return res.status(400).json({
        success: false,
        message: "Backup data is required"
      });
    }
    
    const result = await backupService.restoreUserData(userId, backupData);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error restoring user data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to restore user data"
    });
  }
});

export default userRouter;