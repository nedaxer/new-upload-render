import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { mongoStorage as storage } from "./mongoStorage";
import { insertMongoUserSchema, userDataSchema } from "@shared/mongo-schema";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import MongoStore from "connect-mongodb-session";
import { connectToDatabase, getMongoClient } from "./mongodb";
import { getCoinGeckoPrices } from "./coingecko-api";
import { sendEmail, sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from "./email";
import crypto from "crypto";
import chatbotRoutes from "./api/chatbot-routes";

// Extend express-session types to include userId
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  next();
};

const requireVerified = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  const user = await storage.getUser(req.session.userId);
  if (!user || !user.isVerified) {
    return res.status(403).json({ success: false, message: "Account not verified" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Connect to MongoDB first
  await connectToDatabase();
  
  // Setup MongoDB session store
  const MongoDBStore = MongoStore(session);
  const store = new MongoDBStore({
    uri: 'mongodb+srv://glo54t875:HC3kFetCuyWe9u28@nedaxer.qzntzfb.mongodb.net/?retryWrites=true&w=majority&appName=Nedaxer',
    collection: 'sessions'
  });

  // Handle session store errors
  store.on('error', function(error) {
    console.log('Session store error:', error);
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || 'nedaxer-trading-platform-secret-2025',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true, // Keep secure but allow browser access
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax' // Allow cross-site requests
    }
  }));

  // Connect to MongoDB Atlas
  await connectToDatabase();

  // Crypto prices endpoint
  app.get('/api/crypto/prices', async (req: Request, res: Response) => {
    try {
      const prices = await getCoinGeckoPrices();
      res.json({ success: true, data: prices });
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch crypto prices' });
    }
  });

  // Add realtime prices endpoint with caching
  const { getRealtimePrices } = await import('./api/realtime-prices');
  app.get('/api/crypto/realtime-prices', getRealtimePrices);

  // Auth endpoint to get current user data
  app.get('/api/auth/user', async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Return user data without sensitive fields
      const userData = {
        _id: user._id,
        uid: user.uid,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        favorites: user.favorites || [],
        preferences: user.preferences,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      };

      res.json(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch user data' });
    }
  });

  // Registration endpoint
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      console.log('Registration attempt with data:', {
        ...req.body,
        password: req.body.password ? '********' : undefined
      });

      // Validate input with zod schema
      const result = insertMongoUserSchema.safeParse(req.body);

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
        return res.status(400).json({
          success: false,
          message: "Username already exists"
        });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        });
      }

      // Create new user (automatically verified)
      const newUser = await storage.createUser({
        username,
        email,
        password,
        firstName,
        lastName
      });

      // Automatically verify the user
      await storage.markUserAsVerified(newUser._id.toString());

      console.log(`User created with ID: ${newUser._id}`);

      // Create initial fund balances for new user
      try {
        const { Currency } = await import('./models/Currency');
        const { UserBalance } = await import('./models/UserBalance');
        
        // Get currencies
        const usdCurrency = await Currency.findOne({ symbol: 'USD' });
        const btcCurrency = await Currency.findOne({ symbol: 'BTC' });
        const ethCurrency = await Currency.findOne({ symbol: 'ETH' });
        
        if (usdCurrency && btcCurrency && ethCurrency) {
          // Create starter balances for new user
          const starterBalances = [
            { userId: newUser._id, currencyId: usdCurrency._id, amount: 10000 }, // $10,000 starter
            { userId: newUser._id, currencyId: btcCurrency._id, amount: 0.1 },   // 0.1 BTC starter
            { userId: newUser._id, currencyId: ethCurrency._id, amount: 2 }      // 2 ETH starter
          ];
          
          for (const balanceData of starterBalances) {
            const balance = new UserBalance(balanceData);
            await balance.save();
          }
          console.log('Created starter fund balances for new user');
        }
      } catch (balanceError) {
        console.warn('Could not create starter balances:', balanceError);
        // Don't fail registration if balance creation fails
      }

      // Set session to automatically log user in after registration
      req.session.userId = newUser._id.toString();

      console.log(`Registration and auto-login successful for user: ${email}`);

      return res.status(201).json({
        success: true,
        message: "Registration successful. You are now logged in.",
        user: {
          _id: newUser._id,
          uid: newUser.uid,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          isVerified: true
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during registration"
      });
    }
  });

  // Login endpoint  
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "Username and password are required" 
        });
      }

      // Check if user exists by username or email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid credentials" 
        });
      }

      // Import auth service for password verification
      const { authService } = await import('./services/auth.service');
      const isPasswordValid = await authService.verifyPassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid credentials" 
        });
      }

      // Set session
      req.session.userId = user._id.toString();

      res.json({ 
        success: true, 
        message: "Login successful",
        user: {
          _id: user._id,
          uid: user.uid,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified,
          isAdmin: user.isAdmin
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Failed to logout" 
        });
      }
      res.clearCookie('connect.sid');
      res.json({ 
        success: true, 
        message: "Logout successful" 
      });
    });
  });

  // User profile management
  app.put('/api/auth/profile', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { username, firstName, lastName, profilePicture } = req.body;

      await storage.updateUserProfile(userId, {
        username,
        firstName,
        lastName,
        profilePicture
      });

      res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ success: false, message: "Failed to update profile" });
    }
  });

  // Favorites management
  app.post('/api/favorites', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { cryptoPairSymbol, cryptoId } = req.body;

      await storage.addFavorite(userId, cryptoPairSymbol, cryptoId);
      res.json({ success: true, message: "Added to favorites" });
    } catch (error) {
      console.error('Add favorite error:', error);
      res.status(500).json({ success: false, message: "Failed to add favorite" });
    }
  });

  app.delete('/api/favorites/:symbol', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { symbol } = req.params;

      await storage.removeFavorite(userId, symbol);
      res.json({ success: true, message: "Removed from favorites" });
    } catch (error) {
      console.error('Remove favorite error:', error);
      res.status(500).json({ success: false, message: "Failed to remove favorite" });
    }
  });

  app.get('/api/favorites', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const favorites = await storage.getUserFavorites(userId);
      res.json({ success: true, data: favorites });
    } catch (error) {
      console.error('Get favorites error:', error);
      res.status(500).json({ success: false, message: "Failed to get favorites" });
    }
  });

  // User preferences management
  app.put('/api/preferences', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const preferences = req.body;

      await storage.updateUserPreferences(userId, preferences);
      res.json({ success: true, message: "Preferences updated" });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({ success: false, message: "Failed to update preferences" });
    }
  });

  app.get('/api/preferences', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const preferences = await storage.getUserPreferences(userId);
      res.json({ success: true, data: preferences });
    } catch (error) {
      console.error('Get preferences error:', error);
      res.status(500).json({ success: false, message: "Failed to get preferences" });
    }
  });

  // User balance endpoints for mobile app
  app.get('/api/balances', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      
      // Import models
      const { UserBalance } = await import('./models/UserBalance');
      const { Currency } = await import('./models/Currency');
      
      // Get user balances with currency details
      const balances = await UserBalance.find({ userId }).populate('currencyId');
      
      const formattedBalances = balances.map(balance => ({
        id: balance._id,
        balance: balance.amount,
        currency: {
          id: balance.currencyId._id,
          symbol: balance.currencyId.symbol,
          name: balance.currencyId.name,
          type: 'crypto',
          isActive: balance.currencyId.isActive
        }
      }));

      res.json({
        success: true,
        balances: formattedBalances
      });
    } catch (error) {
      console.error('Balances fetch error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch balances"
      });
    }
  });

  // Get user wallet summary for mobile home
  app.get('/api/wallet/summary', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      
      // Import models
      const { UserBalance } = await import('./models/UserBalance');
      const { Currency } = await import('./models/Currency');
      
      // Find USD currency first
      const usdCurrency = await Currency.findOne({ symbol: 'USD' });
      
      if (!usdCurrency) {
        return res.json({
          success: true,
          data: {
            totalUSDValue: 0,
            usdBalance: 0
          }
        });
      }
      
      // Get only USD balance for the user
      const usdBalance = await UserBalance.findOne({ 
        userId, 
        currencyId: usdCurrency._id 
      });
      
      // Default to 0 USD if no balance exists
      const totalUSDValue = usdBalance?.amount || 0;
      
      res.json({
        success: true,
        data: {
          totalUSDValue: totalUSDValue,
          usdBalance: totalUSDValue
        }
      });
    } catch (error) {
      console.error('Wallet summary error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch wallet summary"
      });
    }
  });

  // Register chatbot routes
  app.use('/api/chatbot', chatbotRoutes);

  const httpServer = createServer(app);
  return httpServer;
}