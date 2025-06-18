import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import nLetter from '@assets/20250618_001640_1750207793691.png';
import eLetter1 from '@assets/20250618_001710_1750207793694.png';
import dLetter from '@assets/20250618_001748_1750207793698.png';
import aLetter from '@assets/20250618_001828_1750207793703.png';
import xLetter from '@assets/20250618_001859_1750207793716.png';
import eLetter2 from '@assets/20250618_001938_1750207793727.png';
import rLetter from '@assets/20250618_002006_1750207793730.png';

interface SplashScreenProps {
  onComplete: () => void;
}

const letters = [
  { src: nLetter, alt: 'N', from: { x: -200, y: -200 }, delay: 0 },
  { src: eLetter1, alt: 'E', from: { x: 200, y: -200 }, delay: 0.2 },
  { src: dLetter, alt: 'D', from: { x: -200, y: 200 }, delay: 0.4 },
  { src: aLetter, alt: 'A', from: { x: 200, y: 200 }, delay: 0.6 },
  { src: xLetter, alt: 'X', from: { x: 0, y: -300 }, delay: 0.8 },
  { src: eLetter2, alt: 'E', from: { x: 0, y: 300 }, delay: 1.0 },
  { src: rLetter, alt: 'R', from: { x: 300, y: 0 }, delay: 1.2 },
];

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogo(false);
      setTimeout(onComplete, 500); // Small delay for fade out
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {showLogo && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #2563eb  50%, #3b82f6 75%, #60a5fa 100%)'
          }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-20"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  y: [null, Math.random() * window.innerHeight],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Letter animation container */}
          <div className="relative flex items-center justify-center space-x-2">
            {letters.map((letter, index) => (
              <motion.div
                key={index}
                initial={{
                  x: letter.from.x,
                  y: letter.from.y,
                  opacity: 0,
                  scale: 0.3,
                  rotate: Math.random() * 360,
                }}
                animate={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                }}
                transition={{
                  delay: letter.delay,
                  duration: 1.2,
                  type: "spring",
                  stiffness: 100,
                  damping: 12,
                }}
                className="relative"
              >
                <motion.img
                  src={letter.src}
                  alt={letter.alt}
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain drop-shadow-2xl"
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    filter: [
                      'drop-shadow(0 0 10px rgba(255,255,255,0.3))',
                      'drop-shadow(0 0 20px rgba(255,255,255,0.6))',
                      'drop-shadow(0 0 10px rgba(255,255,255,0.3))',
                    ],
                  }}
                  transition={{
                    delay: letter.delay + 1.5,
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Glowing effect behind letters */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <div
              className="w-80 h-32 rounded-full blur-3xl opacity-30"
              style={{
                background: 'radial-gradient(ellipse, rgba(255,255,255,0.4) 0%, transparent 70%)',
              }}
            />
          </motion.div>

          {/* Pulsing ring effect */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 0], opacity: [0, 0.3, 0] }}
            transition={{
              delay: 3,
              duration: 3,
              repeat: Infinity,
              ease: "easeOut",
            }}
          >
            <div className="w-96 h-96 border-2 border-white rounded-full" />
          </motion.div>

          {/* Loading text */}
          <motion.div
            className="absolute bottom-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.8 }}
          >
            <motion.p
              className="text-white text-lg font-light tracking-wider"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Loading your trading platform...
            </motion.p>
            
            {/* Loading dots */}
            <div className="flex justify-center space-x-1 mt-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    delay: i * 0.2,
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            className="absolute bottom-8 left-8 right-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 0.5 }}
          >
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-white to-blue-200 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{
                  delay: 3,
                  duration: 6.5,
                  ease: "easeOut",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}