import { Balance } from '../models/Balance';
import { Transaction, CryptoCurrency } from '../models/Transaction';
import { connectToDatabase } from '../mongodb';
import { getExchangeRates } from './blockchainService';

/**
 * Buy cryptocurrency with USD balance
 */
export async function buyCrypto(
  userId: string,
  currency: CryptoCurrency,
  usdAmount: number
): Promise<{ success: boolean; message: string; transaction?: any }> {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get user balance
    const userBalance = await Balance.findOne({ userId });
    
    // Check if user has a balance record
    if (!userBalance) {
      return { 
        success: false, 
        message: 'User balance not found. Please deposit funds first.' 
      };
    }
    
    // Check if user has enough USD balance
    if (userBalance.usdBalance < usdAmount) {
      return { 
        success: false, 
        message: `Insufficient USD balance. Available: $${userBalance.usdBalance.toFixed(2)}, Required: $${usdAmount.toFixed(2)}` 
      };
    }
    
    // Get current exchange rates
    const rates = await getExchangeRates();
    
    // Calculate amount of crypto to buy
    const cryptoAmount = usdAmount / rates[currency];
    
    // Create transaction record
    const transaction = new Transaction({
      userId,
      type: 'buy',
      amount: cryptoAmount,
      usdAmount,
      cryptoCurrency: currency,
      exchangeRate: rates[currency],
      status: 'completed',
      details: `Bought ${cryptoAmount.toFixed(8)} ${currency} for $${usdAmount.toFixed(2)}`
    });
    
    await transaction.save();
    
    // Update user balance
    userBalance.usdBalance -= usdAmount;
    
    // Update specific crypto balance
    switch (currency) {
      case 'BTC':
        userBalance.btcBalance += cryptoAmount;
        break;
      case 'ETH':
        userBalance.ethBalance += cryptoAmount;
        break;
      case 'BNB':
        userBalance.bnbBalance += cryptoAmount;
        break;
      case 'USDT':
        userBalance.usdtBalance += cryptoAmount;
        break;
    }
    
    await userBalance.save();
    
    return {
      success: true,
      message: `Successfully bought ${cryptoAmount.toFixed(8)} ${currency}`,
      transaction: {
        id: transaction._id,
        type: transaction.type,
        amount: cryptoAmount,
        usdAmount,
        cryptoCurrency: currency,
        exchangeRate: rates[currency],
        date: transaction.createdAt
      }
    };
  } catch (error) {
    console.error('Error buying crypto:', error);
    return {
      success: false,
      message: 'An error occurred while processing your purchase'
    };
  }
}

/**
 * Sell cryptocurrency for USD
 */
export async function sellCrypto(
  userId: string,
  currency: CryptoCurrency,
  cryptoAmount: number
): Promise<{ success: boolean; message: string; transaction?: any }> {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get user balance
    const userBalance = await Balance.findOne({ userId });
    
    // Check if user has a balance record
    if (!userBalance) {
      return { 
        success: false, 
        message: 'User balance not found' 
      };
    }
    
    // Check if user has enough crypto balance
    let currentCryptoBalance = 0;
    
    switch (currency) {
      case 'BTC':
        currentCryptoBalance = userBalance.btcBalance;
        break;
      case 'ETH':
        currentCryptoBalance = userBalance.ethBalance;
        break;
      case 'BNB':
        currentCryptoBalance = userBalance.bnbBalance;
        break;
      case 'USDT':
        currentCryptoBalance = userBalance.usdtBalance;
        break;
    }
    
    if (currentCryptoBalance < cryptoAmount) {
      return { 
        success: false, 
        message: `Insufficient ${currency} balance. Available: ${currentCryptoBalance.toFixed(8)}, Required: ${cryptoAmount.toFixed(8)}` 
      };
    }
    
    // Get current exchange rates
    const rates = await getExchangeRates();
    
    // Calculate USD amount to receive
    const usdAmount = cryptoAmount * rates[currency];
    
    // Create transaction record
    const transaction = new Transaction({
      userId,
      type: 'sell',
      amount: cryptoAmount,
      usdAmount,
      cryptoCurrency: currency,
      exchangeRate: rates[currency],
      status: 'completed',
      details: `Sold ${cryptoAmount.toFixed(8)} ${currency} for $${usdAmount.toFixed(2)}`
    });
    
    await transaction.save();
    
    // Update user balance
    userBalance.usdBalance += usdAmount;
    
    // Update specific crypto balance
    switch (currency) {
      case 'BTC':
        userBalance.btcBalance -= cryptoAmount;
        break;
      case 'ETH':
        userBalance.ethBalance -= cryptoAmount;
        break;
      case 'BNB':
        userBalance.bnbBalance -= cryptoAmount;
        break;
      case 'USDT':
        userBalance.usdtBalance -= cryptoAmount;
        break;
    }
    
    await userBalance.save();
    
    return {
      success: true,
      message: `Successfully sold ${cryptoAmount.toFixed(8)} ${currency} for $${usdAmount.toFixed(2)}`,
      transaction: {
        id: transaction._id,
        type: transaction.type,
        amount: cryptoAmount,
        usdAmount,
        cryptoCurrency: currency,
        exchangeRate: rates[currency],
        date: transaction.createdAt
      }
    };
  } catch (error) {
    console.error('Error selling crypto:', error);
    return {
      success: false,
      message: 'An error occurred while processing your sale'
    };
  }
}

/**
 * Get user portfolio summary
 */
export async function getUserPortfolio(userId: string): Promise<{
  usdBalance: number;
  cryptoBalances: {
    currency: CryptoCurrency;
    amount: number;
    usdValue: number;
  }[];
  totalValue: number;
}> {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get user balance
    const userBalance = await Balance.findOne({ userId });
    
    // Check if user has a balance record
    if (!userBalance) {
      // Return default empty portfolio
      return {
        usdBalance: 0,
        cryptoBalances: [],
        totalValue: 0
      };
    }
    
    // Get current exchange rates
    const rates = await getExchangeRates();
    
    // Calculate crypto balances with USD value
    const cryptoBalances = [
      {
        currency: 'BTC' as CryptoCurrency,
        amount: userBalance.btcBalance,
        usdValue: userBalance.btcBalance * rates.BTC
      },
      {
        currency: 'ETH' as CryptoCurrency,
        amount: userBalance.ethBalance,
        usdValue: userBalance.ethBalance * rates.ETH
      },
      {
        currency: 'BNB' as CryptoCurrency,
        amount: userBalance.bnbBalance,
        usdValue: userBalance.bnbBalance * rates.BNB
      },
      {
        currency: 'USDT' as CryptoCurrency,
        amount: userBalance.usdtBalance,
        usdValue: userBalance.usdtBalance * rates.USDT
      }
    ].filter(crypto => crypto.amount > 0); // Only include non-zero balances
    
    // Calculate total portfolio value
    const cryptoValue = cryptoBalances.reduce((total, crypto) => total + crypto.usdValue, 0);
    const totalValue = userBalance.usdBalance + cryptoValue;
    
    return {
      usdBalance: userBalance.usdBalance,
      cryptoBalances,
      totalValue
    };
  } catch (error) {
    console.error('Error getting user portfolio:', error);
    throw error;
  }
}