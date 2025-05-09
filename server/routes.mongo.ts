import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { mongoStorage } from "./mongoStorage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import MongoStore from "connect-mongo";
import { sendVerificationEmail, sendWelcomeEmail } from "./email";

// Note: we need to redeclare this but it's okay since
// the original declaration in routes.ts won't be included
declare module "express-session" {
  interface SessionData {
    userId: string;
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

  const user = await mongoStorage.getUser(req.session.userId);
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
  // Setup session middleware with MongoDB
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://nedaxerus:4vEQeJUIs0Q1FYxb@nedaxer.eyejj2k.mongodb.net/?retryWrites=true&w=majority&appName=Nedaxer';
  
  app.use(
    session({
      store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        collectionName: 'sessions',
        ttl: 30 * 24 * 60 * 60 // 30 days
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

  // API route for user authentication
  app.post('/api/auth/login', async (req, res) => {
    try {
      // Validate input with zod
      const loginSchema = z.object({
        username: z.string().min(3),
        password: z.string().min(6)
      });

      const result = loginSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid credentials format", 
          errors: result.error.format() 
        });
      }
      
      const { username, password } = result.data;

      // Check if user exists
      const user = await mongoStorage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid username or password" 
        });
      }
      
      // Simple password check (in a real app, you'd use bcrypt)
      if (user.password !== password) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid username or password" 
        });
      }
      
      // Check if user is verified
      if (!user.isVerified) {
        // Generate a new verification code if the user is not verified
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
        
        await mongoStorage.setVerificationCode(user._id.toString(), verificationCode, expiresAt);
        
        // Send a new verification email
        await sendVerificationEmail(user.email, verificationCode, user.firstName);
        
        return res.status(403).json({
          success: false,
          message: "Account not verified",
          needsVerification: true,
          userId: user._id.toString()
        });
      }
      
      // Set session
      req.session.userId = user._id.toString();
      
      // User authenticated successfully
      return res.status(200).json({
        success: true,
        message: "Authentication successful",
        user: {
          id: user._id.toString(),
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
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
      const existingUsername = await mongoStorage.getUserByUsername(username);
      if (existingUsername) {
        console.log(`Registration failed: Username ${username} already exists`);
        return res.status(409).json({ 
          success: false, 
          message: "Username already exists" 
        });
      }
      
      // Check if email already exists
      const existingEmail = await mongoStorage.getUserByEmail(email);
      if (existingEmail) {
        console.log(`Registration failed: Email ${email} already exists`);
        return res.status(409).json({ 
          success: false, 
          message: "Email already exists" 
        });
      }
      
      console.log('Creating new user account...');
      
      // Create new user (unverified)
      const newUser = await mongoStorage.createUser({
        username,
        email,
        password,
        firstName,
        lastName
      });
      
      console.log(`User created with ID: ${newUser._id.toString()}`);
      
      // Generate verification code (we'll use this both for direct verification and as part of the URL)
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      
      await mongoStorage.setVerificationCode(newUser._id.toString(), verificationCode, expiresAt);
      console.log(`Verification code set for user ${newUser._id.toString()}`);
      
      // Send verification email with better error handling
      let emailSent = false;
      try {
        // Send verification email with code
        await sendVerificationEmail(email, verificationCode, firstName);
        emailSent = true;
        console.log(`Verification email with code successfully sent to ${email}`);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        
        // In development mode, just log the verification code for testing
        if (process.env.NODE_ENV === 'development') {
          console.log(`DEVELOPMENT MODE: Verification code for ${email} is: ${verificationCode}`);
          emailSent = true; // Consider it sent in development
        }
      }
      
      // In production, report email sending failure
      if (!emailSent && process.env.NODE_ENV !== 'development') {
        return res.status(500).json({
          success: false,
          message: "Account created but verification email could not be sent. Please contact support.",
          user: {
            id: newUser._id.toString()
          }
        });
      }
      
      // Success - respond with user details for the verification page
      // In development mode, also include the verification code in the response
      // so the frontend can display it (since emails aren't actually sent)
      return res.status(201).json({
        success: true,
        message: "User registered successfully. Please check your email for verification code.",
        user: {
          id: newUser._id.toString(),
          username: newUser.username,
          email: newUser.email
        },
        // Only include verification code in development mode
        ...(process.env.NODE_ENV === 'development' && { verificationCode })
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Check for MongoDB specific errors
      const errorMessage = error?.message || "Internal server error";
      
      if (errorMessage.includes('duplicate key') && errorMessage.includes('email')) {
        return res.status(409).json({ 
          success: false, 
          message: "Email already exists" 
        });
      } else if (errorMessage.includes('duplicate key') && errorMessage.includes('username')) {
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
        userId: z.string(),
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
      const isValid = await mongoStorage.verifyUser(userId, code);
      
      if (!isValid) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid or expired verification code" 
        });
      }
      
      // Mark user as verified
      await mongoStorage.markUserAsVerified(userId);
      
      // Get user details for the welcome email
      const user = await mongoStorage.getUser(userId);
      
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
        userId: z.string()
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
      const user = await mongoStorage.getUser(userId);
      
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
      
      await mongoStorage.setVerificationCode(userId, verificationCode, expiresAt);
      
      // Send verification email with clickable link
      let emailSent = false;
      try {
        // Create a verification URL for the user to click
        const verificationUrl = `${process.env.NODE_ENV === 'production' ? 'https://nedaxer.com' : 'http://localhost:5000'}/account/verify?userId=${userId}&code=${verificationCode}`;
        
        // Send verification email with the clickable link
        await sendVerificationEmail(user.email, verificationCode, user.firstName, verificationUrl);
        emailSent = true;
        console.log(`Verification email with clickable link successfully resent to ${user.email}`);
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
      const user = await mongoStorage.getUser(userId as string);
      
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
          id: user._id.toString(),
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
        
        // Check if testuser already exists
        const existingUser = await mongoStorage.getUserByUsername(testUser.username);
        
        if (!existingUser) {
          const newUser = await mongoStorage.createUser(testUser);
          await mongoStorage.markUserAsVerified(newUser._id.toString());
          res.json({ success: true, message: 'Test user created and verified' });
        } else {
          res.json({ success: true, message: 'Test user already exists' });
        }
      } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create test user' });
      }
    });
  }

  const httpServer = createServer(app);

  return httpServer;
}
