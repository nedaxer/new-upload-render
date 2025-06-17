import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import your cut-out letter images
import letterN from '@assets/20250618_001640_1750202449638.png';
import letterE1 from '@assets/20250618_001710_1750202449696.png';
import letterD from '@assets/20250618_001748_1750202449733.png';
import letterA from '@assets/20250618_001828_1750202449772.png';
import letterX from '@assets/20250618_001859_1750202449790.png';
import letterE2 from '@assets/20250618_002006_1750202449835.png';
import letterR from '@assets/20250618_001938_1750202449812.png';
import logoIcon from '@assets/generated-icon_1750202540669.png';

interface NedaxerTransformerProps {
  onAnimationComplete?: () => void;
  autoStart?: boolean;
  className?: string;
}

export function NedaxerTransformer({ onAnimationComplete, autoStart = false, className = "" }: NedaxerTransformerProps) {
  const [isAssembled, setIsAssembled] = useState(false);
  const [showStrike, setShowStrike] = useState(false);
  const [showClickPrompt, setShowClickPrompt] = useState(!autoStart);

  const handleClick = () => {
    if (!isAssembled) {
      setIsAssembled(true);
      setShowClickPrompt(false);
      
      // Show strike animation after letters assemble
      setTimeout(() => {
        setShowStrike(true);
      }, 2500);
      
      setTimeout(() => {
        onAnimationComplete?.();
      }, 4000);
    }
  };

  // Auto-start animation if specified
  useEffect(() => {
    if (autoStart && !isAssembled) {
      setTimeout(() => {
        setIsAssembled(true);
        setShowClickPrompt(false);
        
        // Show strike animation after letters assemble
        setTimeout(() => {
          setShowStrike(true);
        }, 2500);
        
        setTimeout(() => {
          onAnimationComplete?.();
        }, 4000);
      }, 1000);
    }
  }, [autoStart, isAssembled, onAnimationComplete]);

  // Define letter data with dramatic starting positions
  const letters = [
    {
      image: letterN,
      name: 'N',
      initialPosition: { x: -400, y: -300, rotate: -180, scale: 0.5 },
      finalPosition: { x: -150, y: 0, rotate: 0, scale: 1 },
      delay: 0
    },
    {
      image: letterE1,
      name: 'E1',
      initialPosition: { x: -300, y: 400, rotate: 90, scale: 0.5 },
      finalPosition: { x: -100, y: 0, rotate: 0, scale: 1 },
      delay: 0.2
    },
    {
      image: letterD,
      name: 'D',
      initialPosition: { x: 400, y: -250, rotate: -270, scale: 0.5 },
      finalPosition: { x: -50, y: 0, rotate: 0, scale: 1 },
      delay: 0.4
    },
    {
      image: letterA,
      name: 'A',
      initialPosition: { x: 350, y: 300, rotate: 45, scale: 0.5 },
      finalPosition: { x: 0, y: 0, rotate: 0, scale: 1 },
      delay: 0.6
    },
    {
      image: letterX,
      name: 'X',
      initialPosition: { x: -450, y: -200, rotate: 180, scale: 0.5 },
      finalPosition: { x: 50, y: 0, rotate: 0, scale: 1 },
      delay: 0.8
    },
    {
      image: letterE2,
      name: 'E2',
      initialPosition: { x: 300, y: 450, rotate: -90, scale: 0.5 },
      finalPosition: { x: 100, y: 0, rotate: 0, scale: 1 },
      delay: 1.0
    },
    {
      image: letterR,
      name: 'R',
      initialPosition: { x: -200, y: 500, rotate: 135, scale: 0.5 },
      finalPosition: { x: 150, y: 0, rotate: 0, scale: 1 },
      delay: 1.2
    }
  ];

  return (
    <div 
      className={`relative cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div className="relative w-96 h-48 flex items-center justify-center">
        {/* Central Logo Icon */}
        <motion.div
          className="absolute z-10"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: isAssembled ? [0, 1.2, 1] : 0,
            rotate: isAssembled ? [0, 360, 0] : -180
          }}
          transition={{
            duration: 1.5,
            delay: 0.5,
            ease: "easeOut"
          }}
        >
          <img
            src={logoIcon}
            alt="Nedaxer Logo"
            className="w-16 h-16 object-contain filter drop-shadow-lg"
          />
        </motion.div>

        {/* Animated Letters */}
        {letters.map((letter, index) => (
          <motion.div
            key={letter.name}
            className="absolute"
            initial={letter.initialPosition}
            animate={isAssembled ? letter.finalPosition : letter.initialPosition}
            transition={{
              duration: 2,
              delay: letter.delay,
              ease: "easeInOut",
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
          >
            <motion.img
              src={letter.image}
              alt={letter.name}
              className="w-12 h-16 object-contain filter drop-shadow-md"
              animate={isAssembled ? {
                filter: [
                  'drop-shadow(0 0 5px rgba(251, 191, 36, 0.5))',
                  'drop-shadow(0 0 15px rgba(251, 191, 36, 0.8))',
                  'drop-shadow(0 0 5px rgba(251, 191, 36, 0.5))'
                ]
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: letter.delay + 2
              }}
            />
          </motion.div>
        ))}

        {/* Strike Animation - Line running from N to R */}
        <AnimatePresence>
          {showStrike && (
            <motion.div
              className="absolute z-20"
              style={{
                left: '25%',
                top: '50%',
                width: '50%',
                height: '4px',
                background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #d97706)',
                transformOrigin: 'left center'
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ 
                scaleX: [0, 1, 1, 0],
                opacity: [0, 1, 1, 0],
                boxShadow: [
                  '0 0 10px rgba(251, 191, 36, 0.5)',
                  '0 0 20px rgba(251, 191, 36, 1)',
                  '0 0 15px rgba(251, 191, 36, 0.8)',
                  '0 0 5px rgba(251, 191, 36, 0.3)'
                ]
              }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                times: [0, 0.3, 0.7, 1]
              }}
            />
          )}
        </AnimatePresence>

        {/* Energy Burst Effects */}
        <AnimatePresence>
          {isAssembled && (
            <>
              {/* Particle explosion when letters connect */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    background: ['#fbbf24', '#10b981', '#ef4444', '#8b5cf6'][i % 4]
                  }}
                  initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos(i * 18 * Math.PI / 180) * 80,
                    y: Math.sin(i * 18 * Math.PI / 180) * 60,
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 2 + (i * 0.05),
                    ease: "easeOut"
                  }}
                />
              ))}

              {/* Energy rings */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`ring-${i}`}
                  className="absolute border-2 border-yellow-400/40 rounded-full"
                  style={{
                    width: 100 + (i * 40),
                    height: 60 + (i * 25),
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1.5, 0],
                    opacity: [0, 0.8, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: 2.5 + (i * 0.3),
                    ease: "easeOut"
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Strike particle effects */}
        <AnimatePresence>
          {showStrike && (
            <>
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={`strike-particle-${i}`}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                  style={{
                    left: `${25 + (i * 3)}%`,
                    top: '50%'
                  }}
                  initial={{ scale: 0, y: 0 }}
                  animate={{
                    scale: [0, 2, 0],
                    y: [0, -20 + Math.random() * 40, 0]
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.1 * i,
                    ease: "easeOut"
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Click Prompt */}
      <AnimatePresence>
        {showClickPrompt && (
          <motion.div
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm font-medium border border-white/30"
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 20px rgba(251, 191, 36, 0.3)',
                  '0 0 30px rgba(251, 191, 36, 0.6)',
                  '0 0 20px rgba(251, 191, 36, 0.3)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Click to Assemble Nedaxer
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}