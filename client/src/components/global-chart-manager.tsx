
import { useEffect, useCallback } from 'react';

// Global chart management that persists across ALL page navigation
declare global {
  interface Window {
    nedaxerGlobalChart: {
      widget: any;
      container: HTMLDivElement;
      isInitialized: boolean;
      currentSymbol: string;
      isVisible: boolean;
    } | null;
  }
}

// Initialize global chart container that stays in DOM permanently
const initializeGlobalChart = () => {
  if (typeof window === 'undefined') return null;

  if (!window.nedaxerGlobalChart) {
    // Create persistent container that never gets removed
    const container = document.createElement('div');
    container.id = 'nedaxer-global-chart';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '-9999';
    container.style.visibility = 'hidden';
    container.style.pointerEvents = 'none';
    
    // Add to body and never remove
    document.body.appendChild(container);

    window.nedaxerGlobalChart = {
      widget: null,
      container,
      isInitialized: false,
      currentSymbol: 'BTCUSDT',
      isVisible: false
    };
  }

  return window.nedaxerGlobalChart;
};

// Global chart functions that work across all pages
export const useGlobalChart = () => {
  
  const createChart = useCallback((symbol: string = 'BTCUSDT') => {
    if (typeof window === 'undefined' || !(window as any).TradingView) return;

    const globalChart = initializeGlobalChart();
    if (!globalChart) return;

    // Only create if not already initialized
    if (globalChart.isInitialized && globalChart.widget) {
      console.log('Global chart already exists, reusing...');
      return globalChart.widget;
    }

    console.log('Creating persistent global chart...');
    
    // Clear container
    globalChart.container.innerHTML = '';

    // Create TradingView widget
    const widget = new (window as any).TradingView.widget({
      container_id: globalChart.container,
      autosize: true,
      symbol: `BYBIT:${symbol}`,
      interval: "15",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "#111827",
      toolbar_bg: "#111827",
      hide_top_toolbar: true,
      hide_side_toolbar: true,
      allow_symbol_change: true,
      enable_publishing: false,
      details: false,
      withdateranges: false,
      calendar: false,
      studies: [
        {
          id: "BB@tv-basicstudies-1",
          inputs: { length: 20, mult: 2, source: "close" }
        }
      ],
      drawings_access: { type: 'black', tools: [] },
      crosshair: { mode: 1 },
      save_image: false,
      loading_screen: { backgroundColor: "#111827", foregroundColor: "#111827" },
      overrides: {
        "paneProperties.background": "#111827",
        "paneProperties.backgroundType": "solid",
        "paneProperties.vertGridProperties.color": "#374151",
        "paneProperties.horzGridProperties.color": "#374151",
        "paneProperties.crossHairProperties.color": "#FFA500",
        "paneProperties.crossHairProperties.width": 1,
        "paneProperties.crossHairProperties.style": 2,
        "paneProperties.crossHairProperties.transparency": 0,
        "paneProperties.crossHairProperties.labelBackgroundColor": "#000",
        "paneProperties.crossHairProperties.displayMode": 1,
        "BB@tv-basicstudies.upper.color": "#0066FF",
        "BB@tv-basicstudies.lower.color": "#0066FF",
        "BB@tv-basicstudies.median.color": "#FFFF00",
        "BB@tv-basicstudies.upper.linewidth": 1,
        "BB@tv-basicstudies.lower.linewidth": 1,
        "BB@tv-basicstudies.median.linewidth": 2,
        "BB@tv-basicstudies.fillBackground": true,
        "BB@tv-basicstudies.transparency": 90,
        "scalesProperties.backgroundColor": "#111827",
        "scalesProperties.lineColor": "#374151",
        "scalesProperties.textColor": "#9CA3AF",
        "mainSeriesProperties.style": 1,
        "mainSeriesProperties.candleStyle.upColor": "#10B981",
        "mainSeriesProperties.candleStyle.downColor": "#EF4444",
        "mainSeriesProperties.candleStyle.drawWick": true,
        "mainSeriesProperties.candleStyle.drawBorder": false,
        "mainSeriesProperties.candleStyle.wickUpColor": "#10B981",
        "mainSeriesProperties.candleStyle.wickDownColor": "#EF4444",
        "volumePaneSize": "small",
        "volume.volume.color.0": "#EF4444",
        "volume.volume.color.1": "#10B981",
        "volume.volume.transparency": 0,
        "paneProperties.legendProperties.showLegend": false,
        "paneProperties.topMargin": 5,
        "paneProperties.bottomMargin": 15,
        "paneProperties.leftMargin": 5,
        "paneProperties.rightMargin": 5,
      },
      disabled_features: [
        "header_symbol_search", "timeframes_toolbar", "use_localstorage_for_settings",
        "volume_force_overlay", "left_toolbar", "legend_context_menu", "display_market_status",
        "go_to_date", "header_compare", "header_chart_type", "header_resolutions",
        "header_screenshot", "header_fullscreen_button", "header_settings", "header_indicators",
        "context_menus", "control_bar", "edit_buttons_in_legend", "main_series_scale_menu",
        "chart_property_page_legend", "chart_property_page_trading", "border_around_the_chart",
        "snapshot_trading_drawings", "show_logo_on_all_charts",
        "remove_library_container_border", "chart_hide_close_button", "header_saveload",
        "header_undo_redo", "show_chart_property_page", "popup_hints"
      ],
      enabled_features: [
        "show_crosshair_labels", "crosshair_tooltip", "crosshair_cursor"
      ],
      onChartReady: () => {
        console.log('Global persistent chart ready');
        if (globalChart) {
          globalChart.isInitialized = true;
          globalChart.currentSymbol = symbol;
        }
      }
    });

    globalChart.widget = widget;
    return widget;
  }, []);

  const showChart = useCallback((targetElementId: string) => {
    const globalChart = window.nedaxerGlobalChart;
    if (!globalChart || !globalChart.widget) return false;

    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) return false;

    // Move chart iframe to target element
    const iframe = globalChart.container.querySelector('iframe');
    if (iframe) {
      // Clear target element
      targetElement.innerHTML = '';
      
      // Move iframe to target
      targetElement.appendChild(iframe);
      
      // Make chart visible and interactive
      globalChart.container.style.visibility = 'visible';
      globalChart.container.style.pointerEvents = 'auto';
      globalChart.container.style.position = 'static';
      globalChart.container.style.zIndex = 'auto';
      globalChart.isVisible = true;
      
      console.log('Chart moved to', targetElementId);
      return true;
    }
    
    return false;
  }, []);

  const hideChart = useCallback(() => {
    const globalChart = window.nedaxerGlobalChart;
    if (!globalChart) return;

    // Move chart back to hidden container
    const iframe = globalChart.container.querySelector('iframe');
    if (iframe && iframe.parentNode !== globalChart.container) {
      globalChart.container.appendChild(iframe);
    }

    // Hide chart
    globalChart.container.style.visibility = 'hidden';
    globalChart.container.style.pointerEvents = 'none';
    globalChart.container.style.position = 'fixed';
    globalChart.container.style.zIndex = '-9999';
    globalChart.isVisible = false;
    
    console.log('Chart hidden but kept running');
  }, []);

  const changeSymbol = useCallback((symbol: string) => {
    const globalChart = window.nedaxerGlobalChart;
    if (!globalChart || !globalChart.widget) return;

    try {
      globalChart.widget.setSymbol(`BYBIT:${symbol}`, "15", () => {
        console.log('Global chart symbol changed to', symbol);
        globalChart.currentSymbol = symbol;
      });
    } catch (error) {
      console.log('Failed to change symbol on persistent chart:', error);
    }
  }, []);

  const isChartReady = useCallback(() => {
    const globalChart = window.nedaxerGlobalChart;
    return globalChart?.isInitialized || false;
  }, []);

  const getChart = useCallback(() => {
    return window.nedaxerGlobalChart;
  }, []);

  return {
    createChart,
    showChart,
    hideChart,
    changeSymbol,
    isChartReady,
    getChart
  };
};

// Initialize on app load
export const initializeGlobalChartSystem = () => {
  // Add TradingView script if not present
  if (typeof window !== 'undefined' && !(window as any).TradingView) {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      console.log('TradingView loaded for global chart system');
    };
    document.head.appendChild(script);
  }

  // Initialize global chart container
  initializeGlobalChart();
};
