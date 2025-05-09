import { Request, Response, Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { users, currencies, stakingRates } from "@shared/schema";
import { eq, like } from "drizzle-orm";
import { tradingService } from "../services/trading.service";

const adminRouter = Router();

// Middleware to check admin authentication
const requireAdmin = async (req: Request, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required" 
    });
  }
  
  try {
    // Check if user is admin
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId));
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: "Admin privileges required" 
      });
    }
    
    next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Admin login route
adminRouter.post("/login", async (req, res) => {
  try {
    const loginSchema = z.object({
      username: z.string(),
      password: z.string()
    });
    
    const result = loginSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request format",
        errors: result.error.format()
      });
    }
    
    const { username, password } = result.data;
    
    // Find the user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }
    
    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin privileges required"
      });
    }
    
    // Set session
    req.session.userId = user.id;
    
    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Search users
adminRouter.get("/users", requireAdmin, async (req, res) => {
  try {
    // Parse search query
    const { search, limit = 50, offset = 0 } = req.query;
    
    let query = db.select().from(users);
    
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.where(
        like(users.username, searchTerm)
      );
    }
    
    const usersList = await query
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));
    
    return res.status(200).json({
      success: true,
      data: usersList.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Get user details
adminRouter.get("/users/:id", requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }
    
    // Get user info
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Get user balances
    const balances = await tradingService.getAllUserBalances(userId);
    
    // Get recent transactions
    const transactions = await tradingService.getUserTransactionsDetailed(userId, 20);
    
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt
        },
        balances,
        transactions
      }
    });
  } catch (error) {
    console.error("Error getting user details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Credit user balance (admin function)
adminRouter.post("/credit-balance", requireAdmin, async (req, res) => {
  try {
    const creditSchema = z.object({
      userId: z.number(),
      currencyId: z.number(),
      amount: z.number().positive()
    });
    
    const result = creditSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request format",
        errors: result.error.format()
      });
    }
    
    const { userId, currencyId, amount } = result.data;
    
    // Verify user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Verify currency exists
    const [currency] = await db
      .select()
      .from(currencies)
      .where(eq(currencies.id, currencyId));
    
    if (!currency) {
      return res.status(404).json({
        success: false,
        message: "Currency not found"
      });
    }
    
    // Credit user balance
    const updatedBalance = await tradingService.updateUserBalance(userId, currencyId, amount);
    
    return res.status(200).json({
      success: true,
      message: `Successfully credited ${amount} ${currency.symbol} to user ${user.username}`,
      data: {
        updatedBalance
      }
    });
  } catch (error) {
    console.error("Error crediting balance:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Update staking rates
adminRouter.post("/staking-rates", requireAdmin, async (req, res) => {
  try {
    const rateSchema = z.object({
      currencyId: z.number(),
      rate: z.number().min(0).max(1), // 0 to 100%
      minAmount: z.number().positive()
    });
    
    const result = rateSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request format",
        errors: result.error.format()
      });
    }
    
    const { currencyId, rate, minAmount } = result.data;
    
    // Check if currency exists
    const [currency] = await db
      .select()
      .from(currencies)
      .where(eq(currencies.id, currencyId));
    
    if (!currency) {
      return res.status(404).json({
        success: false,
        message: "Currency not found"
      });
    }
    
    // Check if staking rate exists for this currency
    const existingRates = await db
      .select()
      .from(stakingRates)
      .where(eq(stakingRates.currencyId, currencyId));
    
    let updatedRate;
    
    if (existingRates.length > 0) {
      // Update existing rate
      [updatedRate] = await db
        .update(stakingRates)
        .set({
          rate,
          minAmount,
          updatedAt: new Date()
        })
        .where(eq(stakingRates.currencyId, currencyId))
        .returning();
    } else {
      // Create new rate
      [updatedRate] = await db
        .insert(stakingRates)
        .values({
          currencyId,
          rate,
          minAmount,
          isActive: true,
          updatedAt: new Date()
        })
        .returning();
    }
    
    return res.status(200).json({
      success: true,
      message: `Successfully updated staking rate for ${currency.symbol}`,
      data: {
        stakingRate: updatedRate
      }
    });
  } catch (error) {
    console.error("Error updating staking rate:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

export default adminRouter;