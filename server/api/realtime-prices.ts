import type { Request, Response } from "express";
import { getCoinGeckoPrices } from "../coingecko-api";

let priceCache: any = null;
let lastCacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

export async function getRealtimePrices(req: Request, res: Response) {
  try {
    const now = Date.now();
    
    // Use cache if available and fresh
    if (priceCache && (now - lastCacheTime) < CACHE_DURATION) {
      return res.json({ success: true, data: priceCache });
    }

    // Fetch fresh data
    const prices = await getCoinGeckoPrices();
    
    // Update cache
    priceCache = prices;
    lastCacheTime = now;
    
    res.json({ success: true, data: prices });
  } catch (error) {
    console.error('Error fetching realtime prices:', error);
    
    // Return cached data if available, even if stale
    if (priceCache) {
      return res.json({ success: true, data: priceCache, cached: true });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch cryptocurrency prices',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}