import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TransformerLogoProps {
  onAnimationComplete?: () => void;
  autoStart?: boolean;
  className?: string;
}

export function TransformerLogo({ onAnimationComplete, autoStart = false, className = "" }: TransformerLogoProps) {
  const [isAssembled, setIsAssembled] = useState(false);
  const [showClickPrompt, setShowClickPrompt] = useState(!autoStart);

  const handleClick = () => {
    if (!isAssembled) {
      setIsAssembled(true);
      setShowClickPrompt(false);
      setTimeout(() => {
        onAnimationComplete?.();
      }, 3000);
    }
  };

  // Auto-start animation if specified
  if (autoStart && !isAssembled) {
    setTimeout(() => {
      setIsAssembled(true);
      setShowClickPrompt(false);
      setTimeout(() => {
        onAnimationComplete?.();
      }, 3000);
    }, 500);
  }

  // Define individual logo parts based on actual Nedaxer logo structure
  const logoCenter = { x: 0, y: -20 };
  
  // Logo symbol parts (recreating the circular dollar/trading symbol)
  const symbolParts = [
    // Outer circle top-left
    { 
      id: 'circle-tl',
      path: 'M -25 -45 A 25 25 0 0 1 0 -70',
      initialPosition: { x: -150, y: -150, rotate: -90 },
      finalPosition: { x: 0, y: 0, rotate: 0 },
      delay: 0
    },
    // Outer circle top-right
    { 
      id: 'circle-tr',
      path: 'M 0 -70 A 25 25 0 0 1 25 -45',
      initialPosition: { x: 150, y: -150, rotate: 90 },
      finalPosition: { x: 0, y: 0, rotate: 0 },
      delay: 0.1
    },
    // Outer circle bottom-right
    { 
      id: 'circle-br',
      path: 'M 25 -45 A 25 25 0 0 1 25 5',
      initialPosition: { x: 150, y: 150, rotate: 180 },
      finalPosition: { x: 0, y: 0, rotate: 0 },
      delay: 0.2
    },
    // Outer circle bottom-left
    { 
      id: 'circle-bl',
      path: 'M 25 5 A 25 25 0 0 1 -25 5',
      initialPosition: { x: -150, y: 150, rotate: -180 },
      finalPosition: { x: 0, y: 0, rotate: 0 },
      delay: 0.3
    },
    // Left side of circle
    { 
      id: 'circle-left',
      path: 'M -25 5 A 25 25 0 0 1 -25 -45',
      initialPosition: { x: -200, y: 0, rotate: -90 },
      finalPosition: { x: 0, y: 0, rotate: 0 },
      delay: 0.4
    },
    // Inner vertical lines (top)
    { 
      id: 'inner-line-top',
      path: 'M -5 -50 L -5 -35',
      initialPosition: { x: 0, y: -100, scale: 0 },
      finalPosition: { x: 0, y: 0, scale: 1 },
      delay: 0.6
    },
    // Inner vertical lines (bottom)  
    { 
      id: 'inner-line-bottom',
      path: 'M 5 -15 L 5 0',
      initialPosition: { x: 0, y: 100, scale: 0 },
      finalPosition: { x: 0, y: 0, scale: 1 },
      delay: 0.7
    },
    // Center wavy line (stylized N)
    { 
      id: 'center-wave',
      path: 'M -15 -35 Q -5 -45 5 -35 Q 15 -25 25 -35',
      initialPosition: { x: 0, y: 0, scale: 0, opacity: 0 },
      finalPosition: { x: 0, y: 0, scale: 1, opacity: 1 },
      delay: 0.8
    }
  ];

  // Letter parts with more dramatic starting positions
  const letters = [
    {
      letter: 'N',
      initialPosition: { x: -400, y: -200, rotate: -270, scale: 0.3 },
      finalPosition: { x: -105, y: 50, rotate: 0, scale: 1 },
      delay: 1.0
    },
    {
      letter: 'E',
      initialPosition: { x: -300, y: 300, rotate: 180, scale: 0.3 },
      finalPosition: { x: -75, y: 50, rotate: 0, scale: 1 },
      delay: 1.1
    },
    {
      letter: 'D',
      initialPosition: { x: 350, y: -250, rotate: -360, scale: 0.3 },
      finalPosition: { x: -45, y: 50, rotate: 0, scale: 1 },
      delay: 1.2
    },
    {
      letter: 'A',
      initialPosition: { x: 400, y: 200, rotate: 90, scale: 0.3 },
      finalPosition: { x: -15, y: 50, rotate: 0, scale: 1 },
      delay: 1.3
    },
    {
      letter: 'X',
      initialPosition: { x: -350, y: -300, rotate: 270, scale: 0.3 },
      finalPosition: { x: 15, y: 50, rotate: 0, scale: 1 },
      delay: 1.4
    },
    {
      letter: 'E',
      initialPosition: { x: 300, y: 350, rotate: -135, scale: 0.3 },
      finalPosition: { x: 45, y: 50, rotate: 0, scale: 1 },
      delay: 1.5
    },
    {
      letter: 'R',
      initialPosition: { x: -250, y: 400, rotate: 225, scale: 0.3 },
      finalPosition: { x: 75, y: 50, rotate: 0, scale: 1 },
      delay: 1.6
    }
  ];

  return (
    <div 
      className={`relative cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <svg
        width="300"
        height="200"
        viewBox="-150 -50 300 200"
        className="overflow-visible"
      >
        {/* Logo Symbol Parts */}
        {symbolParts.map((part) => (
          <motion.path
            key={part.id}
            d={part.path}
            fill="none"
            stroke="url(#logoGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            initial={part.initialPosition}
            animate={isAssembled ? part.finalPosition : part.initialPosition}
            transition={{
              duration: 1.5,
              delay: part.delay,
              ease: "easeInOut",
              type: "spring",
              stiffness: 100
            }}
          />
        ))}

        {/* Letters */}
        {letters.map((letterData, index) => (
          <motion.text
            key={`${letterData.letter}-${index}`}
            x={0}
            y={0}
            fontSize="20"
            fontWeight="bold"
            fill="url(#textGradient)"
            textAnchor="middle"
            dominantBaseline="middle"
            initial={letterData.initialPosition}
            animate={isAssembled ? letterData.finalPosition : letterData.initialPosition}
            transition={{
              duration: 2.5,
              delay: letterData.delay,
              ease: "easeInOut",
              type: "spring",
              stiffness: 80,
              damping: 12
            }}
            style={{
              filter: isAssembled ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))' : 'none'
            }}
          >
            {letterData.letter}
          </motion.text>
        ))}

        {/* Gradients */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
      </svg>

      {/* Enhanced Particle Effects during Assembly */}
      <AnimatePresence>
        {isAssembled && (
          <>
            {/* Multiple waves of energy burst particles */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  width: Math.random() * 4 + 2,
                  height: Math.random() * 4 + 2,
                  background: ['#fbbf24', '#10b981', '#ef4444', '#8b5cf6', '#60a5fa'][i % 5]
                }}
                initial={{ 
                  scale: 0,
                  x: 0,
                  y: 0,
                  opacity: 1
                }}
                animate={{
                  scale: [0, 1.5, 0],
                  x: Math.cos(i * 12 * Math.PI / 180) * (80 + Math.random() * 40),
                  y: Math.sin(i * 12 * Math.PI / 180) * (80 + Math.random() * 40),
                  opacity: [0, 1, 0]
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2,
                  delay: 1.8 + (i * 0.03),
                  ease: "easeOut"
                }}
              />
            ))}

            {/* Logo part impact sparks */}
            {symbolParts.map((part, i) => (
              <motion.div
                key={`spark-${part.id}`}
                className="absolute w-1 h-8 bg-yellow-400 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transformOrigin: 'bottom center'
                }}
                initial={{ 
                  scale: 0,
                  rotate: i * 45,
                  opacity: 0
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.8,
                  delay: part.delay + 1.5,
                  ease: "easeOut"
                }}
              />
            ))}

            {/* Assembly completion flash with multiple pulses */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, rgba(16, 185, 129, 0.2) 50%, transparent 70%)'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 2, 3, 0],
                opacity: [0, 0.8, 0.4, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.5,
                delay: 2,
                ease: "easeOut"
              }}
            />

            {/* Secondary energy wave */}
            <motion.div
              className="absolute inset-0 border-4 border-yellow-400/60 rounded-full"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ 
                scale: [0.5, 1.5, 2.5],
                opacity: [0, 0.8, 0],
                borderColor: ['rgba(251, 191, 36, 0.6)', 'rgba(16, 185, 129, 0.4)', 'rgba(139, 92, 246, 0.2)']
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2,
                delay: 2.2,
                ease: "easeOut"
              }}
            />

            {/* Electromagnetic field effect */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`field-${i}`}
                className="absolute border border-blue-400/30 rounded-full"
                style={{
                  width: 100 + (i * 20),
                  height: 100 + (i * 20),
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 0.4, 0],
                  rotate: [0, 180, 360]
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 3,
                  delay: 1.5 + (i * 0.2),
                  ease: "easeInOut"
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

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
              Click to Assemble
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assembly sound effect visualization */}
      <AnimatePresence>
        {isAssembled && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Sound wave rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 border-2 border-yellow-400/20 rounded-full"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ 
                  scale: [0.5, 2, 3],
                  opacity: [0, 0.6, 0]
                }}
                transition={{
                  duration: 1.5,
                  delay: 1.5 + (i * 0.3),
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}