/**
 * Migration script to convert crypto balances to USD-only balance system
 * This script will:
 * 1. Remove all existing crypto balances
 * 2. Create a single USD balance for each user (starting at 0)
 * 3. Update the balance structure to match the new system
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://glo54t875:HC3kFetCuyWe9u28@nedaxer.qzntzfb.mongodb.net/';

async function migrateToUSDBalance() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('nedaxer');
    
    // Get all users
    const users = await db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users to migrate`);
    
    // Clear existing balances
    const deleteResult = await db.collection('userbalances').deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing crypto balances`);
    
    // Create new USD balance for each user
    const newBalances = [];
    for (const user of users) {
      newBalances.push({
        userId: user._id,
        usdBalance: 0, // Start with zero balance - users must fund their account
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    if (newBalances.length > 0) {
      const insertResult = await db.collection('userbalances').insertMany(newBalances);
      console.log(`Created ${insertResult.insertedCount} new USD balances`);
    }
    
    console.log('Migration completed successfully!');
    console.log('All users now have zero USD balance and must fund their accounts to trade.');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run the migration
migrateToUSDBalance()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });