import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { mongoStorage as storage } from "./mongoStorage";
import bcrypt from "bcrypt";
import { insertMongoUserSchema, userDataSchema } from "@shared/mongo-schema";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import MongoStore from "connect-mongodb-session";
import { connectToDatabase, getMongoClient } from "./mongodb";
import { getCoinGeckoPrices } from "./coingecko-api";
import { sendEmail, sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from "./email";
import { imageOptimizer } from "./image-optimizer";
import { exchangeRateService } from "./exchange-rate-service";
import { getNewsSourceLogo } from "./logo-service";

import crypto from "crypto";
import chatbotRoutes from "./api/chatbot-routes";
import verificationRoutes from "./api/verification-routes";
import adminKycRoutes from "./api/admin-kyc-routes";
import compression from "compression";
import serveStatic from "serve-static";
import Parser from 'rss-parser';

// Extend express-session types
declare module "express-session" {
  interface SessionData {
    userId: string;
    adminAuthenticated?: boolean;
    adminId?: string;
  }
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  console.log('🔐 Auth check:', { 
    hasSession: !!req.session, 
    userId: req.session?.userId,
    sessionId: req.sessionID 
  });
  
  if (!req.session?.userId) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  
  // Skip user verification for admin users or proceed with normal verification
  if (req.session.userId === 'ADMIN001' || req.session.adminAuthenticated) {
    return next();
  }
  
  // For regular users, verify they exist in database
  try {
    let userId = req.session.userId;
    // Convert to string if it's an ObjectId
    if (typeof userId === 'object' && userId.toString) {
      userId = userId.toString();
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      console.log(`User not found for session userId: ${userId}`);
      return res.status(401).json({ success: false, message: "User not found" });
    }
    
    // Store the resolved userId back in session if needed
    if (req.session.userId !== userId) {
      req.session.userId = userId;
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(500).json({ success: false, message: "Authentication error" });
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

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  const user = await storage.getUser(req.session.userId);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ success: false, message: "Admin access required" });
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
    resave: false, // Don't save session if not modified
    saveUninitialized: false, // Don't create sessions until something stored
    store: store,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: false, // Allow browser access for debugging
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax', // Allow cross-site requests
      path: '/' // Ensure cookie is available for all paths
    },
    name: 'connect.sid', // Explicit session name
    rolling: false // Don't reset expiration on every request
  }));

  // Enable compression middleware for better performance
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return req.method === 'GET' && res.getHeader('content-type')?.includes('text');
    }
  }));

  // Serve optimized static assets with proper caching headers
  app.use('/optimized', serveStatic('public/optimized', {
    maxAge: '1y',
    setHeaders: (res, path) => {
      // Set aggressive caching for optimized images
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Vary', 'Accept-Encoding');
      
      // Add WebP/AVIF support headers
      if (path.includes('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      } else if (path.includes('.avif')) {
        res.setHeader('Content-Type', 'image/avif');
      }
    }
  }));

  // Serve regular static assets with moderate caching
  app.use('/images', serveStatic('public/images', {
    maxAge: '7d',
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=604800');
      res.setHeader('Vary', 'Accept-Encoding');
    }
  }));

  // Connect to MongoDB Atlas
  await connectToDatabase();

  // Initialize image optimizer asynchronously to prevent startup blocking
  setImmediate(async () => {
    try {
      console.log('Starting background image optimization...');
      await imageOptimizer.optimizeAllImages();
      console.log('Background image optimization completed');
    } catch (error) {
      console.error('Background image optimization failed:', error);
    }
  });

  // Image optimization API endpoint
  app.get('/api/images/optimize', async (req: Request, res: Response) => {
    try {
      const { src } = req.query;
      
      if (!src || typeof src !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: 'Image source parameter is required' 
        });
      }

      // Clean the src path (remove leading slash)
      const cleanSrc = src.startsWith('/') ? src.slice(1) : src;
      
      const optimizedImage = await imageOptimizer.optimizeImage(cleanSrc);
      
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      res.json({
        success: true,
        ...optimizedImage
      });
    } catch (error) {
      console.error('Image optimization API error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to optimize image' 
      });
    }
  });

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

  // Currency conversion rates endpoint with multi-source real-time data
  app.get('/api/market-data/conversion-rates', async (req: Request, res: Response) => {
    try {
      const { exchangeRateService } = await import('./exchange-rate-service');
      const ratesData = await exchangeRateService.getRates();

      res.json({
        success: true,
        data: ratesData.rates,
        source: ratesData.source,
        lastUpdated: ratesData.lastUpdated,
        isRealTime: ratesData.success
      });
    } catch (error) {
      console.error('Error fetching conversion rates:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch conversion rates' 
      });
    }
  });

  // Force refresh exchange rates endpoint
  app.post('/api/market-data/conversion-rates/refresh', async (req: Request, res: Response) => {
    try {
      const { exchangeRateService } = await import('./exchange-rate-service');
      const ratesData = await exchangeRateService.forceRefresh();

      res.json({
        success: true,
        data: ratesData.rates,
        source: ratesData.source,
        lastUpdated: ratesData.lastUpdated,
        isRealTime: ratesData.success,
        message: 'Exchange rates refreshed successfully'
      });
    } catch (error) {
      console.error('Error refreshing conversion rates:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to refresh conversion rates' 
      });
    }
  });

  // User search endpoint for transfers
  app.post('/api/users/search', requireAuth, async (req: Request, res: Response) => {
    try {
      const { identifier } = req.body;
      
      if (!identifier || typeof identifier !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email or UID'
        });
      }
      
      const trimmedIdentifier = identifier.trim();
      
      // Import User model
      const { User } = await import('./models/User');
      
      // Search by email or UID
      const user = await User.findOne({
        $or: [
          { email: trimmedIdentifier },
          { uid: trimmedIdentifier }
        ]
      }).select('_id uid email username firstName lastName profilePicture');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      console.log('🔍 User search result:', {
        userId: user._id,
        hasProfilePicture: !!user.profilePicture,
        profilePictureLength: user.profilePicture ? user.profilePicture.length : 0
      });
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('User search error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search user'
      });
    }
  });

  // Change password endpoint
  app.post('/api/user/change-password', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }
      
      // Import User model and bcrypt
      const { User } = await import('./models/User');
      const bcrypt = await import('bcrypt');
      
      // Get user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update both hashed password and actual password for admin viewing
      await User.findByIdAndUpdate(userId, {
        password: hashedNewPassword,
        actualPassword: newPassword
      });
      
      console.log(`🔐 Password changed successfully for user ${userId}`);
      
      // Broadcast password change event via WebSocket for admin dashboard real-time updates
      const { getWebSocketServer } = await import('./websocket');
      const wss = getWebSocketServer();
      
      if (wss) {
        wss.clients.forEach((client: any) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'PASSWORD_CHANGED',
              userId: userId,
              timestamp: new Date().toISOString()
            }));
          }
        });
      }
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  });
  
  // Transfer funds endpoint
  app.post('/api/wallet/transfer', requireAuth, async (req: Request, res: Response) => {
    const senderId = req.session.userId!;
    console.log(`🚀 Transfer request initiated by sender: ${senderId}`);
    
    try {
      const { recipientId, amount } = req.body;
      console.log(`📋 Transfer details - Recipient: ${recipientId}, Amount: ${amount}`);
      
      // Validate input
      if (!recipientId || typeof recipientId !== 'string') {
        console.log('❌ Invalid recipient provided');
        return res.status(400).json({
          success: false,
          message: 'Invalid recipient'
        });
      }
      
      const transferAmount = parseFloat(amount);
      if (isNaN(transferAmount) || transferAmount <= 0) {
        console.log('❌ Invalid transfer amount provided');
        return res.status(400).json({
          success: false,
          message: 'Invalid transfer amount'
        });
      }
      
      // Prevent self-transfer
      if (senderId === recipientId) {
        console.log('❌ User attempting to transfer to themselves');
        return res.status(400).json({
          success: false,
          message: 'Cannot transfer to yourself'
        });
      }
      
      // Import models
      const { UserBalance } = await import('./models/UserBalance');
      const { Currency } = await import('./models/Currency');
      const { Transfer } = await import('./models/Transfer');
      const { User } = await import('./models/User');
      
      // Start MongoDB transaction
      const mongoose = await import('mongoose');
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        // Find USD currency
        const usdCurrency = await Currency.findOne({ symbol: 'USD' });
        if (!usdCurrency) {
          throw new Error('USD currency not found');
        }
        
        // Get sender's balance
        const senderBalance = await UserBalance.findOne({
          userId: senderId,
          currencyId: usdCurrency._id
        }).session(session);
        
        console.log(`💰 Sender balance found: ${senderBalance ? senderBalance.amount : 'NULL'}`);
        console.log(`💰 Transfer amount: ${transferAmount}`);
        
        if (!senderBalance) {
          throw new Error('Sender balance not found');
        }
        
        if (senderBalance.amount < transferAmount) {
          throw new Error(`Insufficient balance. Current: $${senderBalance.amount}, Required: $${transferAmount}`);
        }
        
        // Get or create recipient's balance
        let recipientBalance = await UserBalance.findOne({
          userId: recipientId,
          currencyId: usdCurrency._id
        }).session(session);
        
        if (!recipientBalance) {
          recipientBalance = new UserBalance({
            userId: recipientId,
            currencyId: usdCurrency._id,
            amount: 0
          });
        }
        
        // Update balances
        console.log(`💰 Before transfer - Sender balance: $${senderBalance.amount}, Recipient balance: $${recipientBalance.amount}`);
        senderBalance.amount -= transferAmount;
        recipientBalance.amount += transferAmount;
        console.log(`💰 After transfer calculation - Sender balance: $${senderBalance.amount}, Recipient balance: $${recipientBalance.amount}`);
        
        console.log('💾 Saving sender balance...');
        await senderBalance.save({ session });
        console.log('✅ Sender balance saved');
        
        console.log('💾 Saving recipient balance...');
        await recipientBalance.save({ session });
        console.log('✅ Recipient balance saved');
        
        // Create transfer record
        const transactionId = `TRF${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
        
        const transfer = new Transfer({
          fromUserId: senderId,
          toUserId: recipientId,
          amount: transferAmount,
          currency: 'USD',
          status: 'completed',
          transactionId,
          description: 'USD Transfer'
        });
        
        await transfer.save({ session });
        
        // Get sender and recipient info for notifications
        const sender = await User.findById(senderId).select('firstName lastName');
        const recipient = await User.findById(recipientId).select('firstName lastName');
        
        // Create notifications for both users
        const { Notification } = await import('./models/Notification');
        
        // Notification for sender (transfer sent)
        const senderNotification = new Notification({
          userId: senderId,
          type: 'transfer_sent',
          title: 'Transfer Sent',
          message: `You sent $${transferAmount.toFixed(2)} to ${recipient?.firstName} ${recipient?.lastName}`,
          data: {
            transferId: transfer._id,
            transactionId,
            amount: transferAmount,
            currency: 'USD',
            recipientName: `${recipient?.firstName} ${recipient?.lastName}`,
            recipientId: recipientId,
            status: 'completed'
          }
        });
        
        // Notification for recipient (transfer received)
        const recipientNotification = new Notification({
          userId: recipientId,
          type: 'transfer_received',
          title: 'Transfer Received',
          message: `You received $${transferAmount.toFixed(2)} from ${sender?.firstName} ${sender?.lastName}`,
          data: {
            transferId: transfer._id,
            transactionId,
            amount: transferAmount,
            currency: 'USD',
            senderName: `${sender?.firstName} ${sender?.lastName}`,
            senderId: senderId,
            status: 'completed'
          }
        });
        
        console.log('💾 Saving sender notification:', senderNotification);
        await senderNotification.save({ session });
        console.log('✅ Sender notification saved');
        
        console.log('💾 Saving recipient notification:', recipientNotification);
        await recipientNotification.save({ session });
        console.log('✅ Recipient notification saved');
        
        // Commit transaction
        console.log('🔄 Committing transaction...');
        await session.commitTransaction();
        console.log('✅ Transaction committed successfully');
        
        // Broadcast via WebSocket
        const { getWebSocketServer } = await import('./websocket');
        const wss = getWebSocketServer();
        
        if (wss) {
          wss.clients.forEach((client: any) => {
            if (client.readyState === 1) {
              // Send TRANSFER_CREATED event for automatic client updates
              client.send(JSON.stringify({
                type: 'TRANSFER_CREATED',
                senderId: senderId,
                recipientId: recipientId,
                amount: transferAmount,
                transactionId,
                senderName: `${sender?.firstName} ${sender?.lastName}`,
                recipientName: `${recipient?.firstName} ${recipient?.lastName}`
              }));
              
              // Balance updates for both users
              client.send(JSON.stringify({
                type: 'balance_update',
                userId: senderId
              }));
              client.send(JSON.stringify({
                type: 'balance_update',
                userId: recipientId
              }));
              
              // Notification updates for both users
              client.send(JSON.stringify({
                type: 'notification_update',
                userId: senderId
              }));
              client.send(JSON.stringify({
                type: 'notification_update',
                userId: recipientId
              }));
            }
          });
        }
        
        res.json({
          success: true,
          message: 'Transfer completed successfully',
          transactionId
        });
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      console.error('Transfer error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to complete transfer'
      });
    }
  });

  // Get transfer history for a user
  app.get('/api/transfers/history', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      console.log(`📋 Getting transfer history for user: ${userId}`);
      
      // Handle admin users differently - they see all transfers
      if (userId === 'ADMIN001' || req.session.adminAuthenticated) {
        console.log('✅ Admin user - returning all transfers');
        
        const { Transfer } = await import('./models/Transfer');
        
        const allTransfers = await Transfer.find({})
          .sort({ createdAt: -1 })
          .limit(100)
          .populate('fromUserId', 'firstName lastName email uid')
          .populate('toUserId', 'firstName lastName email uid');
        
        const formattedTransfers = allTransfers
          .filter(transfer => transfer.fromUserId && transfer.toUserId)
          .map(transfer => ({
            _id: transfer._id,
            transactionId: transfer.transactionId,
            type: 'admin_view',
            amount: transfer.amount,
            currency: transfer.currency,
            status: transfer.status,
            fromUser: {
              _id: transfer.fromUserId._id,
              name: `${transfer.fromUserId.firstName || ''} ${transfer.fromUserId.lastName || ''}`.trim() || transfer.fromUserId.email,
              email: transfer.fromUserId.email,
              uid: transfer.fromUserId.uid
            },
            toUser: {
              _id: transfer.toUserId._id,
              name: `${transfer.toUserId.firstName || ''} ${transfer.toUserId.lastName || ''}`.trim() || transfer.toUserId.email,
              email: transfer.toUserId.email,
              uid: transfer.toUserId.uid
            },
            createdAt: transfer.createdAt
          }));
        
        return res.json({
          success: true,
          data: formattedTransfers
        });
      }
      
      // Import models
      const { Transfer } = await import('./models/Transfer');
      const { User } = await import('./models/User');
      
      // Get transfers where user is sender or recipient
      const transfers = await Transfer.find({
        $or: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('fromUserId', 'firstName lastName email uid')
      .populate('toUserId', 'firstName lastName email uid');
      
      console.log(`✅ Found ${transfers.length} transfers for user ${userId}`);
      
      // Format transfers for frontend
      const formattedTransfers = transfers
        .filter(transfer => transfer.fromUserId && transfer.toUserId) // Only include transfers with valid users
        .map(transfer => {
          const isSender = transfer.fromUserId._id.toString() === userId;
          return {
            _id: transfer._id,
            transactionId: transfer.transactionId,
            type: isSender ? 'sent' : 'received',
            amount: transfer.amount,
            currency: transfer.currency,
            status: transfer.status,
            fromUser: {
              _id: transfer.fromUserId._id,
              name: `${transfer.fromUserId.firstName || ''} ${transfer.fromUserId.lastName || ''}`.trim() || transfer.fromUserId.email,
              email: transfer.fromUserId.email,
              uid: transfer.fromUserId.uid
            },
            toUser: {
              _id: transfer.toUserId._id,
              name: `${transfer.toUserId.firstName || ''} ${transfer.toUserId.lastName || ''}`.trim() || transfer.toUserId.email,
              email: transfer.toUserId.email,
              uid: transfer.toUserId.uid
            },
            createdAt: transfer.createdAt
          };
        });
      
      console.log(`📤 Returning ${formattedTransfers.length} formatted transfers`);
      
      res.json({
        success: true,
        data: formattedTransfers
      });
    } catch (error) {
      console.error('Transfer history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transfer history'
      });
    }
  });

  // Get transfer details by transaction ID
  app.get('/api/transfers/details/:transactionId', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { transactionId } = req.params;
      
      // Import models
      const { Transfer } = await import('./models/Transfer');
      const { User } = await import('./models/User');
      
      // Find transfer by transaction ID where user is involved
      const transfer = await Transfer.findOne({
        transactionId,
        $or: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      })
      .populate('fromUserId', 'firstName lastName email uid')
      .populate('toUserId', 'firstName lastName email uid');
      
      if (!transfer) {
        return res.status(404).json({
          success: false,
          message: 'Transfer not found'
        });
      }
      
      // Determine if current user is sender or recipient
      const isSender = transfer.fromUserId._id.toString() === userId;
      
      // Format transfer for frontend
      const formattedTransfer = {
        _id: transfer._id,
        transactionId: transfer.transactionId,
        type: isSender ? 'sent' : 'received',
        amount: transfer.amount,
        currency: transfer.currency,
        status: transfer.status,
        description: transfer.description,
        fromUserId: transfer.fromUserId._id,
        toUserId: transfer.toUserId._id,
        senderName: `${transfer.fromUserId.firstName} ${transfer.fromUserId.lastName}`,
        recipientName: `${transfer.toUserId.firstName} ${transfer.toUserId.lastName}`,
        senderEmail: transfer.fromUserId.email,
        recipientEmail: transfer.toUserId.email,
        senderUID: transfer.fromUserId.uid,
        recipientUID: transfer.toUserId.uid,
        createdAt: transfer.createdAt,
        updatedAt: transfer.updatedAt
      };
      
      res.json({
        success: true,
        data: formattedTransfer
      });
    } catch (error) {
      console.error('Transfer details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transfer details'
      });
    }
  });

  // Add realtime prices endpoint with caching
  const { getRealtimePrices } = await import('./api/realtime-prices');
  app.get('/api/crypto/realtime-prices', getRealtimePrices);

  // News source logo endpoint
  app.get('/api/news/logo/:source', async (req: Request, res: Response) => {
    try {
      const { generateLogoSVG } = await import('./logo-service');
      const sourceName = decodeURIComponent(req.params.source);
      const logoSVG = generateLogoSVG(sourceName);
      
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      res.send(logoSVG);
    } catch (error) {
      console.error('Error generating logo:', error);
      res.status(500).send('Error generating logo');
    }
  });

  // Crypto news endpoint using RSS feeds
  app.get('/api/crypto/news', async (req: Request, res: Response) => {
    try {
      // Import RSS parser with proper ES module handling
      const { default: Parser } = await import('rss-parser');
      const parser = new Parser({
        timeout: 20000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        },
        customFields: {
          item: [
            ['media:content', 'mediaContent'],
            ['media:thumbnail', 'mediaThumbnail'],
            ['content:encoded', 'contentEncoded'],
            ['media:group', 'mediaGroup'],
            ['enclosure', 'enclosure']
          ]
        }
      });

      const feeds = {
        'CoinDesk': 'https://www.coindesk.com/arc/outboundfeeds/rss/',
        'CoinTelegraph': 'https://cointelegraph.com/rss',
        'Decrypt': 'https://decrypt.co/feed',
        'CryptoSlate': 'https://cryptoslate.com/feed/',
        'CryptoBriefing': 'https://cryptobriefing.com/feed/',
        'BeInCrypto': 'https://beincrypto.com/feed/',
        'CryptoNews': 'https://cryptonews.com/news/feed/',
        'Google News - Crypto': 'https://news.google.com/rss/search?q=cryptocurrency&hl=en-US&gl=US&ceid=US:en',
        'Google News - Bitcoin': 'https://news.google.com/rss/search?q=bitcoin&hl=en-US&gl=US&ceid=US:en'
      };

      const allNews = [];
      const fetchPromises = [];

      // Helper function to fetch RSS with proxy for region-restricted sources
      const fetchRSSWithProxy = async (source: string, url: string) => {
        if (source === 'BeInCrypto') {
          try {
            // Use a different approach for BeInCrypto
            const response = await fetch(url, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://beincrypto.com',
                'Origin': 'https://beincrypto.com'
              }
            });
            
            if (!response.ok) {
              console.log(`BeInCrypto RSS not accessible (${response.status}), using alternative source`);
              return null;
            }
            
            const xmlText = await response.text();
            return parser.parseString(xmlText);
          } catch (error) {
            console.log(`BeInCrypto RSS fetch failed:`, error.message);
            return null;
          }
        } else {
          return parser.parseURL(url);
        }
      };

      for (const [source, url] of Object.entries(feeds)) {
        const fetchPromise = fetchRSSWithProxy(source, url)
          .then((feed: any) => {
            if (!feed) return [];
            
            return feed.items.slice(0, 5).map((item: any) => {
              // Enhanced image extraction with source-specific handling
              let imageUrl = null;
              
              // Enhanced media detection (image or video)
              let mediaType = 'image';
              let videoUrl = null;

              // Source-specific image extraction
              if (source === 'Google News - Crypto' || source === 'Google News - Bitcoin') {
                // Google News specific handling - extract from diverse sources
                if (item.mediaContent) {
                  if (Array.isArray(item.mediaContent)) {
                    // Look for video first, then image
                    const videoContent = item.mediaContent.find((content: any) => 
                      content['$']?.medium === 'video' || content['$']?.type?.includes('video')
                    );
                    if (videoContent?.['$']?.url) {
                      videoUrl = videoContent['$'].url;
                      mediaType = 'video';
                    }
                    
                    const imageContent = item.mediaContent.find((content: any) => 
                      content['$']?.medium === 'image' || content['$']?.type?.includes('image')
                    );
                    if (imageContent?.['$']?.url) {
                      imageUrl = imageContent['$'].url;
                    }
                  } else if (item.mediaContent['$']?.url) {
                    if (item.mediaContent['$']?.medium === 'video' || item.mediaContent['$']?.type?.includes('video')) {
                      videoUrl = item.mediaContent['$'].url;
                      mediaType = 'video';
                    } else {
                      imageUrl = item.mediaContent['$'].url;
                    }
                  }
                }
                
                // Fallback to thumbnail
                if (!imageUrl && item.mediaThumbnail?.['$']?.url) {
                  imageUrl = item.mediaThumbnail['$'].url;
                }
                
                // Try content scraping for Google News articles from external sources
                if (!imageUrl && item.content) {
                  const contentImgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
                  if (contentImgMatch) {
                    imageUrl = contentImgMatch[1];
                  }
                }
                
                // Extract from description for Google News
                if (!imageUrl && item.description) {
                  const descImgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
                  if (descImgMatch) {
                    imageUrl = descImgMatch[1];
                  }
                }
                
                // Try to extract image URL from the article link for major news sources
                if (!imageUrl && item.link) {
                  const articleUrl = item.link;
                  if (articleUrl.includes('reuters.com') || 
                      articleUrl.includes('bloomberg.com') || 
                      articleUrl.includes('cnbc.com') ||
                      articleUrl.includes('cnn.com') ||
                      articleUrl.includes('bbc.com')) {
                    // For major news sources, try to construct a likely image URL
                    const urlParts = articleUrl.split('/');
                    const domain = urlParts[2];
                    imageUrl = `https://${domain}/favicon.ico`; // Fallback to favicon
                  }
                }
              } else if (source === 'CryptoSlate') {
                // CryptoSlate specific handling
                if (item.enclosure?.url) {
                  imageUrl = item.enclosure.url;
                } else if (item.mediaContent?.['$']?.url) {
                  imageUrl = item.mediaContent['$'].url;
                } else if (item['media:content']?.['$']?.url) {
                  imageUrl = item['media:content']['$'].url;
                } else if (item.contentEncoded) {
                  const imgMatch = item.contentEncoded.match(/<img[^>]+src="([^">]+)"/);
                  if (imgMatch) {
                    imageUrl = imgMatch[1];
                  }
                } else if (item['content:encoded']) {
                  const imgMatch = item['content:encoded'].match(/<img[^>]+src="([^">]+)"/);
                  if (imgMatch) {
                    imageUrl = imgMatch[1];
                  }
                }
              } else if (source === 'BeInCrypto') {
                // BeInCrypto specific handling with video support
                if (item.mediaContent) {
                  if (Array.isArray(item.mediaContent)) {
                    const videoContent = item.mediaContent.find((content: any) => 
                      content['$']?.medium === 'video' || content['$']?.type?.includes('video')
                    );
                    if (videoContent?.['$']?.url) {
                      videoUrl = videoContent['$'].url;
                      mediaType = 'video';
                    }
                  }
                }
                
                if (item.mediaThumbnail?.['$']?.url) {
                  imageUrl = item.mediaThumbnail['$'].url;
                } else if (item['media:thumbnail']?.['$']?.url) {
                  imageUrl = item['media:thumbnail']['$'].url;
                } else if (item.enclosure?.url) {
                  imageUrl = item.enclosure.url;
                } else if (item.contentEncoded) {
                  const imgMatch = item.contentEncoded.match(/<img[^>]+src="([^">]+)"/);
                  if (imgMatch) {
                    imageUrl = imgMatch[1];
                  }
                } else if (item['content:encoded']) {
                  const imgMatch = item['content:encoded'].match(/<img[^>]+src="([^">]+)"/);
                  if (imgMatch) {
                    imageUrl = imgMatch[1];
                  }
                }
                
                // Additional BeInCrypto image extraction from description
                if (!imageUrl && item.description) {
                  const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
                  if (imgMatch) {
                    imageUrl = imgMatch[1];
                  }
                }
              } else if (source === 'CoinDesk') {
                // CoinDesk specific handling
                if (item.enclosure?.url && item.enclosure.type?.includes('image')) {
                  imageUrl = item.enclosure.url;
                } else if (item.mediaContent?.['$']?.url) {
                  imageUrl = item.mediaContent['$'].url;
                } else if (item['media:content']?.['$']?.url) {
                  imageUrl = item['media:content']['$'].url;
                } else if (item.contentEncoded) {
                  const imgMatch = item.contentEncoded.match(/<img[^>]+src="([^">]+)"/);
                  if (imgMatch) {
                    imageUrl = imgMatch[1];
                  }
                } else if (item['content:encoded']) {
                  const imgMatch = item['content:encoded'].match(/<img[^>]+src="([^">]+)"/);
                  if (imgMatch) {
                    imageUrl = imgMatch[1];
                  }
                }
              } else if (source === 'CryptoBriefing') {
                // CryptoBriefing specific handling
                if (item.mediaThumbnail?.['$']?.url) {
                  imageUrl = item.mediaThumbnail['$'].url;
                } else if (item['media:thumbnail']?.['$']?.url) {
                  imageUrl = item['media:thumbnail']['$'].url;
                } else if (item.enclosure?.url) {
                  imageUrl = item.enclosure.url;
                } else if (item.contentEncoded) {
                  const imgMatch = item.contentEncoded.match(/<img[^>]+src="([^">]+)"/);
                  if (imgMatch) {
                    imageUrl = imgMatch[1];
                  }
                } else if (item['content:encoded']) {
                  const imgMatch = item['content:encoded'].match(/<img[^>]+src="([^">]+)"/);
                  if (imgMatch) {
                    imageUrl = imgMatch[1];
                  }
                }
              } else {
                // Generic image extraction for other sources
                if (item.enclosure?.url && (item.enclosure.type?.includes('image') || item.enclosure.url.match(/\.(jpg|jpeg|png|gif|webp)$/i))) {
                  imageUrl = item.enclosure.url;
                } else if (item['media:thumbnail']?.['$']?.url) {
                  imageUrl = item['media:thumbnail']['$'].url;
                } else if (item['media:content']?.['$']?.url && item['media:content']['$'].medium === 'image') {
                  imageUrl = item['media:content']['$'].url;
                } else if (item.image?.url) {
                  imageUrl = item.image.url;
                } else if (item.content && typeof item.content === 'string') {
                  const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
                  if (imgMatch) {
                    imageUrl = imgMatch[1];
                  }
                } else if (item['content:encoded']) {
                  const imgMatch = item['content:encoded'].match(/<img[^>]+src="([^">]+)"/);
                  if (imgMatch) {
                    imageUrl = imgMatch[1];
                  }
                }
              }
              
              // Additional fallback image extraction from description
              if (!imageUrl && item.description) {
                const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) {
                  imageUrl = imgMatch[1];
                }
              }
              
              // Enhanced fallback - use actual uploaded brand logos if no image found
              if (!imageUrl) {
                const logoMap: { [key: string]: string } = {
                  'CoinDesk': '/logos/coindesk.png',
                  'CryptoSlate': '/logos/cryptoslate.jpg',
                  'CryptoBriefing': '/logos/cryptobriefing.png',
                  'BeInCrypto': '/logos/beincrypto.jpg',
                  'Google News - Crypto': '/logos/google-news.jpg',
                  'Google News - Bitcoin': '/logos/google-news.jpg',
                  'CoinTelegraph': 'https://cointelegraph.com/favicon.ico',
                  'Decrypt': 'https://decrypt.co/favicon.ico',
                  'CryptoNews': 'https://cryptonews.com/favicon.ico'
                };
                imageUrl = logoMap[source] || `/api/news/logo/${encodeURIComponent(source)}`;
              }
              
              // Clean up relative URLs
              if (imageUrl && imageUrl.startsWith('//')) {
                imageUrl = 'https:' + imageUrl;
              } else if (imageUrl && imageUrl.startsWith('/')) {
                // Handle relative URLs based on source domain
                const domainMap = {
                  'CoinDesk': 'https://www.coindesk.com',
                  'CoinTelegraph': 'https://cointelegraph.com',
                  'Decrypt': 'https://decrypt.co',
                  'CryptoSlate': 'https://cryptoslate.com',
                  'CryptoBriefing': 'https://cryptobriefing.com',
                  'BeInCrypto': 'https://beincrypto.com',
                  'CryptoNews': 'https://cryptonews.com'
                };
                const domain = domainMap[source];
                if (domain) {
                  imageUrl = domain + imageUrl;
                }
              }
              
              return {
                title: item.title || 'No Title',
                description: item.contentSnippet || item.summary || item.content?.replace(/<[^>]*>/g, '') || 'No description available',
                url: item.link || '#',
                source: { name: source },
                publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
                urlToImage: imageUrl,
                mediaType: mediaType,
                videoUrl: videoUrl
              };
            });
          })
          .catch((error: any) => {
            console.error(`Error fetching ${source}:`, error.message);
            if (source === 'BeInCrypto') {
              console.log('BeInCrypto may be region-blocked, skipping...');
            }
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

  // Auth endpoint to get current user data with profile picture persistence
  app.get('/api/auth/user', async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      console.log('🔍 Auth request - Session userId:', req.session.userId);

      // Standard user lookup from MongoDB
      const { mongoStorage } = await import('./mongoStorage');
      const user = await mongoStorage.getUser(req.session.userId);
      
      if (!user) {
        console.log('❌ User not found for session ID:', req.session.userId);
        
        // Clear invalid session
        req.session.destroy((err) => {
          if (err) console.error('Session destroy error:', err);
        });
        
        return res.status(401).json({ 
          success: false, 
          message: "Invalid session - user not found" 
        });
      }

      // Ensure profile picture is properly included
      const userData = {
        _id: user._id,
        uid: user.uid,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture || null, // Explicit null for consistency
        favorites: user.favorites || [],
        preferences: user.preferences,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      };

      console.log('✅ Auth user response:', { 
        userId: user._id, 
        uid: user.uid,
        username: user.username,
        hasProfilePicture: !!user.profilePicture,
        profilePictureLength: user.profilePicture?.length 
      });

      console.log('📤 Sending user data with UID:', userData.uid);

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
          isVerified: true,
          profilePicture: null,
          isAdmin: false
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

  // Login endpoint with hardcoded admin bypass
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "Please enter both your email address and password to continue." 
        });
      }

      // HARDCODED ADMIN LOGIN - bypasses MongoDB completely
      const adminEmail = 'nedaxer.us@gmail.com';
      const adminPassword = 'SMART456';
      
      console.log('Checking admin login:', { 
        inputEmail: username.toLowerCase(), 
        adminEmail, 
        emailMatch: username.toLowerCase() === adminEmail,
        passwordMatch: password === adminPassword 
      });
      
      if (username.toLowerCase() === adminEmail && password === adminPassword) {
        console.log('✓ Admin hardcoded login successful - bypassing all MongoDB checks');
        
        // Set admin session
        req.session.userId = 'ADMIN001';
        req.session.adminAuthenticated = true;
        
        // Force session save
        req.session.save((err) => {
          if (err) console.error('Session save error:', err);
        });
        
        const adminUser = {
          _id: 'ADMIN001',
          uid: 'ADMIN001', 
          username: adminEmail,
          email: adminEmail,
          firstName: 'System',
          lastName: 'Administrator',
          isVerified: true,
          isAdmin: true
        };

        return res.json({ 
          success: true, 
          message: "Admin login successful",
          user: adminUser
        });
      }

      // Regular user login through mongoStorage
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }

      if (!user) {
        console.log('❌ User not found for login attempt:', username);
        return res.status(401).json({ 
          success: false, 
          message: "The email address you entered is not associated with any account. Please check your email or register for a new account." 
        });
      }

      // Verify password for regular users
      console.log('Password verification for user:', user.email);
      
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        console.log('❌ Password invalid for user:', user.email);
        return res.status(401).json({ 
          success: false, 
          message: "The password you entered is incorrect. Please check your password and try again." 
        });
      }
      
      console.log('✅ Password valid for user:', user.email);

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
        message: "We're experiencing technical difficulties. Please try again in a few moments, or contact support if the problem persists." 
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

      console.log('Profile updated successfully for user:', userId, {
        hasProfilePicture: !!updatedUser?.profilePicture,
        profilePictureLength: updatedUser?.profilePicture?.length
      });

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
      
      // Standard balance lookup
      
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
      
      // Get only USD balance for the user, create if doesn't exist
      let usdBalance = await UserBalance.findOne({ 
        userId, 
        currencyId: usdCurrency._id 
      });
      
      // Create default USD balance for new users
      if (!usdBalance) {
        usdBalance = await UserBalance.create({
          userId,
          currencyId: usdCurrency._id,
          amount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      const formattedBalances = [{
        id: usdBalance._id,
        balance: usdBalance.amount,
        currency: {
          id: usdCurrency._id,
          symbol: usdCurrency.symbol,
          name: usdCurrency.name,
          type: 'fiat',
          isActive: usdCurrency.isActive
        }
      }];

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
      
      // Standard wallet summary
      
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
      
      // Get only USD balance for the user, create if doesn't exist
      let usdBalance = await UserBalance.findOne({ 
        userId, 
        currencyId: usdCurrency._id 
      });
      
      // Create default USD balance for new users
      if (!usdBalance) {
        usdBalance = await UserBalance.create({
          userId,
          currencyId: usdCurrency._id,
          amount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      const totalUSDValue = usdBalance.amount;
      
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

  // Admin routes
  app.get('/api/admin/users/search', requireAdmin, async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ success: false, message: "Search query required" });
      }

      const users = await storage.searchUsers(query);
      
      // Format users for response with balance
      const formattedUsers = users.map(user => ({
        _id: user._id,
        uid: user.uid,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        balance: user.balance || 0,
        createdAt: user.createdAt
      }));

      res.json({ success: true, users: formattedUsers });
    } catch (error) {
      console.error('Admin user search error:', error);
      res.status(500).json({ success: false, message: "Failed to search users" });
    }
  });

  // New Admin Portal Authentication
  app.post('/api/admin/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      console.log('Admin login attempt for:', email);
      
      if (email === 'admin@nedaxer.com' && password === 'SMART456') {
        req.session.adminAuthenticated = true;
        req.session.adminId = 'admin';
        console.log('Setting admin session, ID:', req.sessionID);
        
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ success: false, message: "Session save failed" });
          }
          console.log('Admin session saved successfully');
          res.json({ success: true, message: "Admin authentication successful" });
        });
      } else {
        console.log('Invalid admin credentials provided');
        res.status(401).json({ success: false, message: "Invalid admin credentials" });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ success: false, message: "Login failed" });
    }
  });

  // Admin logout
  app.post('/api/admin/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  // Admin middleware for new portal
  const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
    console.log('Admin auth check:', { 
      sessionExists: !!req.session, 
      adminAuth: req.session?.adminAuthenticated,
      sessionId: req.sessionID
    });
    
    if (!req.session?.adminAuthenticated) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    next();
  };

  // Debug endpoint for checking notifications and transfers
  app.get('/api/debug/transfers-notifications', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      
      // Import models
      const { Transfer } = await import('./models/Transfer');
      const { Notification } = await import('./models/Notification');
      
      // Check transfers for this user
      const transfers = await Transfer.find({
        $or: [{ fromUserId: userId }, { toUserId: userId }]
      }).sort({ createdAt: -1 }).limit(5);
      
      // Check notifications for this user
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(10);
      
      // Check all transfer notifications
      const transferNotifications = await Notification.find({
        type: { $in: ['transfer_sent', 'transfer_received'] }
      }).sort({ createdAt: -1 }).limit(10);
      
      res.json({
        success: true,
        debug: {
          userId,
          transfers: transfers.length,
          userNotifications: notifications.length,
          transferNotifications: transferNotifications.length,
          latestTransfers: transfers,
          latestNotifications: notifications,
          latestTransferNotifications: transferNotifications
        }
      });
    } catch (error) {
      console.error('Debug error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin user search by email
  app.get('/api/admin/users/search/email', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const email = req.query.q as string;
      if (!email || email.length < 1) {
        return res.json([]);
      }

      const { User } = await import('./models/User');
      const users = await User.find({
        email: { $regex: email, $options: 'i' }
      }).select('-password').limit(10);

      const { UserBalance } = await import('./models/UserBalance');
      const usersWithBalance = await Promise.all(
        users.map(async (user) => {
          const balance = await UserBalance.findOne({ userId: user._id.toString() });
          return {
            ...user.toObject(),
            balance: balance?.usdBalance || 0
          };
        })
      );

      res.json(usersWithBalance);
    } catch (error) {
      console.error('Admin user email search error:', error);
      res.status(500).json({ success: false, message: "Failed to search users by email" });
    }
  });

  // Admin user search by UID
  app.get('/api/admin/users/search/uid', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const uid = req.query.q as string;
      if (!uid || uid.length < 1) {
        return res.json([]);
      }

      const { User } = await import('./models/User');
      const users = await User.find({
        uid: { $regex: uid, $options: 'i' }
      }).select('-password').limit(10);

      const { UserBalance } = await import('./models/UserBalance');
      const usersWithBalance = await Promise.all(
        users.map(async (user) => {
          const balance = await UserBalance.findOne({ userId: user._id.toString() });
          return {
            ...user.toObject(),
            balance: balance?.usdBalance || 0
          };
        })
      );

      res.json(usersWithBalance);
    } catch (error) {
      console.error('Admin user UID search error:', error);
      res.status(500).json({ success: false, message: "Failed to search users by UID" });
    }
  });

  // Admin user search (legacy endpoint - now searches both email and UID)
  app.get('/api/admin/users/search', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 1) {
        return res.json([]);
      }

      const { User } = await import('./models/User');
      const { mongoStorage } = await import('./mongoStorage');
      
      // Search users by email, username, firstName, lastName, or UID
      const users = await User.find({
        $or: [
          { email: { $regex: query, $options: 'i' } },
          { username: { $regex: query, $options: 'i' } },
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { uid: { $regex: query, $options: 'i' } }
        ]
      })
      .select('uid username email firstName lastName isVerified isAdmin profilePicture lastActivity onlineTime isOnline sessionStart createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

      const usersWithBalance = await Promise.all(
        users.map(async (user) => {
          const balance = await mongoStorage.getUserBalance(user._id.toString());
          return {
            _id: user._id,
            uid: user.uid,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            isVerified: user.isVerified,
            isAdmin: user.isAdmin,
            balance: balance || 0,
            lastActivity: user.lastActivity,
            onlineTime: user.onlineTime || 0,
            isOnline: user.isOnline || false,
            sessionStart: user.sessionStart,
            createdAt: user.createdAt
          };
        })
      );

      res.json(usersWithBalance);
    } catch (error) {
      console.error('Admin user search error:', error);
      res.status(500).json({ success: false, message: "Failed to search users" });
    }
  });

  // Get all users for admin overview
  app.get('/api/admin/users/all', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { mongoStorage } = await import('./mongoStorage');
      const { User } = await import('./models/User');
      
      // Get all users with balance info and activity tracking
      const users = await User.find({})
        .select('uid username email firstName lastName isVerified isAdmin profilePicture lastActivity onlineTime isOnline sessionStart createdAt')
        .sort({ createdAt: -1 })
        .limit(50);

      const usersWithBalance = await Promise.all(
        users.map(async (user) => {
          const balance = await mongoStorage.getUserBalance(user._id.toString());
          return {
            _id: user._id,
            uid: user.uid,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            isVerified: user.isVerified,
            isAdmin: user.isAdmin,
            balance: balance || 0,
            lastActivity: user.lastActivity,
            onlineTime: user.onlineTime || 0,
            isOnline: user.isOnline || false,
            sessionStart: user.sessionStart,
            createdAt: user.createdAt
          };
        })
      );

      res.json({ 
        success: true, 
        data: usersWithBalance 
      });
    } catch (error) {
      console.error('Admin get all users error:', error);
      res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
  });

  // Get user password for admin
  app.get('/api/admin/users/:userId/password', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { User } = await import('./models/User');
      
      const user = await User.findById(userId).select('password actualPassword username email');
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      let displayPassword = user.actualPassword;
      
      // If no actualPassword exists, provide admin option to set a temporary password
      if (!displayPassword) {
        displayPassword = "No actual password stored - use 'Reset Password' to set a new one";
      }

      res.json({
        success: true,
        password: displayPassword,
        username: user.username,
        email: user.email,
        hasActualPassword: !!user.actualPassword
      });
    } catch (error) {
      console.error('Admin get user password error:', error);
      res.status(500).json({ success: false, message: "Failed to get user password" });
    }
  });

  // Admin reset user password
  app.post('/api/admin/users/:userId/reset-password', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }
      
      const { User } = await import('./models/User');
      const bcrypt = await import('bcrypt');
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update both hashed password and actual password
      await User.findByIdAndUpdate(userId, {
        password: hashedNewPassword,
        actualPassword: newPassword
      });
      
      console.log(`🔐 Admin reset password for user ${userId} (${user.username})`);
      
      // Broadcast password reset event via WebSocket
      const { getWebSocketServer } = await import('./websocket');
      const wss = getWebSocketServer();
      
      if (wss) {
        wss.clients.forEach((client: any) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'ADMIN_PASSWORD_RESET',
              userId: userId,
              timestamp: new Date().toISOString()
            }));
          }
        });
      }
      
      res.json({
        success: true,
        message: 'Password reset successfully',
        newPassword: newPassword
      });
    } catch (error) {
      console.error('Admin reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password'
      });
    }
  });

  // Track user activity
  app.post('/api/admin/users/:userId/activity', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { action, data } = req.body;
      
      const { User } = await import('./models/User');
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const now = new Date();
      
      if (action === 'login') {
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          sessionStart: now,
          lastActivity: now
        });
      } else if (action === 'logout') {
        if (user.sessionStart) {
          const sessionTime = Math.floor((now.getTime() - user.sessionStart.getTime()) / (1000 * 60)); // minutes
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            onlineTime: (user.onlineTime || 0) + sessionTime,
            lastActivity: now,
            $unset: { sessionStart: 1 }
          });
        }
      } else {
        await User.findByIdAndUpdate(userId, {
          lastActivity: now
        });
      }

      res.json({ success: true, message: "Activity tracked" });
    } catch (error) {
      console.error('Admin track activity error:', error);
      res.status(500).json({ success: false, message: "Failed to track activity" });
    }
  });

  // Check if current user requires deposit
  app.get('/api/user/deposit-requirement', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      const { User } = await import('./models/User');
      
      const user = await User.findById(userId).select('requiresDeposit');
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }

      res.json({
        success: true,
        requiresDeposit: user.requiresDeposit || false
      });
    } catch (error) {
      console.error('Check deposit requirement error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to check deposit requirement" 
      });
    }
  });

  // Toggle deposit requirement for user
  app.post('/api/admin/users/toggle-deposit-requirement', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { userId, requiresDeposit } = req.body;
      
      if (!userId || typeof requiresDeposit !== 'boolean') {
        return res.status(400).json({ 
          success: false, 
          message: "User ID and requiresDeposit boolean are required" 
        });
      }

      const { User } = await import('./models/User');
      
      const user = await User.findByIdAndUpdate(
        userId,
        { requiresDeposit },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }

      // Broadcast WebSocket update for real-time UI updates
      if (wss) {
        const message = JSON.stringify({
          type: 'user_restriction_update',
          data: {
            userId: user._id,
            requiresDeposit: user.requiresDeposit,
            withdrawalRestrictionMessage: user.withdrawalRestrictionMessage
          }
        });
        
        wss.clients.forEach((client: any) => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(message);
          }
        });
      }

      res.json({
        success: true,
        message: `Deposit requirement ${requiresDeposit ? 'enabled' : 'disabled'} for user`,
        data: {
          userId: user._id,
          username: user.username,
          requiresDeposit: user.requiresDeposit
        }
      });
    } catch (error) {
      console.error('Toggle deposit requirement error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to update deposit requirement" 
      });
    }
  });

  // Update withdrawal restriction message for user
  app.post('/api/admin/users/update-withdrawal-message', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { userId, message } = req.body;
      
      if (!userId || typeof message !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: "User ID and message string are required" 
        });
      }

      const { User } = await import('./models/User');
      
      const user = await User.findByIdAndUpdate(
        userId,
        { withdrawalRestrictionMessage: message },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }

      // Broadcast WebSocket update for real-time UI updates
      if (wss) {
        const wsMessage = JSON.stringify({
          type: 'user_restriction_update',
          data: {
            userId: user._id,
            requiresDeposit: user.requiresDeposit,
            withdrawalRestrictionMessage: user.withdrawalRestrictionMessage
          }
        });
        
        wss.clients.forEach((client: any) => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(wsMessage);
          }
        });
      }

      res.json({
        success: true,
        message: "Withdrawal restriction message updated successfully",
        data: {
          userId: user._id,
          username: user.username,
          withdrawalRestrictionMessage: user.withdrawalRestrictionMessage
        }
      });
    } catch (error) {
      console.error('Update withdrawal message error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to update withdrawal restriction message" 
      });
    }
  });

  // Get user withdrawal restriction message
  app.get('/api/user/withdrawal-restriction', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      console.log(`📋 Getting withdrawal restriction for user: ${userId}`);
      
      // Handle admin users differently
      if (userId === 'ADMIN001' || req.session.adminAuthenticated) {
        console.log('✅ Admin user - returning empty restriction message');
        return res.json({
          success: true,
          withdrawalRestrictionMessage: "",
          requiresDeposit: false
        });
      }
      
      const { User } = await import('./models/User');
      
      const user = await User.findById(userId).select('withdrawalRestrictionMessage requiresDeposit');
      
      if (!user) {
        console.log(`❌ User not found: ${userId}`);
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }

      console.log(`✅ Found withdrawal restriction: "${user.withdrawalRestrictionMessage}"`);
      
      res.json({
        success: true,
        data: {
          hasRestriction: user.requiresDeposit || false,
          message: user.withdrawalRestrictionMessage || ""
        }
      });
    } catch (error) {
      console.error('Get withdrawal restriction error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to get withdrawal restriction message" 
      });
    }
  });

  // Get user activity analytics
  app.get('/api/admin/users/analytics', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { User } = await import('./models/User');
      
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        onlineUsers,
        activeUsers24h,
        activeUsers7d,
        topActiveUsers
      ] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ isOnline: true }),
        User.countDocuments({ lastActivity: { $gte: last24Hours } }),
        User.countDocuments({ lastActivity: { $gte: last7Days } }),
        User.find({})
          .select('username email onlineTime lastActivity isOnline')
          .sort({ onlineTime: -1 })
          .limit(10)
      ]);

      res.json({
        success: true,
        analytics: {
          totalUsers,
          onlineUsers,
          activeUsers24h,
          activeUsers7d,
          topActiveUsers
        }
      });
    } catch (error) {
      console.error('Admin analytics error:', error);
      res.status(500).json({ success: false, message: "Failed to get analytics" });
    }
  });

  // Admin add funds
  app.post('/api/admin/users/add-funds', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { userId, amount } = req.body;
      
      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ success: false, message: "Valid user ID and amount required" });
      }

      const { mongoStorage } = await import('./mongoStorage');
      await mongoStorage.addFundsToUser(userId, parseFloat(amount));
      
      console.log(`✓ Admin added $${amount} to user ${userId}`);
      console.log(`📧 Notification: User received $${amount} virtual USD funds`);
      
      res.json({ 
        success: true, 
        message: `Successfully added $${amount} to user account`,
        notification: "Deposit successful: You've received virtual USD funds."
      });
    } catch (error) {
      console.error('Admin add funds error:', error);
      res.status(500).json({ success: false, message: "Failed to add funds" });
    }
  });

  // Admin remove funds
  app.post('/api/admin/users/remove-funds', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { userId, amount } = req.body;
      
      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ success: false, message: "Valid user ID and amount required" });
      }

      const { mongoStorage } = await import('./mongoStorage');
      await mongoStorage.removeFundsFromUser(userId, parseFloat(amount));
      
      console.log(`✓ Admin removed $${amount} from user ${userId}`);
      
      res.json({ 
        success: true, 
        message: `Successfully removed $${amount} from user account`
      });
    } catch (error) {
      console.error('Admin remove funds error:', error);
      res.status(500).json({ success: false, message: "Failed to remove funds" });
    }
  });

  // Admin remove funds
  app.post('/api/admin/users/remove-funds', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { userId, amount } = req.body;
      
      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ success: false, message: "Valid user ID and amount required" });
      }

      const { mongoStorage } = await import('./mongoStorage');
      await mongoStorage.removeFundsFromUser(userId, parseFloat(amount));
      
      console.log(`✓ Admin removed $${amount} from user ${userId}`);
      
      res.json({ 
        success: true, 
        message: `Successfully removed $${amount} from user account`
      });
    } catch (error) {
      console.error('Admin remove funds error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to remove funds" 
      });
    }
  });

  // Admin delete user
  app.delete('/api/admin/users/:userId', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID required" });
      }

      const { mongoStorage } = await import('./mongoStorage');
      const user = await mongoStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (user.isAdmin) {
        return res.status(403).json({ success: false, message: "Cannot delete admin users" });
      }

      await mongoStorage.deleteUser(userId);
      console.log(`✓ Admin deleted user account: ${user.username}`);
      
      res.json({ success: true, message: "User account deleted successfully" });
    } catch (error) {
      console.error('Admin delete user error:', error);
      res.status(500).json({ success: false, message: "Failed to delete user" });
    }
  });

  // Admin create deposit transaction
  app.post('/api/admin/deposits/create', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { 
        userId, 
        cryptoSymbol, 
        cryptoName, 
        chainType, 
        networkName, 
        senderAddress, 
        usdAmount, 
        cryptoPrice 
      } = req.body;

      if (!userId || !cryptoSymbol || !cryptoName || !chainType || !networkName || !senderAddress || !usdAmount || !cryptoPrice) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }

      const { mongoStorage } = await import('./mongoStorage');
      
      // Check if user exists
      const user = await mongoStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const cryptoAmount = usdAmount / cryptoPrice;
      const adminId = req.session?.adminId || 'admin';

      // Create deposit transaction
      const transaction = await mongoStorage.createDepositTransaction({
        userId,
        adminId,
        cryptoSymbol,
        cryptoName,
        chainType,
        networkName,
        senderAddress,
        usdAmount,
        cryptoAmount,
        cryptoPrice
      });

      // Add USD funds to user balance
      await mongoStorage.addFundsToUser(userId, usdAmount);

      // Create notification for user
      const notificationMessage = `Dear valued Nedaxer trader,
Your deposit has been confirmed.
Deposit amount: ${cryptoAmount.toFixed(8)} ${cryptoSymbol}
Deposit address: ${senderAddress}
Timestamp: ${new Date().toISOString().replace('T', ' ').substring(0, 19)}(UTC)`;

      const notification = await mongoStorage.createNotification({
        userId,
        type: 'deposit',
        title: 'Deposit Confirmed',
        message: notificationMessage,
        data: {
          transactionId: transaction._id,
          cryptoSymbol,
          cryptoAmount,
          usdAmount,
          senderAddress,
          chainType,
          networkName
        }
      });

      // Broadcast real-time update via WebSocket
      const wss = (req.app as any).get('wss');
      if (wss) {
        const updateData = {
          type: 'DEPOSIT_CREATED',
          userId,
          notification,
          transaction,
          balanceUpdate: {
            userId,
            newUSDBalance: usdAmount,
            addedAmount: usdAmount
          }
        };
        
        // Broadcast to all connected WebSocket clients
        wss.clients.forEach((client: any) => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify(updateData));
          }
        });
        
        console.log(`📡 Real-time update broadcasted for user ${userId}: +$${usdAmount}`);
      }

      res.json({ 
        success: true, 
        message: `Deposit created successfully. User notified of ${cryptoAmount.toFixed(8)} ${cryptoSymbol} deposit.`,
        transaction: transaction
      });
    } catch (error) {
      console.error('Admin create deposit error:', error);
      res.status(500).json({ success: false, message: "Failed to create deposit" });
    }
  });

  // Admin create withdrawal transaction
  app.post('/api/admin/withdrawals/create', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { 
        userId, 
        cryptoSymbol, 
        cryptoName, 
        chainType, 
        networkName, 
        withdrawalAddress, 
        usdAmount, 
        cryptoPrice 
      } = req.body;

      if (!userId || !cryptoSymbol || !cryptoName || !chainType || !networkName || !withdrawalAddress || !usdAmount || !cryptoPrice) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }

      const { mongoStorage } = await import('./mongoStorage');
      
      // Check if user exists
      const user = await mongoStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Check if user has sufficient balance
      const userBalance = await mongoStorage.getUserBalance(userId);
      if (userBalance < usdAmount) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient balance. User has $${userBalance.toFixed(2)}, trying to withdraw $${usdAmount.toFixed(2)}` 
        });
      }

      const cryptoAmount = usdAmount / cryptoPrice;
      const adminId = req.session?.adminId || 'admin';

      // Create withdrawal transaction
      const transaction = await mongoStorage.createWithdrawalTransaction({
        userId,
        adminId,
        cryptoSymbol,
        cryptoName,
        chainType,
        networkName,
        withdrawalAddress,
        usdAmount,
        cryptoAmount,
        cryptoPrice
      });

      // Remove USD funds from user balance
      await mongoStorage.removeFundsFromUser(userId, usdAmount);

      // Create notification for user
      const notificationMessage = `Dear valued Nedaxer trader,
