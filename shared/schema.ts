import { mysqlTable, text, int, boolean, timestamp, double, primaryKey, json, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User-related tables
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  verificationCode: text("verification_code"),
  verificationCodeExpires: timestamp("verification_code_expires"),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  kycStatus: text("kyc_status").default("pending").notNull(), // pending, approved, rejected
  phone: text("phone"),
  country: text("country"),
  totalPortfolioValue: double("total_portfolio_value").default(0).notNull(),
  riskLevel: text("risk_level").default("moderate").notNull(), // conservative, moderate, aggressive
  referralCode: text("referral_code").unique(),
  referredBy: int("referred_by"),
  profilePicture: text("profile_picture"),
});

export const usersRelations = relations(users, ({ many }) => ({
  balances: many(userBalances),
  wallets: many(userWallets),
  transactions: many(transactions),
  stakingPositions: many(stakingPositions)
}));

// Currency types
export const currencies = mysqlTable("currencies", {
  id: int("id").primaryKey().autoincrement(),
  symbol: text("symbol").notNull().unique(), // BTC, ETH, USD, etc.
  name: text("name").notNull(),
  type: text("type").notNull(), // crypto, fiat
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

export const referralEarningsRelations = relations(referralEarnings, ({ one }) => ({
  user: one(users, {
    fields: [referralEarnings.userId],
    references: [users.id]
  }),
  referredUser: one(users, {
    fields: [referralEarnings.referredUserId],
    references: [users.id]
  }),
  currency: one(currencies, {
    fields: [referralEarnings.currencyId],
    references: [currencies.id]
  })
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
  country: true,
  riskLevel: true
});

export const insertCurrencySchema = createInsertSchema(currencies);
export const insertBalanceSchema = createInsertSchema(userBalances);
export const insertWalletSchema = createInsertSchema(userWallets);
export const insertTransactionSchema = createInsertSchema(transactions);
export const insertStakingRateSchema = createInsertSchema(stakingRates);
export const insertStakingPositionSchema = createInsertSchema(stakingPositions);
export const insertMarketPriceSchema = createInsertSchema(marketPrices);
export const insertFuturesContractSchema = createInsertSchema(futuresContracts);
export const insertFuturesPositionSchema = createInsertSchema(futuresPositions);
export const insertSpotOrderSchema = createInsertSchema(spotOrders);
export const insertFuturesOrderSchema = createInsertSchema(futuresOrders);
export const insertPortfolioSnapshotSchema = createInsertSchema(portfolioSnapshots);
export const insertDepositAddressSchema = createInsertSchema(depositAddresses);
export const insertAdminCreditSchema = createInsertSchema(adminCredits);
export const insertReferralEarningSchema = createInsertSchema(referralEarnings);

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCurrency = z.infer<typeof insertCurrencySchema>;
export type Currency = typeof currencies.$inferSelect;

export type InsertUserBalance = z.infer<typeof insertBalanceSchema>;
export type UserBalance = typeof userBalances.$inferSelect;

export type InsertUserWallet = z.infer<typeof insertWalletSchema>;
export type UserWallet = typeof userWallets.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertStakingRate = z.infer<typeof insertStakingRateSchema>;
export type StakingRate = typeof stakingRates.$inferSelect;

export type InsertStakingPosition = z.infer<typeof insertStakingPositionSchema>;
export type StakingPosition = typeof stakingPositions.$inferSelect;

export type InsertMarketPrice = z.infer<typeof insertMarketPriceSchema>;
export type MarketPrice = typeof marketPrices.$inferSelect;

export type InsertFuturesContract = z.infer<typeof insertFuturesContractSchema>;
export type FuturesContract = typeof futuresContracts.$inferSelect;

export type InsertFuturesPosition = z.infer<typeof insertFuturesPositionSchema>;
export type FuturesPosition = typeof futuresPositions.$inferSelect;

export type InsertSpotOrder = z.infer<typeof insertSpotOrderSchema>;
export type SpotOrder = typeof spotOrders.$inferSelect;

export type InsertFuturesOrder = z.infer<typeof insertFuturesOrderSchema>;
export type FuturesOrder = typeof futuresOrders.$inferSelect;

export type InsertPortfolioSnapshot = z.infer<typeof insertPortfolioSnapshotSchema>;
export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect;

export type InsertDepositAddress = z.infer<typeof insertDepositAddressSchema>;
export type DepositAddress = typeof depositAddresses.$inferSelect;

export type InsertAdminCredit = z.infer<typeof insertAdminCreditSchema>;
export type AdminCredit = typeof adminCredits.$inferSelect;

export type InsertReferralEarning = z.infer<typeof insertReferralEarningSchema>;
export type ReferralEarning = typeof referralEarnings.$inferSelect;