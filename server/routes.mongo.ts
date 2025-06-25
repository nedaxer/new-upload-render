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

  // Auth endpoint to get current user data
  app.get('/api/auth/user', async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      // Standard user lookup from MongoDB
      const { mongoStorage } = await import('./mongoStorage');
      const user = await mongoStorage.getUser(req.session.userId);
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

  // Login endpoint with hardcoded admin bypass
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "Username and password are required" 
        });
      }

      // HARDCODED ADMIN LOGIN - bypasses MongoDB completely
      const adminEmail = 'nedaxer.us@gmail.com';
      const adminPassword = 'Nedaxer.us';
      
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
        return res.status(401).json({ 
          success: false, 
          message: "Invalid credentials" 
        });
      }

      // Verify password for regular users
      const isPasswordValid = await bcrypt.compare(password, user.password);

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
      
      if (email === 'admin@nedaxer.com' && password === 'NedaxerAdmin2025') {
        req.session.adminAuthenticated = true;
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ success: false, message: "Session save failed" });
          }
          res.json({ success: true, message: "Admin authentication successful" });
        });
      } else {
        res.status(401).json({ success: false, message: "Invalid admin credentials" });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ success: false, message: "Login failed" });
    }
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

  // Admin user search
  app.get('/api/admin/users/search', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 1) {
        return res.json([]);
      }

      const { mongoStorage } = await import('./mongoStorage');
      const users = await mongoStorage.searchUsers(query);
      res.json(users);
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
      
      // Get all users with balance info
      const users = await User.find({})
        .select('uid username email firstName lastName isVerified isAdmin createdAt')
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
            isVerified: user.isVerified,
            isAdmin: user.isAdmin,
            balance: balance || 0,
            createdAt: user.createdAt
          };
        })
      );

      res.json(usersWithBalance);
    } catch (error) {
      console.error('Admin get all users error:', error);
      res.status(500).json({ success: false, message: "Failed to fetch users" });
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

  // Register chatbot routes
  app.use('/api/chatbot', chatbotRoutes);

  const httpServer = createServer(app);
  return httpServer;
}