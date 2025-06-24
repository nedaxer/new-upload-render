import React from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { NedaxerSpinner } from '@/components/NedaxerSpinner';

interface PullToRefreshWrapperProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
}

export function PullToRefreshWrapper({ children, onRefresh, disabled = false }: PullToRefreshWrapperProps) {
  const { 
    containerRef, 
    isRefreshing, 
    isPulling,
    pullProgress,
    shouldShowPullIndicator 
  } = usePullToRefresh({
    onRefresh,
    threshold: 100,
    disabled
  });

  return (
    <div className="relative h-full">
      {/* Nedaxer Spinner */}
      <NedaxerSpinner 
        isVisible={isRefreshing}
        isPulling={shouldShowPullIndicator}
        pullProgress={pullProgress}
        onComplete={() => {
          // Additional cleanup if needed
        }}
      />
      
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y' // Allow vertical panning
        }}
      >
        {children}
      </div>
    </div>
  );
}