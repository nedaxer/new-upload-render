
import React, { useEffect, useRef, useState } from 'react';

// Global chart state that persists across all navigation
declare global {
  interface Window {
    nedaxerGlobalChart: {
      widget: any;
      container: HTMLDivElement;
      isReady: boolean;
      currentSymbol: string;
      isVisible: boolean;
    } | null;
  }
}

export function PersistentChartManager({ children, isActive, chartId }: {
  children: React.ReactNode;
  isActive: boolean;
  chartId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize global chart state if it doesn't exist
    if (!window.nedaxerGlobalChart) {
      window.nedaxerGlobalChart = {
        widget: null,
        container: document.createElement('div'),
        isReady: false,
        currentSymbol: 'BTCUSDT',
        isVisible: false
      };
      
      // Style the global container
      window.nedaxerGlobalChart.container.style.width = '100%';
      window.nedaxerGlobalChart.container.style.height = '100%';
      window.nedaxerGlobalChart.container.style.position = 'absolute';
      window.nedaxerGlobalChart.container.style.top = '0';
      window.nedaxerGlobalChart.container.style.left = '0';
      window.nedaxerGlobalChart.container.id = 'global-chart-container';
      
      // Add to a hidden area in the document body
      document.body.appendChild(window.nedaxerGlobalChart.container);
    }

    if (isActive) {
      // Move the global chart container to the current view
      if (window.nedaxerGlobalChart.container.parentNode !== containerRef.current) {
        containerRef.current.appendChild(window.nedaxerGlobalChart.container);
      }
      window.nedaxerGlobalChart.isVisible = true;
      setIsInitialized(true);
    } else {
      // Move chart back to document body but keep it alive
      if (window.nedaxerGlobalChart.container.parentNode === containerRef.current) {
        document.body.appendChild(window.nedaxerGlobalChart.container);
      }
      window.nedaxerGlobalChart.isVisible = false;
    }

    return () => {
      // Don't cleanup - keep chart persistent
    };
  }, [isActive, chartId]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        display: isActive ? 'block' : 'none'
      }}
    >
      {isActive && isInitialized && children}
    </div>
  );
}

// Hook to manage the global chart
export function usePersistentChart() {
  const createChart = (containerId: string, symbol: string, onReady?: () => void) => {
    if (!window.TradingView || !window.nedaxerGlobalChart) return null;

    // If chart already exists, just update symbol
    if (window.nedaxerGlobalChart.widget && window.nedaxerGlobalChart.isReady) {
      try {
        window.nedaxerGlobalChart.widget.setSymbol(symbol, "15");
        window.nedaxerGlobalChart.currentSymbol = symbol;
        onReady?.();
        return window.nedaxerGlobalChart.widget;
      } catch (error) {
        console.log('Error updating symbol, keeping current chart');
        onReady?.();
        return window.nedaxerGlobalChart.widget;
      }
    }

    // Create new chart only if none exists
    const widget = new window.TradingView.widget({
      container_id: window.nedaxerGlobalChart.container,
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
        window.nedaxerGlobalChart!.isReady = true;
        window.nedaxerGlobalChart!.currentSymbol = symbol;
        onReady?.();
      }
    });

    window.nedaxerGlobalChart.widget = widget;
    return widget;
  };

  const showChart = () => {
    if (window.nedaxerGlobalChart && window.nedaxerGlobalChart.container) {
      window.nedaxerGlobalChart.isVisible = true;
      return true;
    }
    return false;
  };

  const hideChart = () => {
    if (window.nedaxerGlobalChart) {
      window.nedaxerGlobalChart.isVisible = false;
    }
  };

  const updateSymbol = (symbol: string) => {
    if (window.nedaxerGlobalChart && window.nedaxerGlobalChart.widget && window.nedaxerGlobalChart.isReady) {
      try {
        window.nedaxerGlobalChart.widget.setSymbol(symbol, "15");
        window.nedaxerGlobalChart.currentSymbol = symbol;
        return true;
      } catch (error) {
        console.log('Error updating symbol');
        return false;
      }
    }
    return false;
  };

  const isReady = () => {
    return window.nedaxerGlobalChart?.isReady || false;
  };

  const getCurrentSymbol = () => {
    return window.nedaxerGlobalChart?.currentSymbol || 'BTCUSDT';
  };

  return {
    createChart,
    showChart,
    hideChart,
    updateSymbol,
    isReady,
    getCurrentSymbol
  };
}
