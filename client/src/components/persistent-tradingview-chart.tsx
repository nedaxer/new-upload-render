import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    TradingView: any;
    persistentTradingViewWidget: any;
    tradingViewChartInitialized: boolean;
  }
}

interface PersistentTradingViewChartProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
  onReady?: () => void;
}

export function PersistentTradingViewChart({ 
  symbol = 'BYBIT:BTCUSDT', 
  interval = '15',
  theme = 'dark',
  onReady 
}: PersistentTradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<string>('--');
  const [priceMetrics, setPriceMetrics] = useState({
    high: '--',
    low: '--',
    turnover: '--'
  });

  // Update price data
  const updatePrice = useCallback(async (apiSymbol: string) => {
    try {
      const response = await fetch(`https://api.bybit.com/v5/market/tickers?category=linear&symbol=${apiSymbol}`);
      const data = await response.json();
      
      if (data.result && data.result.list && data.result.list[0]) {
        const ticker = data.result.list[0];
        const price = parseFloat(ticker.lastPrice).toFixed(2);
        const high = parseFloat(ticker.highPrice24h).toFixed(2);
        const low = parseFloat(ticker.lowPrice24h).toFixed(2);
        const turnover = (parseFloat(ticker.turnover24h) / 1e6).toFixed(2);

        setCurrentPrice(price);
        setPriceMetrics({
          high,
          low,
          turnover: turnover + 'M'
        });
      }
    } catch (error) {
      console.error('Price fetch error:', error);
    }
  }, []);

  // Initialize or reuse existing chart
  const initializeChart = useCallback(() => {
    if (!containerRef.current || !window.TradingView) return;

    // If widget already exists globally, don't recreate
    if (window.persistentTradingViewWidget && window.tradingViewChartInitialized) {
      console.log('Reusing existing persistent chart');
      setIsLoading(false);
      onReady?.();
      return;
    }

    console.log('Creating new persistent chart');
    
    try {
      // Clear container
      containerRef.current.innerHTML = '';

      // Create the persistent widget
      const widget = new window.TradingView.widget({
        container_id: containerRef.current.id,
        autosize: true,
        symbol: symbol,
        interval: interval,
        timezone: "Etc/UTC",
        theme: theme,
        style: "1",
        locale: "en",
        backgroundColor: "rgba(0,0,0,0)",
        toolbar_bg: "rgba(0,0,0,0)",
        hide_top_toolbar: true,
        hide_side_toolbar: true,
        allow_symbol_change: false,
        enable_publishing: false,
        details: false,
        withdateranges: false,
        calendar: false,
        studies: [],
        drawings_access: { type: 'black', tools: [] },
        crosshair: { mode: 1 },
        overrides: {
          "paneProperties.leftAxisProperties.showSeriesLastValue": false,
          "paneProperties.rightAxisProperties.showSeriesLastValue": false,
          "scalesProperties.showLeftScale": false,
          "scalesProperties.showRightScale": false,
          "paneProperties.crossHairProperties.color": "#FFA500",
          "paneProperties.crossHairProperties.width": 1,
          "paneProperties.crossHairProperties.style": 2,
          "paneProperties.crossHairProperties.transparency": 0,
          "volumePaneSize": "small"
        },
        disabled_features: [
          "header_symbol_search",
          "timeframes_toolbar",
          "use_localstorage_for_settings",
          "volume_force_overlay",
          "left_toolbar",
          "legend_context_menu",
          "display_market_status",
          "go_to_date",
          "header_compare",
          "header_chart_type",
          "header_resolutions",
          "header_screenshot",
          "header_fullscreen_button",
          "header_settings",
          "header_indicators",
          "context_menus",
          "control_bar",
          "edit_buttons_in_legend",
          "main_series_scale_menu",
          "chart_property_page_legend",
          "chart_property_page_trading",
          "border_around_the_chart"
        ],
        onChartReady: () => {
          console.log('Persistent chart ready');
          setIsLoading(false);
          window.tradingViewChartInitialized = true;
          onReady?.();
        }
      });

      // Store globally for persistence
      window.persistentTradingViewWidget = widget;
      
    } catch (error) {
      console.error('Chart initialization error:', error);
      setError(true);
      setIsLoading(false);
    }
  }, [symbol, interval, theme, onReady]);

  // Load TradingView script
  useEffect(() => {
    if (window.TradingView) {
      initializeChart();
    } else {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
        setTimeout(initializeChart, 200);
      };
      script.onerror = () => {
        setError(true);
        setIsLoading(false);
      };
      document.head.appendChild(script);
    }
  }, [initializeChart]);

  // Price updates
  useEffect(() => {
    const apiSymbol = symbol.replace('BYBIT:', '');
    updatePrice(apiSymbol);
    
    const interval = setInterval(() => {
      updatePrice(apiSymbol);
    }, 2000);

    return () => clearInterval(interval);
  }, [symbol, updatePrice]);

  // Generate unique container ID
  const containerId = useRef(`tradingview-chart-${Math.random().toString(36).substr(2, 9)}`).current;

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Price Header */}
      <div className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex flex-col">
          <div className="text-white font-bold text-lg">
            {symbol.replace('BYBIT:', '').replace('USDT', '/USDT')}
          </div>
          <div className="text-gray-400 text-sm">
            Price: <span className="text-white">{currentPrice}</span> USD
          </div>
        </div>
        <div className="text-right text-xs text-gray-400">
          <div>24h High: <span className="text-white">{priceMetrics.high}</span></div>
          <div>24h Low: <span className="text-white">{priceMetrics.low}</span></div>
          <div>Turnover: <span className="text-white">{priceMetrics.turnover}</span></div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 relative bg-gray-900">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900 z-20 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="mb-4">
                <div className="w-12 h-12 mx-auto border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-lg font-medium">Loading Chart...</p>
              <p className="text-sm mt-2">Initializing TradingView</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 bg-gray-900 z-20 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="mb-4">
                <div className="w-12 h-12 mx-auto bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">!</span>
                </div>
              </div>
              <p className="text-lg font-medium">Chart Unavailable</p>
              <p className="text-sm mt-2">Unable to load chart data</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {/* TradingView Chart Container */}
        <div 
          ref={containerRef}
          id={containerId}
          className="w-full h-full"
        />

        {/* Watermark */}
        <div 
          className="absolute top-1/2 left-1/2 w-20 h-20 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none z-10"
          style={{
            backgroundImage: 'url(https://i.imgur.com/F9ljfzP.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        />

        {/* Brand Cover */}
        <div className="absolute bottom-7 left-3 w-12 h-12 bg-gray-900 rounded-lg shadow-lg z-50 pointer-events-auto">
          <img 
            src="https://i.imgur.com/1yZtbuJ.jpeg" 
            alt="Nedaxer"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}