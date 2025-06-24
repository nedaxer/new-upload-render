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
      setIsReturning(true);
      
      try {
        await onRefresh();
        // Keep refreshing animation for 2 seconds as requested
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        // Show Nedaxer header after refresh completes
        setTimeout(() => {
          setShowNedaxerHeader(true);
          // Hide Nedaxer header after 3 seconds
          setTimeout(() => {
            setShowNedaxerHeader(false);
            setIsReturning(false);
          }, 3000);
        }, 500);
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
        setIsReturning(false);
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
      {/* Pull indicator with black background and gradient transition */}
      <div 
        className="relative overflow-hidden transition-all duration-500 ease-out"
        style={{
          height: pullDistance > 0 || isRefreshing ? Math.max(pullDistance, isRefreshing ? 160 : 0) : 0,
          background: 'linear-gradient(180deg, #000000 0%, #000000 70%, #1f2937 85%, #374151 100%)'
        } as React.CSSProperties}
      >
        <AnimatePresence>
          {(pullDistance > 0 || isRefreshing) && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ 
                opacity: 0, 
                y: -30,
                transition: { duration: 0.8, ease: "easeInOut" }
              }}
              transition={{ 
                type: "spring", 
                stiffness: 120, 
                damping: 25,
                duration: 1.2
              }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              {/* Show refresh logo with CD-like rotation and drop animation */}
              {showLogo && !isRefreshing && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.2, y: -50, rotateY: -180 }}
                  animate={{ 
                    opacity: logoOpacity, 
                    scale: logoScale,
                    y: 0,
                    rotateY: logoComplete ? 0 : -90
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 35,
                    mass: 1.2,
                    duration: 1.5
                  }}
                  className="flex items-center justify-center h-full w-full"
                  style={{ perspective: '1000px' }}
                >
                  <motion.img
                    src={refreshLogo}
                    alt="Refresh Logo"
                    className="object-contain drop-shadow-xl"
                    style={{
                      height: '70%',
                      width: 'auto',
                      maxWidth: '70%',
                      filter: 'brightness(1.2) contrast(1.15) drop-shadow(0 4px 12px rgba(255,255,255,0.1))',
                      transformStyle: 'preserve-3d'
                    }}
                    animate={{
                      filter: [
                        'brightness(1.2) contrast(1.15) drop-shadow(0 4px 12px rgba(255,255,255,0.1))',
                        'brightness(1.3) contrast(1.2) drop-shadow(0 6px 16px rgba(255,255,255,0.15))',
                        'brightness(1.2) contrast(1.15) drop-shadow(0 4px 12px rgba(255,255,255,0.1))'
                      ],
                      rotateZ: logoComplete ? [0, 5, -5, 0] : 0
                    }}
                    transition={{
                      filter: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      },
                      rotateZ: {
                        duration: 0.8,
                        repeat: logoComplete ? Infinity : 0,
                        ease: "easeInOut"
                      }
                    }}
                  />
                </motion.div>
              )}

              {/* Release to refresh message */}
              {showReleaseMessage && !isRefreshing && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
                >
                  <p className="text-white text-sm font-medium text-center drop-shadow-lg">
                    Release to refresh
                  </p>
                </motion.div>
              )}

              {/* Refreshing state: Simple loading indicator without jumping letters */}
              {isRefreshing && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="flex flex-col items-center justify-center h-full w-full"
                >
                  <motion.div
                    className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-white text-sm font-medium text-center drop-shadow-lg mt-4"
                  >
                    Refreshing...
                  </motion.p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Smooth gradient transition to match app color */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(31,41,55,0.6) 30%, rgba(55,65,81,0.4) 60%, rgba(75,85,99,0.2) 80%, transparent 100%)'
          }}
        />
      </div>

      {/* Separate Nedaxer header with app-matching colors */}
      <AnimatePresence>
        {showNedaxerHeader && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 60, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeInOut",
              height: { duration: 0.6 },
              opacity: { duration: 0.4 }
            }}
            className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 border-b border-slate-600"
          >
            <motion.div
              initial={{ y: -20, scale: 0.8 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -20, scale: 0.8 }}
              transition={{ 
                delay: 0.2, 
                duration: 0.6, 
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              className="flex items-center justify-center h-full px-4"
            >
              <div className="flex items-center space-x-1">
                {letters.map((letter, index) => (
                  <motion.img
                    key={`header-${index}`}
                    src={letter}
                    alt={`Letter ${index + 1}`}
                    className="h-4 w-auto flex-shrink-0 drop-shadow-md"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.4 + (index * 0.08),
                      duration: 0.4,
                      type: "spring",
                      stiffness: 300
                    }}
                  />
                ))}
              </div>
            </motion.div>
            
            {/* Subtle gradient bottom edge matching app theme */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-2 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(51,65,85,0.6) 0%, rgba(71,85,105,0.3) 50%, transparent 100%)'
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