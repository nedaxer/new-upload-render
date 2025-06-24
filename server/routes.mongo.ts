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

  // Crypto news endpoint using RSS feeds
  app.get('/api/crypto/news', async (req: Request, res: Response) => {
    try {
      // Import RSS parser with proper ES module handling
      const { default: Parser } = await import('rss-parser');
      const parser = new Parser({
        timeout: 10000,
        headers: {
          'User-Agent': 'Nedaxer-News-Aggregator/1.0'
        }
      });

      const feeds = {
        'CoinDesk': 'https://www.coindesk.com/arc/outboundfeeds/rss/',
        'CoinTelegraph': 'https://cointelegraph.com/rss',
        'Decrypt': 'https://decrypt.co/feed',
        'Bitcoin Magazine': 'https://bitcoinmagazine.com/.rss/full',
        'CryptoSlate': 'https://cryptoslate.com/feed/',
        'CryptoBriefing': 'https://cryptobriefing.com/feed/',
        'Google News - Crypto': 'https://news.google.com/rss/search?q=crypto'
      };

      const allNews = [];
      const fetchPromises = [];

      for (const [source, url] of Object.entries(feeds)) {
        const fetchPromise = parser.parseURL(url)
          .then((feed: any) => {
            return feed.items.slice(0, 5).map((item: any) => ({
              title: item.title || 'No Title',
              description: item.contentSnippet || item.summary || item.content || 'No description available',
              url: item.link || '#',
              source: { name: source },
              publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
              urlToImage: item.enclosure?.url || item.media?.thumbnail?.url || null
            }));
          })
          .catch((error: any) => {
            console.error(`Error fetching ${source}:`, error.message);
            return []; // Return empty array on error
          });
        
        fetchPromises.push(fetchPromise);
      }

      const results = await Promise.all(fetchPromises);
      
      // Flatten and combine all news articles
      for (const articles of results) {
        allNews.push(...articles);
      }

      // Sort by publication date (newest first)
      allNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      // Return top 30 articles
      res.json(allNews.slice(0, 30));
    } catch (error) {
      console.error('Error fetching crypto news:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch crypto news',
        error: error.message 
      });
    }
  });

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

      // Create only USD balance with $0.00 for new user
      try {
        const { Currency } = await import('./models/Currency');
        const { UserBalance } = await import('./models/UserBalance');
        
        // Get USD currency only
        const usdCurrency = await Currency.findOne({ symbol: 'USD' });
        
        if (usdCurrency) {
          // Create $0.00 USD balance for new user
          const zeroBalance = new UserBalance({
            userId: newUser._id, 
            currencyId: usdCurrency._id, 
            amount: 0
          });
          
          await zeroBalance.save();
          console.log('Created $0.00 USD balance for new user');
        }
      } catch (balanceError) {
        console.warn('Could not create initial balance:', balanceError);
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

      console.log('Profile update request:', { 
        userId, 
        hasProfilePicture: !!profilePicture,
        profilePictureLength: profilePicture?.length 
      });

      // Validate profile picture format if provided
      if (profilePicture && !profilePicture.startsWith('data:image/')) {
        return res.status(400).json({
          success: false,
          message: "Invalid image format. Please use a valid image file."
        });
      }

      // Update user profile in MongoDB
      await storage.updateUserProfile(userId, {
        username,
        firstName,
        lastName,
        profilePicture
      });

      // Get updated user data to return
      const updatedUser = await storage.getUser(userId);

      console.log('Profile updated successfully for user:', userId);

      res.json({ 
        success: true, 
        message: "Profile updated successfully",
        user: {
          _id: updatedUser?._id,
          uid: updatedUser?.uid,
          username: updatedUser?.username,
          email: updatedUser?.email,
          firstName: updatedUser?.firstName,
          lastName: updatedUser?.lastName,
          profilePicture: updatedUser?.profilePicture,
          isVerified: updatedUser?.isVerified
        }
      });
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

  // User balance endpoints for mobile app (USD only)
  app.get('/api/balances', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      
      // Import models
      const { UserBalance } = await import('./models/UserBalance');
      const { Currency } = await import('./models/Currency');
      
      // Get only USD currency
      const usdCurrency = await Currency.findOne({ symbol: 'USD' });
      
      if (!usdCurrency) {
        return res.json({
          success: true,
          balances: []
        });
      }
      
      // Get only USD balance for the user
      const usdBalance = await UserBalance.findOne({ 
        userId, 
        currencyId: usdCurrency._id 
      });
      
      const formattedBalances = usdBalance ? [{
        id: usdBalance._id,
        balance: usdBalance.amount,
        currency: {
          id: usdCurrency._id,
          symbol: usdCurrency.symbol,
          name: usdCurrency.name,
          type: 'fiat',
          isActive: usdCurrency.isActive
        }
      }] : [];

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

  // Reset all user balances to $0.00 and remove crypto balances
  app.post('/api/balances/reset-all', async (req: Request, res: Response) => {
    try {
      const { UserBalance } = await import('./models/UserBalance');
      const { Currency } = await import('./models/Currency');
      
      // Get USD currency
      const usdCurrency = await Currency.findOne({ symbol: 'USD' });
      
      if (usdCurrency) {
        // Remove all non-USD balances
        await UserBalance.deleteMany({ 
          currencyId: { $ne: usdCurrency._id } 
        });
        
        // Reset all USD balances to $0.00
        await UserBalance.updateMany(
          { currencyId: usdCurrency._id }, 
          { $set: { amount: 0, updatedAt: new Date() } }
        );
      }
      
      console.log('Reset all user balances to $0.00 USD only');
      
      res.json({
        success: true,
        message: 'All user balances reset to $0.00 USD only'
      });
    } catch (error) {
      console.error('Error resetting balances:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset balances'
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