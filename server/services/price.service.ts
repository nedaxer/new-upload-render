import axios from 'axios';
import { db } from '../db';
import { marketPrices, currencies } from '@shared/schema';
import { eq } from 'drizzle-orm';

// API keys for price providers
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || '';
const BINANCE_API_KEY = process.env.BINANCE_API_KEY || '';

// Set up caching
const priceCache: Record<string, { price: number; timestamp: number }> = {};
const CACHE_DURATION = 60000; // 1 minute in milliseconds

/**
 * Fetch price from CoinGecko API
 */
async function fetchPriceFromCoinGecko(symbol: string): Promise<number> {
  try {
    const formattedSymbol = symbol.toLowerCase();
    const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${formattedSymbol}&vs_currencies=usd`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    // Add API key if available
    if (COINGECKO_API_KEY) {
      headers['x-cg-api-key'] = COINGECKO_API_KEY;
    }
    
    const response = await axios.get(apiUrl, { headers });
    
    if (response.data && response.data[formattedSymbol] && response.data[formattedSymbol].usd) {
      return response.data[formattedSymbol].usd;
    }
    
    throw new Error('Price not found in response');
    
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
    const formattedSymbol = symbol.toUpperCase() + 'USDT';
    const apiUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${formattedSymbol}`;
    
    const response = await axios.get(apiUrl);
    
    if (response.data && response.data.price) {
      return parseFloat(response.data.price);
    }
    
    throw new Error('Price not found in response');
    
  } catch (error) {
    console.error(`Error fetching price from Binance for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch prices from multiple sources with fallback
 */
export async function fetchPriceFromExternalAPI(symbol: string): Promise<number> {
  // Check the cache first
  const cacheKey = symbol.toLowerCase();
  const cached = priceCache[cacheKey];
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.price;
  }
  
  // If it's USD, the price is always 1
  if (symbol.toUpperCase() === 'USD') {
    return 1;
  }
  
  // Try different sources with fallback
  try {
    // Try Binance first
    const price = await fetchPriceFromBinance(symbol);
    
    // Update cache
    priceCache[cacheKey] = {
      price,
      timestamp: Date.now()
    };
    
    return price;
  } catch (error) {
    try {
      // Fall back to CoinGecko
      const price = await fetchPriceFromCoinGecko(symbol);
      
      // Update cache
      priceCache[cacheKey] = {
        price,
        timestamp: Date.now()
      };
      
      return price;
    } catch (secondError) {
      console.error(`All price fetching methods failed for ${symbol}`);
      throw new Error(`Unable to fetch price for ${symbol}`);
    }
  }
}

/**
 * Update prices for all active currencies
 */
export async function updateAllPrices(): Promise<void> {
  try {
    // Get all active currencies except USD
    const allCurrencies = await db
      .select()
      .from(currencies)
      .where(eq(currencies.isActive, true));
    
    for (const currency of allCurrencies) {
      try {
        // Skip USD as its price is always 1
        if (currency.symbol.toUpperCase() === 'USD') {
          continue;
        }
        
        const price = await fetchPriceFromExternalAPI(currency.symbol);
        
        // Store in database
        await db
          .insert(marketPrices)
          .values({
            currencyId: currency.id,
            price,
            timestamp: new Date(),
            source: 'API_SCHEDULED'
          });
        
      } catch (error) {
        console.error(`Failed to update price for ${currency.symbol}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in updateAllPrices:', error);
  }
}

/**
 * Start a background job to periodically update prices
 */
export function startPriceUpdateJob(intervalMinutes: number = 5): NodeJS.Timer {
  const intervalMs = intervalMinutes * 60 * 1000;
  
  // Update prices immediately
  updateAllPrices().catch(error => {
    console.error('Initial price update failed:', error);
  });
  
  // Set up interval for updates
  return setInterval(() => {
    updateAllPrices().catch(error => {
      console.error('Scheduled price update failed:', error);
    });
  }, intervalMs);
}

/**
 * Get the latest price for a currency
 */
export async function getLatestPrice(currencySymbol: string): Promise<number> {
  try {
    // If it's USD, return 1
    if (currencySymbol.toUpperCase() === 'USD') {
      return 1;
    }
    
    // Check the cache first
    const cacheKey = currencySymbol.toLowerCase();
    const cached = priceCache[cacheKey];
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.price;
    }
    
    // Get the currency ID
    const currency = await db
      .select()
      .from(currencies)
      .where(eq(currencies.symbol, currencySymbol.toUpperCase()))
      .limit(1);
    
    if (currency.length === 0) {
      throw new Error(`Currency ${currencySymbol} not found`);
    }
    
    // Check for existing price in the database
    const latestPrice = await db
      .select()
      .from(marketPrices)
      .where(eq(marketPrices.currencyId, currency[0].id))
      .orderBy({ timestamp: 'desc' })
      .limit(1);
    
    if (latestPrice.length > 0) {
      // Update cache
      priceCache[cacheKey] = {
        price: latestPrice[0].price,
        timestamp: Date.now()
      };
      
      return latestPrice[0].price;
    }
    
    // Fetch from external API if not in database
    const price = await fetchPriceFromExternalAPI(currencySymbol);
    
    // Store in database
    await db
      .insert(marketPrices)
      .values({
        currencyId: currency[0].id,
        price,
        timestamp: new Date(),
        source: 'API_ON_DEMAND'
      });
    
    return price;
    
  } catch (error) {
    console.error(`Error getting latest price for ${currencySymbol}:`, error);
    throw error;
  }
}