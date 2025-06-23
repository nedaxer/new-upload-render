// Cache manager to prevent API calls and data reloading
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes

  // Set data in cache with optional expiry
  set<T>(key: string, data: T, expiry = this.DEFAULT_EXPIRY): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }

  // Get data from cache if not expired
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  // Check if cache has valid data
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Clear specific cache key
  clear(key: string): void {
    this.cache.delete(key);
  }

  // Clear all cache
  clearAll(): void {
    this.cache.clear();
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export const cacheManager = new CacheManager();

// Auto cleanup every 5 minutes
setInterval(() => {
  cacheManager.cleanup();
}, 5 * 60 * 1000);

// React hook to use cache with React Query
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export function useCachedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> & {
    cacheExpiry?: number;
  } = {}
) {
  const { cacheExpiry = 5 * 60 * 1000, ...queryOptions } = options;
  const cacheKey = queryKey.join('_');

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Check cache first
      const cachedData = cacheManager.get<T>(cacheKey);
      if (cachedData) {
        console.log(`Using cached data for ${cacheKey}`);
        return cachedData;
      }

      // Fetch fresh data
      const data = await queryFn();
      cacheManager.set(cacheKey, data, cacheExpiry);
      return data;
    },
    staleTime: cacheExpiry * 0.8, // Consider stale at 80% of expiry
    gcTime: cacheExpiry, // Keep in memory for full expiry time
    ...queryOptions
  });
}