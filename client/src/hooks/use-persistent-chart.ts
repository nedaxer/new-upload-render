/**
 * Hook for managing persistent chart state across navigation
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { chartCacheManager } from '../utils/chart-cache-manager';

interface UsePersistentChartOptions {
  symbol: string;
  onChartReady?: (symbol: string) => void;
  onChartError?: (error: string) => void;
}

export function usePersistentChart({ symbol, onChartReady, onChartError }: UsePersistentChartOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<any>(null);
  const widgetRef = useRef<any>(null);

  // Check if chart is already cached and ready
  const isChartCached = useCallback(() => {
    return chartCacheManager.isChartReady(symbol);
  }, [symbol]);

  // Initialize or restore chart
  const initializeChart = useCallback(async () => {
    if (isChartCached() && widgetRef.current) {
      // Chart is already ready, just update symbol if needed
      setIsReady(true);
      onChartReady?.(symbol);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if TradingView is available
      if (!(window as any).TradingView) {
        throw new Error('TradingView library not loaded');
      }

      // Try to get cached data first
      const cachedData = chartCacheManager.getCachedChartData(symbol);
      
      // Create or update chart widget
      const container = document.getElementById('tradingview-chart');
      if (!container) {
        throw new Error('Chart container not found');
      }

      // Clear existing widget if symbol changed
      const currentState = chartCacheManager.getChartState();
      if (currentState?.symbol !== symbol && widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }

      // Create new widget if needed
      if (!widgetRef.current) {
        widgetRef.current = new (window as any).TradingView.widget({
          container_id: 'tradingview-chart',
          symbol: `BYBIT:${symbol}`,
          interval: currentState?.timeframe || '1D',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#1f2937',
          enable_publishing: false,
          allow_symbol_change: false,
          calendar: false,
          hide_side_toolbar: false,
          studies: currentState?.indicators ? Object.keys(currentState.indicators).filter(k => currentState.indicators[k]) : ['Volume'],
          width: '100%',
          height: '100%',
          autosize: true,
          onChartReady: () => {
            chartCacheManager.setChartReady(symbol);
            setIsReady(true);
            setIsLoading(false);
            onChartReady?.(symbol);
          }
        });
      } else {
        // Update existing widget symbol
        widgetRef.current.setSymbol(`BYBIT:${symbol}`, () => {
          chartCacheManager.setChartReady(symbol);
          setIsReady(true);
          setIsLoading(false);
          onChartReady?.(symbol);
        });
      }

      // Preload chart data in background
      chartCacheManager.preloadChartData(symbol);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize chart';
      setError(errorMessage);
      setIsLoading(false);
      onChartError?.(errorMessage);
    }
  }, [symbol, isChartCached, onChartReady, onChartError]);

  // Load TradingView script if not already loaded
  const loadTradingViewScript = useCallback(() => {
    if ((window as any).TradingView) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';

      script.onload = () => {
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load TradingView script'));
      };

      document.head.appendChild(script);
    });
  }, []);

  // Initialize chart when component mounts or symbol changes
  useEffect(() => {
    const init = async () => {
      try {
        await loadTradingViewScript();
        await initializeChart();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load chart';
        setError(errorMessage);
        setIsLoading(false);
        onChartError?.(errorMessage);
      }
    };

    init();
  }, [symbol, loadTradingViewScript, initializeChart, onChartError]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch (error) {
        console.warn('Error cleaning up chart widget:', error);
      }
      widgetRef.current = null;
    }
  }, []);

  // Update chart settings
  const updateChartSettings = useCallback((settings: { timeframe?: string; indicators?: Record<string, boolean> }) => {
    if (!widgetRef.current) return;

    try {
      if (settings.timeframe) {
        widgetRef.current.chart().setResolution(settings.timeframe);
      }

      chartCacheManager.updateChartState(settings);
    } catch (error) {
      console.warn('Error updating chart settings:', error);
    }
  }, []);

  return {
    isLoading,
    isReady,
    error,
    chartRef,
    initializeChart,
    cleanup,
    updateChartSettings,
    isChartCached: isChartCached()
  };
}