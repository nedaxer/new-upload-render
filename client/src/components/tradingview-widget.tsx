import { useEffect, useRef, memo } from 'react';

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
  height = '400',
  locale = 'en',
  theme = 'dark',
  style = '1',
  toolbar_bg = '#f1f3f6',
  enable_publishing = false,
  allow_symbol_change = true,
  container_id = 'tradingview_widget',
  autosize = false
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widget = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load TradingView script if not already loaded
    const loadTradingViewScript = () => {
      return new Promise((resolve) => {
        if ((window as any).TradingView) {
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => resolve(true);
        document.head.appendChild(script);
      });
    };

    loadTradingViewScript().then(() => {
      // Clean up previous widget
      if (widget.current) {
        widget.current.remove();
      }

      // Create new widget with full API
      widget.current = new (window as any).TradingView.widget({
        container_id,
        autosize,
        symbol,
        interval: 'D',
        timezone: 'Etc/UTC',
        theme,
        style,
        locale,
        enable_publishing,
        allow_symbol_change,
        calendar: false,
        withdateranges: true,
        hide_side_toolbar: false,
        toolbar_bg,
        crosshair: { 
          mode: 2, // Real-time tracking crosshair
          vertLine: {
            visible: true,
            color: "#F59E0B",
            width: 1,
            style: 0,
            labelVisible: true,
            labelBackgroundColor: "#F59E0B"
          },
          horzLine: {
            visible: true,
            color: "#F59E0B", 
            width: 1,
            style: 0,
            labelVisible: true,
            labelBackgroundColor: "#F59E0B"
          }
        },
        overrides: {
          // Hide the price axis completely
          "paneProperties.rightAxisProperties.visible": false,
          "paneProperties.leftAxisProperties.visible": false,
          "scalesProperties.showLeftScale": false,
          "scalesProperties.showRightScale": false,
          "paneProperties.leftAxisProperties.showSeriesLastValue": false,
          "paneProperties.rightAxisProperties.showSeriesLastValue": false,
          
          // Crosshair settings
          "paneProperties.crossHairProperties.color": "#F59E0B",
          "paneProperties.crossHairProperties.width": 1,
          "paneProperties.crossHairProperties.style": 0,
          "paneProperties.crossHairProperties.transparency": 20,
          "paneProperties.crossHairProperties.horzLine.visible": true,
          "paneProperties.crossHairProperties.horzLine.color": "#F59E0B",
          "paneProperties.crossHairProperties.horzLine.width": 1,
          "paneProperties.crossHairProperties.horzLine.style": 0,
          "paneProperties.crossHairProperties.vertLine.visible": true,
          "paneProperties.crossHairProperties.vertLine.color": "#F59E0B",
          "paneProperties.crossHairProperties.vertLine.width": 1,
          "paneProperties.crossHairProperties.vertLine.style": 0,
        },
        enabled_features: [
          "show_crosshair_labels",
          "crosshair_tooltip",
          "crosshair_cursor"
        ],
        disabled_features: [
          "use_localstorage_for_settings",
          "volume_force_overlay"
        ]
      });
    });

    return () => {
      if (widget.current) {
        widget.current.remove();
      }
    };
  }, [symbol, width, height, locale, theme, style, toolbar_bg, enable_publishing, allow_symbol_change, container_id, autosize]);

  return (
    <div className="tradingview-widget-container" style={{ width, height }}>
      <div
        ref={containerRef}
        className="tradingview-widget"
        id={container_id}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
});

TradingViewWidget.displayName = 'TradingViewWidget';

export default TradingViewWidget;