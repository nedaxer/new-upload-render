import { useEffect, memo } from 'react';
import { usePersistentChart } from './persistent-chart-manager';

interface TradingViewWidgetProps {
  symbol?: string;
  width?: string;
  height?: string;
  locale?: string;
  theme?: 'light' | 'dark';
  style?: '1' | '2' | '3' | '8' | '9';
  toolbar_bg?: string;
  enable_publishing?: boolean;
  allow_symbol_change?: boolean;
  container_id?: string;
  autosize?: boolean;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = memo(({
  symbol = 'BINANCE:BTCUSDT',
  width = '100%',
  height = '400'
}) => {
  const { 
    containerRef, 
    isReady, 
    isLoading, 
    error, 
    showChart, 
    changeSymbol 
  } = usePersistentChart();

  useEffect(() => {
    if (isReady) {
      showChart();
      if (symbol) {
        changeSymbol(symbol);
      }
    }
  }, [isReady, symbol, showChart, changeSymbol]);

  if (error) {
    return (
      <div className="tradingview-widget-container flex items-center justify-center" style={{ width, height }}>
        <div className="text-center text-gray-400">
          <p>Chart unavailable</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-orange-600 text-white rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="tradingview-widget-container flex items-center justify-center" style={{ width, height }}>
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
          <p>Loading chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tradingview-widget-container" style={{ width, height }}>
      <div
        ref={containerRef}
        className="tradingview-widget"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
});

TradingViewWidget.displayName = 'TradingViewWidget';

export default TradingViewWidget;