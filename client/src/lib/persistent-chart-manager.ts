declare global {
  interface Window {
    TradingView: any;
    Datafeeds: any;
    nedaxerPersistentChart: {
      widget: any;
      container: HTMLElement | null;
      isReady: boolean;
      currentSymbol: string;
      isVisible: boolean;
      scriptLoaded: boolean;
    };
  }
}

class PersistentChartManager {
  private static instance: PersistentChartManager;
  private hiddenContainer: HTMLElement | null = null;

  static getInstance(): PersistentChartManager {
    if (!PersistentChartManager.instance) {
      PersistentChartManager.instance = new PersistentChartManager();
    }
    return PersistentChartManager.instance;
  }

  constructor() {
    this.initializeGlobalState();
    this.createHiddenContainer();
  }

  private initializeGlobalState() {
    if (typeof window !== 'undefined' && !window.nedaxerPersistentChart) {
      window.nedaxerPersistentChart = {
        widget: null,
        container: null,
        isReady: false,
        currentSymbol: 'BTCUSDT',
        isVisible: false,
        scriptLoaded: false
      };
    }
  }

  private createHiddenContainer() {
    if (typeof window === 'undefined') return;

    // Create a hidden container that persists across page changes
    this.hiddenContainer = document.getElementById('persistent-chart-container');
    if (!this.hiddenContainer) {
      this.hiddenContainer = document.createElement('div');
      this.hiddenContainer.id = 'persistent-chart-container';
      this.hiddenContainer.style.cssText = `
        position: fixed;
        top: -10000px;
        left: -10000px;
        width: 800px;
        height: 600px;
        z-index: -1;
        pointer-events: none;
      `;
      document.body.appendChild(this.hiddenContainer);
      window.nedaxerPersistentChart.container = this.hiddenContainer;
    }
  }

  async loadTradingViewScript(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    if (window.nedaxerPersistentChart.scriptLoaded && window.TradingView) {
      return true;
    }

    return new Promise((resolve) => {
      const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
      if (existingScript) {
        if (window.TradingView) {
          window.nedaxerPersistentChart.scriptLoaded = true;
          resolve(true);
        } else {
          existingScript.addEventListener('load', () => {
            window.nedaxerPersistentChart.scriptLoaded = true;
            resolve(true);
          });
        }
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';

      script.onload = () => {
        window.nedaxerPersistentChart.scriptLoaded = true;
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.head.appendChild(script);
    });
  }

  async initializeChart(symbol: string = 'BYBIT:BTCUSDT'): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // If chart already exists and is ready, just update symbol
    if (window.nedaxerPersistentChart.widget && window.nedaxerPersistentChart.isReady) {
      await this.changeSymbol(symbol);
      return true;
    }

    // Load TradingView script if not loaded
    const scriptLoaded = await this.loadTradingViewScript();
    if (!scriptLoaded || !window.TradingView) {
      return false;
    }

    // Create the persistent chart widget using TradingView's free embed
    try {
      const widgetConfig = {
        "width": "100%",
        "height": "100%",
        "symbol": symbol,
        "interval": "15",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "hide_top_toolbar": true,
        "hide_legend": true,
        "save_image": false,
        "container_id": this.hiddenContainer?.id || "persistent-chart-container"
      };

      const widget = new window.TradingView.widget(widgetConfig);

      window.nedaxerPersistentChart.widget = widget;
      window.nedaxerPersistentChart.currentSymbol = symbol.replace('BYBIT:', '').replace('BINANCE:', '');
      window.nedaxerPersistentChart.isReady = true;

      return true;
    } catch (error) {
      console.error('Failed to create persistent chart:', error);
      return false;
    }
  }

  async changeSymbol(symbol: string): Promise<void> {
    if (typeof window === 'undefined' || !window.nedaxerPersistentChart.widget) return;

    try {
      await window.nedaxerPersistentChart.widget.setSymbol(symbol);
      window.nedaxerPersistentChart.currentSymbol = symbol.replace('BYBIT:', '').replace('BINANCE:', '');
    } catch (error) {
      console.error('Failed to change chart symbol:', error);
    }
  }

  moveChartToContainer(targetContainer: HTMLElement): boolean {
    if (typeof window === 'undefined' || !window.nedaxerPersistentChart.widget) return false;

    try {
      const iframe = this.hiddenContainer?.querySelector('iframe');
      if (iframe && targetContainer) {
        // Clear target container
        targetContainer.innerHTML = '';
        
        // Move iframe to target container
        targetContainer.appendChild(iframe);
        
        // Update visibility
        iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
        window.nedaxerPersistentChart.isVisible = true;
        
        return true;
      }
    } catch (error) {
      console.error('Failed to move chart to container:', error);
    }
    
    return false;
  }

  hideChart(): void {
    if (typeof window === 'undefined' || !window.nedaxerPersistentChart.widget) return;

    try {
      const iframe = document.querySelector('iframe[id*="tradingview"]');
      if (iframe && this.hiddenContainer) {
        // Move iframe back to hidden container
        this.hiddenContainer.appendChild(iframe);
        window.nedaxerPersistentChart.isVisible = false;
      }
    } catch (error) {
      console.error('Failed to hide chart:', error);
    }
  }

  getCurrentSymbol(): string {
    if (typeof window === 'undefined') return 'BTCUSDT';
    return window.nedaxerPersistentChart?.currentSymbol || 'BTCUSDT';
  }

  isChartReady(): boolean {
    if (typeof window === 'undefined') return false;
    return window.nedaxerPersistentChart?.isReady || false;
  }

  getWidget(): any {
    if (typeof window === 'undefined') return null;
    return window.nedaxerPersistentChart?.widget || null;
  }
}

export default PersistentChartManager;