import axios from 'axios';
import { Currency } from '../models/Currency';
import { MarketPrice } from '../models/MarketPrice';

/**
 * Fetch price from CoinGecko API
 */
async function fetchPriceFromCoinGecko(symbol: string): Promise<number> {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`
    );

    if (response.data && response.data[symbol.toLowerCase()]?.usd) {
      return response.data[symbol.toLowerCase()].usd;
    }
    
    throw new Error('Price not available');
  } catch (error) {
    console.error(`Error fetching price from CoinGecko for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch price from Binance API
 */
async function fetchPriceFromBinance(symbol: string): Promise<number> {
  try {
    // Skip USD as it's always 1
    if (symbol === 'USD') return 1;
    
    const pair = symbol === 'USDT' ? 'USDTUSD' : `${symbol}USDT`;
    const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);

    if (response.data && response.data.price) {
      return parseFloat(response.data.price);
    }
    
    throw new Error('Price not available');
  } catch (error) {
    console.error(`Error fetching price from Binance for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch prices from multiple sources with fallback
 */
export async function fetchPriceFromExternalAPI(symbol: string): Promise<number> {
  // For USD, just return 1
  if (symbol === 'USD') return 1;
  
  try {
    // Try Binance first as it has higher rate limits
    return await fetchPriceFromBinance(symbol);
  } catch (error) {
    try {
      // Fallback to CoinGecko
      return await fetchPriceFromCoinGecko(symbol);
    } catch (error2) {
      // For development use mock prices when APIs fail
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Using mock price for ${symbol} as external APIs failed`);
        const mockPrices: Record<string, number> = {
          BTC: 50000,
          ETH: 3000,
          BNB: 500,
          USDT: 1
        };
        
        return mockPrices[symbol] || 100;
      }
      
      throw new Error(`Failed to fetch price for ${symbol} from all sources`);
    }
  }
}

/**
 * Update prices for all active currencies
 */
export async function updateAllPrices(): Promise<void> {
  try {
    // Get all active currencies
    const currencies = await Currency.find({ isActive: true });
    
    for (const currency of currencies) {
      try {
        // Skip USD as it's always 1
        if (currency.symbol === 'USD') {
          continue;
        }
        
        const price = await fetchPriceFromExternalAPI(currency.symbol);
        
        // Save price to database
        const marketPrice = new MarketPrice({
          currencyId: currency._id,
          price,
          timestamp: new Date(),
          source: 'API'
        });
        
        await marketPrice.save();
        console.log(`Updated price for ${currency.symbol}: $${price}`);
      } catch (error) {
        console.error(`Error updating price for ${currency.symbol}:`, error);
      }
    }
  } catch (error) {
    console.error('Error updating prices:', error);
  }
}

/**
 * Start a background job to periodically update prices
 */
export function startPriceUpdateJob(intervalMinutes: number = 5): NodeJS.Timer {
  console.log(`Starting price update job to run every ${intervalMinutes} minutes`);
  
  // Update prices immediately
  updateAllPrices();
  
  // Then start the interval
  return setInterval(updateAllPrices, intervalMinutes * 60 * 1000);
}

/**
 * Get the latest price for a currency
 */
export async function getLatestPrice(currencySymbol: string): Promise<number> {
  try {
    // For USD, always return 1
    if (currencySymbol === 'USD') return 1;
    
    // Find the currency
    const currency = await Currency.findOne({ symbol: currencySymbol.toUpperCase() });
    
    if (!currency) {
      throw new Error(`Currency ${currencySymbol} not found`);
    }
    
    // Get the latest price from the database
    const latestPrice = await MarketPrice.findOne({ 
      currencyId: currency._id 
    }).sort({ timestamp: -1 });
    
    if (latestPrice) {
      return latestPrice.price;
    }
    
    // If no price in database, fetch from external API
    const price = await fetchPriceFromExternalAPI(currencySymbol);
    
    // Save to database
    const marketPrice = new MarketPrice({
      currencyId: currency._id,
      price,
      timestamp: new Date(),
      source: 'API'
    });
    
    await marketPrice.save();
    
    return price;
  } catch (error) {
    console.error(`Error getting latest price for ${currencySymbol}:`, error);
    
    // For development, return mock price if everything fails
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Using mock price for ${currencySymbol} as fallback`);
      const mockPrices: Record<string, number> = {
        BTC: 50000,
        ETH: 3000,
        BNB: 500,
        USDT: 1
      };
      
      return mockPrices[currencySymbol.toUpperCase()] || 100;
    }
    
    throw error;
  }
}