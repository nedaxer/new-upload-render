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

// SVG Background Component - loads instantly without image files
const TradingBackground = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    viewBox="0 0 1920 1080"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0c1426" />
        <stop offset="25%" stopColor="#1a2332" />
        <stop offset="50%" stopColor="#243040" />
        <stop offset="75%" stopColor="#2d3d54" />
        <stop offset="100%" stopColor="#364a68" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3"/>
      </pattern>
    </defs>
    
    {/* Background */}
    <rect width="100%" height="100%" fill="url(#bgGradient)" />
    <rect width="100%" height="100%" fill="url(#grid)" />
    
    {/* Trading Chart Lines */}
    <path
      d="M 100 800 Q 200 700 300 750 T 500 680 T 700 620 T 900 580 T 1100 520 T 1300 480 T 1500 400 T 1700 350"
      fill="none"
      stroke="#00d4ff"
      strokeWidth="3"
      opacity="0.7"
    />
    
    {/* Volume Bars */}
    {Array.from({ length: 50 }, (_, i) => (
      <rect
        key={i}
        x={100 + i * 30}
        y={900 - Math.random() * 200}
        width="20"
        height={Math.random() * 200}
        fill="#00d4ff"
        opacity={0.4 + Math.random() * 0.3}
      />
    ))}
    
    {/* Circular Logo Background */}
    <circle cx="960" cy="300" r="120" fill="none" stroke="#d97706" strokeWidth="8" opacity="0.6" />
    <circle cx="960" cy="300" r="80" fill="none" stroke="#d97706" strokeWidth="4" opacity="0.4" />
    
    {/* Wave Pattern in Circle */}
    <path
      d="M 880 300 Q 920 280 960 300 T 1040 300"
      fill="none"
      stroke="#d97706"
      strokeWidth="6"
      opacity="0.8"
    />
  </svg>
);

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showLogo, setShowLogo] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  // Movie-style animation: letters come from all four corners
  const letters = [
    { src: nLetter, alt: 'N', from: { x: -windowSize.width, y: -windowSize.height }, delay: 0 },
    { src: eLetter1, alt: 'E', from: { x: windowSize.width, y: -windowSize.height }, delay: 0.3 },
    { src: dLetter, alt: 'D', from: { x: -windowSize.width, y: windowSize.height }, delay: 0.6 },
    { src: aLetter, alt: 'A', from: { x: windowSize.width, y: windowSize.height }, delay: 0.9 },
    { src: xLetter, alt: 'X', from: { x: -windowSize.width, y: -windowSize.height }, delay: 1.2 },
    { src: eLetter2, alt: 'E', from: { x: windowSize.width, y: -windowSize.height }, delay: 1.5 },
    { src: rLetter, alt: 'R', from: { x: -windowSize.width, y: windowSize.height }, delay: 1.8 },
  ];

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900"
        >
          {/* Instant-loading SVG Background */}
          <TradingBackground />
          
          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-black/20" />
          {/* Simplified corner light effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 opacity-10 bg-gradient-to-br from-white to-transparent" />
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10 bg-gradient-to-bl from-white to-transparent" />
            <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10 bg-gradient-to-tr from-white to-transparent" />
            <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10 bg-gradient-to-tl from-white to-transparent" />
          </div>

          {/* Movie-style letter animation container */}
          <div className="relative flex items-center justify-center space-x-1 md:space-x-2 z-10">
            {letters.map((letter, index) => (
              <motion.div
                key={index}
                initial={{
                  x: letter.from.x,
                  y: letter.from.y,
                  opacity: 0,
                  scale: 0.2,
                  rotate: 720,
                  filter: 'blur(20px)',
                }}
                animate={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: [0.2, 1.2, 1],
                  rotate: 0,
                  filter: 'blur(0px)',
                }}
                transition={{
                  delay: letter.delay,
                  duration: 2,
                  type: "spring",
                  stiffness: 60,
                  damping: 15,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="relative"
              >
                {/* Cinema-style trailing effect */}
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{
                    delay: letter.delay,
                    duration: 2,
                    ease: "easeOut",
                  }}
                >
                  <motion.img
                    src={letter.src}
                    alt={`${letter.alt}-trail`}
                    className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain"
                    style={{
                      filter: 'blur(8px) brightness(2)',
                      opacity: 0.3,
                    }}
                  />
                </motion.div>

                {/* Main letter */}
                <motion.img
                  src={letter.src}
                  alt={letter.alt}
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain relative z-10"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(255,165,0,0.8)) drop-shadow(0 0 40px rgba(255,165,0,0.4))',
                  }}
                  animate={{
                    filter: [
                      'drop-shadow(0 0 20px rgba(255,165,0,0.8)) drop-shadow(0 0 40px rgba(255,165,0,0.4))',
                      'drop-shadow(0 0 30px rgba(255,165,0,1)) drop-shadow(0 0 60px rgba(255,165,0,0.6))',
                      'drop-shadow(0 0 20px rgba(255,165,0,0.8)) drop-shadow(0 0 40px rgba(255,165,0,0.4))',
                    ],
                  }}
                  transition={{
                    delay: letter.delay + 2,
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Impact flash effect */}
                <motion.div
                  className="absolute inset-0 bg-white rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 3, 0], opacity: [0, 0.8, 0] }}
                  transition={{
                    delay: letter.delay + 1.8,
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Subtle glowing effect behind letters */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <div
              className="w-80 h-32 rounded-full blur-3xl opacity-20"
              style={{
                background: 'radial-gradient(ellipse, rgba(255,165,0,0.3) 0%, transparent 70%)',
              }}
            />
          </motion.div>

          {/* Cinematic title card effect */}
          <motion.div
            className="absolute bottom-16 md:bottom-20 left-4 right-4 text-center z-20"
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 3.5, duration: 1.2, ease: "easeOut" }}
          >
            <motion.div
              className="relative px-4"
              animate={{
                filter: [
                  'drop-shadow(0 0 10px rgba(255,255,255,0.3))',
                  'drop-shadow(0 0 20px rgba(255,255,255,0.6))',
                  'drop-shadow(0 0 10px rgba(255,255,255,0.3))',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <h1 className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-wider mb-2 leading-tight">
                CRYPTOCURRENCY TRADING PLATFORM
              </h1>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
            </motion.div>
            
            <motion.p
              className="text-orange-300 text-sm md:text-base font-light tracking-wider mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.7] }}
              transition={{
                delay: 4,
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Initializing secure trading environment...
            </motion.p>
            
            {/* Cinematic loading bars */}
            <div className="flex justify-center space-x-2 mt-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-orange-400 rounded-full"
                  initial={{ height: 4 }}
                  animate={{
                    height: [4, 20, 4],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    delay: i * 0.15,
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            className="absolute bottom-4 md:bottom-8 left-4 right-4 md:left-8 md:right-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 0.5 }}
          >
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-200 rounded-full"
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