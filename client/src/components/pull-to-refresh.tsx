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

const LOGO_START_THRESHOLD = 60;
const LOGO_COMPLETE_THRESHOLD = 160;
const PULL_THRESHOLD = 180;
const MAX_PULL_DISTANCE = 220;
const letters = [letterN, letterE1, letterD, letterA, letterX, letterE2, letterR];

export function PullToRefresh({ children, onRefresh, disabled = false }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const [hasTriggeredHaptic, setHasTriggeredHaptic] = useState(false);
  const [showNedaxerHeader, setShowNedaxerHeader] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
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
      
      // Trigger haptic feedback when logo AND header are fully visible like a CD
      if (resistance >= PULL_THRESHOLD && !hasTriggeredHaptic) {
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
      // Immediately reset pull distance to make logo return
      setPullDistance(0);
      setIsRefreshing(true);
      setIsReturning(true);
      
      // Show Nedaxer header immediately
      setShowNedaxerHeader(true);
      
      try {
        await onRefresh();
        // Keep refreshing animation for 2 seconds as requested
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        // Hide Nedaxer header after refresh completes
        setTimeout(() => {
          setShowNedaxerHeader(false);
          setIsReturning(false);
        }, 500);
      }
    } else {
      // Smoothly reset pull distance if not refreshing
      const resetAnimation = () => {
        setPullDistance(prev => {
          const newDistance = prev * 0.85;
          if (newDistance > 1) {
            requestAnimationFrame(resetAnimation);
            return newDistance;
          }
          setIsReturning(false);
          return 0;
        });
      };
      resetAnimation();
    }
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
      {/* Pull indicator with orange gradient blending seamlessly with mobile page */}
      {pullDistance > 0 && (
        <div 
          className="relative overflow-hidden transition-all duration-300 ease-out"
          style={{
            height: pullDistance,
            background: 'linear-gradient(180deg, hsl(39, 100%, 50%) 0%, hsl(39, 95%, 48%) 15%, hsl(39, 85%, 45%) 30%, hsl(39, 70%, 40%) 45%, hsl(220, 13%, 35%) 60%, hsl(220, 13%, 25%) 75%, hsl(220, 13%, 18%) 90%, hsl(220, 13%, 15%) 100%)'
          } as React.CSSProperties}
        >
          {/* Smooth gradient transition that blends perfectly with mobile page */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(75, 85, 99, 0) 0%, rgba(71, 85, 105, 0.2) 20%, rgba(55, 65, 81, 0.4) 40%, rgba(51, 65, 85, 0.6) 60%, rgba(47, 59, 77, 0.8) 80%, hsl(220, 13%, 15%) 100%)'
            }}
          />
          
          <AnimatePresence>
            {pullDistance > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ 
                  opacity: 0, 
                  y: -50,
                  transition: { duration: 0.4, ease: "easeInOut" }
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 120, 
                  damping: 25,
                  duration: 0.8
                }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                {/* Show much bigger refresh logo */}
                {showLogo && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.2, y: -80 }}
                    animate={{ 
                      opacity: logoOpacity, 
                      scale: logoScale,
                      y: 0
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 140,
                      damping: 28,
                      mass: 1.8,
                      duration: 2.0
                    }}
                    className="flex items-center justify-center h-full w-full relative"
                  >
                    <motion.img
                      src={refreshLogo}
                      alt="Refresh Logo"
                      className="object-contain drop-shadow-2xl"
                      style={{
                        height: '95%',
                        width: 'auto',
                        maxWidth: '95%',
                        filter: 'brightness(1.2) contrast(1.15) drop-shadow(0 12px 36px rgba(0,0,0,0.4))'
                      }}
                      animate={{
                        filter: [
                          'brightness(1.2) contrast(1.15) drop-shadow(0 12px 36px rgba(0,0,0,0.4))',
                          'brightness(1.3) contrast(1.2) drop-shadow(0 16px 48px rgba(0,0,0,0.5))',
                          'brightness(1.2) contrast(1.15) drop-shadow(0 12px 36px rgba(0,0,0,0.4))'
                        ]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* Release to refresh message positioned under the logo */}
                    {showReleaseMessage && (
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                      >
                        <p className="text-white text-lg font-bold text-center drop-shadow-2xl">
                          Release to refresh
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Separate Nedaxer header that blends seamlessly with mobile page */}
      <AnimatePresence>
        {showNedaxerHeader && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 90, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeInOut",
              height: { duration: 0.6 },
              opacity: { duration: 0.4 }
            }}
            className="relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, hsl(220, 13%, 15%) 0%, hsl(220, 13%, 18%) 25%, hsl(220, 13%, 20%) 50%, hsl(220, 13%, 18%) 75%, hsl(220, 13%, 15%) 100%)'
            }}
          >
            <motion.div
              initial={{ y: -30, scale: 0.8 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -30, scale: 0.8 }}
              transition={{ 
                delay: 0.2, 
                duration: 0.6, 
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              className="flex items-center justify-center h-full px-4"
            >
              <div className="flex items-center space-x-2">
                {letters.map((letter, index) => (
                  <motion.img
                    key={`header-${index}`}
                    src={letter}
                    alt={`Letter ${index + 1}`}
                    className="h-7 w-auto flex-shrink-0 drop-shadow-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: [0, -10, 0]
                    }}
                    transition={{
                      opacity: {
                        delay: 0.4 + (index * 0.1),
                        duration: 0.5
                      },
                      y: {
                        delay: 0.6 + (index * 0.1),
                        duration: 0.9,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut"
                      }
                    }}
                  />
                ))}
              </div>
            </motion.div>
            
            {/* Perfect gradient blend with mobile page */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(55, 65, 81, 0.6) 0%, rgba(51, 65, 85, 0.4) 30%, rgba(47, 59, 77, 0.2) 60%, rgba(45, 55, 72, 0.1) 80%, transparent 100%)'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}