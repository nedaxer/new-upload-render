import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
import { useOffline } from '@/hooks/use-offline';

interface OfflineIndicatorProps {
  showOnlineStatus?: boolean;
  position?: 'top' | 'bottom';
  className?: string;
}

export function OfflineIndicator({ 
  showOnlineStatus = false, 
  position = 'top',
  className = '' 
}: OfflineIndicatorProps) {
  const { isOffline, isOnline, wasOffline } = useOffline();

  // Show indicator when offline, or when just came back online (for 3 seconds)
  const shouldShow = isOffline || (showOnlineStatus && wasOffline);
  const isShowingOnline = !isOffline && wasOffline;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? -50 : 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'top' ? -50 : 50 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed left-0 right-0 z-50 mx-4 ${
            position === 'top' ? 'top-4' : 'bottom-20'
          } ${className}`}
        >
          <div className={`rounded-lg px-4 py-2 shadow-lg backdrop-blur-sm flex items-center justify-center space-x-2 ${
            isOffline 
              ? 'bg-red-500/90 text-white' 
              : 'bg-green-500/90 text-white'
          }`}>
            {isOffline ? (
              <WifiOff className="w-4 h-4" />
            ) : (
              <Wifi className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isOffline 
                ? 'You are offline - using cached data' 
                : 'Back online'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Offline banner for critical sections that need network connectivity
 */
export function OfflineBanner({ message = "This feature requires an internet connection" }: { message?: string }) {
  const { isOffline } = useOffline();

  if (!isOffline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4"
    >
      <div className="flex items-center space-x-2 text-orange-600">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </motion.div>
  );
}