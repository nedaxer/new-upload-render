import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface OfflineFallbackProps {
  onRetry?: () => void;
}

export function OfflineFallback({ onRetry }: OfflineFallbackProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a2e] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-sm mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center"
        >
          <WifiOff className="w-10 h-10 text-gray-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-2xl font-bold text-white mb-4"
        >
          You're Offline
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-gray-400 mb-8 leading-relaxed"
        >
          No internet connection found. Check your connection and try again.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          onClick={handleRetry}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-8 text-xs text-gray-500"
        >
          Some cached content may still be available
        </motion.div>
      </motion.div>
    </div>
  );
}