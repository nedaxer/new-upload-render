import { connect, connection } from 'mongoose';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://nedaxerus:4vEQeJUIs0Q1FYxb@nedaxer.eyejj2k.mongodb.net/?retryWrites=true&w=majority&appName=Nedaxer';

// Connection for Mongoose ODM
export async function connectToDatabase() {
  if (connection.readyState >= 1) {
    return connection;
  }

  try {
    console.log('Connecting to MongoDB...');
    await connect(MONGODB_URI);
    console.log('MongoDB connection established successfully');
    return connection;
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
