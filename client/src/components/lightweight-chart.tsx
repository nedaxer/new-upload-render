
import { useEffect, useRef, memo } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, LineData } from 'lightweight-charts';

// Global chart instances cache to persist across re-renders
const chartInstancesCache = new Map<string, IChartApi>();

export interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface LightweightChartProps {
  data: ChartDataPoint[];
  symbol: string;
  height?: number;
  chartType?: 'candlestick' | 'line';
  showVolume?: boolean;
  theme?: 'light' | 'dark';
  persistentId?: string; // Add optional persistent ID
}

export const LightweightChart = memo(({
  data,
  symbol,
  height = 400,
  chartType = 'candlestick',
  showVolume = true,
  theme = 'dark',
  persistentId
}: LightweightChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const chartKey = persistentId || `${symbol}-${chartType}`;

  useEffect(() => {
    if (!chartContainerRef.current || !data.length) return;

    // Check if we have a cached chart instance
    const cachedChart = chartInstancesCache.get(chartKey);
    if (cachedChart && persistentId) {
      // Reuse existing chart
      chartRef.current = cachedChart;
      
      // Move chart to current container
      const chartDiv = chartContainerRef.current.querySelector('.tv-lightweight-charts');
      if (!chartDiv && cachedChart.chartElement) {
        chartContainerRef.current.appendChild(cachedChart.chartElement());
      }
      
      // Update chart size
      cachedChart.applyOptions({
        width: chartContainerRef.current.clientWidth,
        height,
      });
      
      return;
    }

    // Chart configuration
    const chartOptions = {
      layout: {
        background: { type: ColorType.Solid, color: theme === 'dark' ? '#1a1a1a' : '#ffffff' },
        textColor: theme === 'dark' ? '#d1d4dc' : '#191919',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#2a2a2a' : '#e1e1e1' },
        horzLines: { color: theme === 'dark' ? '#2a2a2a' : '#e1e1e1' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#485c7b' : '#cccccc',
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#485c7b' : '#cccccc',
        timeVisible: true,
        secondsVisible: false,
      },
    };

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      ...chartOptions,
      width: chartContainerRef.current.clientWidth,
      height,
    });

    chartRef.current = chart;
    
    // Cache chart instance if persistent ID is provided
    if (persistentId) {
      chartInstancesCache.set(chartKey, chart);
    }

    // Prepare data
    const chartData = data.map(item => ({
      time: item.time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    })) as CandlestickData[];

    const lineData = data.map(item => ({
      time: item.time,
      value: item.close,
    })) as LineData[];

    const volumeData = data.map(item => ({
      time: item.time,
      value: item.volume || 0,
      color: item.close >= item.open ? '#26a69a' : '#ef5350',
    }));

    // Add price series
    if (chartType === 'candlestick') {
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
      candlestickSeries.setData(chartData);
      candlestickSeriesRef.current = candlestickSeries;
    } else {
      const lineSeries = chart.addLineSeries({
        color: '#0033a0',
        lineWidth: 2,
      });
      lineSeries.setData(lineData);
      lineSeriesRef.current = lineSeries;
    }

    // Add volume series if enabled
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
      volumeSeries.setData(volumeData);
      volumeSeriesRef.current = volumeSeries;
    }

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Only remove chart if not persistent
      if (!persistentId) {
        chart.remove();
        chartRef.current = null;
        candlestickSeriesRef.current = null;
        lineSeriesRef.current = null;
        volumeSeriesRef.current = null;
      }
    };
  }, [data, height, chartType, showVolume, theme]);

  // Update data when props change
  useEffect(() => {
    if (!data.length) return;

    const chartData = data.map(item => ({
      time: item.time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    })) as CandlestickData[];

    const lineData = data.map(item => ({
      time: item.time,
      value: item.close,
    })) as LineData[];

    if (chartType === 'candlestick' && candlestickSeriesRef.current) {
      candlestickSeriesRef.current.setData(chartData);
    } else if (chartType === 'line' && lineSeriesRef.current) {
      lineSeriesRef.current.setData(lineData);
    }

    if (showVolume && volumeSeriesRef.current) {
      const volumeData = data.map(item => ({
        time: item.time,
        value: item.volume || 0,
        color: item.close >= item.open ? '#26a69a' : '#ef5350',
      }));
      volumeSeriesRef.current.setData(volumeData);
    }
  }, [data, chartType, showVolume]);

  return (
    <div className="w-full">
      <div className="mb-2 px-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {symbol} Price Chart
        </h3>
      </div>
      <div
        ref={chartContainerRef}
        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg"
        style={{ height: `${height}px` }}
      />
    </div>
  );
});

LightweightChart.displayName = 'LightweightChart';
