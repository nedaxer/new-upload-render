import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './pull-to-refresh-styles.css';

// Add haptic feedback utility
const triggerHapticFeedback = () => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(50); // Light vibration for 50ms
  }
};

// Import the assets
import refreshLogo from '@assets/Refresh  app logo_1750782062607.png';
import letterN from '@assets/20250618_001640_1750782086856.png';
import letterE1 from '@assets/20250618_001710_1750782086866.png';
import letterD from '@assets/20250618_001748_1750782086877.png';
import letterA from '@assets/20250618_001828_1750782086889.png';
import letterX from '@assets/20250618_001859_1750782086919.png';
import letterE2 from '@assets/20250618_001938_1750782086928.png';
import letterR from '@assets/20250618_002006_1750782086936.png';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

const LOGO_START_THRESHOLD = 40;
const LOGO_COMPLETE_THRESHOLD = 120;
const PULL_THRESHOLD = 140;
const MAX_PULL_DISTANCE = 180;
const letters = [letterN, letterE1, letterD, letterA, letterX, letterE2, letterR];

export function PullToRefresh({ children, onRefresh, disabled = false }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const [hasTriggeredHaptic, setHasTriggeredHaptic] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const touch = e.touches[0];
    setStartY(touch.clientY);
    setIsPulling(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (disabled || isRefreshing || !isPulling) return;

    const touch = e.touches[0];
    const currentY = touch.clientY;
    const deltaY = currentY - startY;

    // Only allow pull when at top of page
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > 0) return;

    if (deltaY > 0) {
      e.preventDefault();
      
      // Apply resistance for smooth pull
      let resistance;
      if (deltaY <= LOGO_START_THRESHOLD) {
        resistance = deltaY * 0.8;
      } else {
        resistance = LOGO_START_THRESHOLD + (deltaY - LOGO_START_THRESHOLD) * 0.6;
      }
      resistance = Math.min(resistance, MAX_PULL_DISTANCE);
      
      // Trigger haptic feedback when logo becomes fully visible
      if (resistance >= LOGO_COMPLETE_THRESHOLD && !hasTriggeredHaptic) {
        triggerHapticFeedback();
        setHasTriggeredHaptic(true);
      }
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        setPullDistance(resistance);
      });
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing || !isPulling) return;

    setIsPulling(false);
    setHasTriggeredHaptic(false);

    // Only trigger refresh if pulled all the way to the threshold
    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        // Keep refreshing animation for 2 seconds as requested
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    // Smoothly reset pull distance
    const resetAnimation = () => {
      setPullDistance(prev => {
        const newDistance = prev * 0.85;
        if (newDistance > 1) {
          requestAnimationFrame(resetAnimation);
          return newDistance;
        }
        return 0;
      });
    };
    resetAnimation();
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPulling, startY, pullDistance, isRefreshing, disabled, hasTriggeredHaptic]);

  const showLogo = pullDistance >= LOGO_START_THRESHOLD;
  const logoComplete = pullDistance >= LOGO_COMPLETE_THRESHOLD;
  const showReleaseMessage = pullDistance >= PULL_THRESHOLD;

  const getLogoOpacity = () => {
    if (!showLogo) return 0;
    if (logoComplete) return 1;
    const progress = Math.min(Math.max((pullDistance - LOGO_START_THRESHOLD) / (LOGO_COMPLETE_THRESHOLD - LOGO_START_THRESHOLD), 0), 1);
    return progress;
  };

  const getLogoScale = () => {
    if (!showLogo) return 0.3;
    if (logoComplete) return 1;
    const progress = Math.min(Math.max((pullDistance - LOGO_START_THRESHOLD) / (LOGO_COMPLETE_THRESHOLD - LOGO_START_THRESHOLD), 0), 1);
    // Smooth easing for scale animation
    const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
    return 0.3 + (easedProgress * 0.7);
  };

  const getScrollProgress = () => {
    return Math.min(pullDistance / MAX_PULL_DISTANCE, 1);
  };

  const logoOpacity = getLogoOpacity();
  const logoScale = getLogoScale();
  const scrollProgress = getScrollProgress();

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Pull indicator with dark background and brand color edges */}
      <div 
        className="relative overflow-hidden transition-all duration-300 ease-out"
        style={{
          height: pullDistance > 0 || isRefreshing ? Math.max(pullDistance, isRefreshing ? 160 : 0) : 0,
          background: `linear-gradient(180deg, 
            hsl(39, 100%, 50%) 0%, 
            hsl(39, 80%, 40%) 10%, 
            rgb(17, 24, 39) 25%, 
            rgb(17, 24, 39) 75%, 
            hsl(39, 80%, 40%) 90%, 
            hsl(39, 100%, 50%) 100%)`
        } as React.CSSProperties}
      >
        <AnimatePresence>
          {(pullDistance > 0 || isRefreshing) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20,
                duration: 0.6
              }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              {/* No initial letters - removed as requested */}

              {/* Show refresh logo with smooth slide and scale animation */}
              {showLogo && !isRefreshing && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.3, y: 20 }}
                  animate={{ 
                    opacity: logoOpacity, 
                    scale: logoScale,
                    y: 0
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    mass: 0.8
                  }}
                  className="flex items-center justify-center h-full w-full"
                >
                  <img
                    src={refreshLogo}
                    alt="Refresh Logo"
                    className="object-contain drop-shadow-lg"
                    style={{
                      height: '80%',
                      width: 'auto',
                      maxWidth: '80%',
                      filter: 'brightness(1.1) contrast(1.1)'
                    }}
                  />
                </motion.div>
              )}

              {/* Release to refresh message */}
              {showReleaseMessage && !isRefreshing && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
                >
                  <p className="text-white text-sm font-medium text-center drop-shadow-md">
                    Release to refresh
                  </p>
                </motion.div>
              )}

              {/* Refreshing state: Show NEDAXER with enhanced jumping animation */}
              {isRefreshing && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full w-full"
                >
                  <div className="flex items-center justify-center space-x-1 px-4 mb-4">
                    {letters.map((letter, index) => (
                      <motion.img
                        key={index}
                        src={letter}
                        alt={`Letter ${index + 1}`}
                        className="h-5 w-auto flex-shrink-0 drop-shadow-md"
                        initial={{ y: 0 }}
                        animate={{ 
                          y: [0, -12, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.1,
                          repeat: Infinity,
                          repeatType: "loop",
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-white text-sm font-medium text-center drop-shadow-md"
                  >
                    Refreshing...
                  </motion.p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}