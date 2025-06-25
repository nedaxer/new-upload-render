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
  const [isPreloading, setIsPreloading] = useState(true);
  const [loadingSteps, setLoadingSteps] = useState({
    prices: false,
    wallet: false,
    balances: false,
    favorites: false,
    rates: false,
    complete: false
  });

  // Critical data queries with immediate execution
  const { data: priceData, isSuccess: pricesLoaded } = useQuery({
    queryKey: ['/api/crypto/realtime-prices'],
    enabled: !!user && isPreloading,
    retry: 1,
    staleTime: 30000,
  });

  const { data: walletData, isSuccess: walletLoaded } = useQuery({
    queryKey: ['/api/wallet/summary'],
    enabled: !!user && isPreloading,
    retry: 1,
    staleTime: 30000,
  });

  const { data: balanceData, isSuccess: balancesLoaded } = useQuery({
    queryKey: ['/api/balances'],
    enabled: !!user && isPreloading,
    retry: 1,
    staleTime: 30000,
  });

  const { data: favoritesData, isSuccess: favoritesLoaded } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: !!user && isPreloading,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Preload exchange rates for currency conversion
  const { data: exchangeRates, isSuccess: ratesLoaded } = useQuery({
    queryKey: ['/api/market-data/conversion-rates'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/market-data/conversion-rates');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        return null; // Continue without rates if failed
      }
    },
    enabled: isPreloading,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update loading steps as data loads
  useEffect(() => {
    setLoadingSteps(prev => ({
      ...prev,
      prices: pricesLoaded,
      wallet: walletLoaded,
      balances: balancesLoaded,
      favorites: favoritesLoaded,
      rates: ratesLoaded || true, // Don't block on rates failure
    }));
  }, [pricesLoaded, walletLoaded, balancesLoaded, favoritesLoaded, ratesLoaded]);

  // Check if all critical data is loaded
  useEffect(() => {
    if (user && pricesLoaded && walletLoaded && balancesLoaded && favoritesLoaded && loadingSteps.rates) {
      // Add small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setLoadingSteps(prev => ({ ...prev, complete: true }));
        setIsPreloading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user, pricesLoaded, walletLoaded, balancesLoaded, favoritesLoaded, loadingSteps.rates]);

  // If not authenticated, show children immediately
  if (!user) {
    return <>{children}</>;
  }

  // Show loading screen while preloading data
  if (isPreloading || !loadingSteps.complete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center space-y-6">
          {/* Nedaxer Logo */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Nedaxer</h1>
            <p className="text-orange-400 text-sm">Trading Platform</p>
          </div>

          {/* Loading Animation */}
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
            <div className="absolute inset-0 rounded-full border-2 border-orange-200 opacity-20"></div>
          </div>

          {/* Loading Steps */}
          <div className="space-y-2 min-w-64">
            <LoadingStep 
              label="Loading market data" 
              completed={loadingSteps.prices}
              active={!loadingSteps.prices}
            />
            <LoadingStep 
              label="Preparing wallet" 
              completed={loadingSteps.wallet}
              active={loadingSteps.prices && !loadingSteps.wallet}
            />
            <LoadingStep 
              label="Syncing balances" 
              completed={loadingSteps.balances}
              active={loadingSteps.wallet && !loadingSteps.balances}
            />
            <LoadingStep 
              label="Loading preferences" 
              completed={loadingSteps.favorites}
              active={loadingSteps.balances && !loadingSteps.favorites}
            />
            <LoadingStep 
              label="Updating exchange rates" 
              completed={loadingSteps.rates}
              active={loadingSteps.favorites && !loadingSteps.rates}
            />
            <LoadingStep 
              label="Finalizing account" 
              completed={loadingSteps.complete}
              active={loadingSteps.rates && !loadingSteps.complete}
            />
          </div>

          <p className="text-gray-400 text-sm">
            Setting up your trading environment...
          </p>
        </div>
      </div>
    );
  }

  // All data loaded, show the mobile app
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