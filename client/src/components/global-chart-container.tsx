import { useEffect, useRef, useState } from 'react';
import { useGlobalChartContext } from '@/contexts/global-chart-context';
import { BarChart3 } from 'lucide-react';

interface GlobalChartContainerProps {
  isVisible: boolean;
  symbol?: string;
  className?: string;
  containerId?: string;
}

export function GlobalChartContainer({ 
  isVisible, 
  symbol, 
  className = '', 
  containerId 
}: GlobalChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    showChart, 
    hideChart, 
    changeSymbol, 
    isReady, 
    isLoading, 
    currentSymbol 
  } = useGlobalChartContext();
  
  const [containerIdState] = useState(
    containerId || `chart-container-${Math.random().toString(36).substr(2, 9)}`
  );

  // Mark container as active when visible
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.setAttribute('data-chart-active', isVisible.toString());
      containerRef.current.id = containerIdState;
    }
  }, [isVisible, containerIdState]);

  // Handle visibility changes
  useEffect(() => {
    if (isVisible) {
      showChart(symbol);
    } else {
      hideChart();
    }
  }, [isVisible, symbol, showChart, hideChart]);

  // Handle symbol changes when visible
  useEffect(() => {
    if (isVisible && symbol && symbol !== currentSymbol) {
      changeSymbol(symbol);
    }
  }, [symbol, currentSymbol, isVisible, changeSymbol]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Chart container */}
      <div
        ref={containerRef}
        id={containerIdState}
        data-chart-active={isVisible}
        className="w-full h-full"
        style={{ display: isVisible ? 'block' : 'none' }}
      />

      {/* Loading state */}
      {(isLoading || !isReady) && isVisible && (
        <div className="absolute inset-0 bg-gray-900 z-20 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="mb-4">
              <BarChart3 className="w-12 h-12 mx-auto opacity-50 animate-pulse" />
            </div>
            <p className="text-lg font-medium">Loading Chart...</p>
            <p className="text-sm mt-2">Initializing TradingView</p>
          </div>
        </div>
      )}

      {/* Background watermark */}
      {isVisible && (
        <div 
          className="absolute top-1/2 left-1/2 w-20 h-20 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none z-10"
          style={{
            backgroundImage: "url('https://i.imgur.com/F9ljfzP.png')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        />
      )}

      {/* TradingView Logo Cover */}
      {isVisible && (
        <img 
          src="https://i.imgur.com/1yZtbuJ.jpeg" 
          alt="Nedaxer Logo"
          className="absolute"
          style={{
            bottom: '28px',
            left: '12px',
            width: '50px',
            height: '50px',
            borderRadius: '8px',
            backgroundColor: '#0e0e0e',
            zIndex: 9999,
            pointerEvents: 'auto',
            boxShadow: '0 0 4px #000'
          }}
        />
      )}
    </div>
  );
}