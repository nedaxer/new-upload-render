import { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { User } from "../models/User";

const router = Router();

// Middleware to check if user is authenticated and an admin
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  
  try {
    // Get user from MongoDB
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    
    // Check if user is an admin
    if (!user.isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    
    // Add user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get admin stats
router.get("/stats", requireAdmin, async (req: Request, res: Response) => {
  try {
    // Get total users count from MongoDB
    const totalUsers = await User.countDocuments();
    
    // For now, provide default values for other stats since the MongoDB models aren't fully set up
    // In a real implementation, you would query the appropriate collections
    const totalTradingVolume = 125000; // Example value
    const activeStakingPositions = 35; // Example value
    const totalStakedValue = 78500; // Example value
    
    // Sample trend data
    const tradingVolumeTrend = 5.2;  // 5.2% increase
    const userGrowthRate = 2.8;      // 2.8% increase
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalTradingVolume,
        activeStakingPositions,
        totalStakedValue,
        tradingVolumeTrend,
        userGrowthRate
      }
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ success: false, message: "Error fetching admin stats" });
  }
});

// Get all users with optional search
router.get("/users", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search && typeof search === 'string') {
      // Use MongoDB $or and $regex for search
      query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Find users and sort by creation date descending
    const allUsers = await User.find(query).sort({ createdAt: -1 });
    
    res.json({ success: true, data: allUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
});

// Get recent transactions for admin dashboard
router.get("/recent-transactions", requireAdmin, async (req: Request, res: Response) => {
  try {
    // Get latest 10 transactions with user information
    const recentTransactions = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        type: transactions.type,
        status: transactions.status,
        amount: transactions.amount,
        price: transactions.price, 
        createdAt: transactions.createdAt,
        currencyId: transactions.currencyId,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email
        },
        currency: {
          symbol: currencies.symbol
        }
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.userId, users.id))
      .innerJoin(currencies, eq(transactions.currencyId, currencies.id))
      .orderBy(desc(transactions.createdAt))
      .limit(10);
    
    // Calculate USD value and prepare response
    const formattedTransactions = recentTransactions.map(tx => ({
      id: tx.id,
      userId: tx.userId,
      type: tx.type,
      status: tx.status,
      amount: tx.amount,
      currency: tx.currency.symbol,
      value: tx.amount * tx.price,  // USD value
      createdAt: tx.createdAt,
      user: {
        id: tx.user.id,
        firstName: tx.user.firstName,
        lastName: tx.user.lastName,
        email: tx.user.email
      }
    }));
    
    res.json({ success: true, data: formattedTransactions });
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    res.status(500).json({ success: false, message: "Error fetching recent transactions" });
  }
});

// Credit user balance
router.post("/credit-balance", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId, currencyId, amount } = req.body;
    
    if (!userId || !currencyId || !amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid request parameters" 
      });
    }
    
    // Check if user exists
    const userExists = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (userExists.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Check if currency exists
    const currencyExists = await db
      .select({ id: currencies.id })
      .from(currencies)
      .where(eq(currencies.id, currencyId))
      .limit(1);
    
    if (currencyExists.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Currency not found" 
      });
    }
    
    // Check if user already has a balance for this currency
    const existingBalance = await db
      .select()
      .from(userBalances)
      .where(
        and(
          eq(userBalances.userId, userId),
          eq(userBalances.currencyId, currencyId)
        )
      )
      .limit(1);
    
    if (existingBalance.length > 0) {
      // Update existing balance
      await db
        .update(userBalances)
        .set({ 
          amount: existingBalance[0].amount + amount,
          updatedAt: new Date()
        })
        .where(eq(userBalances.id, existingBalance[0].id));
    } else {
      // Create new balance
      await db
        .insert(userBalances)
        .values({
          userId,
          currencyId,
          amount,
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }
    
    // Create a transaction record for the credit
    await db
      .insert(transactions)
      .values({
        userId,
        currencyId,
        type: "credit",
        status: "completed",
        amount,
        price: 1, // For USD, price is 1:1
        fee: 0,
        createdAt: new Date()
      });
    
    res.json({ 
      success: true, 
      message: "Balance credited successfully" 
    });
  } catch (error) {
    console.error("Error crediting balance:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error crediting balance" 
    });
  }
});

// Update staking rate
router.post("/staking-rates", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { currencyId, rate, minAmount, isActive = true } = req.body;
    
    if (!currencyId || rate === undefined || minAmount === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }
    
    if (isNaN(rate) || rate < 0 || rate > 1) {
      return res.status(400).json({ 
        success: false, 
        message: "Rate must be between 0 and 1" 
      });
    }
    
    if (isNaN(minAmount) || minAmount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Minimum amount must be greater than 0" 
      });
    }
    
    // Check if staking rate already exists for this currency
    const existingRate = await db
      .select()
      .from(stakingRates)
      .where(eq(stakingRates.currencyId, currencyId))
      .limit(1);
    
    if (existingRate.length > 0) {
      // Update existing rate
      await db
        .update(stakingRates)
        .set({ 
          rate, 
          minAmount, 
          isActive,
          updatedAt: new Date()
        })
        .where(eq(stakingRates.id, existingRate[0].id));
      
      res.json({ 
        success: true, 
        message: "Staking rate updated successfully" 
      });
    } else {
      // Create new staking rate
      await db
        .insert(stakingRates)
        .values({
          currencyId,
          rate,
          minAmount,
          isActive,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      
      res.json({ 
        success: true, 
        message: "Staking rate created successfully" 
      });
    }
  } catch (error) {
    console.error("Error updating staking rate:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating staking rate" 
    });
  }
});

export default router;