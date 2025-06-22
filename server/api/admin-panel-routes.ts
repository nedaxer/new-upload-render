import { Router, Request, Response, NextFunction } from "express";
import { db } from "../db";
import { users, currencies, userBalances, adminCredits, stakingRates, transactions } from "../../shared/schema";
import { eq, desc, sum, count, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// Admin authentication middleware
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  const [user] = await db.select().from(users).where(eq(users.id, req.session.userId));
  
  if (!user || !user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Admin access required"
    });
  }

  next();
};

// Get admin dashboard stats
router.get("/stats", requireAdmin, async (req: Request, res: Response) => {
  try {
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [totalBalance] = await db.select({ 
      total: sum(userBalances.balance) 
    }).from(userBalances);
    
    const [recentTransactions] = await db.select({ count: count() })
      .from(transactions)
      .where(eq(transactions.status, 'completed'));

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers.count || 0,
        totalBalance: totalBalance.total || 0,
        totalTransactions: recentTransactions.count || 0,
        platformValue: (totalBalance.total || 0) * 1.05 // Sample calculation
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin stats"
    });
  }
});

// Get all users for admin management
router.get("/users", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      isVerified: users.isVerified,
      isAdmin: users.isAdmin,
      kycStatus: users.kycStatus,
      totalPortfolioValue: users.totalPortfolioValue,
      createdAt: users.createdAt
    }).from(users);

    if (search && typeof search === 'string') {
      // Check if search is a number (UID search)
      const searchNumber = parseInt(search.replace('#', ''), 10);
      
      if (!isNaN(searchNumber)) {
        // Search by UID
        query = query.where(eq(users.id, searchNumber));
      } else {
        // Search by text fields
        const searchPattern = `%${search}%`;
        query = query.where(
          sql`${users.username} ILIKE ${searchPattern} OR 
              ${users.email} ILIKE ${searchPattern} OR 
              ${users.firstName} ILIKE ${searchPattern} OR 
              ${users.lastName} ILIKE ${searchPattern}`
        );
      }
    }

    const allUsers = await query.orderBy(desc(users.createdAt));

    res.json({
      success: true,
      users: allUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
});

// Credit user balance (admin only)
router.post("/credit-balance", requireAdmin, async (req: Request, res: Response) => {
  try {
    const creditSchema = z.object({
      userId: z.number(),
      currencySymbol: z.string(),
      amount: z.number().positive(),
      reason: z.string().min(1)
    });

    const result = creditSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid credit data",
        errors: result.error.errors
      });
    }

    const { userId, currencySymbol, amount, reason } = result.data;

    // Find currency
    const [currency] = await db.select()
      .from(currencies)
      .where(eq(currencies.symbol, currencySymbol));

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: "Currency not found"
      });
    }

    // Find target user
    const [targetUser] = await db.select()
      .from(users)
      .where(eq(users.id, userId));

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user balance exists, create if not
    const [existingBalance] = await db.select()
      .from(userBalances)
      .where(eq(userBalances.userId, userId))
      .where(eq(userBalances.currencyId, currency.id));

    if (existingBalance) {
      // Update existing balance
      await db.update(userBalances)
        .set({ 
          balance: existingBalance.balance + amount,
          updatedAt: new Date()
        })
        .where(eq(userBalances.id, existingBalance.id));
    } else {
      // Create new balance
      await db.insert(userBalances).values({
        userId,
        currencyId: currency.id,
        balance: amount,
        updatedAt: new Date()
      });
    }

    // Record admin credit transaction
    await db.insert(adminCredits).values({
      adminId: req.session.userId!,
      userId,
      currencyId: currency.id,
      amount,
      reason,
      createdAt: new Date()
    });

    // Create transaction record for user history
    await db.insert(transactions).values({
      userId,
      type: 'deposit',
      sourceId: currency.id,
      sourceAmount: amount,
      targetId: currency.id,
      targetAmount: amount,
      fee: 0,
      status: 'completed',
      metadata: { adminCredit: true, reason },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: `Successfully credited ${amount} ${currencySymbol} to user account`
    });

  } catch (error) {
    console.error('Credit balance error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to credit user balance"
    });
  }
});

// Update staking rates (admin only)
router.post("/staking-rates", requireAdmin, async (req: Request, res: Response) => {
  try {
    const stakingSchema = z.object({
      currencySymbol: z.string(),
      rate: z.number().min(0).max(1), // Rate as decimal (0.05 = 5%)
      minAmount: z.number().positive()
    });

    const result = stakingSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid staking rate data",
        errors: result.error.errors
      });
    }

    const { currencySymbol, rate, minAmount } = result.data;

    // Find currency
    const [currency] = await db.select()
      .from(currencies)
      .where(eq(currencies.symbol, currencySymbol));

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: "Currency not found"
      });
    }

    // Check if staking rate exists
    const [existingRate] = await db.select()
      .from(stakingRates)
      .where(eq(stakingRates.currencyId, currency.id));

    if (existingRate) {
      // Update existing rate
      await db.update(stakingRates)
        .set({ 
          rate,
          minAmount,
          updatedAt: new Date()
        })
        .where(eq(stakingRates.id, existingRate.id));
    } else {
      // Create new staking rate
      await db.insert(stakingRates).values({
        currencyId: currency.id,
        rate,
        minAmount,
        isActive: true,
        updatedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: `Successfully updated staking rate for ${currencySymbol} to ${(rate * 100).toFixed(2)}% APY`
    });

  } catch (error) {
    console.error('Update staking rates error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update staking rates"
    });
  }
});

// Get recent transactions for admin monitoring
router.get("/recent-transactions", requireAdmin, async (req: Request, res: Response) => {
  try {
    const recentTransactions = await db.select({
      id: transactions.id,
      userId: transactions.userId,
      type: transactions.type,
      sourceAmount: transactions.sourceAmount,
      targetAmount: transactions.targetAmount,
      status: transactions.status,
      createdAt: transactions.createdAt,
      username: users.username
    })
    .from(transactions)
    .leftJoin(users, eq(transactions.userId, users.id))
    .orderBy(desc(transactions.createdAt))
    .limit(100);

    res.json({
      success: true,
      transactions: recentTransactions
    });
  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent transactions"
    });
  }
});

export default router;