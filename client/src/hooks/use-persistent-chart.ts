import { useEffect, useRef, useCallback } from 'react';
import PersistentChartManager from '@/lib/persistent-chart-manager';

export function usePersistentChart() {
  const chartManager = useRef<PersistentChartManager | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!chartManager.current) {
      chartManager.current = PersistentChartManager.getInstance();
    }
  }, []);

  const initializeChart = useCallback(async (symbol: string = 'BYBIT:BTCUSDT') => {
    if (!chartManager.current || isInitialized.current) return true;
    
    const success = await chartManager.current.initializeChart(symbol);
    if (success) {
      isInitialized.current = true;
    }
    return success;
  }, []);

  const showChart = useCallback((containerElement: HTMLElement) => {
    if (!chartManager.current) return false;
    return chartManager.current.moveChartToContainer(containerElement);
  }, []);

  const hideChart = useCallback(() => {
    if (!chartManager.current) return;
    chartManager.current.hideChart();
  }, []);

  const changeSymbol = useCallback(async (symbol: string) => {
    if (!chartManager.current) return;
    await chartManager.current.changeSymbol(symbol);
  }, []);

  const getCurrentSymbol = useCallback(() => {
    if (!chartManager.current) return 'BTCUSDT';
    return chartManager.current.getCurrentSymbol();
  }, []);

  const isReady = useCallback(() => {
    if (!chartManager.current) return false;
    return chartManager.current.isChartReady();
  }, []);

  return {
    initializeChart,
    showChart,
    hideChart,
    changeSymbol,
    getCurrentSymbol,
    isReady
  };
}