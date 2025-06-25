import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface MobileAppLoaderProps {
  children: React.ReactNode;
}

export const MobileAppLoader: React.FC<MobileAppLoaderProps> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);

  // Single optimized query for all critical mobile app data
  const mobileDataQuery = useQuery({
    queryKey: ['/api/mobile/app-data'],
    enabled: !!user,
    retry: 2,
    staleTime: 45000, // Extended cache time
    gcTime: 10 * 60 * 1000, // Keep in memory longer
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

  // Check if critical data is loaded
  useEffect(() => {
    if (user) {
      if (mobileDataQuery.isFetched || mobileDataQuery.isError) {
        // Show app immediately when data is ready or fails
        setIsLoading(false);
      }
    }
  }, [user, mobileDataQuery.isFetched, mobileDataQuery.isError]);

  // If not authenticated, show children immediately
  if (!user) {
    return <>{children}</>;
  }

  // Show minimal loading screen only for essential data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          {/* Nedaxer Logo */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">Nedaxer</h1>
            <p className="text-orange-400 text-sm">Trading Platform</p>
          </div>

          {/* Simple Loading Animation */}
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500 mx-auto" />
          </div>

          <p className="text-gray-400 text-sm">
            Loading your account...
          </p>
        </div>
      </div>
    );
  }

  // Data loaded, show the mobile app
  return <>{children}</>;
};

interface LoadingStepProps {
  label: string;
  completed: boolean;
  active: boolean;
}

const LoadingStep: React.FC<LoadingStepProps> = ({ label, completed, active }) => {
  return (
    <div className="flex items-center space-x-3 text-sm">
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
        completed 
          ? 'bg-green-500 border-green-500' 
          : active 
            ? 'border-orange-500 animate-pulse' 
            : 'border-gray-600'
      }`}>
        {completed && (
          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <span className={`transition-colors duration-300 ${
        completed 
          ? 'text-green-400' 
          : active 
            ? 'text-orange-400' 
            : 'text-gray-500'
      }`}>
        {label}
      </span>
    </div>
  );
};