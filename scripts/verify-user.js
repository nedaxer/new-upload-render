
const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');
const { eq } = require('drizzle-orm');

// Import schema
const { users } = require('../shared/schema.ts');

async function verifyUser(userId) {
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nedaxer_db',
    });

    const db = drizzle(connection);

    // Find user by ID
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user[0]) {
      console.log(`❌ User with ID ${userId} not found`);
      return false;
    }

    // Check if already verified
    if (user[0].isVerified) {
      console.log(`✅ User ${user[0].username} (ID: ${userId}) is already verified`);
      return true;
    }

    // Update user verification status
    await db.update(users)
      .set({ 
        isVerified: true,
        verificationCode: null,
        verificationCodeExpires: null
      })
      .where(eq(users.id, userId));

    console.log(`✅ Successfully verified user ${user[0].username} (ID: ${userId})`);
    console.log(`   Email: ${user[0].email}`);
    console.log(`   Name: ${user[0].firstName} ${user[0].lastName}`);
    
    await connection.end();
    return true;

  } catch (error) {
    console.error('❌ Error verifying user:', error);
    return false;
  }
}

// Get user ID from command line arguments
const userId = process.argv[2];

if (!userId) {
  console.log('Usage: node scripts/verify-user.js <USER_ID>');
  console.log('Example: node scripts/verify-user.js 6');
  process.exit(1);
}

// Run verification
verifyUser(parseInt(userId)).then((success) => {
  process.exit(success ? 0 : 1);
});
