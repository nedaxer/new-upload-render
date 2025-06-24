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

const LETTER_COMPLETE_THRESHOLD = 90;
const LOGO_START_THRESHOLD = 100;
const PULL_THRESHOLD = 160;
const MAX_PULL_DISTANCE = 200;
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
      
      // Apply progressive resistance for slower, smoother pull
      let resistance;
      if (deltaY <= LETTER_COMPLETE_THRESHOLD) {
        resistance = deltaY * 0.7; // Slower initial pull for letters
      } else if (deltaY <= LOGO_START_THRESHOLD) {
        resistance = LETTER_COMPLETE_THRESHOLD + (deltaY - LETTER_COMPLETE_THRESHOLD) * 0.6;
      } else {
        resistance = LOGO_START_THRESHOLD + (deltaY - LOGO_START_THRESHOLD) * 0.5; // Even slower for logo
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

    // Only trigger refresh if pulled all the way to the threshold
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
    if (pullDistance < 10) return 0;
    const progress = Math.min((pullDistance - 10) / (LETTER_COMPLETE_THRESHOLD - 10), 1);
    const letterCount = Math.ceil(progress * letters.length);
    return letterCount;
  };

  const getLetterOpacity = () => {
    if (pullDistance < LETTER_COMPLETE_THRESHOLD) return 1;
    if (pullDistance < LOGO_START_THRESHOLD) {
      // Fade out letters between LETTER_COMPLETE_THRESHOLD and LOGO_START_THRESHOLD
      const fadeProgress = (pullDistance - LETTER_COMPLETE_THRESHOLD) / (LOGO_START_THRESHOLD - LETTER_COMPLETE_THRESHOLD);
      return 1 - fadeProgress;
    }
    return 0;
  };

  const getLogoOpacity = () => {
    if (pullDistance < LOGO_START_THRESHOLD) return 0;
    const progress = Math.min((pullDistance - LOGO_START_THRESHOLD) / (PULL_THRESHOLD - LOGO_START_THRESHOLD), 1);
    return progress;
  };

  const getLogoScale = () => {
    if (pullDistance < LOGO_START_THRESHOLD) return 0.3;
    const progress = Math.min((pullDistance - LOGO_START_THRESHOLD) / (PULL_THRESHOLD - LOGO_START_THRESHOLD), 1);
    return 0.3 + (progress * 0.7); // Scale from 0.3 to 1.0
  };

  const showRefreshLogo = pullDistance >= LOGO_START_THRESHOLD;
  const visibleLetterCount = getVisibleLetters();
  const letterOpacity = getLetterOpacity();
  const logoOpacity = getLogoOpacity();
  const logoScale = getLogoScale();

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Pull indicator - positioned to push content down */}
      <div 
        className="relative overflow-hidden transition-all duration-300 ease-out bg-gray-900"
        style={{
          height: pullDistance > 0 || isRefreshing ? Math.max(pullDistance, isRefreshing ? 200 : 0) : 0
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
              {/* Show NEDAXER letters progressively coming together */}
              {pullDistance > 0 && letterOpacity > 0 && !isRefreshing && (
                <div 
                  className="flex items-center justify-center space-x-1 px-4 w-full transition-all duration-500 ease-out"
                  style={{
                    opacity: letterOpacity,
                    transform: `scale(${Math.min(1, pullDistance / LETTER_COMPLETE_THRESHOLD)})`
                  }}
                >
                  {letters.map((letter, index) => (
                    <img
                      key={index}
                      src={letter}
                      alt={`Letter ${index + 1}`}
                      className="h-14 w-auto flex-shrink-0 transition-all duration-300 ease-out"
                      style={{
                        opacity: index < visibleLetterCount ? 1 : 0.1,
                        transform: `
                          scale(${index < visibleLetterCount ? 1 : 0.6}) 
                          translateY(${index < visibleLetterCount ? 0 : 15}px)
                          translateX(${index < visibleLetterCount ? 0 : (index - visibleLetterCount + 1) * 10}px)
                        `
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Show large refresh logo emerging from buried state */}
              {showRefreshLogo && (
                <div 
                  className="flex items-center justify-center h-full w-full transition-all duration-700 ease-out"
                  style={{
                    opacity: logoOpacity,
                    transform: `scale(${logoScale}) translateY(${30 - (logoOpacity * 30)}px)`
                  }}
                >
                  <img
                    src={refreshLogo}
                    alt="Refresh Logo"
                    className="object-contain"
                    style={{
                      height: '95%',
                      width: 'auto',
                      maxWidth: '95%',
                      filter: `brightness(${0.7 + (logoOpacity * 0.3)})` // Darker when buried, brighter when revealed
                    }}
                  />
                </div>
              )}

              {/* Refreshing text */}
              {isRefreshing && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                  <p className="text-orange-400 text-base font-medium text-center animate-pulse">
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