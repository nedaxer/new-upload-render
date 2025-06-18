import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import nLetter from '@assets/20250618_001640_1750207793691.png';
import eLetter1 from '@assets/20250618_001710_1750207793694.png';
import dLetter from '@assets/20250618_001748_1750207793698.png';
import aLetter from '@assets/20250618_001828_1750207793703.png';
import xLetter from '@assets/20250618_001859_1750207793716.png';
import eLetter2 from '@assets/20250618_001938_1750207793727.png';
import rLetter from '@assets/20250618_002006_1750207793730.png';
import backgroundImage from '@assets/file_00000000e0d461f9b4be5c8627966318_1750209747614.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showLogo, setShowLogo] = useState(true);
  const [showClones, setShowClones] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    
    // Preload background image and all letter images for instant display
    const imagesToPreload = [
      backgroundImage,
      nLetter,
      eLetter1,
      dLetter,
      aLetter,
      xLetter,
      eLetter2,
      rLetter
    ];
    
    const preloadLinks = imagesToPreload.map(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = src;
      link.as = 'image';
      document.head.appendChild(link);
      return link;
    });
    
    // Also create Image objects for immediate caching
    const imageObjects = imagesToPreload.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
    
    return () => {
      window.removeEventListener('resize', updateWindowSize);
      preloadLinks.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, []);

  // Letters coming from side corners only
  const letters = [
    { src: nLetter, alt: 'N', from: { x: -windowSize.width, y: 0 }, delay: 0 },
    { src: eLetter1, alt: 'E', from: { x: windowSize.width, y: 0 }, delay: 0.2 },
    { src: dLetter, alt: 'D', from: { x: -windowSize.width, y: 0 }, delay: 0.4 },
    { src: aLetter, alt: 'A', from: { x: windowSize.width, y: 0 }, delay: 0.6 },
    { src: xLetter, alt: 'X', from: { x: -windowSize.width, y: 0 }, delay: 0.8 },
    { src: eLetter2, alt: 'E', from: { x: windowSize.width, y: 0 }, delay: 1.0 },
    { src: rLetter, alt: 'R', from: { x: -windowSize.width, y: 0 }, delay: 1.2 },
  ];

  useEffect(() => {
    // Show clones after letters are arranged (3 seconds after last letter)
    const clonesTimer = setTimeout(() => {
      setShowClones(true);
    }, 3500);

    const timer = setTimeout(() => {
      setShowLogo(false);
      setTimeout(onComplete, 500); // Small delay for fade out
    }, 15000); // 15 seconds

    return () => {
      clearTimeout(clonesTimer);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {showLogo && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 splash-background"
        >

          {/* Movie-style letter animation container */}
          <div className="relative flex items-center justify-center space-x-1 md:space-x-2 z-10">
            {letters.map((letter, index) => (
              <motion.div
                key={index}
                initial={{
                  x: letter.from.x,
                  y: letter.from.y,
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  delay: letter.delay,
                  duration: 1.5,
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  ease: "easeOut",
                }}
                className="relative"
              >
                <motion.img
                  src={letter.src}
                  alt={letter.alt}
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain letter-shine"
                />
              </motion.div>
            ))}

            {/* Clone letters - appear after original arrangement */}
            <AnimatePresence>
              {showClones && letters.map((letter, index) => (
                <React.Fragment key={`clone-group-${index}`}>
                  {/* Primary clone with floating animation */}
                  <motion.div
                    key={`clone-${index}`}
                    initial={{
                      x: 0,
                      y: 0,
                      opacity: 0,
                      scale: 1,
                    }}
                    animate={{
                      x: [0, (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 400],
                      y: [0, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 300],
                      opacity: [0, 0.9, 0.5, 0.2, 0],
                      scale: [1, 1.3, 0.9, 0.7, 0.4],
                      rotate: [0, (Math.random() - 0.5) * 720],
                    }}
                    transition={{
                      delay: index * 0.15,
                      duration: 4,
                      repeat: Infinity,
                      repeatDelay: 1.5,
                      ease: "easeInOut",
                    }}
                    className="absolute pointer-events-none"
                    style={{
                      filter: 'blur(0.5px) brightness(1.3)',
                    }}
                  >
                    <motion.img
                      src={letter.src}
                      alt={`${letter.alt}-clone`}
                      className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain"
                      animate={{
                        filter: [
                          'drop-shadow(0 0 8px rgba(255,165,0,0.7))',
                          'drop-shadow(0 0 20px rgba(255,215,0,0.9))',
                          'drop-shadow(0 0 12px rgba(255,165,0,0.5))',
                        ],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>

                  {/* Secondary ghost clone */}
                  <motion.div
                    key={`ghost-${index}`}
                    initial={{
                      x: 0,
                      y: 0,
                      opacity: 0,
                      scale: 0.8,
                    }}
                    animate={{
                      x: [0, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 250],
                      y: [0, (Math.random() - 0.5) * 150, (Math.random() - 0.5) * 180],
                      opacity: [0, 0.4, 0.2, 0],
                      scale: [0.8, 1.1, 0.6, 0.3],
                      rotate: [0, (Math.random() - 0.5) * 360],
                    }}
                    transition={{
                      delay: index * 0.2 + 0.5,
                      duration: 3.5,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: "easeOut",
                    }}
                    className="absolute pointer-events-none"
                    style={{
                      filter: 'blur(1px) brightness(0.8)',
                    }}
                  >
                    <motion.img
                      src={letter.src}
                      alt={`${letter.alt}-ghost`}
                      className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 object-contain opacity-60"
                      animate={{
                        filter: [
                          'drop-shadow(0 0 5px rgba(135,206,235,0.4))',
                          'drop-shadow(0 0 12px rgba(135,206,235,0.6))',
                          'drop-shadow(0 0 8px rgba(135,206,235,0.3))',
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>

                  {/* Micro particles */}
                  {[0, 1, 2].map((particleIndex) => (
                    <motion.div
                      key={`particle-${index}-${particleIndex}`}
                      initial={{
                        x: 0,
                        y: 0,
                        opacity: 0,
                        scale: 0.3,
                      }}
                      animate={{
                        x: [0, (Math.random() - 0.5) * 150],
                        y: [0, (Math.random() - 0.5) * 100],
                        opacity: [0, 0.8, 0],
                        scale: [0.3, 0.6, 0.2],
                      }}
                      transition={{
                        delay: index * 0.1 + particleIndex * 0.3 + 1,
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "easeOut",
                      }}
                      className="absolute pointer-events-none"
                    >
                      <motion.img
                        src={letter.src}
                        alt={`${letter.alt}-particle`}
                        className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 object-contain opacity-40"
                        style={{
                          filter: 'blur(1px) brightness(1.5)',
                        }}
                      />
                    </motion.div>
                  ))}
                </React.Fragment>
              ))}
            </AnimatePresence>
            
            {/* Sequential light sweep effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
            >
              <motion.div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                  width: '20%',
                  height: '100%',
                }}
                animate={{
                  x: ['-20%', '120%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
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
            className="absolute bottom-16 sm:bottom-20 text-center z-20 px-4 max-w-full"
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 3.5, duration: 1.2, ease: "easeOut" }}
          >
            <motion.div
              className="relative"
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
              <h1 className="text-white text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold tracking-wider mb-2 leading-tight">
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