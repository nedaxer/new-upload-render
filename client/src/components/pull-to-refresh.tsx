import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

const PULL_THRESHOLD = 80;
const LETTER_THRESHOLD = 120;
const letters = [letterN, letterE1, letterD, letterA, letterX, letterE2, letterR];

export function PullToRefresh({ children, onRefresh, disabled = false }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
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
      
      // Apply resistance to the pull
      const resistance = Math.min(deltaY * 0.6, LETTER_THRESHOLD);
      
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

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    // Smoothly reset pull distance
    const resetAnimation = () => {
      setPullDistance(prev => {
        const newDistance = prev * 0.8;
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
  }, [isPulling, startY, pullDistance, isRefreshing, disabled]);

  const getVisibleLetters = () => {
    const progress = Math.min(pullDistance / LETTER_THRESHOLD, 1);
    const letterCount = Math.floor(progress * letters.length);
    return Math.min(letterCount, letters.length);
  };

  const showRefreshLogo = pullDistance >= PULL_THRESHOLD;
  const visibleLetterCount = getVisibleLetters();

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Pull indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-transparent"
            style={{
              height: Math.max(pullDistance + 40, isRefreshing ? 120 : 0),
              background: `linear-gradient(to bottom, 
                rgb(17, 24, 39) 0%, 
                rgb(31, 41, 55) 40%, 
                rgba(249, 115, 22, 0.1) 70%, 
                transparent 100%)`
            }}
          >
            {!showRefreshLogo && !isRefreshing && (
              <div className="flex items-center justify-center space-x-1 mt-4">
                {letters.slice(0, visibleLetterCount).map((letter, index) => (
                  <motion.img
                    key={index}
                    src={letter}
                    alt={`Letter ${index}`}
                    className="h-8 w-auto"
                    initial={{ opacity: 0, y: -20, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      transition: { 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }
                    }}
                  />
                ))}
              </div>
            )}

            {(showRefreshLogo || isRefreshing) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: -30 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  rotate: isRefreshing ? 360 : 0
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20,
                  rotate: { 
                    duration: isRefreshing ? 2 : 0, 
                    repeat: isRefreshing ? Infinity : 0,
                    ease: "linear"
                  }
                }}
                className="mt-4"
              >
                <img
                  src={refreshLogo}
                  alt="Refresh Logo"
                  className="h-16 w-16 object-contain"
                />
              </motion.div>
            )}

            {isRefreshing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2"
              >
                <p className="text-orange-400 text-sm font-medium">
                  Refreshing...
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${Math.min(pullDistance * 0.5, 60)}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
}