Your withdrawal has been processed.
Withdrawal amount: ${cryptoAmount.toFixed(8)} ${cryptoSymbol}
Withdrawal address: ${withdrawalAddress}
Timestamp: ${new Date().toISOString().replace('T', ' ').substring(0, 19)}(UTC)`;

      const notification = await mongoStorage.createNotification({
        userId,
        type: 'withdrawal',
        title: 'Withdrawal Processed',
        message: notificationMessage,
        data: {
          transactionId: transaction._id,
          cryptoSymbol,
          cryptoAmount,
          usdAmount,
          withdrawalAddress,
          chainType,
          networkName
        }
      });

      // Broadcast real-time update via WebSocket
      const wss = (req.app as any).get('wss');
      if (wss) {
        const updateData = {
          type: 'WITHDRAWAL_CREATED',
          userId,
          notification,
          transaction,
          balanceUpdate: {
            userId,
            deductedAmount: usdAmount
          }
        };
        
        // Broadcast to all connected WebSocket clients
        wss.clients.forEach((client: any) => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify(updateData));
          }
        });
        
        console.log(`📡 Real-time update broadcasted for user ${userId}: -$${usdAmount}`);
      }

      res.json({ 
        success: true, 
        message: `Withdrawal created successfully. User notified of ${cryptoAmount.toFixed(8)} ${cryptoSymbol} withdrawal.`,
        transaction: transaction
      });
    } catch (error) {
      console.error('Admin create withdrawal error:', error);
      res.status(500).json({ success: false, message: error.message || "Failed to create withdrawal" });
    }
  });

  // Get user deposit transaction history - SECURE user-specific filtering
  app.get('/api/deposits/history', requireAuth, async (req: Request, res: Response) => {
    try {
      const sessionUserId = req.session?.userId;
      
      if (!sessionUserId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      
      console.log(`SECURE: Getting deposit history for authenticated user: ${sessionUserId}`);
      
      // Use mongoStorage for consistent user-specific filtering
      const { mongoStorage } = await import('./mongoStorage');
      const transactions = await mongoStorage.getUserDepositTransactions(sessionUserId);
      
      console.log(`SECURE: Found ${transactions.length} transactions for user ${sessionUserId}`);
      
      // Verify all returned transactions belong to the authenticated user
      const secureTransactions = transactions.filter(tx => 
        tx.userId === sessionUserId || tx.userId === sessionUserId.toString()
      );
      
      if (secureTransactions.length !== transactions.length) {
        console.error(`SECURITY VIOLATION: Transaction count mismatch. Expected: ${transactions.length}, Secure: ${secureTransactions.length}`);
        return res.status(500).json({ success: false, message: "Security check failed" });
      }
      
      res.json({ 
        success: true, 
        data: secureTransactions
      });
      
    } catch (error) {
      console.error('Get deposit history error:', error);
      res.status(500).json({ success: false, message: "Failed to get deposit history" });
    }
  });

  // Get user deposit transactions by userId (MUST be after /api/deposits/history route)  
  app.get('/api/deposits/:userId', requireAuth, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      // Ensure user can only access their own transactions or admin can access any
      const sessionUserId = req.session?.userId;
      const isAdmin = req.session?.adminAuthenticated;
      
      if (!isAdmin && sessionUserId !== userId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      const { mongoStorage } = await import('./mongoStorage');
      const transactions = await mongoStorage.getUserDepositTransactions(userId);
      
      res.json({ success: true, data: transactions });
    } catch (error) {
      console.error('Get deposit transactions error:', error);
      res.status(500).json({ success: false, message: "Failed to get transactions" });
    }
  });

  // Get single deposit transaction details
  app.get('/api/deposits/details/:transactionId', requireAuth, async (req: Request, res: Response) => {
    try {
      const { transactionId } = req.params;
      
      const { mongoStorage } = await import('./mongoStorage');
      const transaction = await mongoStorage.getDepositTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ success: false, message: "Transaction not found" });
      }

      // Ensure user can only access their own transactions or admin can access any
      const sessionUserId = req.session?.userId;
      const isAdmin = req.session?.adminAuthenticated;
      
      if (!isAdmin && sessionUserId !== transaction.userId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      
      res.json({ success: true, data: transaction });
    } catch (error) {
      console.error('Get deposit transaction details error:', error);
      res.status(500).json({ success: false, message: "Failed to get transaction details" });
    }
  });

  // Get user withdrawal transaction history - SECURE user-specific filtering
  app.get('/api/withdrawals/history', requireAuth, async (req: Request, res: Response) => {
    try {
      const sessionUserId = req.session?.userId;
      
      if (!sessionUserId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      
      console.log(`SECURE: Getting withdrawal history for authenticated user: ${sessionUserId}`);
      
      // Use mongoStorage for consistent user-specific filtering
      const { mongoStorage } = await import('./mongoStorage');
      const transactions = await mongoStorage.getUserWithdrawalTransactions(sessionUserId);
      
      console.log(`SECURE: Found ${transactions.length} withdrawal transactions for user ${sessionUserId}`);
      
      // Verify all returned transactions belong to the authenticated user
      const secureTransactions = transactions.filter(tx => 
        tx.userId === sessionUserId || tx.userId === sessionUserId.toString()
      );
      
      if (secureTransactions.length !== transactions.length) {
        console.error(`SECURITY VIOLATION: Transaction count mismatch. Expected: ${transactions.length}, Secure: ${secureTransactions.length}`);
        return res.status(500).json({ success: false, message: "Security check failed" });
      }
      
      res.json({ 
        success: true, 
        data: secureTransactions
      });
    } catch (error) {
      console.error('Get withdrawal history error:', error);
      res.status(500).json({ success: false, message: "Failed to get withdrawal history" });
    }
  });

  // Get user withdrawal transactions by userId (MUST be after /api/withdrawals/history route)  
  app.get('/api/withdrawals/:userId', requireAuth, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      // Ensure user can only access their own transactions or admin can access any
      const sessionUserId = req.session?.userId;
      const isAdmin = req.session?.adminAuthenticated;
      
      if (!isAdmin && sessionUserId !== userId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      const { mongoStorage } = await import('./mongoStorage');
      const transactions = await mongoStorage.getUserWithdrawalTransactions(userId);
      
      res.json({ success: true, data: transactions });
    } catch (error) {
      console.error('Get withdrawal transactions error:', error);
      res.status(500).json({ success: false, message: "Failed to get transactions" });
    }
  });

  // Get single withdrawal transaction details
  app.get('/api/withdrawals/details/:transactionId', requireAuth, async (req: Request, res: Response) => {
    try {
      const { transactionId } = req.params;
      
      const { mongoStorage } = await import('./mongoStorage');
      const transaction = await mongoStorage.getWithdrawalTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ success: false, message: "Transaction not found" });
      }

      // Ensure user can only access their own transactions or admin can access any
      const sessionUserId = req.session?.userId;
      const isAdmin = req.session?.adminAuthenticated;
      
      if (!isAdmin && sessionUserId !== transaction.userId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      
      res.json({ success: true, data: transaction });
    } catch (error) {
      console.error('Get withdrawal transaction details error:', error);
      res.status(500).json({ success: false, message: "Failed to get transaction details" });
    }
  });

  // Create test deposit notification (for testing purposes)
  app.post('/api/test/create-deposit-notification', async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID required" });
      }

      const { mongoStorage } = await import('./mongoStorage');
      
      // Create test deposit notification
      const notification = await mongoStorage.createNotification({
        userId,
        type: 'deposit',
        title: 'Deposit Confirmed',
        message: `Dear valued Nedaxer trader,
