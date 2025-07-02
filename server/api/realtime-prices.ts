import type { Request, Response } from "express";
import axios from "axios";

let priceCache: any = null;
let lastCacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

interface CryptoTicker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
}

export async function getRealtimePrices(req: Request, res: Response) {
  try {
    const now = Date.now();
    
    // Use cache if available and fresh
    if (priceCache && (now - lastCacheTime) < CACHE_DURATION) {
      return res.json({ success: true, data: priceCache });
    }

    console.log('🚀 Fetching fresh CoinGecko data...');
    
    // Direct API call to CoinGecko for essential coins
    const API_KEY = process.env.COINGECKO_API_KEY || '';
    if (!API_KEY) {
      throw new Error('CoinGecko API key not configured');
    }

    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'bitcoin,ethereum,tether,binancecoin,solana,ripple,dogecoin,cardano',
        vs_currencies: 'usd',
        include_24hr_change: 'true',
        include_24hr_vol: 'true',
        include_market_cap: 'true'
      },
      headers: {
        'x-cg-demo-api-key': API_KEY,
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    console.log('✅ CoinGecko response received:', Object.keys(response.data));

    // Transform data
    const coinMapping = {
      'bitcoin': { symbol: 'BTC', name: 'Bitcoin' },
      'ethereum': { symbol: 'ETH', name: 'Ethereum' },
      'tether': { symbol: 'USDT', name: 'Tether' },
      'binancecoin': { symbol: 'BNB', name: 'BNB' },
      'solana': { symbol: 'SOL', name: 'Solana' },
      'ripple': { symbol: 'XRP', name: 'XRP' },
      'dogecoin': { symbol: 'DOGE', name: 'Dogecoin' },
      'cardano': { symbol: 'ADA', name: 'Cardano' }
    };
    
    const tickers: CryptoTicker[] = [];
    
    for (const [coinId, coinInfo] of Object.entries(coinMapping)) {
      if (response.data[coinId]) {
        const coinData = response.data[coinId];
        tickers.push({
          symbol: coinInfo.symbol,
          name: coinInfo.name,
          price: coinData.usd,
          change: coinData.usd_24h_change || 0,
          volume: coinData.usd_24h_vol || 0,
          marketCap: coinData.usd_market_cap || 0
        });
        console.log(`✅ ${coinInfo.symbol}: $${coinData.usd.toFixed(2)}`);
      }
    }
    
    // Update cache
    priceCache = tickers;
    lastCacheTime = now;
    
    console.log(`🎉 Successfully fetched ${tickers.length} crypto prices`);
    res.json({ success: true, data: tickers });
    
  } catch (error) {
    console.error('❌ Error fetching realtime prices:', error);
    
    // Return cached data if available, even if stale
    if (priceCache) {
      console.log('📦 Returning cached data due to error');
      return res.json({ success: true, data: priceCache, cached: true });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch cryptocurrency prices',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}