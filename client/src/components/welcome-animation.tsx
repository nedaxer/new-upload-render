import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles, TrendingUp } from 'lucide-react';

interface WelcomeAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
  userName?: string;
}

export const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({
  isVisible,
  onComplete,
  userName = 'there'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showLogo, setShowLogo] = useState(false);

  const steps = [
    {
      icon: CheckCircle,
      title: "Account Created Successfully!",
      subtitle: "Setting up your trading environment...",
      duration: 2000
    },
    {
      icon: Sparkles,
      title: "Initializing Your Wallet",
      subtitle: "Preparing your secure USD balance...",
      duration: 2000
    },
    {
      icon: TrendingUp,
      title: `Welcome to Nedaxer, ${userName}!`,
      subtitle: "Your greatest choice for crypto trading",
      duration: 3000
    }
  ];

  useEffect(() => {
    if (!isVisible) return;

    setShowLogo(true);
    
    const stepTimer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Complete the animation sequence
        setTimeout(() => {
          onComplete();
        }, steps[currentStep].duration);
      }
    }, steps[currentStep].duration);

    return () => clearTimeout(stepTimer);
  }, [isVisible, currentStep, onComplete]);

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center"
      >
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-blue-500/10 animate-pulse" />
          
          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-orange-500/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center px-8 max-w-md mx-auto">
          {/* Nedaxer Logo Animation */}
          <motion.div
            initial={{ scale: 0, rotateY: -180 }}
            animate={{ scale: showLogo ? 1 : 0, rotateY: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 0.2 
            }}
            className="mb-8"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-2xl">
              <span className="text-white font-bold text-2xl">N</span>
            </div>
            <motion.h1 
              className="text-3xl font-bold text-white mb-2"
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

          {/* Step Animation */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Step Icon */}
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity }
              }}
              className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center mb-6"
            >
              <IconComponent className="w-8 h-8 text-white" />
            </motion.div>

            {/* Step Content */}
            <div className="space-y-3">
              <motion.h2 
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {currentStepData.title}
              </motion.h2>
              
              <motion.p 
                className="text-gray-300 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {currentStepData.subtitle}
              </motion.p>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center space-x-2 mt-8">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
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
          </motion.div>

          {/* Loading Bar */}
          <motion.div 
            className="w-full bg-gray-700 rounded-full h-2 mt-8 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-blue-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ 
                width: `${((currentStep + 1) / steps.length) * 100}%` 
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </motion.div>

          {/* Progress Percentage */}
          <motion.p 
            className="text-orange-500 font-semibold mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};