Your deposit has been confirmed.
Deposit amount: 0.00222222 BTC
Deposit address: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
Timestamp: ${new Date().toISOString().replace('T', ' ').substring(0, 19)}(UTC)`,
        data: {
          cryptoSymbol: 'BTC',
          cryptoAmount: 0.00222222,
          usdAmount: 100,
          senderAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          chainType: 'Bitcoin',
          networkName: 'Bitcoin Network'
        }
      });

      console.log(`✅ Test deposit notification created for user ${userId}`);
      
      res.json({ 
        success: true, 
        message: "Test deposit notification created",
        notification: notification
      });
    } catch (error) {
      console.error('Create test deposit notification error:', error);
      res.status(500).json({ success: false, message: "Failed to create test notification" });
    }
  });

  // Get user notifications (requires authentication)
  app.get('/api/notifications', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      console.log(`🔔 Notifications API called for user ${userId}`);
      
      const { mongoStorage } = await import('./mongoStorage');
      const notifications = await mongoStorage.getUserNotifications(userId);
      
      console.log(`📝 Found ${notifications.length} notifications for user ${userId}`);
      
      // Count unread notifications
      const unreadCount = notifications.filter(n => !n.isRead).length;
      console.log(`📊 Unread notifications: ${unreadCount}`);
      
      res.json({ 
        success: true, 
        data: notifications,
        unreadCount: unreadCount
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ success: false, message: "Failed to get notifications" });
    }
  });

  // Get unread notification count for home page badge
  app.get('/api/notifications/unread-count', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      
      const { mongoStorage } = await import('./mongoStorage');
      const notifications = await mongoStorage.getUserNotifications(userId);
      const unreadCount = notifications.filter(n => !n.isRead).length;
      
      console.log(`📊 Unread count for user ${userId}: ${unreadCount}`);
      
      res.json({ 
        success: true, 
        unreadCount: unreadCount
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ success: false, message: "Failed to get unread count" });
    }
  });

  // Mark notification as read
  app.put('/api/notifications/:notificationId/read', requireAuth, async (req: Request, res: Response) => {
    try {
      const { notificationId } = req.params;
      
      const { mongoStorage } = await import('./mongoStorage');
      await mongoStorage.markNotificationAsRead(notificationId);
      
      res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ success: false, message: "Failed to mark notification as read" });
    }
  });

  // Register chatbot routes
  app.use('/api/chatbot', chatbotRoutes);
  
  // Register verification routes
  const { default: verificationRoutes } = await import('./api/verification-routes');
  app.use('/api/verification', verificationRoutes);
  
  // Register admin KYC routes
  const { default: adminKycRoutes } = await import('./api/admin-kyc-routes');
  app.use('/api/admin', adminKycRoutes);

  // Check withdrawal eligibility
  app.get('/api/withdrawals/eligibility', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      
      const { User } = await import('./models/User');
      const { mongoStorage } = await import('./mongoStorage');
      
      // Get user data including withdrawal restriction message
      const user = await User.findById(userId).select('withdrawalRestrictionMessage');
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      // Calculate total deposits from transaction history
      const deposits = await mongoStorage.getUserDepositTransactions(userId);
      const totalDeposited = deposits.reduce((sum, deposit) => sum + deposit.usdAmount, 0);
      
      // Default minimum required amount (can be made configurable per user later)
      const minimumRequired = 500;
      const canWithdraw = totalDeposited >= minimumRequired;
      
      res.json({
        success: true,
        data: {
          canWithdraw,
          totalDeposited,
          minimumRequired,
          withdrawalMessage: user.withdrawalRestrictionMessage || "You need to make a first deposit of $500 to unlock withdrawal features.",
          shortfall: Math.max(0, minimumRequired - totalDeposited)
        }
      });
    } catch (error) {
      console.error('Check withdrawal eligibility error:', error);
      res.status(500).json({ success: false, message: "Failed to check withdrawal eligibility" });
    }
  });

  // Admin send message to user
  app.post('/api/admin/send-message', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { userId, message } = req.body;
      
      if (!userId || !message || message.trim().length === 0) {
        return res.status(400).json({ success: false, message: "User ID and message are required" });
      }
      
      if (message.length > 2000) {
        return res.status(400).json({ success: false, message: "Message too long (max 2000 characters)" });
      }

      const { mongoStorage } = await import('./mongoStorage');
      const { AdminMessage } = await import('./models/AdminMessage');
      
      // Check if user exists
      const user = await mongoStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const adminId = req.session?.adminId || 'admin';
      
      // Create admin message record
      const adminMessage = new AdminMessage({
        userId,
        adminId,
        message: message.trim(),
        type: 'support_message',
        isRead: false
      });
      await adminMessage.save();
      
      // Create notification for user
      const notification = await mongoStorage.createNotification({
        userId,
        type: 'system',
        title: 'Support Message',
        message: message.trim(),
        data: {
          messageId: (adminMessage._id as any).toString(),
          from: 'support',
          notificationType: 'message'
        }
      });

      // Broadcast real-time notification update
      const wss = app.get('wss');
      if (wss) {
        const updateData = {
          type: 'notification_update',
          data: { userId, notification }
        };
        
        wss.clients.forEach((client: any) => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify(updateData));
          }
        });
        
        console.log(`📡 Real-time message notification sent to user ${userId}`);
      }

      console.log(`✓ Admin sent message to user ${userId}: "${message.substring(0, 50)}..."`);
      
      res.json({ 
        success: true, 
        message: "Message sent successfully",
        notification: notification
      });
    } catch (error) {
      console.error('Admin send message error:', error);
      res.status(500).json({ success: false, message: "Failed to send message" });
    }
  });

  // Admin get user withdrawal settings
  app.get('/api/admin/users/:userId/withdrawal-settings', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID required" });
      }

      const { UserSettings } = await import('./models/UserSettings');
      const { mongoStorage } = await import('./mongoStorage');
      
      // Check if user exists
      const user = await mongoStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      // Get or create user settings
      let userSettings = await UserSettings.findOne({ userId });
      if (!userSettings) {
        userSettings = new UserSettings({ 
          userId,
          minimumDepositForWithdrawal: 500,
          totalDeposited: 0,
          canWithdraw: false
        });
        await userSettings.save();
      }
      
      // Calculate total deposits from transaction history
      const deposits = await mongoStorage.getUserDepositTransactions(userId);
      const totalDeposited = deposits.reduce((sum, deposit) => sum + deposit.usdAmount, 0);
      
      // Update user settings with current total
      userSettings.totalDeposited = totalDeposited;
      userSettings.canWithdraw = totalDeposited >= userSettings.minimumDepositForWithdrawal;
      await userSettings.save();
      
      res.json({
        success: true,
        data: {
          canWithdraw: userSettings.canWithdraw,
          totalDeposited: userSettings.totalDeposited,
          minimumRequired: userSettings.minimumDepositForWithdrawal,
          withdrawalMessage: userSettings.withdrawalMessage || "You need to make a first deposit of ${amount} to unlock withdrawal features.",
          shortfall: Math.max(0, userSettings.minimumDepositForWithdrawal - userSettings.totalDeposited)
        }
      });
    } catch (error) {
      console.error('Get user withdrawal settings error:', error);
      res.status(500).json({ success: false, message: "Failed to get withdrawal settings" });
    }
  });

  // Admin update user withdrawal requirements
  app.post('/api/admin/users/withdrawal-settings', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { userId, withdrawalRestrictionMessage } = req.body;
      
      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID required" });
      }

      const { User } = await import('./models/User');
      
      // Update user's withdrawal restriction message
      const user = await User.findByIdAndUpdate(
        userId,
        { withdrawalRestrictionMessage: withdrawalRestrictionMessage || '' },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      // Broadcast real-time withdrawal settings update via WebSocket
      const { getWebSocketServer } = await import('./websocket');
      const wss = getWebSocketServer();
      
      if (wss) {
        const updateData = {
          type: 'WITHDRAWAL_SETTINGS_UPDATE',
          userId,
          withdrawalRestrictionMessage: user.withdrawalRestrictionMessage
        };
        
        wss.clients.forEach((client: any) => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify(updateData));
          }
        });
        
        console.log(`📡 Real-time withdrawal settings update sent to user ${userId}`);
      }
      
      console.log(`✓ Admin updated withdrawal restriction message for user ${userId}`);
      
      res.json({ 
        success: true, 
        message: "Withdrawal restriction message updated successfully",
        user: {
          _id: user._id,
          withdrawalRestrictionMessage: user.withdrawalRestrictionMessage
        }
      });
    } catch (error) {
      console.error('Admin update withdrawal settings error:', error);
      res.status(500).json({ success: false, message: "Failed to update withdrawal settings" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const { WebSocketServer, WebSocket } = await import('ws');
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('WebSocket message received:', data);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  // =======================
  // CONNECTION REQUEST ROUTES
  // =======================

  // Admin send connection request
  app.post('/api/admin/connection-request/send', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { userId, customMessage, successMessage, serviceName } = req.body;
      
      if (!userId || !customMessage || !successMessage || !serviceName) {
        return res.status(400).json({ 
          success: false, 
          message: "All fields are required: userId, customMessage, successMessage, serviceName" 
        });
      }

      const { mongoStorage } = await import('./mongoStorage');
      
      // Check if user exists
      const user = await mongoStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Import ConnectionRequest model
      const { ConnectionRequest } = await import('./models/ConnectionRequest');
      
      // Create connection request
      const connectionRequest = await ConnectionRequest.create({
        userId,
        adminId: req.session?.adminId || 'admin',
        customMessage,
        successMessage,
        serviceName,
        status: 'pending'
      });

      // Create notification for user
      const notification = await mongoStorage.createNotification({
        userId,
        type: 'connection_request',
        title: 'Connection Request',
        message: `Dear User, ${customMessage}`,
        data: {
          connectionRequestId: (connectionRequest._id as any).toString(),
          serviceName,
          customMessage,
          successMessage,
          status: 'pending'
        }
      });

      console.log(`✅ Admin sent connection request to user ${userId}`);
      
      // Broadcast real-time update
      const wss = app.get('wss');
      if (wss) {
        wss.clients.forEach((client: any) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'CONNECTION_REQUEST_CREATED',
              userId: userId,
              connectionRequestId: (connectionRequest._id as any).toString(),
              notification: notification
            }));
          }
        });
      }

      res.json({ 
        success: true, 
        message: "Connection request sent successfully",
        data: { connectionRequestId: (connectionRequest._id as any).toString() }
      });
    } catch (error) {
      console.error('Admin send connection request error:', error);
      res.status(500).json({ success: false, message: "Failed to send connection request" });
    }
  });

  // User respond to connection request
  app.post('/api/connection-request/respond', requireAuth, async (req: Request, res: Response) => {
    try {
      const { connectionRequestId, response } = req.body; // response: 'accept' or 'decline'
      
      if (!connectionRequestId || !response || !['accept', 'decline'].includes(response)) {
        return res.status(400).json({ 
          success: false, 
          message: "Valid connectionRequestId and response (accept/decline) required" 
        });
      }

      const { ConnectionRequest } = await import('./models/ConnectionRequest');
      const { mongoStorage } = await import('./mongoStorage');
      
      // Find connection request
      const connectionRequest = await ConnectionRequest.findById(connectionRequestId);
      if (!connectionRequest) {
        return res.status(404).json({ success: false, message: "Connection request not found" });
      }

      // Verify user owns this request
      if (connectionRequest.userId !== req.session?.userId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      // Check if already responded
      if (connectionRequest.status !== 'pending') {
        return res.status(400).json({ success: false, message: "Connection request already responded to" });
      }

      // Update connection request status
      connectionRequest.status = response === 'accept' ? 'accepted' : 'declined';
      connectionRequest.respondedAt = new Date();
      await connectionRequest.save();

      let responseMessage = '';
      let notificationMessage = '';

      if (response === 'accept') {
        responseMessage = `${connectionRequest.successMessage} has been successfully connected. Please contact support if you did not make this request.`;
        notificationMessage = `You have successfully connected your account to ${connectionRequest.serviceName}.`;
      } else {
        responseMessage = "You did not request this connection. Please report to support.";
        notificationMessage = `Connection request to ${connectionRequest.serviceName} was declined.`;
      }

      // Remove the original connection request notification
      await mongoStorage.removeNotificationByData(connectionRequest.userId, 'connection_request', {
        connectionRequestId: (connectionRequest._id as any).toString()
      });

      // Create notification for response
      const notification = await mongoStorage.createNotification({
        userId: connectionRequest.userId,
        type: 'system',
        title: response === 'accept' ? 'Connection Successful' : 'Connection Declined',
        message: notificationMessage,
        data: {
          connectionRequestId: (connectionRequest._id as any).toString(),
          serviceName: connectionRequest.serviceName,
          response,
          timestamp: new Date().toISOString()
        }
      });

      console.log(`✅ User ${connectionRequest.userId} ${response}ed connection request ${connectionRequestId}`);
      
      // Broadcast real-time update
      const wss = app.get('wss');
      if (wss) {
        wss.clients.forEach((client: any) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'CONNECTION_REQUEST_RESPONDED',
              userId: connectionRequest.userId,
              connectionRequestId: (connectionRequest._id as any).toString(),
              response,
              notification: notification
            }));
          }
        });
      }

      res.json({ 
        success: true, 
        message: responseMessage,
        data: { 
          response,
          connectionRequestId: (connectionRequest._id as any).toString(),
          serviceName: connectionRequest.serviceName
        }
      });
    } catch (error) {
      console.error('Connection request response error:', error);
      res.status(500).json({ success: false, message: "Failed to respond to connection request" });
    }
  });

  // Get user's connection requests
  app.get('/api/connection-requests', requireAuth, async (req: Request, res: Response) => {
    try {
      const { ConnectionRequest } = await import('./models/ConnectionRequest');
      
      const connectionRequests = await ConnectionRequest.find({ 
        userId: req.session?.userId 
      }).sort({ createdAt: -1 });

      res.json({ 
        success: true, 
        data: connectionRequests 
      });
    } catch (error) {
      console.error('Get connection requests error:', error);
      res.status(500).json({ success: false, message: "Failed to get connection requests" });
    }
  });

  // Get single connection request details
  app.get('/api/connection-request/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { ConnectionRequest } = await import('./models/ConnectionRequest');
      
      const connectionRequest = await ConnectionRequest.findById(id);
      if (!connectionRequest) {
        return res.status(404).json({ success: false, message: "Connection request not found" });
      }

      // Verify user owns this request
      if (connectionRequest.userId !== req.session?.userId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      res.json({ 
        success: true, 
        data: connectionRequest 
      });
    } catch (error) {
      console.error('Get connection request details error:', error);
      res.status(500).json({ success: false, message: "Failed to get connection request details" });
    }
  });

  // Admin get all connection requests
  app.get('/api/admin/connection-requests', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { ConnectionRequest } = await import('./models/ConnectionRequest');
      
      const connectionRequests = await ConnectionRequest.find({})
        .sort({ createdAt: -1 })
        .limit(100);

      res.json({ 
        success: true, 
        data: connectionRequests 
      });
    } catch (error) {
      console.error('Admin get connection requests error:', error);
      res.status(500).json({ success: false, message: "Failed to get connection requests" });
    }
  });

  // Store WebSocket server for broadcasting updates
  app.set('wss', wss);
  
  return httpServer;
}