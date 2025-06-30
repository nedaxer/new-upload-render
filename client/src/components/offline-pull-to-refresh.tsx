import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './pull-to-refresh-styles.css';
import { hapticMedium } from '@/lib/haptics';

// Add haptic feedback utility with moderate vibration
const triggerHapticFeedback = () => {
  hapticMedium(); // Use medium haptic feedback for noticeable but gentle vibration
};

// Offline cached assets from public directory
const refreshLogo = '/splash-assets/refresh-logo.png';
const letterN = '/splash-assets/pull-letter-n.png';
const letterE1 = '/splash-assets/pull-letter-e1.png';
const letterD = '/splash-assets/pull-letter-d.png';
const letterA = '/splash-assets/pull-letter-a.png';
const letterX = '/splash-assets/pull-letter-x.png';
const letterE2 = '/splash-assets/pull-letter-e2.png';
const letterR = '/splash-assets/pull-letter-r.png';

interface OfflinePullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

const LOGO_START_THRESHOLD = 60;
const LOGO_COMPLETE_THRESHOLD = 160;
const PULL_THRESHOLD = 180;
const MAX_PULL_DISTANCE = 220;
const letters = [letterN, letterE1, letterD, letterA, letterX, letterE2, letterR];

export function OfflinePullToRefresh({ children, onRefresh, disabled = false }: OfflinePullToRefreshProps) {
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
    if (!isPulling || disabled || isRefreshing) return;
    
    const touch = e.touches[0];
    let newPullDistance = Math.max(0, touch.clientY - startY);
    
    // Apply resistance for smoother pulling
    if (newPullDistance > MAX_PULL_DISTANCE) {
      newPullDistance = MAX_PULL_DISTANCE + (newPullDistance - MAX_PULL_DISTANCE) * 0.1;
    }
    
    // Trigger haptic feedback when header appears
    if (newPullDistance >= MAX_PULL_DISTANCE && !hasTriggeredHaptic) {
      triggerHapticFeedback();
      setHasTriggeredHaptic(true);
    }
    
    setPullDistance(newPullDistance);
    
    // Show Nedaxer header at the maximum pull distance
    if (newPullDistance >= MAX_PULL_DISTANCE && !showNedaxerHeader) {
      setShowNedaxerHeader(true);
    } else if (newPullDistance < MAX_PULL_DISTANCE && showNedaxerHeader && !isReturning) {
      setShowNedaxerHeader(false);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling || disabled) return;
    
    setIsPulling(false);
    setHasTriggeredHaptic(false);
    
    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setIsReturning(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        setIsReturning(false);
        setShowNedaxerHeader(false);
        setPullDistance(0);
      }
    } else {
      setIsReturning(true);
      setTimeout(() => {
        setPullDistance(0);
        setIsReturning(false);
        setShowNedaxerHeader(false);
      }, 300);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, showNedaxerHeader, isReturning, hasTriggeredHaptic]);

  const logoSize = Math.min(
    95, 
    Math.max(0, ((pullDistance - LOGO_START_THRESHOLD) / (LOGO_COMPLETE_THRESHOLD - LOGO_START_THRESHOLD)) * 95)
  );

  const logoOpacity = pullDistance >= LOGO_START_THRESHOLD ? 
    Math.min(1, (pullDistance - LOGO_START_THRESHOLD) / (LOGO_COMPLETE_THRESHOLD - LOGO_START_THRESHOLD)) : 0;

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ 
        transform: `translateY(${Math.min(pullDistance, MAX_PULL_DISTANCE)}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    >
      {/* Enhanced Orange Header with Seamless Blending */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          height: `${Math.min(pullDistance, MAX_PULL_DISTANCE)}px`,
          background: `linear-gradient(135deg, 
            #f97316 0%, 
            #ea580c 30%, 
            #dc2626 100%)`,
          opacity: pullDistance > 0 ? 1 : 0,
          transform: `translateY(-${Math.max(0, MAX_PULL_DISTANCE - pullDistance)}px)`
        }}
      >
        {/* Logo Container */}
        <div className="flex items-center justify-center h-full relative">
          {pullDistance >= LOGO_START_THRESHOLD && (
            <>
              {/* Main refresh logo */}
              <motion.img
                src={refreshLogo}
                alt="Refresh"
                className="absolute"
                style={{
                  width: `${logoSize}%`,
                  height: 'auto',
                  opacity: logoOpacity,
                  filter: 'brightness(1.1) drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
                }}
                animate={{
                  scale: isRefreshing ? [1, 1.1, 1] : 1,
                  rotate: isRefreshing ? 360 : 0,
                }}
                transition={{
                  scale: { duration: 1, repeat: isRefreshing ? Infinity : 0 },
                  rotate: { duration: 2, repeat: isRefreshing ? Infinity : 0, ease: "linear" }
                }}
              />
              
              {/* Release to refresh text */}
              {pullDistance >= PULL_THRESHOLD && !isRefreshing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-2 text-white text-xs font-medium tracking-wide"
                >
                  Release to refresh
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* NEDAXER Header Animation */}
      <AnimatePresence>
        {showNedaxerHeader && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white py-3"
          >
            <div className="flex items-center justify-center space-x-1">
              {letters.map((letter, index) => (
                <motion.img
                  key={index}
                  src={letter}
                  alt={`Letter ${index + 1}`}
                  className="w-6 h-6 object-contain"
                  initial={{ y: 0 }}
                  animate={{
                    y: isRefreshing ? [0, -8, 0, -4, 0] : [0, -12, 0]
                  }}
                  transition={{
                    delay: index * 0.1,
                    duration: isRefreshing ? 1.2 : 0.6,
                    repeat: isRefreshing ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            
            <motion.div
              className="text-center text-xs font-light tracking-wider mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              NEDAXER
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}