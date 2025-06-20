import { useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    TradingView: any;
    tvWidget: any;
    tvChartState: {
      isReady: boolean;
      currentSymbol: string;
      isVisible: boolean;
      container: HTMLElement | null;
    };
  }
}

export interface ChartState {
  isReady: boolean;
  currentSymbol: string;
  isVisible: boolean;
  container: HTMLElement | null;
}

export const usePersistentChart = () => {
  const initializeChartState = useCallback(() => {
    if (!window.tvChartState) {
      window.tvChartState = {
        isReady: false,
        currentSymbol: 'BYBIT:BTCUSDT',
        isVisible: false,
        container: null
      };
    }
    return window.tvChartState;
  }, []);

  const getChartWidget = useCallback(() => {
    return window.tvWidget || null;
  }, []);

  const setChartWidget = useCallback((widget: any) => {
    window.tvWidget = widget;
  }, []);

  const createChart = useCallback((containerId: string, symbol: string = 'BYBIT:BTCUSDT') => {
    if (!window.TradingView) {
      console.error('TradingView library not loaded');
      return null;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return null;
    }

    // Clear any existing content
    container.innerHTML = '';

    const widget = new window.TradingView.widget({
      container_id: containerId,
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
        "paneProperties.leftAxisProperties.showSeriesLastValue": false,
        "paneProperties.rightAxisProperties.showSeriesLastValue": false,
        "scalesProperties.showLeftScale": false,
        "scalesProperties.showRightScale": true,

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
        "paneProperties.legendProperties.showStudyArguments": false,
        "paneProperties.legendProperties.showStudyTitles": false,
        "paneProperties.legendProperties.showStudyValues": false,
        "paneProperties.legendProperties.showSeriesTitle": false,

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
        "show_crosshair_labels",
        "crosshair_tooltip",
        "crosshair_cursor"
      ],
      onChartReady: () => {
        console.log('Persistent chart ready');
        window.tvChartState = {
          isReady: true,
          currentSymbol: symbol,
          isVisible: true,
          container: container
        };
      }
    });

    setChartWidget(widget);
    window.tvChartState = {
      isReady: false,
      currentSymbol: symbol,
      isVisible: true,
      container: container
    };

    return widget;
  }, [setChartWidget]);

  const showChart = useCallback((containerId: string, symbol?: string) => {
    const existingWidget = getChartWidget();
    const chartState = initializeChartState();
    
    if (existingWidget && existingWidget.iframe && existingWidget.iframe.contentWindow) {
      // Chart already exists, just move it to the new container and show it
      const container = document.getElementById(containerId);
      if (container) {
        // Clear container first
        container.innerHTML = '';
        
        // Move the iframe to the new container
        if (existingWidget.iframe && existingWidget.iframe.parentNode !== container) {
          container.appendChild(existingWidget.iframe);
        }
        
        // Ensure chart is visible
        if (existingWidget.iframe) {
          existingWidget.iframe.style.display = 'block';
          existingWidget.iframe.style.visibility = 'visible';
        }
        
        chartState.container = container;
        chartState.isVisible = true;
        
        // Change symbol if requested
        if (symbol && symbol !== chartState.currentSymbol) {
          try {
            existingWidget.setSymbol(symbol, "15", () => {
              console.log('Symbol changed to', symbol);
              chartState.currentSymbol = symbol;
            });
          } catch (error) {
            console.warn('Failed to change symbol, keeping current:', error);
          }
        }
        
        return existingWidget;
      }
    } else {
      // No existing chart, create a new one
      return createChart(containerId, symbol);
    }
  }, [getChartWidget, initializeChartState, createChart]);

  const hideChart = useCallback(() => {
    const existingWidget = getChartWidget();
    const chartState = initializeChartState();
    
    if (existingWidget && existingWidget.iframe) {
      existingWidget.iframe.style.display = 'none';
      chartState.isVisible = false;
    }
  }, [getChartWidget, initializeChartState]);

  const changeSymbol = useCallback((symbol: string) => {
    const existingWidget = getChartWidget();
    const chartState = initializeChartState();
    
    if (existingWidget && chartState.isReady) {
      try {
        existingWidget.setSymbol(symbol, "15", () => {
          console.log('Symbol changed to', symbol);
          chartState.currentSymbol = symbol;
          
          // Save symbol to localStorage for persistence across page reloads
          localStorage.setItem('nedaxer_chart_symbol', symbol);
        });
      } catch (error) {
        console.warn('Failed to change symbol:', error);
      }
    }
  }, [getChartWidget, initializeChartState]);

  const getStoredSymbol = useCallback(() => {
    return localStorage.getItem('nedaxer_chart_symbol') || 'BYBIT:BTCUSDT';
  }, []);

  return {
    initializeChartState,
    getChartWidget,
    createChart,
    showChart,
    hideChart,
    changeSymbol,
    getStoredSymbol
  };
};