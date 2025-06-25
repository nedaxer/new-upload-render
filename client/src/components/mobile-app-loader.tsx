import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';

interface MobileAppLoaderProps {
  children: React.ReactNode;
}

export const MobileAppLoader: React.FC<MobileAppLoaderProps> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Single optimized query for all critical mobile app data with 10-second auto-refresh
  const mobileDataQuery = useQuery({
    queryKey: ['/api/mobile/app-data'],
    enabled: !!user,
    retry: 2,
    staleTime: 8000, // Refresh every 8 seconds to ensure 10-second updates
    refetchInterval: 10000, // Auto-refresh every 10 seconds
    gcTime: 5 * 60 * 1000, // Keep in memory for 5 minutes
  });

  // Currency rates query with 10-second auto-refresh
  const exchangeRatesQuery = useQuery({
    queryKey: ['/api/market-data/conversion-rates'],
    enabled: !!user,
    retry: 2,
    staleTime: 8000,
    refetchInterval: 10000, // Auto-refresh every 10 seconds
    gcTime: 5 * 60 * 1000,
  });

  // Populate individual query caches from the combined response
  useEffect(() => {
    if (mobileDataQuery.data) {
      const response = mobileDataQuery.data as any;
      if (response?.success && response?.data) {
        const data = response.data;
        
        // Populate individual caches to maintain compatibility
        if (data.prices) {
          queryClient.setQueryData(['/api/crypto/realtime-prices'], { success: true, data: data.prices });
        }
        if (data.wallet) {
          queryClient.setQueryData(['/api/wallet/summary'], { success: true, data: data.wallet });
        }
        if (data.balances) {
          queryClient.setQueryData(['/api/balances'], { success: true, balances: data.balances });
        }
        if (data.favorites) {
          queryClient.setQueryData(['/api/favorites'], { success: true, data: data.favorites });
        }
        if (data.exchangeRates) {
          queryClient.setQueryData(['/api/market-data/conversion-rates'], { success: true, data: data.exchangeRates });
        }
      }
    }
  }, [mobileDataQuery.data, queryClient]);

  // Update exchange rates cache when standalone query updates
  useEffect(() => {
    if (exchangeRatesQuery.data) {
      const response = exchangeRatesQuery.data as any;
      if (response?.success && response?.data) {
        queryClient.setQueryData(['/api/market-data/conversion-rates'], response);
      }
    }
  }, [exchangeRatesQuery.data, queryClient]);

  // NO LOADING DELAYS - Always show children immediately
  // Data loads in background with auto-refresh every 10 seconds
  return <>{children}</>;
};