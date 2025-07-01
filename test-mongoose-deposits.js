import mongoose from 'mongoose';
import { DepositTransaction } from './server/models/DepositTransaction.js';

async function testMongooseDeposits() {
  try {
    await mongoose.connect('mongodb+srv://glo54t875:HC3kFetCuyWe9u28@nedaxer.qzntzfb.mongodb.net/nedaxer');
    
    console.log('📊 Testing mongoose DepositTransaction model...');
    const deposits = await DepositTransaction.find({}).sort({ createdAt: -1 }).limit(5);
    
    console.log(`Found ${deposits.length} deposits using mongoose:`);
    deposits.forEach((deposit, index) => {
      console.log(`\n${index + 1}. Deposit ${deposit._id}:`);
      console.log(`   - cryptoSymbol: ${deposit.cryptoSymbol}`);
      console.log(`   - cryptoAmount: ${deposit.cryptoAmount} (type: ${typeof deposit.cryptoAmount})`);
      console.log(`   - usdAmount: ${deposit.usdAmount} (type: ${typeof deposit.usdAmount})`);
      console.log(`   - userId: ${deposit.userId}`);
      console.log(`   - createdAt: ${deposit.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testMongooseDeposits();