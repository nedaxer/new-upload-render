import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { sendVerificationEmail, sendWelcomeEmail } from "./email";

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
  // Setup session middleware
  const PgSession = connectPgSimple(session);
  
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: 'session', // Use the default table name
        createTableIfMissing: true
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
      const user = await storage.getUserByUsername(username);
      
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
        
        await storage.setVerificationCode(user.id, verificationCode, expiresAt);
        
        // Send a new verification email
        await sendVerificationEmail(user.email, verificationCode, user.firstName);
        
        return res.status(403).json({
          success: false,
          message: "Account not verified",
          needsVerification: true,
          userId: user.id
        });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // User authenticated successfully
      return res.status(200).json({
        success: true,
        message: "Authentication successful",
        user: {
          id: user.id,
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
      
      // Create new user (unverified)
      const newUser = await storage.createUser({
        username,
        email,
        password,
        firstName,
        lastName
      });
      
      console.log(`User created with ID: ${newUser.id}`);
      
      // Generate verification code
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      
      await storage.setVerificationCode(newUser.id, verificationCode, expiresAt);
      console.log(`Verification code set for user ${newUser.id}`);
      
      // Send verification email with better error handling
      let emailSent = false;
      try {
        await sendVerificationEmail(email, verificationCode, firstName);
        emailSent = true;
        console.log(`Verification email successfully sent to ${email}`);
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
            id: newUser.id
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
          id: newUser.id,
          username: newUser.username,
          email: newUser.email
        },
        // Only include verification code in development mode
        ...(process.env.NODE_ENV === 'development' && { verificationCode })
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
      
      // Send verification email
      let emailSent = false;
      try {
        await sendVerificationEmail(user.email, verificationCode, user.firstName);
        emailSent = true;
        console.log(`Verification email successfully resent to ${user.email}`);
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
  
  // Route to handle account verification page
  app.get('/account/verify', (req, res) => {
    // Preserve query parameters for userId
    const userId = req.query.userId;
    if (userId) {
      res.redirect(`/#/account/verify?userId=${userId}`);
    } else {
      res.redirect('/#/account/verify');
    }
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
        
        // Check if testuser already exists
        const existingUser = await storage.getUserByUsername(testUser.username);
        
        if (!existingUser) {
          const newUser = await storage.createUser(testUser);
          await storage.markUserAsVerified(newUser.id);
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
