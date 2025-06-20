import { useCallback } from 'react';

// Simplified persistent chart hook that works with the global system
export const usePersistentChart = () => {

  const showChart = useCallback(() => {
    if (window.nedaxerGlobalChart) {
      window.nedaxerGlobalChart.isVisible = true;
      return true;
    }
    return false;
  }, []);

  const hideChart = useCallback(() => {
    if (window.nedaxerGlobalChart) {
      window.nedaxerGlobalChart.isVisible = false;
    }
  }, []);

  const isChartReady = useCallback(() => {
    return window.nedaxerGlobalChart?.isReady || false;
  }, []);

  const isChartVisible = useCallback(() => {
    return window.nedaxerGlobalChart?.isVisible || false;
  }, []);

  const getChartSymbol = useCallback(() => {
    return window.nedaxerGlobalChart?.currentSymbol || 'BTCUSDT';
  }, []);

  const updateChartSymbol = useCallback((symbol: string) => {
    if (window.nedaxerGlobalChart && window.nedaxerGlobalChart.widget && window.nedaxerGlobalChart.isReady) {
      try {
        window.nedaxerGlobalChart.widget.setSymbol(symbol, "15");
        window.nedaxerGlobalChart.currentSymbol = symbol;
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  }, []);

  return {
    showChart,
    hideChart,
    isChartReady,
    isChartVisible,
    getChartSymbol,
    updateChartSymbol
  };
};