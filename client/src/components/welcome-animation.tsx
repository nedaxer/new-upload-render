import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Wallet, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
  userName?: string;
  userBalance?: number;
}

export const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({
  isVisible,
  onComplete,
  userName = 'there',
  userBalance = 0
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSkip, setShowSkip] = useState(false);

  const welcomeSteps = [
    {
      icon: Sparkles,
      title: `Welcome to Nedaxer, ${userName}!`,
      subtitle: "Your premier crypto trading destination",
      content: "Join thousands of traders on our advanced platform.",
      gradient: "from-orange-500 via-pink-500 to-purple-600"
    },
    {
      icon: TrendingUp,
      title: "Everything You Need",
      subtitle: "Professional trading tools await",
      content: "Spot trading, futures, staking, and real-time analytics.",
      gradient: "from-blue-500 via-cyan-500 to-teal-500"
    },
    {
      icon: Wallet,
      title: "Your Balance",
      subtitle: `$${userBalance.toFixed(2)} USD ready`,
      content: "Start trading immediately or add more funds anytime.",
      gradient: "from-green-500 via-emerald-500 to-lime-500"
    }
  ];

  useEffect(() => {
    if (!isVisible) return;

    // Show skip button after 2 seconds
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 2000);

    // Auto-advance steps
    const stepTimer = setTimeout(() => {
      if (currentStep < welcomeSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Auto-complete after last step
        setTimeout(onComplete, 2000);
      }
    }, 3000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(stepTimer);
    };
  }, [currentStep, isVisible, onComplete]);

  if (!isVisible) return null;

  const currentStepData = welcomeSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(45, 0, 85, 0.2) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 70%, rgba(25, 25, 25, 0.4) 0%, transparent 60%),
            radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0.9) 0%, rgba(5, 5, 15, 1) 100%),
            linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)
          `
        }}
      >
        {/* Venom-like Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Black Tendrils - Venom veins */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`tendril-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 400 + 150}px`,
                height: `${Math.random() * 3 + 1}px`,
                background: `linear-gradient(90deg, 
                  transparent, 
                  rgba(45, 0, 85, 0.6), 
                  rgba(15, 15, 15, 0.8), 
                  rgba(45, 0, 85, 0.6), 
                  transparent)`,
                transform: `rotate(${Math.random() * 360}deg)`,
                borderRadius: '50px'
              }}
              animate={{
                scale: [0.3, 1.5, 0.3],
                opacity: [0.1, 0.8, 0.1],
                x: ['-100px', '100px', '-100px'],
                y: ['-50px', '50px', '-50px'],
                rotate: [0, 360]
              }}
              transition={{
                duration: Math.random() * 6 + 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Floating Crypto Icons with Venom integration */}
          {[
            { symbol: '₿', color: '#f7931a', name: 'Bitcoin' },
            { symbol: 'Ξ', color: '#627eea', name: 'Ethereum' },
            { symbol: '₮', color: '#26a17b', name: 'Tether' },
            { symbol: '◊', color: '#1e88e5', name: 'Crypto' },
            { symbol: '◎', color: '#9945ff', name: 'Solana' },
            { symbol: '▲', color: '#ff6b35', name: 'Triangle' }
          ].map((crypto, i) => (
            <motion.div
              key={`crypto-${i}`}
              className="absolute text-2xl font-bold"
              style={{
                left: `${15 + i * 12}%`,
                top: `${20 + (i % 4) * 20}%`,
                color: crypto.color,
                filter: 'drop-shadow(0 0 8px currentColor)',
                textShadow: `0 0 15px ${crypto.color}50`
              }}
              animate={{
                y: [0, -30, 0],
                scale: [0.6, 1.4, 0.6],
                opacity: [0.2, 0.8, 0.2],
                rotate: [0, 180, 360],
                filter: [
                  'drop-shadow(0 0 8px currentColor)',
                  `drop-shadow(0 0 20px ${crypto.color})`,
                  'drop-shadow(0 0 8px currentColor)'
                ]
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: i * 0.7,
                ease: "easeInOut"
              }}
            >
              {crypto.symbol}
            </motion.div>
          ))}

          {/* Organic Pulsing Cells - Human cell structures */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`cell-${i}`}
              className="absolute rounded-full border"
              style={{
                left: `${Math.random() * 90 + 5}%`,
                top: `${Math.random() * 90 + 5}%`,
                width: `${Math.random() * 80 + 30}px`,
                height: `${Math.random() * 80 + 30}px`,
                background: `radial-gradient(circle, 
                  rgba(45, 0, 85, 0.15) 0%, 
                  rgba(15, 15, 25, 0.3) 40%, 
                  transparent 70%)`,
                border: '1px solid rgba(45, 0, 85, 0.3)',
                boxShadow: 'inset 0 0 20px rgba(45, 0, 85, 0.2)'
              }}
              animate={{
                scale: [0.4, 1.8, 0.4],
                opacity: [0.1, 0.5, 0.1],
                rotate: [0, 360]
              }}
              transition={{
                duration: Math.random() * 5 + 3,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}

          {/* Alien texture overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 30% 40%, rgba(45, 0, 85, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 70% 60%, rgba(25, 25, 45, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 50% 80%, rgba(15, 15, 25, 0.2) 0%, transparent 40%)
              `,
              mixBlendMode: 'overlay'
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity
            }}
          />

          {/* Dynamic symbiote movement */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(
                ${currentStep * 45 + 45}deg, 
                transparent 40%, 
                rgba(45, 0, 85, 0.1) 50%, 
                transparent 60%
              )`
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
            }}
            transition={{
              duration: 5,
              repeat: Infinity
            }}
          />
        </div>

        {/* Skip Button */}
        {showSkip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-6 right-6 z-10"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onComplete}
              className="text-gray-400 hover:text-white bg-black/60 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50"
            >
              <X className="w-4 h-4 mr-1" />
              Skip
            </Button>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-md mx-auto px-6">
          {/* Nedaxer Logo - 4K Header Style */}
          <motion.div
            initial={{ scale: 0, rotateY: -180 }}
            animate={{ 
              scale: 1, 
              rotateY: 0,
            }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              delay: 0.2 
            }}
            className="mb-8"
          >
            {/* Main Logo Circle - 4K Enhanced */}
            <motion.div
              className="w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden"
              style={{
                background: `
                  linear-gradient(135deg, 
                    #ff5900 0%, 
                    #ff7b00 25%, 
                    #4f46e5 75%, 
                    #3b82f6 100%
                  )
                `
              }}
              animate={{
                boxShadow: [
                  "0 0 40px rgba(255,89,0,0.4), 0 0 80px rgba(79,70,229,0.2), inset 0 0 30px rgba(0,0,0,0.3)",
                  "0 0 60px rgba(255,89,0,0.7), 0 0 120px rgba(79,70,229,0.4), inset 0 0 30px rgba(0,0,0,0.3)",
                  "0 0 40px rgba(255,89,0,0.4), 0 0 80px rgba(79,70,229,0.2), inset 0 0 30px rgba(0,0,0,0.3)"
                ]
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              {/* Rotating Venom-like Background */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, 
                    #ff5900, 
                    #2d0055, 
                    #ff5900, 
                    #1a1a2e, 
                    #4f46e5, 
                    #ff5900)`
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Inner symbiote glow */}
              <motion.div
                className="absolute inset-3 rounded-full"
                style={{
                  background: `radial-gradient(circle, 
                    rgba(0,0,0,0.7) 0%, 
                    rgba(45, 0, 85, 0.3) 50%, 
                    rgba(0,0,0,0.8) 100%)`
                }}
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  scale: [0.9, 1.1, 0.9]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              {/* Logo Letter - 4K Enhanced */}
              <motion.span 
                className="relative z-10 text-white font-bold text-5xl"
                style={{
                  filter: 'drop-shadow(0 0 15px rgba(255,89,0,0.8))',
                  textShadow: '0 0 20px rgba(255,255,255,0.5)'
                }}
                animate={{
                  textShadow: [
                    '0 0 20px rgba(255,255,255,0.5)',
                    '0 0 30px rgba(255,89,0,0.8)',
                    '0 0 20px rgba(255,255,255,0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                N
              </motion.span>
            </motion.div>

            {/* Nedaxer Title with Enhanced Animation */}
            <motion.div className="space-y-2">
              <motion.h1 
                className="text-5xl font-bold text-white tracking-wider"
                style={{
                  filter: 'drop-shadow(0 0 15px rgba(255,89,0,0.6))',
                  textShadow: '0 0 25px rgba(255,89,0,0.4)'
                }}
              >
                {["N", "E", "D", "A", "X", "E", "R"].map((letter, index) => (
                  <motion.span
                    key={index}
                    animate={{
                      y: [0, -12, 0],
                      textShadow: [
                        "0 0 15px rgba(255,89,0,0.6)",
                        "0 0 30px rgba(255,89,0,1), 0 0 40px rgba(79,70,229,0.6)",
                        "0 0 15px rgba(255,89,0,0.6)"
                      ],
                      color: [
                        "#ffffff",
                        "#ff5900",
                        "#4f46e5",
                        "#ffffff"
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.15
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.h1>
              
              {/* Symbiote tagline */}
              <motion.p 
                className="text-purple-300 text-sm font-medium opacity-80"
                animate={{
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                Crypto Evolution Unleashed
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Step Icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 15, -15, 0]
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className={`w-18 h-18 mx-auto bg-gradient-to-r ${currentStepData.gradient} rounded-full flex items-center justify-center shadow-xl`}
              style={{
                boxShadow: '0 0 25px rgba(255,89,0,0.4)'
              }}
            >
              <IconComponent className="w-9 h-9 text-white" />
            </motion.div>

            {/* Step Text */}
            <div className="space-y-4">
              <motion.h2 
                className="text-3xl font-bold text-white"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  textShadow: '0 0 15px rgba(255,89,0,0.3)'
                }}
              >
                {currentStepData.title}
              </motion.h2>
              
              <motion.p 
                className="text-orange-400 font-semibold text-xl"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }}
                style={{
                  textShadow: '0 0 10px rgba(255,89,0,0.5)'
                }}
              >
                {currentStepData.subtitle}
              </motion.p>
              
              <p className="text-gray-300 leading-relaxed text-lg">
                {currentStepData.content}
              </p>
            </div>
          </motion.div>

          {/* Progress Indicators */}
          <div className="flex justify-center space-x-4 mt-8">
            {welcomeSteps.map((_, index) => (
              <motion.div
                key={index}
                className={`w-4 h-4 rounded-full ${
                  index === currentStep 
                    ? 'bg-orange-500' 
                    : index < currentStep 
                      ? 'bg-green-500' 
                      : 'bg-gray-600'
                }`}
                style={{
                  boxShadow: index === currentStep ? '0 0 15px rgba(255,89,0,0.6)' : 'none'
                }}
                animate={index === currentStep ? {
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7]
                } : {}}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            ))}
          </div>

          {/* Action Button */}
          {currentStep === welcomeSteps.length - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-10"
            >
              <Button
                onClick={onComplete}
                className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold px-10 py-4 rounded-full shadow-xl text-lg"
                style={{
                  boxShadow: '0 0 25px rgba(255,89,0,0.4), 0 0 50px rgba(79,70,229,0.2)'
                }}
              >
                <Star className="w-6 h-6 mr-2" />
                Enter the Evolution
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};