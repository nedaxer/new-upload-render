import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SplashScreen } from './splash-screen';

export function MobileAppLoader({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [showSplash, setShowSplash] = useState(true);
  const [emergencyTimeout, setEmergencyTimeout] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Clear all caches on component mount to prevent blank screen issues
  useEffect(() => {
    const clearCaches = async () => {
      try {
        // Clear React Query cache
        queryClient.clear();
        console.log('All caches cleared');

        // Clear browser caches if available
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }
      } catch (error) {
        console.error('Cache clearing error:', error);
      }
    };

    // Only clear caches if this seems to be a page refresh
    const isRefresh = performance.navigation?.type === 1 || 
                     performance.getEntriesByType('navigation')[0]?.type === 'reload';

    if (isRefresh) {
      clearCaches();
    }
  }, [queryClient]);

  // Emergency timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Emergency timeout reached, forcing app to load');
      setEmergencyTimeout(true);
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Error boundary for auth queries
  useEffect(() => {
    const handleError = () => {
      setHasError(true);
      setShowSplash(false);
    };

    window.addEventListener('unhandledrejection', handleError);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleError);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Preload critical data for authenticated users
  const { isLoading: walletLoading, error: walletError } = useQuery({
    queryKey: ['/api/wallet/summary'],
    enabled: !!user && !emergencyTimeout && !hasError,
    retry: 1,
    staleTime: 30000,
    onError: () => setHasError(true)
  });

  const { isLoading: priceLoading, error: priceError } = useQuery({
    queryKey: ['/api/crypto/realtime-prices'],
    enabled: !emergencyTimeout && !hasError,
    retry: 1,
    staleTime: 30000,
    onError: () => console.log('Price data failed, continuing without it')
  });

  // Hide splash screen once critical data is loaded or timeout reached
  useEffect(() => {
    if (emergencyTimeout || hasError) {
      setShowSplash(false);
      return;
    }

    if (!authLoading) {
      if (user) {
        // For authenticated users, wait for wallet data or handle error
        if (!walletLoading || walletError) {
          const timer = setTimeout(() => {
            setShowSplash(false);
          }, 1000);
          return () => clearTimeout(timer);
        }
      } else {
        // For unauthenticated users, show immediately
        const timer = setTimeout(() => {
          setShowSplash(false);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [authLoading, user, walletLoading, walletError, emergencyTimeout, hasError]);

  // Show error state if something went wrong
  if (hasError && !showSplash) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a2e] text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Loading Error</h2>
          <p className="text-gray-400 mb-4">Something went wrong while loading the app.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-white"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }

  if (showSplash) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}