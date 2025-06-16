
const mongoose = require('mongoose');
const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');

// MongoDB User Schema
const mongoUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  verificationCode: { type: String, default: null },
  verificationCodeExpires: { type: Date, default: null },
  resetPasswordCode: { type: String, default: null },
  resetPasswordCodeExpires: { type: Date, default: null },
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const MongoUser = mongoose.model('User', mongoUserSchema);

async function findUserInBothDatabases(searchId) {
  console.log(`🔍 Searching for user with ID: ${searchId}`);
  console.log('=' .repeat(50));

  // Search in MongoDB
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nedaxer_db';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Search by ObjectId if it looks like one, otherwise search by username or email
    let mongoUser = null;
    
    if (mongoose.Types.ObjectId.isValid(searchId)) {
      mongoUser = await MongoUser.findById(searchId);
      console.log(`📋 MongoDB search by ObjectId: ${mongoUser ? 'Found' : 'Not found'}`);
    }
    
    if (!mongoUser) {
      // Search by username, email, or any field that might contain this ID
      mongoUser = await MongoUser.findOne({
        $or: [
          { username: searchId },
          { email: searchId },
          { _id: searchId }
        ]
      });
      console.log(`📋 MongoDB search by username/email: ${mongoUser ? 'Found' : 'Not found'}`);
    }

    if (mongoUser) {
      console.log(`✅ Found in MongoDB:`);
      console.log(`   ID: ${mongoUser._id}`);
      console.log(`   Username: ${mongoUser.username}`);
      console.log(`   Email: ${mongoUser.email}`);
      console.log(`   Name: ${mongoUser.firstName} ${mongoUser.lastName}`);
      console.log(`   Verified: ${mongoUser.isVerified}`);
      console.log(`   Created: ${mongoUser.createdAt}`);
    } else {
      console.log(`❌ User not found in MongoDB`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error searching MongoDB:', error.message);
  }

  console.log('=' .repeat(50));

  // Search in MySQL
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nedaxer_db'
    });

    console.log('✅ Connected to MySQL');

    // Search by ID (numeric)
    const [mysqlUsers] = await connection.execute(
      'SELECT * FROM users WHERE id = ? OR username = ? OR email = ?',
      [searchId, searchId, searchId]
    );

    if (mysqlUsers.length > 0) {
      const user = mysqlUsers[0];
      console.log(`✅ Found in MySQL:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Verified: ${user.isVerified}`);
      console.log(`   Created: ${user.createdAt}`);
    } else {
      console.log(`❌ User not found in MySQL`);
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error searching MySQL:', error.message);
  }
}

// Get search term from command line arguments
const searchId = process.argv[2];

if (!searchId) {
  console.log('Usage: node scripts/find-user.js <USER_ID_OR_USERNAME_OR_EMAIL>');
  console.log('Example: node scripts/find-user.js 672661763');
  process.exit(1);
}

// Run search
findUserInBothDatabases(searchId).then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Search failed:', error);
  process.exit(1);
});
