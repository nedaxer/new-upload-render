import axios from 'axios';

const baseURL = 'http://localhost:5000';

async function testAdminSystem() {
  try {
    console.log('🔐 Testing admin login...');
    
    // Create axios instance with session support
    const client = axios.create({
      baseURL,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    });

    // 1. Admin login
    const loginResponse = await client.post('/api/admin/login', {
      email: 'admin@nedaxer.com',
      password: 'NedaxerAdmin2025'
    });
    
    console.log('✅ Admin login:', loginResponse.data);

    // 2. Search for user
    console.log('\n🔍 Searching for user robinstephen100@outlook.com...');
    const searchResponse = await client.get('/api/admin/users/search?q=robinstephen100');
    console.log('✅ Search results:', JSON.stringify(searchResponse.data, null, 2));

    if (searchResponse.data.length > 0) {
      const user = searchResponse.data[0];
      console.log(`\n💰 Found user ${user.username} (${user.email}), current balance: $${user.balance}`);
      
      // 3. Add funds
      console.log('\n💸 Adding $100 to user account...');
      const fundResponse = await client.post('/api/admin/users/add-funds', {
        userId: user._id,
        amount: 100
      });
      
      console.log('✅ Fund transfer result:', fundResponse.data);
      
      // 4. Verify balance update
      console.log('\n🔄 Verifying balance update...');
      const verifyResponse = await client.get(`/api/admin/users/search?q=${user.email}`);
      const updatedUser = verifyResponse.data[0];
      console.log(`✅ Updated balance: $${updatedUser.balance}`);
      
    } else {
      console.log('❌ User not found in search results');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdminSystem();