import { MongoClient } from 'mongodb';

async function findUsersWithDocs() {
  const client = new MongoClient('mongodb+srv://glo54t875:HC3kFetCuyWe9u28@nedaxer.qzntzfb.mongodb.net/');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('nedaxer');
    const users = db.collection('users');
    
    // Find all users with documents
    const usersWithDocs = await users.find({ 
      'kycData.documents': { $exists: true } 
    }).toArray();
    
    console.log(`Found ${usersWithDocs.length} users with documents:`);
    
    usersWithDocs.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.kycStatus}) - UID: ${user.uid}`);
      if (user.kycData?.documents) {
        console.log(`   Documents: front=${!!user.kycData.documents.front}, back=${!!user.kycData.documents.back}, single=${!!user.kycData.documents.single}`);
      }
    });
    
    // Check specifically for pending users
    const pendingUsers = await users.find({ 
      kycStatus: { $in: ['submitted', 'pending'] }
    }).toArray();
    
    console.log(`\nFound ${pendingUsers.length} pending users:`);
    pendingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.kycStatus}) - UID: ${user.uid}`);
      console.log(`   Has documents: ${!!user.kycData?.documents}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

findUsersWithDocs().catch(console.error);