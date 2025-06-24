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

const PULL_THRESHOLD = 100;
const LETTER_THRESHOLD = 140;
const MAX_PULL_DISTANCE = 160;
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
      
      // Apply resistance to the pull with progressive resistance
      let resistance;
      if (deltaY <= LETTER_THRESHOLD) {
        resistance = deltaY * 0.8;
      } else {
        resistance = LETTER_THRESHOLD + (deltaY - LETTER_THRESHOLD) * 0.3;
      }
      resistance = Math.min(resistance, MAX_PULL_DISTANCE);
      
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
    if (pullDistance < 20) return 0;
    const progress = Math.min((pullDistance - 20) / 80, 1);
    const letterCount = Math.ceil(progress * letters.length);
    return letterCount;
  };

  const showRefreshLogo = pullDistance >= PULL_THRESHOLD;
  const visibleLetterCount = getVisibleLetters();

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Pull indicator - positioned to push content down */}
      <div 
        className="relative overflow-hidden transition-all duration-300 ease-out bg-gray-900"
        style={{
          height: pullDistance > 0 || isRefreshing ? Math.max(pullDistance, isRefreshing ? 160 : 0) : 0
        }}
      >
        <AnimatePresence>
          {(pullDistance > 0 || isRefreshing) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900"
            >
              {!showRefreshLogo && !isRefreshing && (
                <div className="flex items-center justify-center space-x-1 px-4 w-full">
                  {letters.map((letter, index) => (
                    <motion.img
                      key={index}
                      src={letter}
                      alt={`Letter ${index + 1}`}
                      className="h-10 w-auto flex-shrink-0"
                      style={{
                        opacity: index < visibleLetterCount ? 1 : 0,
                        transform: `scale(${index < visibleLetterCount ? 1 : 0.8})`
                      }}
                    />
                  ))}
                </div>
              )}

              {(showRefreshLogo || isRefreshing) && (
                <div 
                  className="flex items-center justify-center"
                  style={{
                    opacity: showRefreshLogo || isRefreshing ? 1 : 0,
                    transform: `scale(${showRefreshLogo || isRefreshing ? 1 : 0.3}) translateY(${showRefreshLogo || isRefreshing ? 0 : 30}px)`
                  }}
                >
                  <img
                    src={refreshLogo}
                    alt="Refresh Logo"
                    className="h-24 w-24 object-contain"
                  />
                </div>
              )}

              {isRefreshing && (
                <div className="mt-3">
                  <p className="text-orange-400 text-sm font-medium text-center">
                    Refreshing...
                  </p>
                </div>
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