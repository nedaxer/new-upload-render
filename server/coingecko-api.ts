import axios from 'axios';

interface CryptoPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  name: string;
  tradingViewSymbol: string;
  coinGeckoId?: string;
  price?: number;
  change?: number;
}

const CRYPTO_PAIRS: CryptoPair[] = [
  // Major Pairs
  { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', name: 'Bitcoin', tradingViewSymbol: 'BYBIT:BTCUSDT', coinGeckoId: 'bitcoin' },
  { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', name: 'Ethereum', tradingViewSymbol: 'BYBIT:ETHUSDT', coinGeckoId: 'ethereum' },
  { symbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT', name: 'Solana', tradingViewSymbol: 'BYBIT:SOLUSDT', coinGeckoId: 'solana' },
  { symbol: 'XRPUSDT', baseAsset: 'XRP', quoteAsset: 'USDT', name: 'XRP', tradingViewSymbol: 'BYBIT:XRPUSDT', coinGeckoId: 'ripple' },
  { symbol: 'DOGEUSDT', baseAsset: 'DOGE', quoteAsset: 'USDT', name: 'Dogecoin', tradingViewSymbol: 'BYBIT:DOGEUSDT', coinGeckoId: 'dogecoin' },
  { symbol: 'ADAUSDT', baseAsset: 'ADA', quoteAsset: 'USDT', name: 'Cardano', tradingViewSymbol: 'BYBIT:ADAUSDT', coinGeckoId: 'cardano' },
  { symbol: 'BNBUSDT', baseAsset: 'BNB', quoteAsset: 'USDT', name: 'BNB', tradingViewSymbol: 'BYBIT:BNBUSDT', coinGeckoId: 'binancecoin' },
  { symbol: 'LTCUSDT', baseAsset: 'LTC', quoteAsset: 'USDT', name: 'Litecoin', tradingViewSymbol: 'BYBIT:LTCUSDT', coinGeckoId: 'litecoin' },
  { symbol: 'DOTUSDT', baseAsset: 'DOT', quoteAsset: 'USDT', name: 'Polkadot', tradingViewSymbol: 'BYBIT:DOTUSDT', coinGeckoId: 'polkadot' },
  { symbol: 'AVAXUSDT', baseAsset: 'AVAX', quoteAsset: 'USDT', name: 'Avalanche', tradingViewSymbol: 'BYBIT:AVAXUSDT', coinGeckoId: 'avalanche-2' },
  { symbol: 'MATICUSDT', baseAsset: 'MATIC', quoteAsset: 'USDT', name: 'Polygon', tradingViewSymbol: 'BYBIT:MATICUSDT', coinGeckoId: 'matic-network' },
  { symbol: 'LINKUSDT', baseAsset: 'LINK', quoteAsset: 'USDT', name: 'Chainlink', tradingViewSymbol: 'BYBIT:LINKUSDT', coinGeckoId: 'chainlink' },
  { symbol: 'UNIUSDT', baseAsset: 'UNI', quoteAsset: 'USDT', name: 'Uniswap', tradingViewSymbol: 'BYBIT:UNIUSDT', coinGeckoId: 'uniswap' },
  { symbol: 'BCHUSDT', baseAsset: 'BCH', quoteAsset: 'USDT', name: 'Bitcoin Cash', tradingViewSymbol: 'BYBIT:BCHUSDT', coinGeckoId: 'bitcoin-cash' },
  { symbol: 'TRXUSDT', baseAsset: 'TRX', quoteAsset: 'USDT', name: 'TRON', tradingViewSymbol: 'BYBIT:TRXUSDT', coinGeckoId: 'tron' },
  { symbol: 'ATOMUSDT', baseAsset: 'ATOM', quoteAsset: 'USDT', name: 'Cosmos', tradingViewSymbol: 'BYBIT:ATOMUSDT', coinGeckoId: 'cosmos' },
  { symbol: 'NEARUSDT', baseAsset: 'NEAR', quoteAsset: 'USDT', name: 'NEAR Protocol', tradingViewSymbol: 'BYBIT:NEARUSDT', coinGeckoId: 'near' },
  { symbol: 'FTMUSDT', baseAsset: 'FTM', quoteAsset: 'USDT', name: 'Fantom', tradingViewSymbol: 'BYBIT:FTMUSDT', coinGeckoId: 'fantom' },
  { symbol: 'ARBUSDT', baseAsset: 'ARB', quoteAsset: 'USDT', name: 'Arbitrum', tradingViewSymbol: 'BYBIT:ARBUSDT', coinGeckoId: 'arbitrum' },
  { symbol: 'OPUSDT', baseAsset: 'OP', quoteAsset: 'USDT', name: 'Optimism', tradingViewSymbol: 'BYBIT:OPUSDT', coinGeckoId: 'optimism' },
  { symbol: 'APTUSDT', baseAsset: 'APT', quoteAsset: 'USDT', name: 'Aptos', tradingViewSymbol: 'BYBIT:APTUSDT', coinGeckoId: 'aptos' },
  { symbol: 'PEPEUSDT', baseAsset: 'PEPE', quoteAsset: 'USDT', name: 'Pepe', tradingViewSymbol: 'BYBIT:PEPEUSDT', coinGeckoId: 'pepe' },
  { symbol: 'SHIBUSDT', baseAsset: 'SHIB', quoteAsset: 'USDT', name: 'Shiba Inu', tradingViewSymbol: 'BYBIT:SHIBUSDT', coinGeckoId: 'shiba-inu' },
  { symbol: 'WIFUSDT', baseAsset: 'WIF', quoteAsset: 'USDT', name: 'dogwifhat', tradingViewSymbol: 'BYBIT:WIFUSDT', coinGeckoId: 'dogwifcoin' },
  { symbol: 'BONKUSDT', baseAsset: 'BONK', quoteAsset: 'USDT', name: 'Bonk', tradingViewSymbol: 'BYBIT:BONKUSDT', coinGeckoId: 'bonk' },
  { symbol: 'MNTUSDT', baseAsset: 'MNT', quoteAsset: 'USDT', name: 'Mantle', tradingViewSymbol: 'BYBIT:MNTUSDT', coinGeckoId: 'mantle' },
  { symbol: 'SUIUSDT', baseAsset: 'SUI', quoteAsset: 'USDT', name: 'Sui', tradingViewSymbol: 'BYBIT:SUIUSDT', coinGeckoId: 'sui' },
  { symbol: 'SEIUSDT', baseAsset: 'SEI', quoteAsset: 'USDT', name: 'Sei', tradingViewSymbol: 'BYBIT:SEIUSDT', coinGeckoId: 'sei-network' },
  { symbol: 'APEUSDT', baseAsset: 'APE', quoteAsset: 'USDT', name: 'ApeCoin', tradingViewSymbol: 'BYBIT:APEUSDT', coinGeckoId: 'apecoin' },
  { symbol: 'DYDXUSDT', baseAsset: 'DYDX', quoteAsset: 'USDT', name: 'dYdX', tradingViewSymbol: 'BYBIT:DYDXUSDT', coinGeckoId: 'dydx' }
];

interface CoinGeckoPrice {
  usd: number;
  usd_24h_change: number;
  usd_24h_vol: number;
  usd_market_cap: number;
}

interface CryptoTicker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  high24h?: number;
  low24h?: number;
}

export async function getCoinGeckoPrices(): Promise<CryptoTicker[]> {
  try {
    const API_KEY = process.env.COINGECKO_API_KEY;
    if (!API_KEY) {
      throw new Error('CoinGecko API key not configured');
    }

    // Get all coinGeckoIds from our crypto pairs
    const coinIds = CRYPTO_PAIRS
      .filter(pair => pair.coinGeckoId)
      .map(pair => pair.coinGeckoId!)
      .join(',');

    console.log('Fetching CoinGecko prices for coins:', coinIds.split(',').length);

    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
      params: {
        ids: coinIds,
        vs_currencies: 'usd',
        include_24hr_change: 'true',
        include_24hr_vol: 'true',
        include_market_cap: 'true'
      },
      headers: {
        'x-cg-demo-api-key': API_KEY
      },
      timeout: 15000
    });

    // Transform data to match our crypto pairs
    const tickers: CryptoTicker[] = [];
    
    CRYPTO_PAIRS.forEach(pair => {
      if (pair.coinGeckoId && response.data[pair.coinGeckoId]) {
        const coinData: CoinGeckoPrice = response.data[pair.coinGeckoId];
        tickers.push({
          symbol: pair.symbol,
          name: pair.name,
          price: coinData.usd,
          change: coinData.usd_24h_change || 0,
          volume: coinData.usd_24h_vol || 0,
          marketCap: coinData.usd_market_cap || 0
        });
      }
    });

    console.log(`Successfully fetched ${tickers.length} crypto prices from CoinGecko`);
    return tickers;
  } catch (error) {
    console.error('CoinGecko API error:', error);
    throw error;
  }
}

