import { useState, useEffect } from 'react';

interface OfflineState {
  isOffline: boolean;
  isOnline: boolean;
  wasOffline: boolean;
}

/**
 * Hook to detect and track offline/online status
 * Provides comprehensive offline state management for the mobile app
 */
export function useOffline(): OfflineState {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const offline = !navigator.onLine;
      
      // Track if we were offline before coming back online
      if (!offline && isOffline) {
        setWasOffline(true);
        // Reset the wasOffline flag after a short delay
        setTimeout(() => setWasOffline(false), 3000);
      }
      
      setIsOffline(offline);
    };

    // Set initial state
    updateOnlineStatus();

    // Listen for network changes
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [isOffline]);

  return {
    isOffline,
    isOnline: !isOffline,
    wasOffline
  };
}

/**
 * Hook to check if specific assets are available offline
 * Tests actual asset loading to ensure offline functionality
 */
export function useOfflineAssets(assetUrls: string[]) {
  const [assetsAvailable, setAssetsAvailable] = useState<Record<string, boolean>>({});
  const [allAssetsLoaded, setAllAssetsLoaded] = useState(false);

  useEffect(() => {
    const checkAssets = async () => {
      const results: Record<string, boolean> = {};
      
      for (const url of assetUrls) {
        try {
          const response = await fetch(url, { method: 'HEAD' });
          results[url] = response.ok;
        } catch {
          results[url] = false;
        }
      }
      
      setAssetsAvailable(results);
      setAllAssetsLoaded(Object.values(results).every(Boolean));
    };

    if (assetUrls.length > 0) {
      checkAssets();
    }
  }, [assetUrls]);

  return {
    assetsAvailable,
    allAssetsLoaded
  };
}