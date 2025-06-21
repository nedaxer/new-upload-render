import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'sql7.freesqldatabase.com',
      port: 3306,
      user: 'sql7785049',
      password: 'k2kSfD5TYV',
      database: 'sql7785049'
    });
    
    console.log('MySQL connection successful');
    
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log('Users in database:', users[0].count);
    
    const [currencies] = await connection.execute('SELECT * FROM currencies');
    console.log('Available currencies:', currencies.map(c => c.symbol).join(', '));
    
    await connection.end();
    console.log('Database test completed successfully');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

testConnection();