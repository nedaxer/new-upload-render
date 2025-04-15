import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import nodemailer from "nodemailer";
import { pool } from "./db";

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

// Function to send verification email
async function sendVerificationEmail(email: string, code: string, firstName: string): Promise<void> {
  try {
    // Create transporter with debug enabled
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.example.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_PASSWORD || "",
      },
      // For development only - handle TLS issues gracefully
      tls: {
        rejectUnauthorized: false
      },
      debug: process.env.NODE_ENV === 'development'
    });

    // Email content with enhanced design
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Nedaxer Team <noreply@nedaxer.com>",
      to: email,
      subject: "Verify Your Nedaxer Account",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Nedaxer Account</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; color: #333;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 20px; margin-bottom: 20px;">
            <tr>
              <td>
                <!-- Header -->
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="background: linear-gradient(135deg, #0033a0 0%, #001a60 100%); padding: 30px 0;">
                      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Nedaxer</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 16px;">Cryptocurrency Trading Platform</p>
                    </td>
                  </tr>
                </table>
                
                <!-- Content -->
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 30px 40px;">
                  <tr>
                    <td>
                      <h2 style="color: #0033a0; margin-top: 0; margin-bottom: 20px; font-size: 22px;">Email Verification</h2>
                      <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">Hello ${firstName},</p>
                      <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">Thank you for joining Nedaxer! To complete your registration and access your new account, please use the verification code below:</p>
                      
                      <div style="background: linear-gradient(to right, #f0f4ff, #e6f0fb); border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0;">
                        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0033a0;">${code}</div>
                        <p style="color: #4b5563; margin-top: 15px; font-size: 14px;">This code will expire in 30 minutes</p>
                      </div>
                      
                      <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">If you did not create an account with Nedaxer, please disregard this email.</p>
                      
                      <div style="border-top: 1px solid #e5e7eb; margin: 30px 0; padding-top: 30px;">
                        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 5px; font-size: 16px;">Thank you,</p>
                        <p style="color: #0033a0; font-weight: 600; margin-top: 0; font-size: 16px;">The Nedaxer Team</p>
                      </div>
                    </td>
                  </tr>
                </table>
                
                <!-- Footer -->
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="background-color: #f0f4ff; padding: 20px 0;">
                      <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">© ${new Date().getFullYear()} Nedaxer. All rights reserved.</p>
                      <p style="color: #6b7280; margin: 0; font-size: 12px;">This is an automated message, please do not reply.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    
    // In development, don't throw - just log the error (so flow can continue)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Development mode: Verification code for ${email} is: ${code}`);
    } else {
      throw new Error("Failed to send verification email");
    }
  }
}

// Function to send welcome email after verification
async function sendWelcomeEmail(email: string, firstName: string): Promise<void> {
  try {
    // Create transporter with debug enabled
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.example.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_PASSWORD || "",
      },
      // For development only - handle TLS issues gracefully
      tls: {
        rejectUnauthorized: false
      },
      debug: process.env.NODE_ENV === 'development'
    });

    // Email content with beautiful design
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Nedaxer Team <noreply@nedaxer.com>",
      to: email,
      subject: "Welcome to Nedaxer - Your Account is Now Active!",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Nedaxer</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; color: #333;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 20px; margin-bottom: 20px;">
            <tr>
              <td>
                <!-- Header with Celebration Style -->
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="background: linear-gradient(135deg, #0033a0 0%, #001a60 100%); padding: 40px 0;">
                      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">Welcome to Nedaxer!</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Your journey to smarter crypto trading begins now</p>
                    </td>
                  </tr>
                </table>
                
                <!-- Main Content -->
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 40px;">
                  <tr>
                    <td>
                      <h2 style="color: #0033a0; margin-top: 0; margin-bottom: 20px; font-size: 24px;">Hi ${firstName},</h2>
                      <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">Congratulations! Your Nedaxer account has been successfully verified and is now active. We're thrilled to have you join our community of cryptocurrency traders.</p>
                      
                      <div style="background-color: #f0f7ff; border-left: 4px solid #0033a0; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <h3 style="color: #0033a0; margin-top: 0; margin-bottom: 10px; font-size: 18px;">What's Next?</h3>
                        <ul style="color: #4b5563; padding-left: 20px; margin-bottom: 0;">
                          <li style="margin-bottom: 10px;">Complete your profile to personalize your trading experience</li>
                          <li style="margin-bottom: 10px;">Explore our trading tutorials and educational resources</li>
                          <li style="margin-bottom: 10px;">Connect your preferred payment method</li>
                          <li style="margin-bottom: 0;">Make your first trade with confidence</li>
                        </ul>
                      </div>
                      
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="https://nedaxer.com/getting-started" style="background-color: #0033a0; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">Get Started Now</a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">If you need any assistance or have questions, our support team is available 24/7 to help you. Simply reply to this email or contact us through our support portal.</p>
                      
                      <div style="border-top: 1px solid #e5e7eb; margin: 30px 0; padding-top: 30px;">
                        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 5px; font-size: 16px;">Happy trading,</p>
                        <p style="color: #0033a0; font-weight: 600; margin-top: 0; font-size: 16px;">The Nedaxer Team</p>
                      </div>
                    </td>
                  </tr>
                </table>
                
                <!-- Footer with Social Links -->
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f4ff; padding: 30px;">
                  <tr>
                    <td align="center">
                      <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">Follow us for market updates and trading tips</p>
                      <div style="margin-bottom: 20px;">
                        <!-- Social media icons would go here -->
                        <a href="#" style="display: inline-block; margin: 0 10px; color: #0033a0; text-decoration: none;">Twitter</a>
                        <a href="#" style="display: inline-block; margin: 0 10px; color: #0033a0; text-decoration: none;">LinkedIn</a>
                        <a href="#" style="display: inline-block; margin: 0 10px; color: #0033a0; text-decoration: none;">Instagram</a>
                      </div>
                      <p style="color: #6b7280; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} Nedaxer. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    
    // In development, don't throw - just log the error (so flow can continue)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Development mode: Would have sent welcome email to ${email}`);
    } else {
      throw new Error("Failed to send welcome email");
    }
  }
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
      return res.status(201).json({
        success: true,
        message: "User registered successfully. Please check your email for verification code.",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email
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
      
      // Send verification email
      await sendVerificationEmail(user.email, verificationCode, user.firstName);
      
      return res.status(200).json({
        success: true,
        message: "Verification code resent successfully"
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
