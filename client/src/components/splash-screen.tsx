import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OptimizedImage, useImagePreloader } from './optimized-image';
import nLetter from '@assets/20250618_001640_1750207793691.png';
import eLetter1 from '@assets/20250618_001710_1750207793694.png';
import dLetter from '@assets/20250618_001748_1750207793698.png';
import aLetter from '@assets/20250618_001828_1750207793703.png';
import xLetter from '@assets/20250618_001859_1750207793716.png';
import eLetter2 from '@assets/20250618_001938_1750207793727.png';
import rLetter from '@assets/20250618_002006_1750207793730.png';
import backgroundImage from '@assets/file_00000000e0d461f9b4be5c8627966318_1750209747614.png';
import nedaxerLogo from '@assets/20250618_042459_1750217238332.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showLogo, setShowLogo] = useState(true);
  const [showClones, setShowClones] = useState(false);
  const [hideOriginals, setHideOriginals] = useState(false);
  const [showNedaxerLogo, setShowNedaxerLogo] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });

  // Critical images for immediate preloading
  const criticalImages = [
    backgroundImage,
    nLetter,
    eLetter1,
    dLetter,
    aLetter,
    xLetter,
    eLetter2,
    rLetter,
    nedaxerLogo
  ];

  // Preload critical images with priority
  useImagePreloader(criticalImages, true);

  useEffect(() => {
    // Check if splash screen should be skipped (for admin portal)
    const skipSplash = sessionStorage.getItem('skipSplashScreen');
    if (skipSplash === 'true') {
      onComplete();
      return;
    }

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
      rLetter,
      nedaxerLogo
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

  // Letters for 4-second launch animation
  const letters = [
    { src: nLetter, alt: 'N', from: { x: -windowSize.width, y: 0 }, delay: 0 },
    { src: eLetter1, alt: 'E', from: { x: windowSize.width, y: 0 }, delay: 0.1 },
    { src: dLetter, alt: 'D', from: { x: -windowSize.width, y: 0 }, delay: 0.2 },
    { src: aLetter, alt: 'A', from: { x: windowSize.width, y: 0 }, delay: 0.3 },
    { src: xLetter, alt: 'X', from: { x: -windowSize.width, y: 0 }, delay: 0.4 },
    { src: eLetter2, alt: 'E', from: { x: windowSize.width, y: 0 }, delay: 0.5 },
    { src: rLetter, alt: 'R', from: { x: -windowSize.width, y: 0 }, delay: 0.6 },
  ];

  useEffect(() => {
    // Show clones and hide originals after letters are arranged
    const clonesTimer = setTimeout(() => {
      setHideOriginals(true);
      setShowClones(true);
    }, 1500); // 1.5 seconds for letters to arrange

    // Show NEDAXER logo after clones disappear
    const nedaxerLogoTimer = setTimeout(() => {
      setShowClones(false);
      setShowNedaxerLogo(true);
    }, 2500); // 2.5 seconds total

    // Complete animation after exactly 4 seconds
    const timer = setTimeout(() => {
      setShowLogo(false);
      setTimeout(onComplete, 300); // Quick fade out
    }, 4000); // Exactly 4 seconds

    return () => {
      clearTimeout(clonesTimer);
      clearTimeout(nedaxerLogoTimer);
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
                  opacity: hideOriginals ? 0 : 1,
                  scale: hideOriginals ? 0.8 : 1,
                }}
                transition={{
                  delay: letter.delay,
                  duration: hideOriginals ? 0.3 : 0.8,
                  type: "spring",
                  stiffness: 120,
                  damping: 15,
                  ease: "easeOut",
                }}
                className="relative"
              >
                <motion.img
                  src={letter.src}
                  alt={letter.alt}
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain letter-shine"
                />
                
                {/* Clone letter positioned exactly over original */}
                <AnimatePresence>
                  {showClones && (
                    <motion.div
                      key={`clone-${index}`}
                      initial={{
                        opacity: 0,
                        scale: 0.8,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{
                        delay: 0,
                        duration: 0.5,
                        ease: "easeOut",
                      }}
                      className="absolute inset-0"
                    >
                      <motion.img
                        src={letter.src}
                        alt={`${letter.alt}-clone`}
                        className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain"
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
                  )}
                </AnimatePresence>
              </motion.div>
            ))}


          </div>

          {/* NEDAXER Logo Display */}
          <AnimatePresence>
            {showNedaxerLogo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center z-20"
              >
                <motion.img
                  src={nedaxerLogo}
                  alt="NEDAXER"
                  className="w-80 h-32 object-contain"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtle glowing effect behind letters */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <div
              className="w-80 h-32 rounded-full blur-3xl opacity-30"
              style={{
                background: 'radial-gradient(ellipse, rgba(255,165,0,0.4) 0%, transparent 70%)',
              }}
            />
          </motion.div>

          {/* Enhanced title card for 4-second animation */}
          <motion.div
            className="absolute bottom-16 sm:bottom-20 text-center z-20 px-4 max-w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.6, ease: "easeOut" }}
          >
            <motion.h1 
              className="text-white text-lg sm:text-xl md:text-2xl font-bold tracking-wider mb-3"
              animate={{
                textShadow: [
                  '0 0 10px rgba(255,165,0,0.5)',
                  '0 0 20px rgba(255,165,0,0.8)',
                  '0 0 10px rgba(255,165,0,0.5)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              NEDAXER
            </motion.h1>
            
            <motion.div
              className="w-32 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent mx-auto"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 2.5, duration: 0.8 }}
            />
            
            <motion.p
              className="text-orange-300 text-sm font-light tracking-wide mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 0.5 }}
            >
              Cryptocurrency Trading Platform
            </motion.p>
            
            {/* Simplified loading indicator */}
            <motion.div
              className="flex justify-center space-x-1 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.2, duration: 0.4 }}
            >
              {[0, 1, 2].map((i) => (
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
            </motion.div>
          </motion.div>

          {/* Progress bar for 4-second animation */}
          <motion.div
            className="absolute bottom-8 left-8 right-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.3 }}
          >
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-200 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{
                  delay: 1.5,
                  duration: 2.5,
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