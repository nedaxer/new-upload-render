import React, { useEffect, useRef, useState } from 'react';

interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface LightweightChartProps {
  symbol: string;
  className?: string;
}

export const LightweightChart: React.FC<LightweightChartProps> = ({ symbol, className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<CandlestickData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  // Generate realistic candlestick data
  const generateCandlestickData = (basePrice: number) => {
    const data: CandlestickData[] = [];
    let price = basePrice;
    const now = Date.now();
    
    for (let i = 100; i >= 0; i--) {
      const time = now - (i * 15 * 60 * 1000); // 15-minute intervals
      const volatility = price * 0.02; // 2% volatility
      
      const open = price + (Math.random() - 0.5) * volatility;
      const close = open + (Math.random() - 0.5) * volatility;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      const volume = Math.random() * 1000000;
      
      data.push({
        time,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: Math.round(volume)
      });
      
      price = close;
    }
    
    return data;
  };

  // Fetch real price data
  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const response = await fetch(`/api/bybit/tickers`);
        const result = await response.json();
        
        if (result.success) {
          const coinData = result.data.find((coin: any) => coin.symbol === symbol);
          if (coinData) {
            const price = parseFloat(coinData.lastPrice);
            setCurrentPrice(price);
            setData(generateCandlestickData(price));
          }
        }
      } catch (error) {
        console.error('Failed to fetch price data:', error);
        // Fallback data
        const fallbackPrice = symbol === 'BTCUSDT' ? 65000 : 3500;
        setCurrentPrice(fallbackPrice);
        setData(generateCandlestickData(fallbackPrice));
      }
    };

    fetchPriceData();
    const interval = setInterval(fetchPriceData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [symbol]);

  // Draw the chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    
    // Clear canvas
    ctx.fillStyle = '#0e0e0e';
    ctx.fillRect(0, 0, width, height);

    // Calculate price range
    const prices = data.flatMap(d => [d.high, d.low]);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.1;

    // Chart dimensions
    const chartTop = 20;
    const chartBottom = height - 40;
    const chartLeft = 50;
    const chartRight = width - 20;
    const chartHeight = chartBottom - chartTop;
    const chartWidth = chartRight - chartLeft;

    // Draw grid lines
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = chartTop + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(chartLeft, y);
      ctx.lineTo(chartRight, y);
      ctx.stroke();
      
      // Price labels
      const price = maxPrice + padding - ((maxPrice + padding - (minPrice - padding)) / 5) * i;
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(0), chartLeft - 5, y + 3);
    }

    // Draw candlesticks
    const candleWidth = Math.max(2, chartWidth / data.length - 1);
    
    data.forEach((candle, index) => {
      const x = chartLeft + (index * chartWidth) / data.length;
      const openY = chartTop + ((maxPrice + padding - candle.open) / (maxPrice + padding - (minPrice - padding))) * chartHeight;
      const closeY = chartTop + ((maxPrice + padding - candle.close) / (maxPrice + padding - (minPrice - padding))) * chartHeight;
      const highY = chartTop + ((maxPrice + padding - candle.high) / (maxPrice + padding - (minPrice - padding))) * chartHeight;
      const lowY = chartTop + ((maxPrice + padding - candle.low) / (maxPrice + padding - (minPrice - padding))) * chartHeight;

      // Wick
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();

      // Body
      const isGreen = candle.close > candle.open;
      ctx.fillStyle = isGreen ? '#00ff88' : '#ff4444';
      ctx.fillRect(x, Math.min(openY, closeY), candleWidth, Math.abs(closeY - openY) || 1);
    });

    // Current price line
    if (currentPrice > 0) {
      const currentY = chartTop + ((maxPrice + padding - currentPrice) / (maxPrice + padding - (minPrice - padding))) * chartHeight;
      ctx.strokeStyle = '#ffa500';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(chartLeft, currentY);
      ctx.lineTo(chartRight, currentY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Price label
      ctx.fillStyle = '#ffa500';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(currentPrice.toFixed(2), chartRight - 80, currentY - 5);
    }

  }, [data, currentPrice]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="absolute top-2 left-2 text-white text-sm">
        <div className="font-bold">{symbol.replace('USDT', '/USDT')}</div>
        <div className="text-xs text-gray-400">15m • Candlestick</div>
      </div>
    </div>
  );
};