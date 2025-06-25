import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, TrendingUp, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomePopupProps {
  isVisible: boolean;
  onClose: () => void;
  userName?: string;
  userBalance?: number;
}

export const WelcomePopup: React.FC<WelcomePopupProps> = ({
  isVisible,
  onClose,
  userName = 'there',
  userBalance = 0
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const welcomeSteps = [
    {
      icon: Sparkles,
      title: `Welcome to Nedaxer, ${userName}!`,
      subtitle: "Your greatest choice for crypto trading",
      content: "You've joined thousands of traders on the most advanced cryptocurrency trading platform.",
      color: "from-orange-500 to-yellow-500"
    },
    {
      icon: TrendingUp,
      title: "Your Trading Journey Begins",
      subtitle: "Everything you need is ready",
      content: "Access spot trading, futures, staking, and professional analysis tools all in one place.",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Gift,
      title: "Your Account Balance",
      subtitle: `Current Balance: $${userBalance.toFixed(2)} USD`,
      content: "Start trading with your USD balance. Add funds anytime through our secure deposit system.",
      color: "from-green-500 to-teal-500"
    }
  ];

  useEffect(() => {
    if (!isVisible) return;

    // Auto-advance through steps
    const timer = setTimeout(() => {
      if (currentStep < welcomeSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentStep, isVisible]);

  if (!isVisible) return null;

  const currentStepData = welcomeSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-gradient-to-br from-gray-900 to-black rounded-2xl max-w-md w-full p-6 relative overflow-hidden border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background Animation */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${currentStepData.color} opacity-10`}
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Nedaxer Logo */}
            <motion.div
              initial={{ scale: 0, rotateY: -180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center mb-3 shadow-xl">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <h1 className="text-xl font-bold text-white">NEDAXER</h1>
            </motion.div>

            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Step Icon */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-12 h-12 mx-auto bg-gradient-to-r ${currentStepData.color} rounded-full flex items-center justify-center mb-4`}
              >
                <IconComponent className="w-6 h-6 text-white" />
              </motion.div>

              {/* Step Text */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">
                  {currentStepData.title}
                </h2>
                <p className="text-orange-400 font-medium">
                  {currentStepData.subtitle}
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {currentStepData.content}
                </p>
              </div>
            </motion.div>

            {/* Progress Indicators */}
            <div className="flex justify-center space-x-2 mt-6">
              {welcomeSteps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep 
                      ? 'bg-orange-500' 
                      : index < currentStep 
                        ? 'bg-green-500' 
                        : 'bg-gray-600'
                  }`}
                  animate={index === currentStep ? {
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              {currentStep < welcomeSteps.length - 1 ? (
                <>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 border-gray-600 text-gray-300 hover:text-white"
                  >
                    Skip
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700"
                  >
                    Next
                  </Button>
                </>
              ) : (
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700"
                >
                  Start Trading
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};