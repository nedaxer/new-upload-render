import { mysqlTable, text, int, boolean, timestamp, double, primaryKey, json, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User-related tables
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  verificationCode: varchar("verification_code", { length: 255 }),
  verificationCodeExpires: timestamp("verification_code_expires"),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  kycStatus: varchar("kyc_status", { length: 50 }).default("pending").notNull(),
  phone: varchar("phone", { length: 50 }),
  country: varchar("country", { length: 100 }),
  totalPortfolioValue: double("total_portfolio_value").default(0).notNull(),
  riskLevel: varchar("risk_level", { length: 50 }).default("moderate").notNull(),
  referralCode: varchar("referral_code", { length: 255 }).unique(),
  referredBy: int("referred_by"),
  profilePicture: text("profile_picture"),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  balances: many(userBalances),
  wallets: many(userWallets),
  transactions: many(transactions),
  stakingPositions: many(stakingPositions),
  favorites: many(userFavorites),
  preferences: one(userPreferences)
}));

// Currency types
export const currencies = mysqlTable("currencies", {
  id: int("id").primaryKey().autoincrement(),
  symbol: varchar("symbol", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const currenciesRelations = relations(currencies, ({ many }) => ({
  balances: many(userBalances),
  stakingRates: many(stakingRates),
  wallets: many(userWallets)
}));

// User balance table
export const userBalances = mysqlTable("user_balances", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  currencyId: int("currency_id").notNull().references(() => currencies.id),
  balance: double("balance").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const userBalancesRelations = relations(userBalances, ({ one }) => ({
  user: one(users, {
    fields: [userBalances.userId],
    references: [users.id]
  }),
  currency: one(currencies, {
    fields: [userBalances.currencyId],
    references: [currencies.id]
  })
}));

// User wallet addresses
export const userWallets = mysqlTable("user_wallets", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  currencyId: int("currency_id").notNull().references(() => currencies.id),
  address: text("address").notNull(),
  hdPath: text("hd_path").notNull(),
  privateKeyEncrypted: text("private_key_encrypted"), // Optional: store encrypted private keys if needed
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const userWalletsRelations = relations(userWallets, ({ one }) => ({
  user: one(users, {
    fields: [userWallets.userId],
    references: [users.id]
  }),
  currency: one(currencies, {
    fields: [userWallets.currencyId],
    references: [currencies.id]
  })
}));

// Transaction types: deposit, withdrawal, trade, stake, unstake
export const transactions = mysqlTable("transactions", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // deposit, withdrawal, trade_buy, trade_sell, stake, unstake, reward
  sourceId: int("source_id").references(() => currencies.id), // From currency (null for deposits)
  sourceAmount: double("source_amount").default(0),
  targetId: int("target_id").references(() => currencies.id), // To currency (null for withdrawals)
  targetAmount: double("target_amount").default(0),
  fee: double("fee").default(0),
  status: text("status").default("pending").notNull(), // pending, completed, failed
  txHash: text("tx_hash"), // Blockchain transaction hash
  blockchainConfirmations: int("blockchain_confirmations").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  description: text("description"),
  metadata: json("metadata") // Additional transaction data
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id]
  }),
  sourceCurrency: one(currencies, {
    fields: [transactions.sourceId],
    references: [currencies.id]
  }),
  targetCurrency: one(currencies, {
    fields: [transactions.targetId],
    references: [currencies.id]
  })
}));

