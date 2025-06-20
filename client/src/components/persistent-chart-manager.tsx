import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    TradingView: any;
    persistentChartWidget: any;
    persistentChartContainer: HTMLDivElement | null;
    tradingViewChartLoaded: boolean;
  }
}

interface ChartConfig {
  symbol: string;
  containerId: string;
}

export function usePersistentChart() {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentSymbol = useRef<string>('BYBIT:BTCUSDT');

  // Initialize persistent chart container if it doesn't exist
  const initializePersistentContainer = () => {
    if (!window.persistentChartContainer) {
      const container = document.createElement('div');
      container.id = 'persistent-chart-container';
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        visibility: hidden;
        pointer-events: none;
      `;
      document.body.appendChild(container);
      window.persistentChartContainer = container;
    }
  };

  // Create the chart widget only once
  const createWidget = (symbol: string) => {
    if (!window.TradingView) {
      console.log('TradingView not loaded yet');
      return;
    }
    
    if (window.persistentChartWidget) {
      console.log('Widget already exists');
      setIsLoading(false);
      setIsReady(true);
      return;
    }

    console.log('Creating new TradingView widget for symbol:', symbol);
    
    try {
      const widget = new window.TradingView.widget({
        container_id: "persistent-chart-container",
        autosize: true,
        symbol: symbol,
        interval: "15",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        backgroundColor: "#111827",
        toolbar_bg: "#111827",
        hide_top_toolbar: true,
        hide_side_toolbar: true,
        allow_symbol_change: false,
        enable_publishing: false,
        details: false,
        withdateranges: false,
        calendar: false,
        studies: [
          {
            id: "BB@tv-basicstudies-1",
            inputs: {
              length: 20,
              mult: 2,
              source: "close"
            }
          }
        ],
        drawings_access: { type: 'black', tools: [] },
        crosshair: {
          mode: 1
        },
        save_image: false,
        loading_screen: { backgroundColor: "#111827", foregroundColor: "#111827" },
        overrides: {
          "paneProperties.background": "#111827",
          "paneProperties.backgroundType": "solid",
          "paneProperties.backgroundGradientStartColor": "#111827", 
          "paneProperties.backgroundGradientEndColor": "#111827",
          "paneProperties.vertGridProperties.color": "#374151",
          "paneProperties.horzGridProperties.color": "#374151",
          "paneProperties.crossHairProperties.color": "#FFA500",
          "paneProperties.crossHairProperties.width": 1,
          "paneProperties.crossHairProperties.style": 2,
          "paneProperties.crossHairProperties.transparency": 0,
          "volumePaneSize": "small",
          "paneProperties.leftAxisProperties.showSeriesLastValue": false,
          "paneProperties.rightAxisProperties.showSeriesLastValue": false,
          "scalesProperties.showLeftScale": false,
          "scalesProperties.showRightScale": false,
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
          "header_saveload",
          "context_menus"
        ],
        enabled_features: [
          "side_toolbar_in_fullscreen_mode"
        ]
      });

      window.persistentChartWidget = widget;
      window.tradingViewChartLoaded = true;
      setIsLoading(false);
      setIsReady(true);

    } catch (err) {
      console.error('Failed to create TradingView widget:', err);
      setError(true);
      setIsLoading(false);
    }
  };

  // Load TradingView script if not already loaded
  const loadTradingViewScript = () => {
    console.log('Loading TradingView script...');
    
    if (window.TradingView) {
      console.log('TradingView already loaded');
      setIsReady(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
    if (existingScript) {
      console.log('Script already exists, waiting for load');
      existingScript.addEventListener('load', () => {
        console.log('TradingView script loaded from existing');
        setIsReady(true);
      });
      return;
    }

    console.log('Creating new script element');
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('TradingView script loaded successfully');
      setIsReady(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load TradingView script');
      setError(true);
      setIsLoading(false);
    };

    document.head.appendChild(script);
    console.log('Script added to head');
  };

  // Show the chart in the current container
  const showChart = () => {
    if (!containerRef.current || !window.persistentChartContainer) return;

    // Move the persistent container to the current location
    const persistentContainer = window.persistentChartContainer;
    persistentContainer.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      visibility: visible;
      pointer-events: auto;
      z-index: 1;
    `;

    // Clear current container and append the persistent one
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(persistentContainer);
  };

  // Hide the chart but keep it alive
  const hideChart = () => {
    if (!window.persistentChartContainer) return;

    const persistentContainer = window.persistentChartContainer;
    persistentContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      visibility: hidden;
      pointer-events: none;
    `;

    // Move back to body to keep it alive
    if (persistentContainer.parentNode !== document.body) {
      document.body.appendChild(persistentContainer);
    }
  };

  // Change symbol without recreating widget
  const changeSymbol = (newSymbol: string) => {
    if (window.persistentChartWidget && currentSymbol.current !== newSymbol) {
      try {
        window.persistentChartWidget.setSymbol(newSymbol, '15');
        currentSymbol.current = newSymbol;
      } catch (err) {
        console.error('Failed to change symbol:', err);
      }
    }
  };

  // Initialize everything
  useEffect(() => {
    initializePersistentContainer();
    loadTradingViewScript();
  }, []);

  // Create widget when TradingView is ready
  useEffect(() => {
    if (isReady && !window.tradingViewChartLoaded) {
      createWidget(currentSymbol.current);
    }
  }, [isReady]);

  return {
    containerRef,
    isReady: isReady && window.tradingViewChartLoaded,
    isLoading,
    error,
    showChart,
    hideChart,
    changeSymbol,
    widget: window.persistentChartWidget
  };
}