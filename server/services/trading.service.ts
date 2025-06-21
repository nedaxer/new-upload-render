import { db } from '../db';
import { 
  User, 
  Transaction, 
  UserBalance, 
  Currency,
  transactions, 
  userBalances, 
  currencies,
  marketPrices,
  MarketPrice
} from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { fetchPriceFromExternalAPI } from './price.service';

class TradingService {
  /**
   * Find a user's balance for a specific currency
   */
  async getUserBalance(userId: number, currencyId: number): Promise<UserBalance | undefined> {
    const result = await db
      .select()
      .from(userBalances)
      .where(
        and(
          eq(userBalances.userId, userId),
          eq(userBalances.currencyId, currencyId)
        )
      );
    return result.length > 0 ? result[0] : undefined;
  }

  /**
   * Get all balances for a user
   */
  async getAllUserBalances(userId: number): Promise<(UserBalance & { currency: Currency })[]> {
    const result = await db
      .select({
        balance: userBalances,
        currency: currencies
      })
      .from(userBalances)
      .innerJoin(currencies, eq(userBalances.currencyId, currencies.id))
      .where(eq(userBalances.userId, userId));
    
    return result.map(row => ({
      ...row.balance,
      currency: row.currency
    }));
  }

  /**
   * Create or update a user's balance
   */
  async updateUserBalance(userId: number, currencyId: number, amount: number): Promise<UserBalance> {
    const existingBalance = await this.getUserBalance(userId, currencyId);
    
    if (existingBalance) {
      // Update existing balance
      const newBalance = existingBalance.balance + amount;
      if (newBalance < 0) {
        throw new Error('Insufficient balance');
      }
      
      const [updatedBalance] = await db
        .update(userBalances)
        .set({ 
          balance: newBalance,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(userBalances.userId, userId),
            eq(userBalances.currencyId, currencyId)
          )
        )
        .returning();
      
      return updatedBalance;
    } else {
      // Create new balance
      if (amount < 0) {
        throw new Error('Cannot create negative balance');
      }
      
      const [newBalance] = await db
        .insert(userBalances)
        .values({
          userId,
          currencyId,
          balance: amount < 0 ? 0 : amount, // Ensure balance never starts negative
          updatedAt: new Date()
        })
        .returning();
      
      return newBalance;
    }
  }

  /**
   * Get the latest market price for a currency
   */
  async getLatestPrice(currencyId: number): Promise<number> {
    const result = await db
      .select()
      .from(marketPrices)
      .where(eq(marketPrices.currencyId, currencyId))
      .orderBy(desc(marketPrices.timestamp))
      .limit(1);
    
    if (result.length > 0) {
      return result[0].price;
    }
    
    // If no price in database, fetch from external API
    const currency = await db
      .select()
      .from(currencies)
      .where(eq(currencies.id, currencyId))
      .limit(1);
    
    if (currency.length === 0) {
      throw new Error('Currency not found');
    }
    
    const price = await fetchPriceFromExternalAPI(currency[0].symbol);
    
    // Save the price to the database
    await db
      .insert(marketPrices)
      .values({
        currencyId,
        price,
        timestamp: new Date(),
        source: 'API'
      });
    
    return price;
  }

  /**
   * Buy crypto with USD
   */
  async buyCrypto(
    userId: number, 
    fromCurrencyId: number, 
    toCurrencyId: number, 
    amount: number
  ): Promise<Transaction> {
    // Get latest price of the crypto
    const price = await this.getLatestPrice(toCurrencyId);
    
    // Calculate the amount of crypto to buy
    const cryptoAmount = amount / price;
    
    // Deduct USD from user's account
    await this.updateUserBalance(userId, fromCurrencyId, -amount);
    
    // Add crypto to user's account
    await this.updateUserBalance(userId, toCurrencyId, cryptoAmount);
    
    // Record the transaction
    const [transaction] = await db
      .insert(transactions)
      .values({
        userId,
        type: 'trade_buy',
        sourceId: fromCurrencyId,
        sourceAmount: amount,
        targetId: toCurrencyId,
        targetAmount: cryptoAmount,
        fee: 0, // No fee for now
        status: 'completed',
        metadata: { price },
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return transaction;
  }

  /**
   * Sell crypto for USD
   */
  async sellCrypto(
    userId: number, 
    fromCurrencyId: number, 
    toCurrencyId: number, 
    amount: number
  ): Promise<Transaction> {
    // Get latest price of the crypto
    const price = await this.getLatestPrice(fromCurrencyId);
    
    // Calculate the amount of USD to receive
    const usdAmount = amount * price;
    
    // Deduct crypto from user's account
    await this.updateUserBalance(userId, fromCurrencyId, -amount);
    
    // Add USD to user's account
    await this.updateUserBalance(userId, toCurrencyId, usdAmount);
    
    // Record the transaction
    const [transaction] = await db
      .insert(transactions)
      .values({
        userId,
        type: 'trade_sell',
        sourceId: fromCurrencyId,
        sourceAmount: amount,
        targetId: toCurrencyId,
        targetAmount: usdAmount,
        fee: 0, // No fee for now
        status: 'completed',
        metadata: { price },
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return transaction;
  }

  /**
   * Get transaction history for a user
   */
  async getUserTransactions(
    userId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<Transaction[]> {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);
    
    return result;
  }

  /**
   * Get detailed transaction history with currency information
   */
  async getUserTransactionsDetailed(
    userId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    const result = await db
      .select({
        transaction: transactions,
        sourceCurrency: currencies,
        targetCurrency: currencies
      })
      .from(transactions)
      .leftJoin(
        currencies, 
        eq(transactions.sourceId, currencies.id)
      )
      .leftJoin(
        currencies, 
        eq(transactions.targetId, currencies.id)
      )
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);
    
    return result.map(row => ({
      ...row.transaction,
      sourceCurrency: row.sourceCurrency,
      targetCurrency: row.targetCurrency
    }));
  }
}

export const tradingService = new TradingService();