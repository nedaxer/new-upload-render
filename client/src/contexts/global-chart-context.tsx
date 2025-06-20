import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useGlobalChart } from '@/hooks/use-global-chart';

interface GlobalChartContextType {
  isChartVisible: boolean;
  currentSymbol: string;
  showChart: (symbol?: string) => void;
  hideChart: () => void;
  changeSymbol: (symbol: string) => void;
  isReady: boolean;
  isLoading: boolean;
}

const GlobalChartContext = createContext<GlobalChartContextType | null>(null);

interface GlobalChartProviderProps {
  children: ReactNode;
}

export function GlobalChartProvider({ children }: GlobalChartProviderProps) {
  const [isChartVisible, setIsChartVisible] = useState(false);
  const [currentSymbol, setCurrentSymbol] = useState('BYBIT:BTCUSDT');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    isReady,
    isLoading,
    initializeChart,
    showChartInContainer,
    hideChart: hideGlobalChart,
    changeSymbol: changeGlobalSymbol,
    getCurrentSymbol
  } = useGlobalChart();

  // Initialize chart on mount
  useEffect(() => {
    if (!isReady && !isLoading) {
      initializeChart(currentSymbol);
    }
  }, [isReady, isLoading, initializeChart, currentSymbol]);

  const showChart = (symbol?: string) => {
    if (symbol && symbol !== currentSymbol) {
      setCurrentSymbol(symbol);
      if (isReady) {
        changeGlobalSymbol(symbol);
      }
    }
    setIsChartVisible(true);
    
    // Find active chart container and show chart there
    const activeContainer = document.querySelector('[data-chart-active="true"]');
    if (activeContainer && activeContainer.id) {
      showChartInContainer(activeContainer.id);
    }
  };

  const hideChart = () => {
    setIsChartVisible(false);
    hideGlobalChart();
  };

  const changeSymbol = (symbol: string) => {
    setCurrentSymbol(symbol);
    if (isReady) {
      changeGlobalSymbol(symbol);
    }
  };

  const contextValue: GlobalChartContextType = {
    isChartVisible,
    currentSymbol,
    showChart,
    hideChart,
    changeSymbol,
    isReady,
    isLoading
  };

  return (
    <GlobalChartContext.Provider value={contextValue}>
      {children}
    </GlobalChartContext.Provider>
  );
}

export function useGlobalChartContext(): GlobalChartContextType {
  const context = useContext(GlobalChartContext);
  if (!context) {
    throw new Error('useGlobalChartContext must be used within a GlobalChartProvider');
  }
  return context;
}