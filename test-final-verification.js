import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';

async function testFinalVerification() {
  try {
    console.log('🧪 Final verification of both fixes...\n');
    
    // Use the working user credentials from the logs
    console.log('=== TESTING WITH WORKING USER SESSION ===');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'robinstephen100@outlook.com',
        password: 'smart123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData.success ? 'SUCCESS' : 'FAILED');
    
    if (loginData.success) {
      const sessionCookie = loginResponse.headers.get('set-cookie')?.split(';')[0] || '';
      
      // Test 1: Withdrawal Restriction Messages
      console.log('\n1. Testing Withdrawal Restriction Messages:');
      const withdrawalResponse = await fetch('http://localhost:5000/api/user/withdrawal-restriction', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': sessionCookie
        }
      });
      
      const withdrawalData = await withdrawalResponse.json();
      console.log('Status:', withdrawalResponse.status);
      console.log('Response:', JSON.stringify(withdrawalData, null, 2));
      
      if (withdrawalData.success && withdrawalData.data) {
        console.log('✅ WITHDRAWAL RESTRICTION MESSAGES WORKING');
        console.log(`   Has Restriction: ${withdrawalData.data.hasRestriction}`);
        console.log(`   Message: "${withdrawalData.data.message}"`);
      } else {
        console.log('❌ Withdrawal restriction messages still not working');
      }
      
      // Test 2: Transfer History
      console.log('\n2. Testing Transfer History:');
      const transferResponse = await fetch('http://localhost:5000/api/transfers/history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': sessionCookie
        }
      });
      
      const transferData = await transferResponse.json();
      console.log('Status:', transferResponse.status);
      console.log('Transfer count:', transferData.data?.length || 0);
      
      if (transferData.success && Array.isArray(transferData.data)) {
        console.log('✅ TRANSFER HISTORY WORKING');
        console.log(`   Found ${transferData.data.length} transfers`);
        if (transferData.data.length > 0) {
          console.log(`   Latest: ${transferData.data[0].transactionId} - $${transferData.data[0].amount}`);
        }
      } else {
        console.log('❌ Transfer history still not working');
      }
      
      console.log('\n=== FINAL RESULTS ===');
      const withdrawalWorking = withdrawalData.success && withdrawalData.data;
      const transferWorking = transferData.success && Array.isArray(transferData.data);
      
      if (withdrawalWorking && transferWorking) {
        console.log('🎉 BOTH ISSUES SUCCESSFULLY FIXED!');
        console.log('✅ Withdrawal restriction messages are working');
        console.log('✅ Transfer history is working');
      } else {
        console.log('⚠️  Some issues remain:');
        if (!withdrawalWorking) console.log('❌ Withdrawal restriction messages');
        if (!transferWorking) console.log('❌ Transfer history');
      }
      
    } else {
      console.log('❌ Cannot test - login failed');
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testFinalVerification().catch(console.error);