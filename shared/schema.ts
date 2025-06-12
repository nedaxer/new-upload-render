import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, primaryKey, uuid, json, real, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User-related tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
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
  totalPortfolioValue: doublePrecision("total_portfolio_value").default(0).notNull(),
  riskLevel: text("risk_level").default("moderate").notNull(), // conservative, moderate, aggressive
});

export const usersRelations = relations(users, ({ many }) => ({
  balances: many(userBalances),
  wallets: many(userWallets),
  transactions: many(transactions),
  stakingPositions: many(stakingPositions)
}));

// Currency types
export const currencies = pgTable("currencies", {
  id: serial("id").primaryKey(),
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
export const userBalances = pgTable("user_balances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  currencyId: integer("currency_id").notNull().references(() => currencies.id),
  balance: doublePrecision("balance").notNull().default(0),
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
export const userWallets = pgTable("user_wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  currencyId: integer("currency_id").notNull().references(() => currencies.id),
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
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // deposit, withdrawal, trade_buy, trade_sell, stake, unstake, reward
  sourceId: integer("source_id").references(() => currencies.id), // From currency (null for deposits)
  sourceAmount: doublePrecision("source_amount").default(0),
  targetId: integer("target_id").references(() => currencies.id), // To currency (null for withdrawals)
  targetAmount: doublePrecision("target_amount").default(0),
  fee: doublePrecision("fee").default(0),
  status: text("status").notNull(), // pending, completed, failed
  txHash: text("tx_hash"), // Blockchain transaction hash (for deposits/withdrawals)
  metadata: json("metadata"), // Optional additional data about transaction
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
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
export const stakingRates = pgTable("staking_rates", {
  id: serial("id").primaryKey(),
  currencyId: integer("currency_id").notNull().references(() => currencies.id),
  rate: real("rate").notNull(), // Annual percentage rate (e.g., 0.05 for 5%)
  minAmount: doublePrecision("min_amount").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const stakingRatesRelations = relations(stakingRates, ({ one }) => ({
  currency: one(currencies, {
    fields: [stakingRates.currencyId],
    references: [currencies.id]
  })
}));

// User staking positions
export const stakingPositions = pgTable("staking_positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  currencyId: integer("currency_id").notNull().references(() => currencies.id),
  amount: doublePrecision("amount").notNull(),
  rate: real("rate").notNull(), // Rate at time of staking
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endsAt: timestamp("ends_at"), // Optional end date (null for indefinite)
  lastRewardAt: timestamp("last_reward_at").defaultNow().notNull(),
  accumulatedRewards: doublePrecision("accumulated_rewards").default(0).notNull(),
  status: text("status").notNull(), // active, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
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

// Market price data with OHLCV
export const marketPrices = pgTable("market_prices", {
  id: serial("id").primaryKey(),
  currencyId: integer("currency_id").notNull().references(() => currencies.id),
  open: doublePrecision("open").notNull(),
  high: doublePrecision("high").notNull(),
  low: doublePrecision("low").notNull(),
  close: doublePrecision("close").notNull(),
  volume: doublePrecision("volume").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  interval: text("interval").notNull(), // 1m, 5m, 15m, 1h, 4h, 1d
  source: text("source").notNull(), // API source
});

export const marketPricesRelations = relations(marketPrices, ({ one }) => ({
  currency: one(currencies, {
    fields: [marketPrices.currencyId],
    references: [currencies.id]
  })
}));

// Futures contracts
export const futuresContracts = pgTable("futures_contracts", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(), // BTCUSDT, ETHUSDT
  baseAsset: text("base_asset").notNull(), // BTC, ETH
  quoteAsset: text("quote_asset").notNull(), // USDT
  contractType: text("contract_type").notNull(), // perpetual, quarterly
  expiryDate: timestamp("expiry_date"), // null for perpetual
  tickSize: doublePrecision("tick_size").notNull(),
  minQty: doublePrecision("min_qty").notNull(),
  maxQty: doublePrecision("max_qty").notNull(),
  leverage: doublePrecision("leverage").notNull().default(1),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Futures positions
export const futuresPositions = pgTable("futures_positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contractId: integer("contract_id").notNull().references(() => futuresContracts.id),
  side: text("side").notNull(), // long, short
  size: doublePrecision("size").notNull(),
  entryPrice: doublePrecision("entry_price").notNull(),
  markPrice: doublePrecision("mark_price").notNull(),
  leverage: doublePrecision("leverage").notNull(),
  margin: doublePrecision("margin").notNull(),
  pnl: doublePrecision("pnl").default(0).notNull(),
  unrealizedPnl: doublePrecision("unrealized_pnl").default(0).notNull(),
  status: text("status").notNull(), // open, closed, liquidated
  stopLoss: doublePrecision("stop_loss"),
  takeProfit: doublePrecision("take_profit"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

// Spot trading orders
export const spotOrders = pgTable("spot_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  symbol: text("symbol").notNull(), // BTCUSDT
  side: text("side").notNull(), // buy, sell
  type: text("type").notNull(), // market, limit, stop_loss, take_profit
  quantity: doublePrecision("quantity").notNull(),
  price: doublePrecision("price"),
  stopPrice: doublePrecision("stop_price"),
  executedQty: doublePrecision("executed_qty").default(0),
  status: text("status").notNull(), // new, partially_filled, filled, canceled, expired
  timeInForce: text("time_in_force").default("GTC"), // GTC, IOC, FOK
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const spotOrdersRelations = relations(spotOrders, ({ one }) => ({
  user: one(users, {
    fields: [spotOrders.userId],
    references: [users.id]
  })
}));

// Futures trading orders
export const futuresOrders = pgTable("futures_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contractId: integer("contract_id").notNull().references(() => futuresContracts.id),
  side: text("side").notNull(), // buy, sell
  type: text("type").notNull(), // market, limit, stop_market, stop_limit
  quantity: doublePrecision("quantity").notNull(),
  price: doublePrecision("price"),
  stopPrice: doublePrecision("stop_price"),
  executedQty: doublePrecision("executed_qty").default(0),
  leverage: doublePrecision("leverage").notNull(),
  status: text("status").notNull(), // new, partially_filled, filled, canceled, expired
  timeInForce: text("time_in_force").default("GTC"),
  reduceOnly: boolean("reduce_only").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
export const portfolioSnapshots = pgTable("portfolio_snapshots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  totalValue: doublePrecision("total_value").notNull(),
  spotValue: doublePrecision("spot_value").notNull(),
  futuresValue: doublePrecision("futures_value").notNull(),
  stakingValue: doublePrecision("staking_value").notNull(),
  totalPnl: doublePrecision("total_pnl").notNull(),
  dailyPnl: doublePrecision("daily_pnl").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const portfolioSnapshotsRelations = relations(portfolioSnapshots, ({ one }) => ({
  user: one(users, {
    fields: [portfolioSnapshots.userId],
    references: [users.id]
  })
}));

// Deposit/Withdrawal addresses
export const depositAddresses = pgTable("deposit_addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  currencyId: integer("currency_id").notNull().references(() => currencies.id),
  address: text("address").notNull(),
  network: text("network").notNull(), // mainnet, testnet, polygon, bsc
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

// Admin fund credits (for admin to add funds to user accounts)
export const adminCredits = pgTable("admin_credits", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => users.id),
  userId: integer("user_id").notNull().references(() => users.id),
  currencyId: integer("currency_id").notNull().references(() => currencies.id),
  amount: doublePrecision("amount").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminCreditsRelations = relations(adminCredits, ({ one }) => ({
  admin: one(users, {
    fields: [adminCredits.adminId],
    references: [users.id]
  }),
  user: one(users, {
    fields: [adminCredits.userId],
    references: [users.id]
  }),
  currency: one(currencies, {
    fields: [adminCredits.currencyId],
    references: [currencies.id]
  })
}));

// Schema for creating users
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
});

// Schema for inserting currencies
export const insertCurrencySchema = createInsertSchema(currencies);

// Schema for inserting balances
export const insertBalanceSchema = createInsertSchema(userBalances);

// Schema for inserting wallets
export const insertWalletSchema = createInsertSchema(userWallets);

// Schema for inserting transactions
export const insertTransactionSchema = createInsertSchema(transactions);

// Schema for inserting staking rates
export const insertStakingRateSchema = createInsertSchema(stakingRates);

// Schema for inserting staking positions
export const insertStakingPositionSchema = createInsertSchema(stakingPositions);

// Type exports
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

export const insertMarketPriceSchema = createInsertSchema(marketPrices);
export type InsertMarketPrice = z.infer<typeof insertMarketPriceSchema>;
export type MarketPrice = typeof marketPrices.$inferSelect;

// Additional schema exports for new features
export const insertFuturesContractSchema = createInsertSchema(futuresContracts);
export type InsertFuturesContract = z.infer<typeof insertFuturesContractSchema>;
export type FuturesContract = typeof futuresContracts.$inferSelect;

export const insertFuturesPositionSchema = createInsertSchema(futuresPositions);
export type InsertFuturesPosition = z.infer<typeof insertFuturesPositionSchema>;
export type FuturesPosition = typeof futuresPositions.$inferSelect;

export const insertSpotOrderSchema = createInsertSchema(spotOrders);
export type InsertSpotOrder = z.infer<typeof insertSpotOrderSchema>;
export type SpotOrder = typeof spotOrders.$inferSelect;

export const insertFuturesOrderSchema = createInsertSchema(futuresOrders);
export type InsertFuturesOrder = z.infer<typeof insertFuturesOrderSchema>;
export type FuturesOrder = typeof futuresOrders.$inferSelect;

export const insertPortfolioSnapshotSchema = createInsertSchema(portfolioSnapshots);
export type InsertPortfolioSnapshot = z.infer<typeof insertPortfolioSnapshotSchema>;
export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect;

export const insertDepositAddressSchema = createInsertSchema(depositAddresses);
export type InsertDepositAddress = z.infer<typeof insertDepositAddressSchema>;
export type DepositAddress = typeof depositAddresses.$inferSelect;

export const insertAdminCreditSchema = createInsertSchema(adminCredits);
export type InsertAdminCredit = z.infer<typeof insertAdminCreditSchema>;
export type AdminCredit = typeof adminCredits.$inferSelect;
