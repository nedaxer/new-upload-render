import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

// For testing in Replit environment, we'll use a local MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nedaxer';

// Connection for Mongoose ODM
export async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connection established successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Direct MongoDB client access (alternative to Mongoose)
let cachedClient: MongoClient | null = null;

export async function getMongoClient() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    const client = new MongoClient(MONGODB_URI);
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
