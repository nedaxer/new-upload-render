/**
 * Custom hook for managing offline data with React Query integration
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { offlineStorage } from '@/utils/offline-storage';
import { useEffect } from 'react';

/**
 * Enhanced useQuery hook with offline storage fallback
 */
export function useOfflineQuery<T>(
  queryKey: string | string[],
  queryFn: () => Promise<T>,
  options: {
    storeOffline?: boolean;
    getOfflineData?: () => T | null;
    storeOfflineData?: (data: T) => void;
    enabledOnline?: boolean;
    staleTime?: number;
  } = {}
) {
  const queryClient = useQueryClient();
  const keyString = Array.isArray(queryKey) ? queryKey.join('_') : queryKey;

  const {
    storeOffline = true,
    getOfflineData,
    storeOfflineData,
    enabledOnline = true,
    staleTime = 5 * 60 * 1000 // 5 minutes default
  } = options;

  const query = useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: async () => {
      try {
        const data = await queryFn();
        // Store successful online data locally
        if (storeOffline && storeOfflineData) {
          storeOfflineData(data);
        }
        return data;
      } catch (error) {
        // If online request fails and we have offline data, use it
        if (!offlineStorage.isOnline() && getOfflineData) {
          const offlineData = getOfflineData();
          if (offlineData) {
            console.log(`Using offline data for ${keyString}`);
            return offlineData;
          }
        }
        throw error;
      }
    },
    enabled: offlineStorage.isOnline() ? enabledOnline : false,
    staleTime,
    retry: (failureCount, error) => {
      // Don't retry if we're offline
      if (!offlineStorage.isOnline()) {
        return false;
      }
      return failureCount < 3;
    }
  });

  // If we're offline or query failed, try to get offline data
  useEffect(() => {
    if ((!offlineStorage.isOnline() || query.isError) && getOfflineData) {
      const offlineData = getOfflineData();
      if (offlineData && !query.data) {
        // Manually set the query data to offline data
        queryClient.setQueryData(Array.isArray(queryKey) ? queryKey : [queryKey], offlineData);
      }
    }
  }, [query.isError, query.data, queryClient, queryKey, getOfflineData]);

  return {
    ...query,
    isOffline: !offlineStorage.isOnline(),
    hasOfflineData: getOfflineData ? !!getOfflineData() : false
  };
}

/**
 * Hook for notifications with offline support
 */
export function useOfflineNotifications() {
  return useOfflineQuery(
    '/api/notifications',
    async () => {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const result = await response.json();
      return result.data;
    },
    {
      getOfflineData: () => offlineStorage.getNotifications(),
      storeOfflineData: (data) => offlineStorage.storeNotifications(data),
      staleTime: 30 * 1000, // 30 seconds
    }
  );
}

/**
 * Hook for news with offline support and 24-hour expiry
 */
export function useOfflineNews() {
  return useOfflineQuery(
    '/api/news',
    async () => {
      const response = await fetch('/api/news');
      if (!response.ok) throw new Error('Failed to fetch news');
      const result = await response.json();
      return result.data;
    },
    {
      getOfflineData: () => offlineStorage.getNews(),
      storeOfflineData: (data) => offlineStorage.storeNews(data),
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

/**
 * Hook for transaction history with offline support
 */
export function useOfflineTransactions() {
  return useOfflineQuery(
    '/api/deposits/history',
    async () => {
      const response = await fetch('/api/deposits/history');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const result = await response.json();
      return result.data;
    },
    {
      getOfflineData: () => offlineStorage.getDeposits(),
      storeOfflineData: (data) => offlineStorage.storeDeposits(data),
      staleTime: 60 * 1000, // 1 minute
    }
  );
}

/**
 * Hook for transfer history with offline support
 */
export function useOfflineTransfers() {
  return useOfflineQuery(
    '/api/transfers/history',
    async () => {
      const response = await fetch('/api/transfers/history');
      if (!response.ok) throw new Error('Failed to fetch transfers');
      const result = await response.json();
      return result.data;
    },
    {
      getOfflineData: () => offlineStorage.getTransfers(),
      storeOfflineData: (data) => offlineStorage.storeTransfers(data),
      staleTime: 60 * 1000, // 1 minute
    }
  );
}

/**
 * Hook for balances with offline support
 */
export function useOfflineBalances() {
  return useOfflineQuery(
    '/api/balances',
    async () => {
      const response = await fetch('/api/balances');
      if (!response.ok) throw new Error('Failed to fetch balances');
      const result = await response.json();
      return result.balances;
    },
    {
      getOfflineData: () => offlineStorage.getBalances(),
      storeOfflineData: (data) => offlineStorage.storeBalances(data),
      staleTime: 30 * 1000, // 30 seconds
    }
  );
}

/**
 * Hook for wallet summary with offline support
 */
export function useOfflineWalletSummary() {
  return useOfflineQuery(
    '/api/wallet/summary',
    async () => {
      const response = await fetch('/api/wallet/summary');
      if (!response.ok) throw new Error('Failed to fetch wallet summary');
      const result = await response.json();
      return result.data;
    },
    {
      getOfflineData: () => offlineStorage.getWalletSummary(),
      storeOfflineData: (data) => offlineStorage.storeWalletSummary(data),
      staleTime: 30 * 1000, // 30 seconds
    }
  );
}

/**
 * Hook for crypto prices with offline support
 */
export function useOfflineCryptoPrices() {
  return useOfflineQuery(
    '/api/crypto/realtime-prices',
    async () => {
      const response = await fetch('/api/crypto/realtime-prices');
      if (!response.ok) throw new Error('Failed to fetch crypto prices');
      const result = await response.json();
      return result.data;
    },
    {
      getOfflineData: () => offlineStorage.getCryptoPrices(),
      storeOfflineData: (data) => offlineStorage.storeCryptoPrices(data),
      staleTime: 10 * 1000, // 10 seconds when online
    }
  );
}

/**
 * Hook for favorites with offline support
 */
export function useOfflineFavorites() {
  return useOfflineQuery(
    '/api/favorites',
    async () => {
      const response = await fetch('/api/favorites');
      if (!response.ok) throw new Error('Failed to fetch favorites');
      const result = await response.json();
      return result.data;
    },
    {
      getOfflineData: () => offlineStorage.getFavorites(),
      storeOfflineData: (data) => offlineStorage.storeFavorites(data),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to monitor online/offline status
 */
export function useOnlineStatus() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => {
      console.log('App is back online, refetching data...');
      // Refetch all queries when back online
      queryClient.refetchQueries();
    };

    const handleOffline = () => {
      console.log('App is now offline, using cached data...');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);

  return {
    isOnline: offlineStorage.isOnline(),
    isOffline: !offlineStorage.isOnline()
  };
}