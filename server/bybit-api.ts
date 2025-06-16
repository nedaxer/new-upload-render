import axios from 'axios';
import crypto from 'crypto';

const API_KEY = 'NmVlQMpRfwD38YUXzz';
const API_SECRET = 'YrN8mSP5orBSvXWUpexBXJYrtYBvtyZB7wiz';
const BASE_URL = 'https://api.bybit.com';

interface BybitTicker {
  symbol: string;
  lastPrice: string;
  price24hPcnt: string;
  volume24h: string;
  highPrice24h: string;
  lowPrice24h: string;
  turnover24h: string;
}

interface BybitResponse {
  retCode: number;
  retMsg: string;
  result: {
    category: string;
    list: BybitTicker[];
  };
  time: number;
}

function generateSignature(timestamp: string, apiKey: string, recv_window: string, queryString: string): string {
  const param_str = timestamp + apiKey + recv_window + queryString;
  return crypto.createHmac('sha256', API_SECRET).update(param_str).digest('hex');
}

export async function getBybitTickers(): Promise<BybitTicker[]> {
  try {
    const timestamp = Date.now().toString();
    const recv_window = '5000';
    const queryString = 'category=linear';
    
    const signature = generateSignature(timestamp, API_KEY, recv_window, queryString);
    
    const response = await axios.get(`${BASE_URL}/v5/market/tickers`, {
      params: {
        category: 'linear'
      },
      headers: {
        'X-BAPI-API-KEY': API_KEY,
        'X-BAPI-SIGN': signature,
        'X-BAPI-TIMESTAMP': timestamp,
        'X-BAPI-RECV-WINDOW': recv_window,
        'Content-Type': 'application/json'
      }
    });

    const data: BybitResponse = response.data;
    
    if (data.retCode !== 0) {
      throw new Error(`Bybit API error: ${data.retMsg}`);
    }

    return data.result.list;
  } catch (error) {
    console.error('Error fetching Bybit tickers:', error);
    throw error;
  }
}

export function getMarketSentiment(priceChange: string): 'Bullish' | 'Bearish' | 'Neutral' {
  const change = parseFloat(priceChange);
  if (change > 2) return 'Bullish';
  if (change < -2) return 'Bearish';
  return 'Neutral';
}