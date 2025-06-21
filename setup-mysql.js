import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'sql7.freesqldatabase.com',
  port: 3306,
  user: 'sql7785049',
  password: 'k2kSfD5TYV',
  database: 'sql7785049'
});

console.log('Connected to MySQL database');

// Create tables for the trading platform
const createTablesSQL = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  verification_code VARCHAR(255),
  verification_code_expires TIMESTAMP NULL,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE NOT NULL,
  kyc_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  phone VARCHAR(50),
  country VARCHAR(100),
  total_portfolio_value DOUBLE DEFAULT 0 NOT NULL,
  risk_level VARCHAR(50) DEFAULT 'moderate' NOT NULL,
  referral_code VARCHAR(255) UNIQUE,
  referred_by INT,
  profile_picture TEXT
);

CREATE TABLE IF NOT EXISTS currencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS user_balances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  currency_id INT NOT NULL,
  balance DOUBLE DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (currency_id) REFERENCES currencies(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  source_id INT,
  source_amount DOUBLE DEFAULT 0,
  target_id INT,
  target_amount DOUBLE DEFAULT 0,
  fee DOUBLE DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  tx_hash VARCHAR(255),
  blockchain_confirmations INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  completed_at TIMESTAMP NULL,
  description TEXT,
  metadata TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (source_id) REFERENCES currencies(id),
  FOREIGN KEY (target_id) REFERENCES currencies(id)
);

CREATE TABLE IF NOT EXISTS staking_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  currency_id INT NOT NULL,
  apy DOUBLE NOT NULL,
  minimum_stake DOUBLE DEFAULT 0 NOT NULL,
  lockup_period INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (currency_id) REFERENCES currencies(id)
);

CREATE TABLE IF NOT EXISTS user_favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  crypto_pair_symbol VARCHAR(50) NOT NULL,
  crypto_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  last_selected_pair VARCHAR(50),
  last_selected_crypto VARCHAR(50),
  last_selected_tab VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`;

// Execute table creation
const statements = createTablesSQL.split(';').filter(stmt => stmt.trim());
for (const statement of statements) {
  if (statement.trim()) {
    await connection.execute(statement);
    console.log('Executed:', statement.substring(0, 50) + '...');
  }
}

// Insert initial currencies
const currencies = [
  ['BTC', 'Bitcoin', 'crypto'],
  ['ETH', 'Ethereum', 'crypto'],
  ['USDT', 'Tether', 'crypto'],
  ['BNB', 'Binance Coin', 'crypto'],
  ['USD', 'US Dollar', 'fiat']
];

for (const [symbol, name, type] of currencies) {
  try {
    await connection.execute(
      'INSERT IGNORE INTO currencies (symbol, name, type) VALUES (?, ?, ?)',
      [symbol, name, type]
    );
    console.log(`Added currency: ${symbol}`);
  } catch (error) {
    console.log(`Currency ${symbol} already exists`);
  }
}

// Insert test user
try {
  await connection.execute(
    'INSERT IGNORE INTO users (username, email, password, first_name, last_name, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
    ['testuser', 'test@example.com', 'password123', 'Test', 'User', true]
  );
  console.log('Added test user');
} catch (error) {
  console.log('Test user already exists');
}

// Add some staking rates
const stakingRates = [
  [1, 5.5], // BTC
  [2, 4.8], // ETH
  [4, 8.2]  // BNB
];

for (const [currencyId, apy] of stakingRates) {
  try {
    await connection.execute(
      'INSERT IGNORE INTO staking_rates (currency_id, apy, minimum_stake) VALUES (?, ?, ?)',
      [currencyId, apy, 0.01]
    );
    console.log(`Added staking rate for currency ${currencyId}: ${apy}%`);
  } catch (error) {
    console.log(`Staking rate for currency ${currencyId} already exists`);
  }
}

await connection.end();
console.log('MySQL database setup completed successfully');