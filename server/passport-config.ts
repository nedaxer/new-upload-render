import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { mongoStorage as storage } from './mongoStorage';
import { InsertMongoUser } from '@shared/mongo-schema';

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "https://43f1d461-49ab-439c-9c38-6bb239d0af37-00-2s7sr664vpoc4.worf.replit.dev/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth profile received:', {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName
    });

    const email = profile.emails?.[0]?.value;
    
    if (!email) {
      return done(new Error('No email found in Google profile'), undefined);
    }

    // Check if user already exists with this email
    let user = await storage.getUserByEmail(email);
    
    if (user) {
      console.log('Existing user found, logging in:', user.email);
      return done(null, user);
    }

    // Create new user from Google profile
    const firstName = profile.name?.givenName || '';
    const lastName = profile.name?.familyName || '';
    const displayName = profile.displayName || email.split('@')[0];

    const newUser = await storage.createUser({
      username: email,
      email: email,
      firstName: firstName,
      lastName: lastName,
      password: '', // No password needed for OAuth users
      favorites: [],
      isVerified: true, // Google accounts are pre-verified
      isAdmin: false,
      balance: 0,
      kycStatus: 'none',
      profilePicture: profile.photos?.[0]?.value || '',
      googleId: profile.id
    });

    console.log('New Google user created:', newUser.email);
    return done(null, newUser);

  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, undefined);
  }
}));

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user._id.toString());
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;