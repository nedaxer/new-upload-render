import { Router, Request, Response } from "express";
import { db } from "../db";
import { currencies, marketPrices, futuresContracts } from "../../shared/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import axios from "axios";

const router = Router();

// Cache for market data to avoid excessive API calls
const marketDataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

// Get real-time market data from CoinGecko
router.get("/prices", async (req: Request, res: Response) => {
  try {
    const cacheKey = 'market_prices';
    const cached = marketDataCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json({
        success: true,
        data: cached.data
      });
    }

    // Fetch real market data from CoinGecko
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'bitcoin,ethereum,binancecoin,cardano,polkadot,ripple,solana,polygon,avalanche-2,chainlink,uniswap,litecoin,cosmos',
        vs_currencies: 'usd',
        include_24hr_change: 'true',
        include_24hr_vol: 'true'
      },
      timeout: 5000
    });

    const marketData = Object.entries(response.data).map(([id, data]: [string, any]) => {
      const symbolMap: { [key: string]: string } = {
        'bitcoin': 'BTC',
        'ethereum': 'ETH',
        'binancecoin': 'BNB',
        'cardano': 'ADA',
        'polkadot': 'DOT',
        'ripple': 'XRP',
        'solana': 'SOL',
        'polygon': 'MATIC',
        'avalanche-2': 'AVAX',
        'chainlink': 'LINK',
        'uniswap': 'UNI',
        'litecoin': 'LTC',
        'cosmos': 'ATOM'
      };

      return {
        symbol: symbolMap[id] || id.toUpperCase(),
        price: data.usd,
        change24h: data.usd_24h_change || 0,
        volume24h: data.usd_24h_vol || 0,
        timestamp: new Date().toISOString()
      };
    });

    // Cache the data
    marketDataCache.set(cacheKey, {
      data: marketData,
      timestamp: Date.now()
    });

    res.json({
      success: true,
      data: marketData
    });

  } catch (error) {
    console.error('Market data fetch error:', error);
    
    // Fallback to database data if API fails
    try {
      const dbCurrencies = await db.select({
        symbol: currencies.symbol,
        name: currencies.name
      }).from(currencies).where(eq(currencies.type, 'crypto'));

      const fallbackData = dbCurrencies.map(currency => ({
        symbol: currency.symbol,
        price: Math.random() * 50000 + 1000, // Simulated price for demo
        change24h: (Math.random() - 0.5) * 10,
        volume24h: Math.random() * 1000000000,
        timestamp: new Date().toISOString()
      }));

      res.json({
        success: true,
        data: fallbackData,
        fallback: true
      });
    } catch (dbError) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch market data"
      });
    }
  }
});

// Get historical chart data
router.get("/chart/:symbol", async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h', limit = '100' } = req.query;

    const coinIdMap: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'ADA': 'cardano',
      'DOT': 'polkadot',
      'XRP': 'ripple',
      'SOL': 'solana',
      'MATIC': 'polygon',
      'AVAX': 'avalanche-2',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'LTC': 'litecoin',
      'ATOM': 'cosmos'
    };

    const coinId = coinIdMap[symbol.toUpperCase()];
    if (!coinId) {
      return res.status(404).json({
        success: false,
        message: "Symbol not supported"
      });
    }

    const days = interval === '1d' ? '30' : interval === '1h' ? '7' : '1';
    
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days,
        interval: interval === '1h' ? 'hourly' : 'daily'
      },
      timeout: 10000
    });

    const chartData = response.data.prices.map((point: [number, number], index: number) => ({
      timestamp: point[0],
      open: index > 0 ? response.data.prices[index - 1][1] : point[1],
      high: point[1] * (1 + Math.random() * 0.02),
      low: point[1] * (1 - Math.random() * 0.02),
      close: point[1],
      volume: response.data.total_volumes[index] ? response.data.total_volumes[index][1] : 0
    }));

    res.json({
      success: true,
      data: chartData.slice(-parseInt(limit as string))
    });

  } catch (error) {
    console.error('Chart data fetch error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chart data"
    });
  }
});

// Get futures contracts
router.get("/futures-contracts", async (req: Request, res: Response) => {
  try {
    const contracts = await db.select().from(futuresContracts)
      .where(eq(futuresContracts.isActive, true));

    res.json({
      success: true,
      data: contracts
    });
  } catch (error) {
    console.error('Futures contracts fetch error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch futures contracts"
    });
  }
});

// Get market depth/orderbook simulation
router.get("/orderbook/:symbol", async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    // Simulate orderbook data
    const basePrice = Math.random() * 50000 + 10000;
    const bids = [];
    const asks = [];
    
    // Generate realistic bid/ask data
    for (let i = 0; i < 20; i++) {
      bids.push({
        price: basePrice - (i * basePrice * 0.001),
        quantity: Math.random() * 10 + 0.1,
        total: 0
      });
      
      asks.push({
        price: basePrice + (i * basePrice * 0.001),
        quantity: Math.random() * 10 + 0.1,
        total: 0
      });
    }

    // Calculate cumulative totals
    let bidTotal = 0;
    let askTotal = 0;
    
    bids.forEach(bid => {
      bidTotal += bid.quantity;
      bid.total = bidTotal;
    });
    
    asks.forEach(ask => {
      askTotal += ask.quantity;
      ask.total = askTotal;
    });

    res.json({
      success: true,
      data: {
        symbol,
        bids: bids.reverse(),
        asks,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('Orderbook fetch error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orderbook data"
    });
  }
});

// Get trading pairs
router.get("/trading-pairs", async (req: Request, res: Response) => {
  try {
    const pairs = await db.select({
      symbol: currencies.symbol,
      name: currencies.name,
      type: currencies.type
    }).from(currencies).where(eq(currencies.isActive, true));

    // Generate trading pairs (all crypto vs USDT)
    const cryptoCurrencies = pairs.filter(p => p.type === 'crypto' && p.symbol !== 'USDT');
    const tradingPairs = cryptoCurrencies.map(crypto => ({
      symbol: `${crypto.symbol}USDT`,
      baseAsset: crypto.symbol,
      quoteAsset: 'USDT',
      status: 'TRADING',
      tickSize: crypto.symbol === 'BTC' ? 0.01 : 0.0001,
      minQty: crypto.symbol === 'BTC' ? 0.00001 : 0.001
    }));

    res.json({
      success: true,
      data: tradingPairs
    });
  } catch (error) {
    console.error('Trading pairs fetch error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trading pairs"
    });
  }
});

export default router;