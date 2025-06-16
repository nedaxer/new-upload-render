import axios from 'axios';

interface BybitTicker {
  symbol: string;
  lastPrice: string;
  price24hPcnt: string;
  volume24h: string;
  highPrice24h: string;
  lowPrice24h: string;
  turnover24h: string;
}

interface CoinGeckoTicker {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  market_cap: number;
}

export async function getBybitTickers(): Promise<BybitTicker[]> {
  try {
    // Use CoinGecko API as alternative since Bybit is blocked
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h'
      }
    });

    const coinGeckoData: CoinGeckoTicker[] = response.data;
    
    // Transform CoinGecko data to match Bybit format
    const tickers: BybitTicker[] = coinGeckoData.map(coin => ({
      symbol: `${coin.symbol.toUpperCase()}USDT`,
      lastPrice: coin.current_price.toString(),
      price24hPcnt: (coin.price_change_percentage_24h || 0).toString(),
      volume24h: coin.total_volume.toString(),
      highPrice24h: coin.high_24h.toString(),
      lowPrice24h: coin.low_24h.toString(),
      turnover24h: (coin.total_volume * coin.current_price).toString()
    }));

    return tickers;
  } catch (error) {
    console.error('Error fetching market tickers:', error);
    throw error;
  }
}

export function getMarketSentiment(priceChange: string): 'Bullish' | 'Bearish' | 'Neutral' {
  const change = parseFloat(priceChange);
  if (change > 2) return 'Bullish';
  if (change < -2) return 'Bearish';
  return 'Neutral';
}