// Staking rates for different currencies
export const stakingRates = mysqlTable("staking_rates", {
  id: int("id").primaryKey().autoincrement(),
  currencyId: int("currency_id").notNull().references(() => currencies.id),
  apy: double("apy").notNull(), // Annual Percentage Yield
  minimumStake: double("minimum_stake").default(0).notNull(),
  lockupPeriod: int("lockup_period").default(0).notNull(), // in days
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const stakingRatesRelations = relations(stakingRates, ({ one }) => ({
  currency: one(currencies, {
    fields: [stakingRates.currencyId],
    references: [currencies.id]
  })
}));

// User staking positions
export const stakingPositions = mysqlTable("staking_positions", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  currencyId: int("currency_id").notNull().references(() => currencies.id),
  amount: double("amount").notNull(),
  apy: double("apy").notNull(), // Rate locked in when staking started
  lockupPeriod: int("lockup_period").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").default("active").notNull(), // active, completed, withdrawn
  rewardsEarned: double("rewards_earned").default(0).notNull(),
  lastRewardCalculation: timestamp("last_reward_calculation").defaultNow().notNull()
});

export const stakingPositionsRelations = relations(stakingPositions, ({ one }) => ({
  user: one(users, {
    fields: [stakingPositions.userId],
    references: [users.id]
  }),
  currency: one(currencies, {
    fields: [stakingPositions.currencyId],
    references: [currencies.id]
  })
}));

// Market prices for cryptocurrencies
export const marketPrices = mysqlTable("market_prices", {
  id: int("id").primaryKey().autoincrement(),
  currencyId: int("currency_id").notNull().references(() => currencies.id),
  price: double("price").notNull(),
  change24h: double("change_24h").default(0).notNull(),
  volume24h: double("volume_24h").default(0).notNull(),
  marketCap: double("market_cap").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const marketPricesRelations = relations(marketPrices, ({ one }) => ({
  currency: one(currencies, {
    fields: [marketPrices.currencyId],
    references: [currencies.id]
  })
}));

// Futures contracts
export const futuresContracts = mysqlTable("futures_contracts", {
  id: int("id").primaryKey().autoincrement(),
  symbol: text("symbol").notNull().unique(), // BTCUSDT, ETHUSDT, etc.
  baseCurrency: text("base_currency").notNull(),
  quoteCurrency: text("quote_currency").notNull(),
  contractSize: double("contract_size").default(1).notNull(),
  tickSize: double("tick_size").default(0.01).notNull(),
  maxLeverage: int("max_leverage").default(100).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Futures positions
export const futuresPositions = mysqlTable("futures_positions", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  contractId: int("contract_id").notNull().references(() => futuresContracts.id),
  side: text("side").notNull(), // long, short
  size: double("size").notNull(),
  entryPrice: double("entry_price").notNull(),
  markPrice: double("mark_price").notNull(),
  leverage: int("leverage").notNull(),
  margin: double("margin").notNull(),
  unrealizedPnl: double("unrealized_pnl").default(0).notNull(),
  realizedPnl: double("realized_pnl").default(0).notNull(),
  status: text("status").default("open").notNull(), // open, closed, liquidated
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at")
});

export const futuresPositionsRelations = relations(futuresPositions, ({ one }) => ({
  user: one(users, {
    fields: [futuresPositions.userId],
    references: [users.id]
  }),
  contract: one(futuresContracts, {
    fields: [futuresPositions.contractId],
    references: [futuresContracts.id]
  })
}));

// Spot orders
export const spotOrders = mysqlTable("spot_orders", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  baseCurrencyId: int("base_currency_id").notNull().references(() => currencies.id),
  quoteCurrencyId: int("quote_currency_id").notNull().references(() => currencies.id),
  side: text("side").notNull(), // buy, sell
  type: text("type").notNull(), // market, limit
  quantity: double("quantity").notNull(),
  price: double("price"), // null for market orders
  filled: double("filled").default(0).notNull(),
  status: text("status").default("open").notNull(), // open, filled, cancelled, partial
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const spotOrdersRelations = relations(spotOrders, ({ one }) => ({
  user: one(users, {
    fields: [spotOrders.userId],
    references: [users.id]
  }),
  baseCurrency: one(currencies, {
    fields: [spotOrders.baseCurrencyId],
    references: [currencies.id]
  }),
  quoteCurrency: one(currencies, {
    fields: [spotOrders.quoteCurrencyId],
    references: [currencies.id]
  })
}));

// Futures orders
export const futuresOrders = mysqlTable("futures_orders", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  contractId: int("contract_id").notNull().references(() => futuresContracts.id),
  side: text("side").notNull(), // buy, sell
  type: text("type").notNull(), // market, limit, stop
  quantity: double("quantity").notNull(),
  price: double("price"), // null for market orders
  stopPrice: double("stop_price"), // for stop orders
  leverage: int("leverage").notNull(),
  filled: double("filled").default(0).notNull(),
  status: text("status").default("open").notNull(), // open, filled, cancelled, partial
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const futuresOrdersRelations = relations(futuresOrders, ({ one }) => ({
  user: one(users, {
    fields: [futuresOrders.userId],
    references: [users.id]
  }),
  contract: one(futuresContracts, {
    fields: [futuresOrders.contractId],
    references: [futuresContracts.id]
  })
}));

// Portfolio snapshots for performance tracking
export const portfolioSnapshots = mysqlTable("portfolio_snapshots", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  totalValue: double("total_value").notNull(),
  spotValue: double("spot_value").default(0).notNull(),
  futuresValue: double("futures_value").default(0).notNull(),
  stakingValue: double("staking_value").default(0).notNull(),
  change24h: double("change_24h").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const portfolioSnapshotsRelations = relations(portfolioSnapshots, ({ one }) => ({
  user: one(users, {
    fields: [portfolioSnapshots.userId],
    references: [users.id]
  })
}));

// Deposit addresses for cryptocurrencies
export const depositAddresses = mysqlTable("deposit_addresses", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  currencyId: int("currency_id").notNull().references(() => currencies.id),
  address: text("address").notNull(),
  tag: text("tag"), // for currencies that require destination tags
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const depositAddressesRelations = relations(depositAddresses, ({ one }) => ({
  user: one(users, {
    fields: [depositAddresses.userId],
    references: [users.id]
  }),
  currency: one(currencies, {
    fields: [depositAddresses.currencyId],
    references: [currencies.id]
  })
}));

// Admin credits system
export const adminCredits = mysqlTable("admin_credits", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  currencyId: int("currency_id").notNull().references(() => currencies.id),
  amount: double("amount").notNull(),
  type: text("type").notNull(), // credit, debit
  reason: text("reason").notNull(),
  adminId: int("admin_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});



export const adminCreditsRelations = relations(adminCredits, ({ one }) => ({
  user: one(users, {
    fields: [adminCredits.userId],
    references: [users.id]
  }),
  currency: one(currencies, {
    fields: [adminCredits.currencyId],
    references: [currencies.id]
  }),
  admin: one(users, {
    fields: [adminCredits.adminId],
    references: [users.id]
  })
}));



// Referral earnings
export const referralEarnings = mysqlTable("referral_earnings", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  referredUserId: int("referred_user_id").notNull().references(() => users.id),
  currencyId: int("currency_id").notNull().references(() => currencies.id),
  amount: double("amount").notNull(),
  type: text("type").notNull(), // trading_fee, deposit_bonus
  status: text("status").default("pending").notNull(), // pending, paid
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at")
});

// User favorites for cryptocurrency pairs
export const userFavorites = mysqlTable("user_favorites", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  cryptoPairSymbol: text("crypto_pair_symbol").notNull(), // e.g., "BTCUSDT", "ETHUSDT"
  cryptoId: text("crypto_id").notNull(), // e.g., "bitcoin", "ethereum"
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// User preferences for trading interface
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  lastSelectedPair: varchar("last_selected_pair", { length: 50 }),
  lastSelectedCrypto: varchar("last_selected_crypto", { length: 50 }),
  lastSelectedTab: varchar("last_selected_tab", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// User notifications system
export const notifications = mysqlTable("notifications", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // deposit, withdrawal, trade, system
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  cryptoSymbol: varchar("crypto_symbol", { length: 10 }), // BTC, ETH, etc.
  amount: double("amount"),
  address: text("address"),
  txHash: text("tx_hash"),
  timestamp: varchar("timestamp", { length: 100 }),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}));

// Admin transaction history
export const adminTransactions = mysqlTable("admin_transactions", {
  id: int("id").primaryKey().autoincrement(),
  adminId: int("admin_id").notNull().references(() => users.id),
  targetUserId: int("target_user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // add_funds, delete_user
  cryptoSymbol: varchar("crypto_symbol", { length: 10 }), // BTC, ETH, USDT, etc.
  network: varchar("network", { length: 50 }), // BEP20, ERC20, etc.
  usdAmount: double("usd_amount"), // Amount in USD
  cryptoAmount: double("crypto_amount"), // Equivalent crypto amount
  sendAddress: text("send_address"), // Virtual send address
  status: varchar("status", { length: 20 }).default("completed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const adminTransactionsRelations = relations(adminTransactions, ({ one }) => ({
  admin: one(users, {
    fields: [adminTransactions.adminId],
    references: [users.id]
  }),
  targetUser: one(users, {
    fields: [adminTransactions.targetUserId],
    references: [users.id]
  })
}));

// Insert schemas using zod
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCurrencySchema = createInsertSchema(currencies).omit({
  id: true,
  createdAt: true,
});

export const insertUserBalanceSchema = createInsertSchema(userBalances).omit({
  id: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertStakingRateSchema = createInsertSchema(stakingRates).omit({
  id: true,
  createdAt: true,
});

export const insertStakingPositionSchema = createInsertSchema(stakingPositions).omit({
  id: true,
  startDate: true,
  lastRewardCalculation: true,
});

export const insertMarketPriceSchema = createInsertSchema(marketPrices).omit({
  id: true,
  updatedAt: true,
});

export const insertSpotOrderSchema = createInsertSchema(spotOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFuturesOrderSchema = createInsertSchema(futuresOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPortfolioSnapshotSchema = createInsertSchema(portfolioSnapshots).omit({
  id: true,
  createdAt: true,
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

export const insertUserPreferenceSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Currency = typeof currencies.$inferSelect;
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;

export type UserBalance = typeof userBalances.$inferSelect;
export type InsertUserBalance = z.infer<typeof insertUserBalanceSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type StakingRate = typeof stakingRates.$inferSelect;
export type InsertStakingRate = z.infer<typeof insertStakingRateSchema>;

export type StakingPosition = typeof stakingPositions.$inferSelect;
export type InsertStakingPosition = z.infer<typeof insertStakingPositionSchema>;

export type MarketPrice = typeof marketPrices.$inferSelect;
export type InsertMarketPrice = z.infer<typeof insertMarketPriceSchema>;

export type SpotOrder = typeof spotOrders.$inferSelect;
export type InsertSpotOrder = z.infer<typeof insertSpotOrderSchema>;

export type FuturesOrder = typeof futuresOrders.$inferSelect;
export type InsertFuturesOrder = z.infer<typeof insertFuturesOrderSchema>;

export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect;
export type InsertPortfolioSnapshot = z.infer<typeof insertPortfolioSnapshotSchema>;

export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = z.infer<typeof insertUserPreferenceSchema>;