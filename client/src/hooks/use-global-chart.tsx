import { useState, useEffect, useRef, useCallback } from 'react';

interface ChartInstance {
  widget: any;
  container: HTMLDivElement;
  symbol: string;
  isReady: boolean;
}

// Global chart management
class GlobalChartManager {
  private static instance: GlobalChartManager;
  private chartInstance: ChartInstance | null = null;
  private subscribers: Set<() => void> = new Set();
  private isScriptLoaded = false;
  private scriptPromise: Promise<void> | null = null;

  static getInstance(): GlobalChartManager {
    if (!GlobalChartManager.instance) {
      GlobalChartManager.instance = new GlobalChartManager();
    }
    return GlobalChartManager.instance;
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify() {
    this.subscribers.forEach(callback => callback());
  }

  async loadTradingViewScript(): Promise<void> {
    if (this.isScriptLoaded && (window as any).TradingView) {
      return Promise.resolve();
    }

    if (this.scriptPromise) {
      return this.scriptPromise;
    }

    this.scriptPromise = new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
      if (existingScript && (window as any).TradingView) {
        this.isScriptLoaded = true;
        resolve();
        return;
      }

      // Add preload hints
      const addPreloadHints = () => {
        const hints = [
          { rel: 'dns-prefetch', href: 'https://s3.tradingview.com' },
          { rel: 'preconnect', href: 'https://s3.tradingview.com' },
          { rel: 'preload', href: 'https://s3.tradingview.com/tv.js', as: 'script' }
        ];

        hints.forEach(hint => {
          const existingHint = document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`);
          if (!existingHint) {
            const link = document.createElement('link');
            Object.assign(link, hint);
            document.head.appendChild(link);
          }
        });
      };

      addPreloadHints();

      // Create script
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';

      script.onload = () => {
        this.isScriptLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load TradingView script'));
      };

      document.head.appendChild(script);
    });

    return this.scriptPromise;
  }

  async createChart(symbol: string = 'BYBIT:BTCUSDT'): Promise<ChartInstance | null> {
    try {
      await this.loadTradingViewScript();

      if (!(window as any).TradingView) {
        throw new Error('TradingView not available');
      }

      // Create persistent container if it doesn't exist
      if (!this.chartInstance) {
        const container = document.createElement('div');
        container.id = 'global-chart-container';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.zIndex = '1';

        // Append to body initially to keep it persistent
        document.body.appendChild(container);

        const widget = new (window as any).TradingView.widget({
          container_id: container.id,
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
            if (this.chartInstance) {
              this.chartInstance.isReady = true;
              this.notify();
            }
          }
        });

        this.chartInstance = {
          widget,
          container,
          symbol,
          isReady: false
        };
      }

      return this.chartInstance;
    } catch (error) {
      console.error('Failed to create chart:', error);
      return null;
    }
  }

  getChart(): ChartInstance | null {
    return this.chartInstance;
  }

  moveChartToContainer(targetContainerId: string): boolean {
    if (!this.chartInstance) return false;

    const targetContainer = document.getElementById(targetContainerId);
    if (!targetContainer) return false;

    // Clear target container
    targetContainer.innerHTML = '';

    // Move chart container to target
    this.chartInstance.container.style.display = 'block';
    targetContainer.appendChild(this.chartInstance.container);

    return true;
  }

  hideChart(): void {
    if (!this.chartInstance) return;

    // Move chart back to body and hide it
    this.chartInstance.container.style.display = 'none';
    document.body.appendChild(this.chartInstance.container);
  }

  changeSymbol(symbol: string): void {
    if (!this.chartInstance || !this.chartInstance.isReady) return;

    try {
      this.chartInstance.widget.setSymbol(symbol, "15", () => {
        if (this.chartInstance) {
          this.chartInstance.symbol = symbol;
        }
      });
    } catch (error) {
      console.error('Failed to change symbol:', error);
    }
  }

  getCurrentSymbol(): string {
    return this.chartInstance?.symbol || 'BYBIT:BTCUSDT';
  }

  isReady(): boolean {
    return this.chartInstance?.isReady || false;
  }

  cleanup(): void {
    if (this.chartInstance) {
      try {
        this.chartInstance.widget.remove();
      } catch (error) {
        // Ignore cleanup errors
      }
      
      if (this.chartInstance.container.parentNode) {
        this.chartInstance.container.parentNode.removeChild(this.chartInstance.container);
      }
      
      this.chartInstance = null;
    }
    this.subscribers.clear();
  }
}

export function useGlobalChart() {
  const chartManager = useRef(GlobalChartManager.getInstance());
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = chartManager.current.subscribe(() => {
      setIsReady(chartManager.current.isReady());
    });

    setIsReady(chartManager.current.isReady());

    return () => {
      unsubscribe();
    };
  }, []);

  const initializeChart = useCallback(async (symbol?: string) => {
    setIsLoading(true);
    try {
      await chartManager.current.createChart(symbol);
    } catch (error) {
      console.error('Failed to initialize chart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const showChartInContainer = useCallback((containerId: string) => {
    return chartManager.current.moveChartToContainer(containerId);
  }, []);

  const hideChart = useCallback(() => {
    chartManager.current.hideChart();
  }, []);

  const changeSymbol = useCallback((symbol: string) => {
    chartManager.current.changeSymbol(symbol);
  }, []);

  const getCurrentSymbol = useCallback(() => {
    return chartManager.current.getCurrentSymbol();
  }, []);

  return {
    isReady,
    isLoading,
    initializeChart,
    showChartInContainer,
    hideChart,
    changeSymbol,
    getCurrentSymbol
  };
}