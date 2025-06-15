import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import { sendVerificationEmail, sendWelcomeEmail } from "./email";
import { WebSocketServer } from "ws";
import { db } from "./db";
import { users, currencies, userBalances, transactions, stakingRates, stakingPositions } from "../shared/schema";
import { eq, desc, and } from "drizzle-orm";
import adminPanelRoutes from "./api/admin-panel-routes";
import marketDataRoutes from "./api/market-data-routes";
import futuresTradingRoutes from "./api/futures-trading-routes";
import spotTradingRoutes from "./api/spot-trading-routes";
import referralRoutes from "./api/referral-routes";
import chatbotRoutes from "./api/chatbot-routes";

// Extend express-session types to include userId
declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

// Function to generate a random verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Authentication middleware to check if user is logged in
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }
  next();
};

// Middleware to check if user is verified
const requireVerified = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not found"
    });
  }

  if (!user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Account not verified",
      needsVerification: true
    });
  }

  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware with memory store
  const memoryStore = MemoryStore(session);
  
  app.use(
    session({
      store: new memoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      secret: process.env.SESSION_SECRET || 'nedaxer-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      }
    })
  );

  // Register API routes
  app.use('/api/admin', adminPanelRoutes);
  app.use('/api/market', marketDataRoutes);
  app.use('/api/futures', futuresTradingRoutes);
  app.use('/api/spot', spotTradingRoutes);
  app.use('/api/referrals', referralRoutes);
  app.use('/api/chatbot', chatbotRoutes);

  // API route for user authentication
  app.post('/api/auth/login', async (req, res) => {
    try {
      console.log('Login attempt:', { 
        body: req.body, 
        hasSession: !!req.session 
      });

      // Validate input with zod
      const loginSchema = z.object({
        username: z.string().min(1),
        password: z.string().min(1)
      });

      const result = loginSchema.safeParse(req.body);
      
      if (!result.success) {
        console.log('Login validation failed:', result.error.format());
        return res.status(400).json({ 
          success: false, 
          message: "Invalid credentials format", 
          errors: result.error.format() 
        });
      }
      
      const { username, password } = result.data;
      console.log('Attempting login for:', username);

      // Check if user exists by username or email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }
      
      if (!user) {
        console.log('User not found for:', username);
        return res.status(401).json({ 
          success: false, 
          message: "Invalid username/email or password" 
        });
      }
      
      console.log('User found:', { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin
      });
      
      // Simple password check (in a real app, you'd use bcrypt)
      if (user.password !== password) {
        console.log('Password mismatch for user:', user.username);
        return res.status(401).json({ 
          success: false, 
          message: "Invalid username/email or password" 
        });
      }
      
      // Set session
      req.session.userId = user.id;
      console.log('Session set for user:', user.id);
      
      // User authenticated successfully
      return res.status(200).json({
        success: true,
        message: "Authentication successful",
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: user.isVerified,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ 
        success: false, 
        message: "Internal server error",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // API route for user registration
  app.post('/api/auth/register', async (req, res) => {
    try {
      console.log('Registration attempt with data:', {
        ...req.body,
        password: req.body.password ? '********' : undefined // Don't log passwords
      });
      
      // Validate input with zod schema
      const result = insertUserSchema.safeParse(req.body);
      
      if (!result.success) {
        console.log('Registration validation failed:', result.error.format());
        return res.status(400).json({ 
          success: false, 
          message: "Invalid registration data", 
          errors: result.error.format() 
        });
      }
      
      const { username, email, password, firstName, lastName } = result.data;
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        console.log(`Registration failed: Username ${username} already exists`);
        return res.status(409).json({ 
          success: false, 
          message: "Username already exists" 
        });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        console.log(`Registration failed: Email ${email} already exists`);
        return res.status(409).json({ 
          success: false, 
          message: "Email already exists" 
        });
      }
      
      console.log('Creating new user account...');
      
      // Create new user (automatically verified)
      const newUser = await storage.createUser({
        username,
        email,
        password,
        firstName,
        lastName
      });
      
      // Automatically verify the user
      await storage.markUserAsVerified(newUser.id);
      
      console.log(`User created with ID: ${newUser.id}`);
      
      // Set session to automatically log user in after registration
      req.session.userId = newUser.id;
      
      console.log(`Registration and auto-login successful for user: ${email}`);
      
      return res.status(201).json({
        success: true,
        message: "Account created successfully! You are now logged in.",
        user: {
          id: newUser.id,
          username: newUser.username,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          isVerified: true
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Check for specific database errors
      const errorMessage = error?.message || "Internal server error";
      const isPgError = errorMessage.includes('duplicate key') || errorMessage.includes('violates unique constraint');
      
      if (isPgError && errorMessage.includes('email')) {
        return res.status(409).json({ 
          success: false, 
          message: "Email already exists" 
        });
      } else if (isPgError && errorMessage.includes('username')) {
        return res.status(409).json({ 
          success: false, 
          message: "Username already exists" 
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: "Internal server error during registration. Please try again." 
      });
    }
  });
  
  // API route for verifying account
  app.post('/api/auth/verify', async (req, res) => {
    try {
      const verifySchema = z.object({
        userId: z.number(),
        code: z.string().length(6)
      });
      
      const result = verifySchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid verification data", 
          errors: result.error.format() 
        });
      }
      
      const { userId, code } = result.data;
      
      // Verify the code
      const isValid = await storage.verifyUser(userId, code);
      
      if (!isValid) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid or expired verification code" 
        });
      }
      
      // Mark user as verified
      await storage.markUserAsVerified(userId);
      
      // Get user details for the welcome email
      const user = await storage.getUser(userId);
      
      // Send welcome email if user exists
      if (user) {
        try {
          await sendWelcomeEmail(user.email, user.firstName);
        } catch (emailError) {
          // Log error but don't fail the verification process
          console.error('Error sending welcome email:', emailError);
        }
      }
      
      // Set session
      req.session.userId = userId;
      
      return res.status(200).json({
        success: true,
        message: "Account verified successfully"
      });
    } catch (error) {
      console.error('Verification error:', error);
      return res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });
  
  // API route for resending verification code
  app.post('/api/auth/resend-verification', async (req, res) => {
    try {
      const schema = z.object({
        userId: z.number()
      });
      
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid request", 
          errors: result.error.format() 
        });
      }
      
      const { userId } = result.data;
      
      // Get user
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }
      
      if (user.isVerified) {
        return res.status(400).json({ 
          success: false, 
          message: "User already verified" 
        });
      }
      
      // Generate new verification code
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      
      await storage.setVerificationCode(userId, verificationCode, expiresAt);
      
      // Send verification email with code
      let emailSent = false;
      try {
        // Send verification email with code
        await sendVerificationEmail(user.email, verificationCode, user.firstName);
        emailSent = true;
        console.log(`Verification email with code successfully resent to ${user.email}`);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        
        // In development mode, just log the verification code for testing
        if (process.env.NODE_ENV === 'development') {
          console.log(`DEVELOPMENT MODE: Verification code for ${user.email} is: ${verificationCode}`);
          emailSent = true; // Consider it sent in development
        }
      }
      
      // In production, report email sending failure
      if (!emailSent && process.env.NODE_ENV !== 'development') {
        return res.status(500).json({
          success: false,
          message: "Failed to send verification email. Please try again or contact support."
        });
      }
      
      // Success - respond with verification code in development mode
      return res.status(200).json({
        success: true,
        message: "Verification code resent successfully",
        // Only include verification code in development mode
        ...(process.env.NODE_ENV === 'development' && { verificationCode })
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      return res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });
  
  // API route for getting current user (if logged in)
  app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId as number);
      
      if (!user) {
        // Session has userId but user not found in DB
        req.session.destroy((err) => {
          if (err) console.error('Error destroying session:', err);
        });
        
        return res.status(401).json({
          success: false,
          message: "User not found"
        });
      }
      
      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: user.isVerified
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });
  
  // API route for logging out
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to logout" 
        });
      }
      
      res.clearCookie('connect.sid');
      return res.status(200).json({
        success: true,
        message: "Logged out successfully"
      });
    });
  });

  // Route to handle account login page
  app.get('/account/login', (req, res) => {
    res.redirect('/#/account/login');
  });
  
  // Route to handle account registration page
  app.get('/account/register', (req, res) => {
    res.redirect('/#/account/register');
  });
  
  // Portfolio and Balance Management Endpoints
  
  // Get user portfolio overview
  app.get('/api/portfolio', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      // Get all user balances with currency information
      const balances = await db
        .select({
          id: userBalances.id,
          balance: userBalances.balance,
          currency: {
            id: currencies.id,
            symbol: currencies.symbol,
            name: currencies.name,
            type: currencies.type
          }
        })
        .from(userBalances)
        .innerJoin(currencies, eq(userBalances.currencyId, currencies.id))
        .where(eq(userBalances.userId, userId));

      // Get staking positions
      const stakingData = await db
        .select({
          id: stakingPositions.id,
          amount: stakingPositions.amount,
          accumulatedRewards: stakingPositions.accumulatedRewards,
          startedAt: stakingPositions.startedAt,
          status: stakingPositions.status,
          currency: {
            symbol: currencies.symbol,
            name: currencies.name
          },
          rate: stakingPositions.rate
        })
        .from(stakingPositions)
        .innerJoin(currencies, eq(stakingPositions.currencyId, currencies.id))
        .where(and(eq(stakingPositions.userId, userId), eq(stakingPositions.status, 'active')));

      // Calculate total portfolio value (simplified - using 1:1 USD conversion for demo)
      const totalValue = balances.reduce((sum, balance) => {
        return sum + (balance.balance || 0);
      }, 0);

      return res.json({
        success: true,
        portfolio: {
          totalValue,
          balances,
          stakingPositions: stakingData,
          totalStaked: stakingData.reduce((sum, pos) => sum + (pos.amount || 0), 0),
          totalRewards: stakingData.reduce((sum, pos) => sum + (pos.accumulatedRewards || 0), 0)
        }
      });
    } catch (error) {
      console.error('Portfolio fetch error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch portfolio"
      });
    }
  });

  // Get user balances
  app.get('/api/balances', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      const balances = await db
        .select({
          id: userBalances.id,
          balance: userBalances.balance,
          currency: {
            id: currencies.id,
            symbol: currencies.symbol,
            name: currencies.name,
            type: currencies.type,
            isActive: currencies.isActive
          }
        })
        .from(userBalances)
        .innerJoin(currencies, eq(userBalances.currencyId, currencies.id))
        .where(eq(userBalances.userId, userId));

      return res.json({
        success: true,
        balances
      });
    } catch (error) {
      console.error('Balances fetch error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch balances"
      });
    }
  });

  // Credit user balance (admin function for demo)
  app.post('/api/balances/credit', requireAuth, async (req, res) => {
    try {
      const { currencySymbol, amount } = req.body;
      const userId = req.session.userId as number;

      if (!currencySymbol || !amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid currency or amount"
        });
      }

      // Get currency
      const currency = await db
        .select()
        .from(currencies)
        .where(eq(currencies.symbol, currencySymbol))
        .limit(1);

      if (!currency.length) {
        return res.status(404).json({
          success: false,
          message: "Currency not found"
        });
      }

      // Check if user balance exists
      const existingBalance = await db
        .select()
        .from(userBalances)
        .where(and(
          eq(userBalances.userId, userId),
          eq(userBalances.currencyId, currency[0].id)
        ))
        .limit(1);

      if (existingBalance.length > 0) {
        // Update existing balance
        await db
          .update(userBalances)
          .set({ 
            balance: existingBalance[0].balance + amount,
            updatedAt: new Date()
          })
          .where(eq(userBalances.id, existingBalance[0].id));
      } else {
        // Create new balance
        await db
          .insert(userBalances)
          .values({
            userId,
            currencyId: currency[0].id,
            balance: amount
          });
      }

      // Record transaction
      await db
        .insert(transactions)
        .values({
          userId,
          type: 'deposit',
          targetId: currency[0].id,
          targetAmount: amount,
          status: 'completed',
          metadata: { description: `Manual credit of ${amount} ${currencySymbol}` }
        });

      return res.json({
        success: true,
        message: `Successfully credited ${amount} ${currencySymbol}`
      });
    } catch (error) {
      console.error('Credit balance error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to credit balance"
      });
    }
  });

  // Trading Endpoints
  
  // Get available trading pairs
  app.get('/api/trading/pairs', async (req, res) => {
    try {
      const activeCurrencies = await db
        .select()
        .from(currencies)
        .where(eq(currencies.isActive, true));

      // Create trading pairs (crypto vs USD)
      const usd = activeCurrencies.find(c => c.symbol === 'USD');
      const cryptoCurrencies = activeCurrencies.filter(c => c.type === 'crypto');

      const tradingPairs = cryptoCurrencies.map(crypto => ({
        id: `${crypto.symbol}_USD`,
        baseAsset: crypto.symbol,
        quoteAsset: 'USD',
        baseName: crypto.name,
        quoteName: usd?.name || 'US Dollar',
        active: true
      }));

      return res.json({
        success: true,
        pairs: tradingPairs
      });
    } catch (error) {
      console.error('Trading pairs fetch error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch trading pairs"
      });
    }
  });

  // Place a buy order
  app.post('/api/trading/buy', requireAuth, async (req, res) => {
    try {
      const { pair, amount, price } = req.body;
      const userId = req.session.userId as number;

      if (!pair || !amount || !price || amount <= 0 || price <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid trading parameters"
        });
      }

      const [baseAsset, quoteAsset] = pair.split('_');
      const totalCost = amount * price;

      // Get currencies
      const baseCurrency = await db.select().from(currencies).where(eq(currencies.symbol, baseAsset)).limit(1);
      const quoteCurrency = await db.select().from(currencies).where(eq(currencies.symbol, quoteAsset)).limit(1);

      if (!baseCurrency.length || !quoteCurrency.length) {
        return res.status(404).json({
          success: false,
          message: "Invalid trading pair"
        });
      }

      // Check user has sufficient quote currency balance
      const quoteBalance = await db
        .select()
        .from(userBalances)
        .where(and(
          eq(userBalances.userId, userId),
          eq(userBalances.currencyId, quoteCurrency[0].id)
        ))
        .limit(1);

      if (!quoteBalance.length || quoteBalance[0].amount < totalCost) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${quoteAsset} balance`
        });
      }

      // Deduct quote currency
      await db
        .update(userBalances)
        .set({ 
          amount: quoteBalance[0].amount - totalCost,
          updatedAt: new Date()
        })
        .where(eq(userBalances.id, quoteBalance[0].id));

      // Add base currency
      const baseBalance = await db
        .select()
        .from(userBalances)
        .where(and(
          eq(userBalances.userId, userId),
          eq(userBalances.currencyId, baseCurrency[0].id)
        ))
        .limit(1);

      if (baseBalance.length > 0) {
        await db
          .update(userBalances)
          .set({ 
            amount: baseBalance[0].amount + amount,
            updatedAt: new Date()
          })
          .where(eq(userBalances.id, baseBalance[0].id));
      } else {
        await db
          .insert(userBalances)
          .values({
            userId,
            currencyId: baseCurrency[0].id,
            amount,
            lockedAmount: 0
          });
      }

      // Record buy transaction
      await db
        .insert(transactions)
        .values({
          userId,
          currencyId: baseCurrency[0].id,
          amount,
          type: 'buy',
          status: 'completed',
          description: `Bought ${amount} ${baseAsset} at ${price} ${quoteAsset} each`
        });

      // Record sell transaction for quote currency
      await db
        .insert(transactions)
        .values({
          userId,
          currencyId: quoteCurrency[0].id,
          amount: -totalCost,
          type: 'sell',
          status: 'completed',
          description: `Sold ${totalCost} ${quoteAsset} for ${amount} ${baseAsset}`
        });

      return res.json({
        success: true,
        message: `Successfully bought ${amount} ${baseAsset}`,
        transaction: {
          pair,
          amount,
          price,
          totalCost,
          type: 'buy'
        }
      });
    } catch (error) {
      console.error('Buy order error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to execute buy order"
      });
    }
  });

  // Place a sell order
  app.post('/api/trading/sell', requireAuth, async (req, res) => {
    try {
      const { pair, amount, price } = req.body;
      const userId = req.session.userId as number;

      if (!pair || !amount || !price || amount <= 0 || price <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid trading parameters"
        });
      }

      const [baseAsset, quoteAsset] = pair.split('_');
      const totalReceive = amount * price;

      // Get currencies
      const baseCurrency = await db.select().from(currencies).where(eq(currencies.symbol, baseAsset)).limit(1);
      const quoteCurrency = await db.select().from(currencies).where(eq(currencies.symbol, quoteAsset)).limit(1);

      if (!baseCurrency.length || !quoteCurrency.length) {
        return res.status(404).json({
          success: false,
          message: "Invalid trading pair"
        });
      }

      // Check user has sufficient base currency balance
      const baseBalance = await db
        .select()
        .from(userBalances)
        .where(and(
          eq(userBalances.userId, userId),
          eq(userBalances.currencyId, baseCurrency[0].id)
        ))
        .limit(1);

      if (!baseBalance.length || baseBalance[0].amount < amount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${baseAsset} balance`
        });
      }

      // Deduct base currency
      await db
        .update(userBalances)
        .set({ 
          amount: baseBalance[0].amount - amount,
          updatedAt: new Date()
        })
        .where(eq(userBalances.id, baseBalance[0].id));

      // Add quote currency
      const quoteBalance = await db
        .select()
        .from(userBalances)
        .where(and(
          eq(userBalances.userId, userId),
          eq(userBalances.currencyId, quoteCurrency[0].id)
        ))
        .limit(1);

      if (quoteBalance.length > 0) {
        await db
          .update(userBalances)
          .set({ 
            amount: quoteBalance[0].amount + totalReceive,
            updatedAt: new Date()
        })
          .where(eq(userBalances.id, quoteBalance[0].id));
      } else {
        await db
          .insert(userBalances)
          .values({
            userId,
            currencyId: quoteCurrency[0].id,
            amount: totalReceive,
            lockedAmount: 0
          });
      }

      // Record transactions
      await db
        .insert(transactions)
        .values({
          userId,
          currencyId: baseCurrency[0].id,
          amount: -amount,
          type: 'sell',
          status: 'completed',
          description: `Sold ${amount} ${baseAsset} at ${price} ${quoteAsset} each`
        });

      await db
        .insert(transactions)
        .values({
          userId,
          currencyId: quoteCurrency[0].id,
          amount: totalReceive,
          type: 'buy',
          status: 'completed',
          description: `Received ${totalReceive} ${quoteAsset} for ${amount} ${baseAsset}`
        });

      return res.json({
        success: true,
        message: `Successfully sold ${amount} ${baseAsset}`,
        transaction: {
          pair,
          amount,
          price,
          totalReceive,
          type: 'sell'
        }
      });
    } catch (error) {
      console.error('Sell order error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to execute sell order"
      });
    }
  });

  // Get transaction history
  app.get('/api/transactions', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const { limit = 50, offset = 0 } = req.query;

      const userTransactions = await db
        .select({
          id: transactions.id,
          amount: transactions.amount,
          type: transactions.type,
          status: transactions.status,
          description: transactions.description,
          createdAt: transactions.createdAt,
          currency: {
            symbol: currencies.symbol,
            name: currencies.name
          }
        })
        .from(transactions)
        .innerJoin(currencies, eq(transactions.currencyId, currencies.id))
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.createdAt))
        .limit(Number(limit))
        .offset(Number(offset));

      return res.json({
        success: true,
        transactions: userTransactions
      });
    } catch (error) {
      console.error('Transactions fetch error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch transactions"
      });
    }
  });

  // Staking Endpoints
  
  // Get available staking options
  app.get('/api/staking/options', async (req, res) => {
    try {
      const stakingOptions = await db
        .select({
          id: stakingRates.id,
          rate: stakingRates.rate,
          minAmount: stakingRates.minAmount,
          isActive: stakingRates.isActive,
          currency: {
            id: currencies.id,
            symbol: currencies.symbol,
            name: currencies.name,
            type: currencies.type
          }
        })
        .from(stakingRates)
        .innerJoin(currencies, eq(stakingRates.currencyId, currencies.id))
        .where(eq(stakingRates.isActive, true));

      return res.json({
        success: true,
        options: stakingOptions
      });
    } catch (error) {
      console.error('Staking options fetch error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch staking options"
      });
    }
  });

  // Start staking
  app.post('/api/staking/stake', requireAuth, async (req, res) => {
    try {
      const { currencySymbol, amount } = req.body;
      const userId = req.session.userId as number;

      if (!currencySymbol || !amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid staking parameters"
        });
      }

      // Get currency and staking rate
      const currency = await db
        .select()
        .from(currencies)
        .where(eq(currencies.symbol, currencySymbol))
        .limit(1);

      if (!currency.length) {
        return res.status(404).json({
          success: false,
          message: "Currency not found"
        });
      }

      const stakingRate = await db
        .select()
        .from(stakingRates)
        .where(and(
          eq(stakingRates.currencyId, currency[0].id),
          eq(stakingRates.isActive, true)
        ))
        .limit(1);

      if (!stakingRate.length) {
        return res.status(404).json({
          success: false,
          message: "Staking not available for this currency"
        });
      }

      if (amount < stakingRate[0].minAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum staking amount is ${stakingRate[0].minAmount} ${currencySymbol}`
        });
      }

      // Check user balance
      const userBalance = await db
        .select()
        .from(userBalances)
        .where(and(
          eq(userBalances.userId, userId),
          eq(userBalances.currencyId, currency[0].id)
        ))
        .limit(1);

      if (!userBalance.length || userBalance[0].amount < amount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${currencySymbol} balance`
        });
      }

      // Move to locked balance and create staking position
      await db
        .update(userBalances)
        .set({ 
          amount: userBalance[0].amount - amount,
          lockedAmount: userBalance[0].lockedAmount + amount,
          updatedAt: new Date()
        })
        .where(eq(userBalances.id, userBalance[0].id));

      await db
        .insert(stakingPositions)
        .values({
          userId,
          currencyId: currency[0].id,
          amount,
          rewards: 0,
          startDate: new Date(),
          isActive: true
        });

      // Record transaction
      await db
        .insert(transactions)
        .values({
          userId,
          currencyId: currency[0].id,
          amount: -amount,
          type: 'stake',
          status: 'completed',
          description: `Staked ${amount} ${currencySymbol} at ${(stakingRate[0].rate * 100).toFixed(2)}% APY`
        });

      return res.json({
        success: true,
        message: `Successfully staked ${amount} ${currencySymbol}`,
        staking: {
          amount,
          currency: currencySymbol,
          rate: stakingRate[0].rate,
          estimatedAnnualReward: amount * stakingRate[0].rate
        }
      });
    } catch (error) {
      console.error('Staking error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to start staking"
      });
    }
  });

  // Route to handle account verification page
  app.get('/account/verify', (req, res) => {
    // Preserve query parameters for userId and code
    const userId = req.query.userId;
    const code = req.query.code;
    
    // Build the redirect URL with all parameters
    let redirectUrl = '/#/account/verify';
    
    if (userId || code) {
      redirectUrl += '?';
      
      if (userId) {
        redirectUrl += `userId=${userId}`;
      }
      
      if (userId && code) {
        redirectUrl += '&';
      }
      
      if (code) {
        redirectUrl += `code=${code}`;
      }
    }
    
    res.redirect(redirectUrl);
  });
  
  // Route to handle forgot password page
  app.get('/account/forgot-password', (req, res) => {
    res.redirect('/#/account/forgot-password');
  });

  // Simple helper route for development - creates a test user
  if (process.env.NODE_ENV === 'development') {
    app.get('/api/setup-test-user', async (req, res) => {
      try {
        const testUser = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        };
        
        // Check if testuser already exists by email
        const existingUser = await storage.getUserByEmail(testUser.email);
        
        if (!existingUser) {
          const newUser = await storage.createUser(testUser);
          await storage.markUserAsVerified(newUser.id);
          res.json({ success: true, message: 'Test user created and verified' });
        } else {
          res.json({ success: true, message: 'Test user already exists' });
        }
      } catch (error) {
        console.error('Error creating test user:', error);
        res.status(500).json({ success: false, message: 'Failed to create test user' });
      }
    });
  }

  // Get current authenticated user
  app.get('/api/auth/user', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated"
        });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found"
        });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({
            success: false,
            message: "Failed to logout"
          });
        }
        
        res.clearCookie('connect.sid'); // Clear session cookie
        return res.status(200).json({
          success: true,
          message: "Logged out successfully"
        });
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Import price service
  const { priceService } = await import('./services/price.service');

  // Real-time markets API
  app.get("/api/markets", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const cryptocurrencies = await priceService.getTopCryptocurrencies(limit);
      
      const markets = cryptocurrencies.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_percentage_24h,
        change7d: coin.price_change_percentage_7d,
        marketCap: coin.market_cap,
        volume: coin.total_volume,
        rank: coin.market_cap_rank,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
        lastUpdated: coin.last_updated
      }));
      
      res.json(markets);
    } catch (error) {
      console.error("Error fetching markets:", error);
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  // Get specific coin data
  app.get("/api/markets/:coinId", async (req: Request, res: Response) => {
    try {
      const { coinId } = req.params;
      const coinData = await priceService.getCoinPrice(coinId);
      
      res.json({
        id: coinData.id,
        symbol: coinData.symbol.toUpperCase(),
        name: coinData.name,
        price: coinData.current_price,
        change: coinData.price_change_percentage_24h,
        change7d: coinData.price_change_percentage_7d,
        marketCap: coinData.market_cap,
        volume: coinData.total_volume,
        rank: coinData.market_cap_rank,
        high24h: coinData.high_24h,
        low24h: coinData.low_24h,
        circulatingSupply: coinData.circulating_supply,
        totalSupply: coinData.total_supply,
        lastUpdated: coinData.last_updated
      });
    } catch (error) {
      console.error(`Error fetching coin ${req.params.coinId}:`, error);
      res.status(500).json({ message: "Failed to fetch coin data" });
    }
  });

  // Get historical chart data
  app.get("/api/markets/:coinId/chart", async (req: Request, res: Response) => {
    try {
      const { coinId } = req.params;
      const days = parseInt(req.query.days as string) || 30;
      
      const chartData = await priceService.getMarketChart(coinId, days);
      
      const formattedData = chartData.prices.map((price, index) => ({
        timestamp: price[0],
        date: new Date(price[0]).toISOString(),
        price: price[1],
        volume: chartData.volumes[index] ? chartData.volumes[index][1] : 0
      }));
      
      res.json(formattedData);
    } catch (error) {
      console.error(`Error fetching chart for ${req.params.coinId}:`, error);
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });

  // Get OHLC candlestick data
  app.get("/api/markets/:coinId/ohlc", async (req: Request, res: Response) => {
    try {
      const { coinId } = req.params;
      const days = parseInt(req.query.days as string) || 30;
      
      const ohlcData = await priceService.getHistoricalData(coinId, days);
      
      res.json(ohlcData);
    } catch (error) {
      console.error(`Error fetching OHLC for ${req.params.coinId}:`, error);
      res.status(500).json({ message: "Failed to fetch OHLC data" });
    }
  });

  // Get technical indicators
  app.get("/api/markets/:coinId/indicators", async (req: Request, res: Response) => {
    try {
      const { coinId } = req.params;
      const indicators = await priceService.getTechnicalIndicators(coinId);
      
      res.json(indicators);
    } catch (error) {
      console.error(`Error fetching indicators for ${req.params.coinId}:`, error);
      res.status(500).json({ message: "Failed to fetch technical indicators" });
    }
  });

  // Get trending coins
  app.get("/api/trending", async (req: Request, res: Response) => {
    try {
      const trending = await priceService.getTrendingCoins();
      res.json(trending);
    } catch (error) {
      console.error("Error fetching trending coins:", error);
      res.status(500).json({ message: "Failed to fetch trending coins" });
    }
  });

  // Get global market data
  app.get("/api/global", async (req: Request, res: Response) => {
    try {
      const globalData = await priceService.getGlobalMarketData();
      res.json(globalData);
    } catch (error) {
      console.error("Error fetching global market data:", error);
      res.status(500).json({ message: "Failed to fetch global market data" });
    }
  });
  
  const httpServer = createServer(app);

  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send initial data
    ws.send(JSON.stringify({ type: 'connection', message: 'Connected to trading platform' }));
    
    // Handle messages from clients
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received:', data);
        
        // Handle different message types
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
