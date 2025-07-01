import { MongoClient } from 'mongodb';

async function debugDepositAmounts() {
  const client = new MongoClient('mongodb+srv://glo54t875:HC3kFetCuyWe9u28@nedaxer.qzntzfb.mongodb.net/');
  
  try {
    await client.connect();
    const db = client.db('nedaxer');
    
    console.log('\n📊 Checking deposit transactions...');
    const deposits = await db.collection('deposittransactions').find({}).sort({ createdAt: -1 }).limit(5).toArray();
    
    // Also check the mongoose collection name
    const depositTransactions = await db.collection('DepositTransactions').find({}).sort({ createdAt: -1 }).limit(5).toArray();
    
    console.log(`Found ${deposits.length} recent deposits in 'deposittransactions':`);
    deposits.forEach((deposit, index) => {
      console.log(`\n${index + 1}. Deposit ${deposit._id}:`);
      console.log(`   - cryptoSymbol: ${deposit.cryptoSymbol}`);
      console.log(`   - cryptoAmount: ${deposit.cryptoAmount} (type: ${typeof deposit.cryptoAmount})`);
      console.log(`   - usdAmount: ${deposit.usdAmount} (type: ${typeof deposit.usdAmount})`);
      console.log(`   - cryptoPrice: ${deposit.cryptoPrice} (type: ${typeof deposit.cryptoPrice})`);
      console.log(`   - userId: ${deposit.userId}`);
      console.log(`   - createdAt: ${deposit.createdAt}`);
    });
    
    console.log(`\nFound ${depositTransactions.length} recent deposits in 'DepositTransactions':`);
    depositTransactions.forEach((deposit, index) => {
      console.log(`\n${index + 1}. Deposit ${deposit._id}:`);
      console.log(`   - cryptoSymbol: ${deposit.cryptoSymbol}`);
      console.log(`   - cryptoAmount: ${deposit.cryptoAmount} (type: ${typeof deposit.cryptoAmount})`);
      console.log(`   - usdAmount: ${deposit.usdAmount} (type: ${typeof deposit.usdAmount})`);
      console.log(`   - cryptoPrice: ${deposit.cryptoPrice} (type: ${typeof deposit.cryptoPrice})`);
      console.log(`   - userId: ${deposit.userId}`);
      console.log(`   - createdAt: ${deposit.createdAt}`);
    });
    
    console.log('\n📊 Checking notifications...');
    const notifications = await db.collection('notifications').find({ type: 'deposit' }).sort({ createdAt: -1 }).limit(3).toArray();
    
    console.log(`Found ${notifications.length} recent deposit notifications:`);
    notifications.forEach((notification, index) => {
      console.log(`\n${index + 1}. Notification ${notification._id}:`);
      console.log(`   - message: ${notification.message.substring(0, 100)}...`);
      console.log(`   - data.cryptoAmount: ${notification.data?.cryptoAmount} (type: ${typeof notification.data?.cryptoAmount})`);
      console.log(`   - data.usdAmount: ${notification.data?.usdAmount} (type: ${typeof notification.data?.usdAmount})`);
      console.log(`   - userId: ${notification.userId}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

debugDepositAmounts();