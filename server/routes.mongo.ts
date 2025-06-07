import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { mongoStorage } from "./mongoStorage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import MongoStore from "connect-mongo";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from "./email";

// Note: we need to redeclare this but it's okay since
// the original declaration in routes.ts won't be included
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// Function to generate a random verification code
// Import auth service at the top to access verification code generation
import { authService } from './services/auth.service';

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
  // Use the existing Mongoose connection instead of creating a new one
  const mongoose = (await import('mongoose')).default;
  
  app.use(
    session({
      store: MongoStore.create({
        client: mongoose.connection.getClient(),
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

      // Check if user exists by username or email (since we use email as username)
      let user = await mongoStorage.getUserByUsername(username);
      
      // If not found by username, try by email (since we're now using email as username)
      if (!user) {
        user = await mongoStorage.getUserByEmail(username);
        console.log(`User not found by username, checking by email: ${username}`);
      }
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "Account not found. Please use your email address as your username." 
        });
      }
      
      // Import auth service
      const { authService } = await import('./services/auth.service');
      
      // Verify password using bcrypt
      const isPasswordValid = await authService.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: "Incorrect password. Please try again." 
        });
      }
      
      // We no longer check for verification
      // Users are automatically verified when created
      
      // Set session
      const userId = user._id ? (user._id as any).toString() : '';
      req.session.userId = userId;
      
      // Ensure session is saved before responding
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('Error saving session during login:', err);
            reject(err);
          } else {
            console.log('Login session saved successfully for user:', userId);
            resolve();
          }
        });
      });
      
      // User authenticated successfully
      return res.status(200).json({
        success: true,
        message: "Authentication successful",
        user: {
          id: userId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: true,
          isAdmin: user.isAdmin || false
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
      
      const userId = newUser._id ? (newUser._id as any).toString() : '';
      console.log(`User created with ID: ${userId}`);
      
      // Set user session (automatically log in)
      req.session.userId = userId;
      console.log(`User ${userId} automatically logged in after registration`);
      
      // Try to send a welcome email
      try {
        await sendWelcomeEmail(email, firstName);
        console.log(`Welcome email sent to ${email}`);
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // This error doesn't need to block the registration process
      }
      
      // Ensure session is saved before responding
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('Error saving session during registration:', err);
            reject(err);
          } else {
            console.log('Registration session saved successfully for user:', userId);
            resolve();
          }
        });
      });
      
      // Success - respond with user details
      return res.status(201).json({
        success: true,
        message: "User registered successfully. You are now logged in.",
        user: {
          id: userId,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          isVerified: true,
          isAdmin: newUser.isAdmin || false
        }
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
      const verificationCode = authService.generateVerificationCode();
      const expiresAt = authService.generateExpirationDate(30); // 30 minutes from now
      
      await mongoStorage.setVerificationCode(userId, verificationCode, expiresAt);
      
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
      const userId = req.session.userId;
      
      // If no user ID in session, user is not logged in
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated"
        });
      }
      
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
          id: (user._id as any).toString(),
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: user.isVerified,
          isAdmin: user.isAdmin || false
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
  
  // Keep old endpoint for backward compatibility
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
          id: (user._id as any).toString(),
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
  
  // API route for requesting a password reset
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const schema = z.object({
        email: z.string().email()
      });
      
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid email", 
          errors: result.error.format() 
        });
      }
      
      const { email } = result.data;
      
      // Find user by email
      const user = await mongoStorage.getUserByEmail(email);
      
      // Don't reveal if user exists or not for security
      if (!user) {
        return res.status(200).json({
          success: true,
          message: "If an account with that email exists, a password reset link has been sent."
        });
      }
      
      // Generate reset code with authService
      const resetCode = authService.generateVerificationCode();
      const expiresAt = authService.generateExpirationDate(15); // 15 minutes
      
      // Save reset code to user
      await mongoStorage.setResetPasswordCode((user._id as any).toString(), resetCode, expiresAt);
      
      // Send reset email
      let emailSent = false;
      try {
        await sendPasswordResetEmail(email, resetCode, user.firstName);
        emailSent = true;
        console.log(`Password reset email sent to ${email}`);
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
        
        // In development mode, log the reset code
        if (process.env.NODE_ENV === 'development') {
          console.log(`DEVELOPMENT MODE: Password reset code for ${email} is: ${resetCode}`);
          emailSent = true; // Consider it sent in development
        }
      }
      
      // In production, report email sending failure
      if (!emailSent && process.env.NODE_ENV !== 'development') {
        return res.status(500).json({
          success: false,
          message: "Failed to send password reset email. Please try again later."
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
        // Only include reset code in development mode
        ...(process.env.NODE_ENV === 'development' && { resetCode, userId: (user._id as any).toString() })
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      return res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });
  
  // API route for verifying reset code and setting new password
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const schema = z.object({
        userId: z.string(),
        resetCode: z.string().length(6),
        newPassword: z.string().min(8) // Minimum 8 characters
      });
      
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid reset request data", 
          errors: result.error.format() 
        });
      }
      
      const { userId, resetCode, newPassword } = result.data;
      
      // Verify the reset code
      const isValid = await mongoStorage.verifyResetPasswordCode(userId, resetCode);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset code"
        });
      }
      
      // Update the password
      const updateSuccess = await mongoStorage.updatePassword(userId, newPassword);
      
      if (!updateSuccess) {
        return res.status(500).json({
          success: false,
          message: "Failed to update password"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Password updated successfully"
      });
    } catch (error) {
      console.error('Password reset error:', error);
      return res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
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
          await mongoStorage.markUserAsVerified((newUser._id as any).toString());
          res.json({ success: true, message: 'Test user created and verified' });
        } else {
          res.json({ success: true, message: 'Test user already exists' });
        }
      } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create test user' });
      }
    });
    
    // Add a special debug route to create a user with email as username
    app.get('/api/setup-email-user', async (req, res) => {
      try {
        // Generate a unique username with timestamp to avoid conflicts
        const uniqueEmail = `test${Date.now()}@example.com`;
        
        const emailUser = {
          username: uniqueEmail,  // Using email as username
          email: uniqueEmail,
          password: 'password123',
          firstName: 'Email',
          lastName: 'User'
        };
        
        // Import auth service to hash the password 
        const { authService } = await import('./services/auth.service');
        
        // Always create a new user for testing
        const { User } = await import('./models/User');
        
        // Hash the password
        const hashedPassword = await authService.hashPassword(emailUser.password);
        
        // Create the user directly in MongoDB to avoid any potential issues
        const newUser = new User({
          username: emailUser.username,
          email: emailUser.email,
          password: hashedPassword,
          firstName: emailUser.firstName,
          lastName: emailUser.lastName,
          isVerified: true,
          createdAt: new Date()
        });
        
        await newUser.save();
        
        // Log the user details for debugging
        console.log('Debug - Created fresh test user:');
        console.log('Username/Email:', emailUser.email);
        console.log('Password (plaintext):', emailUser.password);
        console.log('Password (hashed):', hashedPassword);
        
        // Test verification with the fresh hash
        const verifyResult = await authService.verifyPassword(emailUser.password, hashedPassword);
        console.log('Password verification test:', verifyResult ? 'SUCCESS' : 'FAILED');
        
        res.json({ 
          success: true, 
          message: 'Created fresh test user',
          loginDetails: {
            username: emailUser.email,
            password: emailUser.password
          },
          debug: {
            hashed: hashedPassword,
            verifyTest: verifyResult
          }
        });
      } catch (error) {
        console.error('Error creating test user:', error);
        res.status(500).json({ success: false, message: 'Failed to create test user' });
      }
    });
    
    // Add a debug route for testing password verification directly
    app.get('/api/debug-password', async (req, res) => {
      try {
        // Import auth service
        const { authService } = await import('./services/auth.service');
        
        // Test against the known hash used for seed users
        const knownHash = '$2b$10$8jMDJUUvx98Bq7BhA3eELuZGsKh6gzzC7HbkFKiILKNUppTmcQUl.'; // 'password'
        const testPassword = 'password';
        
        // Test verification
        const isValid = await authService.verifyPassword(testPassword, knownHash);
        
        // Generate a new hash for comparison
        const newHash = await authService.hashPassword(testPassword);
        
        // Test verification against new hash
        const isValidWithNewHash = await authService.verifyPassword(testPassword, newHash);
        
        res.json({
          success: true,
          debug: {
            knownHash,
            testPassword,
            isValid,
            newHash,
            isValidWithNewHash
          }
        });
      } catch (error) {
        console.error('Error testing password:', error);
        res.status(500).json({ success: false, message: 'Failed to test password' });
      }
    });
  }

  // Include admin routes from external file
  const adminRouter = (await import('./api/admin-routes')).default;
  app.use('/api/admin', adminRouter);
  
  // Include trading routes
  const tradingRouter = (await import('./api/trading-routes.mongo')).default;
  app.use('/api/trading', tradingRouter);

  const httpServer = createServer(app);

  return httpServer;
}
