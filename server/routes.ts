import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import { sendVerificationEmail, sendWelcomeEmail } from "./email";
import { WebSocketServer, WebSocket } from "ws";
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
        sameSite: 'lax',
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

  // Rate limiting cache for API requests
  let pricesCache: any = null;
  let pricesCacheTime = 0;
  const CACHE_DURATION = 30000; // 30 seconds

  // Cryptocurrency API routes using CoinGecko
  app.get('/api/crypto/prices', async (req: Request, res: Response) => {
    try {
      // Return cached data if available and fresh
      const now = Date.now();
      if (pricesCache && (now - pricesCacheTime) < CACHE_DURATION) {
        return res.json(pricesCache);
      }

      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false');

      if (!response.ok) {
        // If API fails but we have cached data, return it
        if (pricesCache) {
          return res.json(pricesCache);
        }
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();

      // Update cache
      pricesCache = data;
      pricesCacheTime = now;

      res.json(data);
    } catch (error) {
      console.error('Error fetching crypto prices:', error);

      // Return cached data if available
      if (pricesCache) {
        return res.json(pricesCache);
      }

      res.status(500).json({ 
        error: 'Failed to fetch cryptocurrency prices',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/crypto/detail/:coinId', async (req: Request, res: Response) => {
    try {
      const { coinId } = req.params;
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();

      // Transform the data to match our expected format
      const transformedData = {
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        current_price: data.market_data?.current_price?.usd || 0,
        price_change_percentage_24h: data.market_data?.price_change_percentage_24h || 0,
        market_cap: data.market_data?.market_cap?.usd || 0,
        volume_24h: data.market_data?.total_volume?.usd || 0,
        image: data.image?.small || ''
      };

      res.json(transformedData);
    } catch (error) {
      console.error('Error fetching crypto detail:', error);
      res.status(500).json({ 
        error: 'Failed to fetch cryptocurrency details',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Function to fetch news from multiple sources
  const fetchCryptoNews = async (): Promise<any[]> => {
    let newsData = [];

    try {
      // Use CryptoCompare as primary source (working and includes Coinotag articles)
      const cryptoCompareResponse = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&feeds=coinotag,cryptocompare,coindesk');

      if (cryptoCompareResponse.ok) {
        const cryptoCompareData = await cryptoCompareResponse.json();
        if (cryptoCompareData.Data && Array.isArray(cryptoCompareData.Data)) {
          newsData = cryptoCompareData.Data.slice(0, 20).map((article: any) => ({
            title: article.title,
            description: article.body || 'Latest cryptocurrency news and market updates',
            url: article.url || article.guid,
            source: { name: article.source_info?.name || article.source || 'CryptoCompare' },
            publishedAt: new Date(article.published_on * 1000).toISOString(),
            urlToImage: article.imageurl || `https://images.cryptocompare.com/news/default/${article.lang || 'EN'}/64x64.png`
          }));
        }
      }

      console.log('CryptoCompare news fetched, total articles:', newsData.length);
    } catch (newsError) {
      console.log('News fetching error:', newsError);
    }

    return newsData;
  };

  app.get('/api/crypto/news', async (req: Request, res: Response) => {
    try {
      let newsData = await fetchCryptoNews();

      // If no news from APIs, provide current sample structure
      if (newsData.length === 0) {
        const now = new Date();
        newsData = [
          {
            title: "Bitcoin Reaches New Milestone in Cryptocurrency Market",
            description: "Bitcoin continues to show strong performance as institutional adoption increases globally.",
            url: "https://example.com/news/bitcoin-milestone",
            source: { name: "Crypto News" },
            publishedAt: new Date().toISOString(),
            urlToImage: "https://via.placeholder.com/400x200/1a1a1a/orange?text=BTC+News"
          },
          {
            title: "Ethereum Network Upgrade Shows Promising Results",
            description: "The latest Ethereum network improvements demonstrate enhanced scalability and reduced transaction costs.",
            url: "https://example.com/news/ethereum-upgrade",
            source: { name: "Blockchain Today" },
            publishedAt: new Date(now.getTime() - Math.random() * 3600000).toISOString(),
            urlToImage: "https://via.placeholder.com/400x200/1a1a1a/blue?text=ETH+News"
          },
          {
            title: "Solana Network Hits New Transaction Record",
            description: "Solana processes over 65 million transactions in a single day, showcasing network scalability improvements.",
            url: "https://coindesk.com/tech/solana-transaction-record",
            source: { name: "CoinDesk" },
            publishedAt: new Date(now.getTime() - Math.random() * 14400000).toISOString(),
            urlToImage: "https://via.placeholder.com/400x200/9945ff/ffffff?text=Solana+Record"
          },
          {
            title: "Central Bank Digital Currency Trials Expand Globally",
            description: "More than 80 countries now exploring or piloting central bank digital currencies according to new research.",
            url: "https://coindesk.com/policy/cbdc-trials-expand",
            source: { name: "Reuters Crypto" },
            publishedAt: new Date(now.getTime() - Math.random() * 18000000).toISOString(),
            urlToImage: "https://via.placeholder.com/400x200/2563eb/ffffff?text=CBDC+Trials"
          },
          {
            title: "DeFi Protocol Launches Cross-Chain Bridge",
            description: "New protocol enables seamless asset transfers between Ethereum, Polygon, and Arbitrum networks.",
            url: "https://coindesk.com/tech/defi-cross-chain-bridge",
            source: { name: "DeFi Pulse" },
            publishedAt: new Date(now.getTime() - Math.random() * 21600000).toISOString(),
            urlToImage: "https://via.placeholder.com/400x200/8b5cf6/ffffff?text=DeFi+Bridge"
          },
          {
            title: "NFT Marketplace Volume Surges 150% This Quarter",
            description: "OpenSea and Blur lead trading volume recovery as new collections drive renewed collector interest.",
            url: "https://coindesk.com/business/nft-marketplace-surge",
            source: { name: "NFT News" },
            publishedAt: new Date(now.getTime() - Math.random() * 25200000).toISOString(),
            urlToImage: "https://via.placeholder.com/400x200/ec4899/ffffff?text=NFT+Surge"
          }
        ];
      }

      // Sort by publication date (newest first)
      newsData.sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      res.json(newsData);
    } catch (error) {
      console.error('Error fetching news:', error);
      res.status(500).json({ 
        message: 'Failed to fetch news',
        data: [] // Return empty array on error so frontend doesn't break
      });
    }
  });

  app.get('/api/crypto/trending', async (req: Request, res: Response) => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/search/trending');

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      res.json(data.coins || []);
    } catch (error) {
      console.error('Error fetching trending crypto:', error);
      res.status(500).json({ 
        error: 'Failed to fetch trending cryptocurrencies',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

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
  app.get('/api/auth/user', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated"
        });
      }

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
          isVerified: user.isVerified,
          isAdmin: user.isAdmin,
          profilePicture: user.profilePicture
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

  // API route for getting current user (if logged in) - legacy endpoint
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

  // API route for updating user profile
  app.patch('/api/user/update-profile', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const updateSchema = z.object({
        nickname: z.string().min(1).max(20).optional(),
        profilePicture: z.string().optional()
      });

      const result = updateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid update data",
          errors: result.error.format()
        });
      }

      const { nickname, profilePicture } = result.data;

      // Update user profile
      if (nickname) {
        await storage.updateUserProfile(userId, { username: nickname });
      }

      if (profilePicture) {
        await storage.updateUserProfile(userId, { profilePicture });
      }

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Profile update error:', error);
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

  // Security API endpoints

  // Get security settings
  app.get('/api/user/security/settings', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Default security settings
      const securitySettings = {
        twoFactorEnabled: false,
        biometricEnabled: false,
        loginNotifications: true,
        screenLock: true,
        autoLogout: 30,
        trustedDevices: [],
        lastPasswordChange: user.createdAt
      };

      return res.json({
        success: true,
        data: securitySettings
      });
    } catch (error) {
      console.error('Security settings fetch error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch security settings"
      });
    }
  });

  // Update security settings
  app.patch('/api/user/security/update', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const { twoFactorEnabled, biometricEnabled, loginNotifications, screenLock, autoLogout } = req.body;

      // In a real implementation, you would save these to the database
      // For now, we'll simulate the update

      return res.json({
        success: true,
        message: "Security settings updated successfully",
        data: {
          twoFactorEnabled: twoFactorEnabled ?? false,
          biometricEnabled: biometricEnabled ?? false,
          loginNotifications: loginNotifications ?? true,
          screenLock: screenLock ?? true,
          autoLogout: autoLogout ?? 30
        }
      });
    } catch (error) {
      console.error('Security settings update error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to update security settings"
      });
    }
  });

  // Change password
  app.post('/api/user/change-password', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required"
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 8 characters long"
        });
      }

      // Get user from storage
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Check current password (plain text comparison for existing users)
      if (user.password !== currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect"
        });
      }

      // Update password (keeping it as plain text for simplicity in this demo)
      await storage.updateUserProfile(userId, { password: newPassword });

      console.log(`Password changed successfully for user: ${userId}`);

      return res.json({
        success: true,
        message: "Password changed successfully"
      });
    } catch (error) {
      console.error('Password change error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to change password"
      });
    }
  });

  // 2FA Setup endpoints
  app.post('/api/user/security/2fa/enable', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const { token } = req.body;

      if (!token || token.length !== 6) {
        return res.status(400).json({
          success: false,
          message: "Invalid 6-digit verification code required"
        });
      }

      // In a real implementation, you would validate the TOTP token
      // For demo purposes, we'll accept any 6-digit code
      console.log(`2FA enabled for user ${userId} with token: ${token}`);

      return res.json({
        success: true,
        message: "Two-factor authentication enabled successfully",
        data: {
          twoFactorEnabled: true,
          backupCodes: [
            'ABC123DEF456',
            'GHI789JKL012', 
            'MNO345PQR678',
            'STU901VWX234',
            'YZA567BCD890'
          ]
        }
      });
    } catch (error) {
      console.error('2FA enable error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to enable 2FA"
      });
    }
  });

  app.post('/api/user/security/2fa/disable', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required to disable 2FA"
        });
      }

      // Get user and verify password
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      if (user.password !== password) {
        return res.status(400).json({
          success: false,
          message: "Incorrect password"
        });
      }

      console.log(`2FA disabled for user ${userId}`);

      return res.json({
        success: true,
        message: "Two-factor authentication disabled successfully"
      });
    } catch (error) {
      console.error('2FA disable error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to disable 2FA"
      });
    }
  });

  // Biometric toggle endpoint
  app.post('/api/user/security/biometric/toggle', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const { enabled } = req.body;

      console.log(`Biometric ${enabled ? 'enabled' : 'disabled'} for user ${userId}`);

      return res.json({
        success: true,
        message: `Biometric authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
        data: {
          biometricEnabled: enabled
        }
      });
    } catch (error) {
      console.error('Biometric toggle error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to toggle biometric authentication"
      });
    }
  });

  // Get login history
  app.get('/api/user/security/login-history', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;

      // Generate sample login history data for demonstration
      const loginHistory = [
        {
          id: `${userId}-1`,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          ipAddress: req.ip || '192.168.1.1',
          location: 'New York, NY',
          device: 'Chrome Browser',
          successful: true
        },
        {
          id: `${userId}-2`,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          ipAddress: '192.168.1.100',
          location: 'New York, NY',
          device: 'Mobile App',
          successful: true
        },
        {
          id: `${userId}-3`,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          ipAddress: '10.0.0.50',
          location: 'Los Angeles, CA',
          device: 'Safari Browser',
          successful: false
        }
      ];

      return res.json({
        success: true,
        data: loginHistory
      });
    } catch (error) {
      console.error('Login history fetch error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch login history"
      });
    }
  });

  // Get security events
  app.get('/api/events/security', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;

      // Generate sample security events for demonstration
      const securityEvents = [
        {
          id: `${userId}-event-1`,
          type: 'login',
          description: 'Successful login from Chrome Browser',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          ipAddress: req.ip || '192.168.1.1',
          location: 'New York, NY',
          successful: true
        },
        {
          id: `${userId}-event-2`,
          type: 'password_change',
          description: 'Password changed successfully',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          ipAddress: req.ip || '192.168.1.1',
          location: 'New York, NY',
          successful: true
        },
        {
          id: `${userId}-event-3`,
          type: '2fa_enabled',
          description: 'Two-factor authentication enabled',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          ipAddress: req.ip || '192.168.1.1',
          location: 'New York, NY',
          successful: true
        }
      ];

      return res.json({
        success: true,
        data: securityEvents
      });
    } catch (error) {
      console.error('Security events fetch error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch security events"
      });
    }
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

  // Simple balance credit endpoint
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

  // Get available currencies
  app.get('/api/currencies', async (req, res) => {
    try {
      const allCurrencies = await db
        .select()
        .from(currencies)
        .where(eq(currencies.isActive, true));

      return res.json({
        success: true,
        currencies: allCurrencies
      });
    } catch (error) {
      console.error('Currencies fetch error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch currencies"
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

  // Real-time crypto prices from CoinGecko API
  app.get("/api/crypto/realtime-prices", async (req: Request, res: Response) => {
    try {
      const { getCoinGeckoPrices } = await import('./coingecko-api.js');
      const tickers = await getCoinGeckoPrices();
      
      // Transform tickers to include sentiment
      const tickersWithSentiment = tickers.map(ticker => ({
        ...ticker,
        sentiment: ticker.change > 5 ? 'Bullish' : ticker.change < -5 ? 'Bearish' : 'Neutral'
      }));

      res.json({
        success: true,
        data: tickersWithSentiment,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Error fetching real-time crypto prices:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch real-time crypto prices",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws'
  });

  // Store active WebSocket connections
  const activeConnections = new Set<any>();

  // Function to broadcast news updates to all connected clients
  const broadcastNewsUpdate = async () => {
    try {
      const newsData = await fetchCryptoNews();

      if (newsData.length > 0) {
        const formattedNews = newsData.slice(0, 10);

        // Broadcast to all connected clients with error handling
        const deadConnections = new Set();
        activeConnections.forEach(ws => {
          try {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'news_update',
                data: formattedNews,
                timestamp: Date.now()
              }));
            } else {
              deadConnections.add(ws);
            }
          } catch (error) {
            console.error('Error sending to WebSocket client:', error);
            deadConnections.add(ws);
          }
        });

        // Clean up dead connections
        deadConnections.forEach(ws => activeConnections.delete(ws));

        console.log(`Broadcasted ${formattedNews.length} news articles to ${activeConnections.size} clients`);
      }
    } catch (error) {
      console.error('Error broadcasting news update:', error);
    }
  };

  // Live market data endpoints (using CoinGecko as data source)
  
  // Import CoinGecko API functions
  const { getCoinGeckoPrices } = await import('./coingecko-api.js');

  // Get real-time crypto prices using CoinGecko API with API key
  app.get("/api/crypto/realtime-prices", async (req: Request, res: Response) => {
    try {
      const tickers = await getCoinGeckoPrices();

      // Add sentiment analysis based on price change
      const tickersWithSentiment = tickers.map(ticker => ({
        ...ticker,
        sentiment: ticker.change >= 5 ? 'Bullish' : ticker.change <= -5 ? 'Bearish' : 'Neutral'
      }));

      console.log(`Successfully fetched ${tickersWithSentiment.length} crypto prices from CoinGecko`);

      res.json({
        success: true,
        data: tickersWithSentiment,
        timestamp: Date.now(),
        count: tickersWithSentiment.length
      });
    } catch (error) {
      console.error("CoinGecko prices fetch error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch real-time prices",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Set up periodic news updates every 2 minutes
  setInterval(broadcastNewsUpdate, 2 * 60 * 1000);

  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');
    activeConnections.add(ws);

    // Send initial connection message
    try {
      ws.send(JSON.stringify({ 
        type: 'connection', 
        message: 'Connected to real-time crypto news feed',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error sending initial message:', error);
    }

    // Handle messages from clients
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());

        // Handle different message types
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        } else if (data.type === 'subscribe_news') {
          // Send latest news immediately when client subscribes
          broadcastNewsUpdate();
        } else if (data.type === 'subscribe_prices') {
          // Handle price subscription requests
          ws.send(JSON.stringify({ 
            type: 'price_subscription_confirmed',
            timestamp: Date.now()
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        try {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid message format',
            timestamp: Date.now()
          }));
        } catch (sendError) {
          console.error('Error sending error message:', sendError);
        }
      }
    });

    // Handle connection errors
    ws.on('error', (error) => {
      console.error('WebSocket connection error:', error);
      activeConnections.delete(ws);
    });

    // Handle disconnection
    ws.on('close', (code, reason) => {
      console.log(`WebSocket client disconnected: ${code} ${reason}`);
      activeConnections.delete(ws);
    });
  });

  return httpServer;
}