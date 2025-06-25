import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, TrendingUp } from 'lucide-react';

interface LoadingWithAnimationProps {
  message?: string;
  showNedaxerLogo?: boolean;
}

export const LoadingWithAnimation: React.FC<LoadingWithAnimationProps> = ({
  message = "Loading...",
  showNedaxerLogo = false
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        {showNedaxerLogo ? (
          <motion.div
            initial={{ scale: 0, rotateY: -180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 0.2 
            }}
            className="mb-8"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-2xl">
              <span className="text-white font-bold text-2xl">N</span>
            </div>
            <motion.h1 
              className="text-2xl font-bold text-white mb-4"
              animate={{ 
                textShadow: [
                  "0 0 10px rgba(255,165,0,0.5)",
                  "0 0 20px rgba(255,165,0,0.8)",
                  "0 0 10px rgba(255,165,0,0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              NEDAXER
            </motion.h1>
          </motion.div>
        ) : (
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity }
            }}
            className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center mb-6"
          >
            <TrendingUp className="w-8 h-8 text-white" />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-white text-lg">{message}</p>
        </motion.div>

        {/* Progress dots animation */}
        <div className="flex justify-center space-x-2 mt-6">
          {[...Array(3)].map((_, index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-orange-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.3
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};