export async function getCoinGeckoPrice(coinGeckoId: string): Promise<CryptoTicker | null> {
  try {
    const API_KEY = process.env.COINGECKO_API_KEY;
    if (!API_KEY) {
      throw new Error('CoinGecko API key not configured');
    }

    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
      params: {
        ids: coinGeckoId,
        vs_currencies: 'usd',
        include_24hr_change: 'true',
        include_24hr_vol: 'true',
        include_market_cap: 'true'
      },
      headers: {
        'x-cg-demo-api-key': API_KEY
      },
      timeout: 10000
    });

    if (response.data[coinGeckoId]) {
      const coinData: CoinGeckoPrice = response.data[coinGeckoId];
      const pair = CRYPTO_PAIRS.find(p => p.coinGeckoId === coinGeckoId);
      
      return {
        symbol: pair?.symbol || coinGeckoId.toUpperCase(),
        name: pair?.name || coinGeckoId,
        price: coinData.usd,
        change: coinData.usd_24h_change || 0,
        volume: coinData.usd_24h_vol || 0,
        marketCap: coinData.usd_market_cap || 0
      };
    }

    return null;
  } catch (error) {
    console.error(`CoinGecko price fetch error for ${coinGeckoId}:`, error);
    return null;
  }
}

// Helper function to get symbol from coinGeckoId
export function getSymbolFromCoinGeckoId(coinGeckoId: string): string {
  const pair = CRYPTO_PAIRS.find(p => p.coinGeckoId === coinGeckoId);
  return pair?.symbol || `${coinGeckoId.toUpperCase()}USDT`;
}

// Helper function to get name from coinGeckoId
export function getNameFromCoinGeckoId(coinGeckoId: string): string {
  const pair = CRYPTO_PAIRS.find(p => p.coinGeckoId === coinGeckoId);
  return pair?.name || coinGeckoId;
}