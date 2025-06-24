import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  disabled?: boolean;
}

export function usePullToRefresh({ 
  onRefresh, 
  threshold = 100, 
  disabled = false 
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [hasTriggeredVibration, setHasTriggeredVibration] = useState(false);
  
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Haptic feedback function
  const triggerHapticFeedback = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration
    }
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Only trigger if we're at the top of the page
    if (container.scrollTop <= 5) { // Allow small margin for precise detection
      startYRef.current = e.touches[0].clientY;
      setIsPulling(true);
      setHasTriggeredVibration(false);
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || !isPulling) return;
    
    currentYRef.current = e.touches[0].clientY;
    const distance = Math.max(0, currentYRef.current - startYRef.current);
    
    if (distance > 0) {
      e.preventDefault(); // Prevent default scrolling
      setPullDistance(Math.min(distance, threshold * 1.8));
      
      // Trigger haptic feedback when threshold is reached
      if (distance >= threshold && !hasTriggeredVibration) {
        triggerHapticFeedback();
        setHasTriggeredVibration(true);
      }
    }
  }, [disabled, isRefreshing, isPulling, threshold, hasTriggeredVibration, triggerHapticFeedback]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing || !isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      triggerHapticFeedback(); // Feedback on refresh start
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        // Add minimum loading time for better UX
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 1500);
      }
    } else {
      // Smooth reset if threshold not reached
      setPullDistance(0);
    }
  }, [disabled, isRefreshing, isPulling, pullDistance, threshold, onRefresh, triggerHapticFeedback]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use passive: false to allow preventDefault
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const shouldShowSpinner = isRefreshing;
  const shouldShowPullIndicator = isPulling && pullDistance > 20;

  return {
    containerRef,
    isRefreshing,
    isPulling,
    pullDistance,
    pullProgress,
    shouldShowSpinner,
    shouldShowPullIndicator
  };
}