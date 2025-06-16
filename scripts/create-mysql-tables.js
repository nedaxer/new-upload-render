import mysql from 'mysql2/promise';

const createTables = async () => {
  let connection;
  try {
    console.log('Creating database tables...');
    
    connection = await mysql.createConnection({
      host: 'sql7.freesqldatabase.com',
      port: 3306,
      user: 'sql7785049',
      password: 'k2kSfD5TYV',
      database: 'sql7785049',
    });

    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        verification_code VARCHAR(255),
        verification_code_expires TIMESTAMP NULL,
        is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        kyc_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        phone VARCHAR(50),
        country VARCHAR(100),
        total_portfolio_value DOUBLE NOT NULL DEFAULT 0,
        risk_level VARCHAR(50) NOT NULL DEFAULT 'moderate',
        referral_code VARCHAR(255) UNIQUE,
        referred_by INT,
        profile_picture TEXT
      )
    `);
    console.log('✓ Users table created');

    // Currencies table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS currencies (
        id INT PRIMARY KEY AUTO_INCREMENT,
        symbol VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Currencies table created');

    // User balances table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_balances (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        currency_id INT NOT NULL,
        balance DOUBLE NOT NULL DEFAULT 0,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (currency_id) REFERENCES currencies(id)
      )
    `);
    console.log('✓ User balances table created');

    // User wallets table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_wallets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        currency_id INT NOT NULL,
        address TEXT NOT NULL,
        hd_path TEXT NOT NULL,
        private_key_encrypted TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (currency_id) REFERENCES currencies(id)
      )
    `);
    console.log('✓ User wallets table created');

    // Transactions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        type TEXT NOT NULL,
        source_id INT,
        source_amount DOUBLE DEFAULT 0,
        target_id INT,
        target_amount DOUBLE DEFAULT 0,
        fee DOUBLE DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        tx_hash TEXT,
        blockchain_confirmations INT DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        description TEXT,
        metadata JSON,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (source_id) REFERENCES currencies(id),
        FOREIGN KEY (target_id) REFERENCES currencies(id)
      )
    `);
    console.log('✓ Transactions table created');

    // Staking rates table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS staking_rates (
        id INT PRIMARY KEY AUTO_INCREMENT,
        currency_id INT NOT NULL,
        apy DOUBLE NOT NULL,
        minimum_stake DOUBLE NOT NULL DEFAULT 0,
        lockup_period INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (currency_id) REFERENCES currencies(id)
      )
    `);
    console.log('✓ Staking rates table created');

    // Staking positions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS staking_positions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        currency_id INT NOT NULL,
        amount DOUBLE NOT NULL,
        apy DOUBLE NOT NULL,
        lockup_period INT NOT NULL,
        start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        rewards_earned DOUBLE NOT NULL DEFAULT 0,
        last_reward_calculation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (currency_id) REFERENCES currencies(id)
      )
    `);
    console.log('✓ Staking positions table created');

    // Market prices table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS market_prices (
        id INT PRIMARY KEY AUTO_INCREMENT,
        currency_id INT NOT NULL,
        price DOUBLE NOT NULL,
        change_24h DOUBLE NOT NULL DEFAULT 0,
        volume_24h DOUBLE NOT NULL DEFAULT 0,
        market_cap DOUBLE NOT NULL DEFAULT 0,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (currency_id) REFERENCES currencies(id)
      )
    `);
    console.log('✓ Market prices table created');

    // Futures contracts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS futures_contracts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        symbol TEXT NOT NULL,
        base_currency TEXT NOT NULL,
        quote_currency TEXT NOT NULL,
        contract_size DOUBLE NOT NULL DEFAULT 1,
        tick_size DOUBLE NOT NULL DEFAULT 0.01,
        max_leverage INT NOT NULL DEFAULT 100,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_futures_symbol (symbol(50))
      )
    `);
    console.log('✓ Futures contracts table created');

    // Insert default currencies
    await connection.execute(`
      INSERT IGNORE INTO currencies (symbol, name, type, is_active) VALUES
      ('BTC', 'Bitcoin', 'crypto', TRUE),
      ('ETH', 'Ethereum', 'crypto', TRUE),
      ('USDT', 'Tether', 'crypto', TRUE),
      ('USD', 'US Dollar', 'fiat', TRUE),
      ('BNB', 'Binance Coin', 'crypto', TRUE),
      ('ADA', 'Cardano', 'crypto', TRUE),
      ('DOT', 'Polkadot', 'crypto', TRUE),
      ('SOL', 'Solana', 'crypto', TRUE)
    `);
    console.log('✓ Default currencies inserted');

    console.log('✅ All database tables created successfully!');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

createTables();