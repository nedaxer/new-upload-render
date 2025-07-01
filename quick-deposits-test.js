import { MongoClient } from 'mongodb';

async function quickDepositsTest() {
  const client = new MongoClient('mongodb+srv://glo54t875:HC3kFetCuyWe9u28@nedaxer.qzntzfb.mongodb.net/');
  
  try {
    await client.connect();
    const db = client.db('nedaxer');
    
    // Test if API endpoint would find the deposits correctly
    const userId = '685c46d9b3dc40aeae0ed7fa';
    console.log(`🔍 Testing deposit query for user: ${userId}`);
    
    const deposits = await db.collection('deposittransactions').find({ 
      $or: [
        { userId: userId },
        { userId: userId.toString() }
      ]
    }).sort({ createdAt: -1 }).toArray();
    
    console.log(`Found ${deposits.length} deposits for user ${userId}:`);
    deposits.forEach((deposit, index) => {
      console.log(`${index + 1}. ${deposit.cryptoSymbol}: ${deposit.cryptoAmount} (USD: $${deposit.usdAmount})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

quickDepositsTest();