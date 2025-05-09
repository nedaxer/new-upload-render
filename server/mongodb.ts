import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

// In-memory MongoDB server for development
let mongoMemoryServer: MongoMemoryServer;
let mongoUri: string;

// Connection for Mongoose ODM
export async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    console.log('Connecting to MongoDB...');
    
    // If we're in development without a real MongoDB URI, use in-memory MongoDB
    if (!process.env.MONGODB_URI) {
      // Create MongoDB Memory Server
      mongoMemoryServer = await MongoMemoryServer.create();
      mongoUri = mongoMemoryServer.getUri();
      console.log('Using in-memory MongoDB server');
    } else {
      mongoUri = process.env.MONGODB_URI;
      console.log('Using remote MongoDB server');
    }
    
    await mongoose.connect(mongoUri);
    console.log('MongoDB connection established successfully');
    
    // Add default data if using in-memory database
    if (!process.env.MONGODB_URI) {
      await createInitialData();
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
    
    // Create test user
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: '$2b$10$8jMDJUUvx98Bq7BhA3eELuZGsKh6gzzC7HbkFKiILKNUppTmcQUl.', // 'password'
      firstName: 'Test',
      lastName: 'User',
      isVerified: true,
      isAdmin: false,
      createdAt: new Date()
    });
    await testUser.save();
    console.log('Created test user with username: testuser, password: password');
    
    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: '$2b$10$8jMDJUUvx98Bq7BhA3eELuZGsKh6gzzC7HbkFKiILKNUppTmcQUl.', // 'password'
      firstName: 'Admin',
      lastName: 'User',
      isVerified: true,
      isAdmin: true,
      createdAt: new Date()
    });
    await adminUser.save();
    console.log('Created admin user with username: admin, password: password');
    
    // Create currencies
    const currencies = [
      { symbol: 'USD', name: 'US Dollar', isActive: true },
      { symbol: 'BTC', name: 'Bitcoin', isActive: true },
      { symbol: 'ETH', name: 'Ethereum', isActive: true },
      { symbol: 'BNB', name: 'Binance Coin', isActive: true },
      { symbol: 'USDT', name: 'Tether', isActive: true }
    ];
    
    for (const currencyData of currencies) {
      const currency = new Currency(currencyData);
      await currency.save();
    }
    console.log('Created currencies:', currencies.map(c => c.symbol).join(', '));
    
    // Get currency IDs
    const usdCurrency = await Currency.findOne({ symbol: 'USD' });
    const btcCurrency = await Currency.findOne({ symbol: 'BTC' });
    const ethCurrency = await Currency.findOne({ symbol: 'ETH' });
    
    if (usdCurrency && btcCurrency && ethCurrency && testUser) {
      // Create balances for test user
      const balances = [
        { userId: testUser._id, currencyId: usdCurrency._id, amount: 10000 },
        { userId: testUser._id, currencyId: btcCurrency._id, amount: 0.5 },
        { userId: testUser._id, currencyId: ethCurrency._id, amount: 5 }
      ];
      
      for (const balanceData of balances) {
        const balance = new UserBalance(balanceData);
        await balance.save();
      }
      console.log('Created initial balances for test user');
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
    // Make sure MongoDB memory server is started if needed
    if (!mongoUri) {
      await connectToDatabase();
    }
    
    const client = new MongoClient(mongoUri);
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
