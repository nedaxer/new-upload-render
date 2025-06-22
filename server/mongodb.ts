import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

// In-memory MongoDB server for development
let mongoMemoryServer: MongoMemoryServer;
let mongoUri: string = '';

// Connection for Mongoose ODM
export async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    
    // Use your MongoDB Atlas connection string
    mongoUri = 'mongodb+srv://glo54t875:HC3kFetCuyWe9u28@nedaxer.qzntzfb.mongodb.net/?retryWrites=true&w=majority&appName=Nedaxer';
    console.log('Using MongoDB Atlas cluster');
    
    await mongoose.connect(mongoUri);
    console.log('MongoDB Atlas connection established successfully');
    
    // Add default data for our in-memory database
    try {
      await createInitialData();
    } catch (error) {
      console.log('Initial data creation already completed or failed:', error);
    }
    
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Create initial data for development
async function createInitialData() {
  console.log('Creating initial data for development...');
  
  try {
    // Import models
    const { User } = await import('./models/User');
    const { Currency } = await import('./models/Currency');
    const { UserBalance } = await import('./models/UserBalance');
    
    // Import auth service
    const { authService } = await import('./services/auth.service');
    // Create the hashed password
    const hashedPassword = await authService.hashPassword('password');
    
    // Import UID generation utility
    const { generateUID } = await import('./utils/uid');
    
    // Check if test user already exists
    const existingTestUser = await User.findOne({ username: 'testuser' });
    if (!existingTestUser) {
      const testUser = new User({
        uid: generateUID(),
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword, // Freshly hashed 'password'
        firstName: 'Test',
        lastName: 'User',
        isVerified: true,
        isAdmin: false,
        createdAt: new Date()
      });
      await testUser.save();
      console.log('Created test user with username: testuser, password: password');
    }
    
    // Check if admin user already exists
    const existingAdminUser = await User.findOne({ username: 'admin' });
    if (!existingAdminUser) {
      const adminUser = new User({
        uid: generateUID(),
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword, // Same hashed password
        firstName: 'Admin',
        lastName: 'User',
        isVerified: true,
        isAdmin: true,
        createdAt: new Date()
      });
      await adminUser.save();
      console.log('Created admin user with username: admin, password: password');
    }
    
    // Create only USD currency for fiat broker
    const currencies = [
      { symbol: 'USD', name: 'US Dollar', isActive: true }
    ];
    
    for (const currencyData of currencies) {
      const existingCurrency = await Currency.findOne({ symbol: currencyData.symbol });
      if (!existingCurrency) {
        const currency = new Currency(currencyData);
        await currency.save();
      }
    }
    console.log('Currencies initialized:', currencies.map(c => c.symbol).join(', '));
    
    // Get USD currency (only currency we need for fiat broker)
    const usdCurrency = await Currency.findOne({ symbol: 'USD' });
    
    // Get users for balance initialization
    const testUser = await User.findOne({ username: 'testuser' });
    const adminUser = await User.findOne({ username: 'admin' });
    
    if (usdCurrency && testUser && adminUser) {
      // Create USD balances for users - Default to $0 (users must deposit to have balance)
      const existingTestBalance = await UserBalance.findOne({ userId: testUser._id, currencyId: usdCurrency._id });
      if (!existingTestBalance) {
        const testBalance = new UserBalance({
          userId: testUser._id, 
          currencyId: usdCurrency._id, 
          amount: 0 // Start with $0 - users must deposit
        });
        await testBalance.save();
      }
      
      const existingAdminBalance = await UserBalance.findOne({ userId: adminUser._id, currencyId: usdCurrency._id });
      if (!existingAdminBalance) {
        const adminBalance = new UserBalance({
          userId: adminUser._id, 
          currencyId: usdCurrency._id, 
          amount: 0 // Start with $0 - admin can add funds through admin panel
        });
        await adminBalance.save();
      }
      console.log('Created initial balances for admin user');
      
      // Create additional demo users with various fund levels
      const demoUsers = [
        {
          uid: generateUID(),
          username: 'trader1',
          email: 'trader1@example.com',
          firstName: 'Professional',
          lastName: 'Trader',
          funds: { USD: 25000, BTC: 1.2, ETH: 15 }
        },
        {
          uid: generateUID(),
          username: 'investor1',
          email: 'investor1@example.com',
          firstName: 'Long Term',
          lastName: 'Investor',
          funds: { USD: 75000, BTC: 3.8, ETH: 40 }
        },
        {
          uid: generateUID(),
          username: 'whale1',
          email: 'whale1@example.com',
          firstName: 'Crypto',
          lastName: 'Whale',
          funds: { USD: 500000, BTC: 15.5, ETH: 200 }
        }
      ];
      
      for (const userData of demoUsers) {
        const user = new User({
          uid: userData.uid,
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          isVerified: true,
          isAdmin: false,
          createdAt: new Date()
        });
        await user.save();
        
        // Create balances for each demo user
        const userBalances = [
          { userId: user._id, currencyId: usdCurrency._id, amount: userData.funds.USD },
          { userId: user._id, currencyId: btcCurrency._id, amount: userData.funds.BTC },
          { userId: user._id, currencyId: ethCurrency._id, amount: userData.funds.ETH }
        ];
        
        for (const balanceData of userBalances) {
          const balance = new UserBalance(balanceData);
          await balance.save();
        }
        console.log(`Created demo user: ${userData.username} with funds`);
      }
    }
    
    console.log('Initial data creation completed successfully');
  } catch (error) {
    console.error('Error creating initial data:', error);
  }
}

// Direct MongoDB client access (alternative to Mongoose)
let cachedClient: MongoClient | null = null;

export async function getMongoClient() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    // Use your MongoDB Atlas connection string
    const connectionString = 'mongodb+srv://glo54t875:HC3kFetCuyWe9u28@nedaxer.qzntzfb.mongodb.net/?retryWrites=true&w=majority&appName=Nedaxer';
    const client = new MongoClient(connectionString);
    await client.connect();
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('MongoDB client connection error:', error);
    throw error;
  }
}

export function getDb(client: MongoClient, dbName = 'nedaxer') {
  return client.db(dbName);
}
