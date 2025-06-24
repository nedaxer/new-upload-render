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
    
    // Check if we're at the top of the container or window
    const isAtTop = container.scrollTop <= 5 || window.scrollY <= 5;
    
    if (isAtTop) {
      startYRef.current = e.touches[0].clientY;
      setIsPulling(true);
      setHasTriggeredVibration(false);
      console.log('Pull to refresh started at Y:', startYRef.current);
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || !isPulling) return;
    
    currentYRef.current = e.touches[0].clientY;
    const distance = Math.max(0, currentYRef.current - startYRef.current);
    
    console.log('Touch move distance:', distance);
    
    if (distance > 10) { // Small threshold to avoid accidental triggers
      e.preventDefault(); // Prevent default scrolling
      setPullDistance(Math.min(distance, threshold * 1.8));
      
      // Trigger haptic feedback when threshold is reached
      if (distance >= threshold && !hasTriggeredVibration) {
        console.log('Triggering haptic feedback');
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

    // Add listeners to both container and document for better detection
    const addListeners = (element: Element | Document) => {
      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd, { passive: false });
    };

    const removeListeners = (element: Element | Document) => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };

    addListeners(container);
    addListeners(document);

    return () => {
      removeListeners(container);
      removeListeners(document);
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