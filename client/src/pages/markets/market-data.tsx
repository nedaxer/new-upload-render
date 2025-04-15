import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, ArrowRight, BarChart4, Clock, Zap, Download, ChevronDown, ChevronUp, Layers, Maximize, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  ComposedChart, 
  Legend, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { useState } from "react";

export default function MarketData() {
  // Sample Bitcoin price data (simulating historical data)
  const bitcoinData = [
    { date: "Jan 1", price: 29453, volume: 21.2, macd: 145, rsi: 48, open: 29340, high: 29620, low: 29140, close: 29453 },
    { date: "Jan 5", price: 30891, volume: 24.5, macd: 195, rsi: 52, open: 29453, high: 30950, low: 29440, close: 30891 },
    { date: "Jan 10", price: 36284, volume: 35.8, macd: 312, rsi: 65, open: 30891, high: 36500, low: 30880, close: 36284 },
    { date: "Jan 15", price: 42750, volume: 41.2, macd: 475, rsi: 72, open: 36284, high: 43100, low: 36200, close: 42750 },
    { date: "Jan 20", price: 41230, volume: 38.7, macd: 425, rsi: 68, open: 42750, high: 43200, low: 41000, close: 41230 },
    { date: "Jan 25", price: 43290, volume: 42.3, macd: 456, rsi: 71, open: 41230, high: 43500, low: 41100, close: 43290 },
    { date: "Jan 31", price: 42120, volume: 39.5, macd: 412, rsi: 62, open: 43290, high: 43400, low: 42000, close: 42120 },
    { date: "Feb 5", price: 44930, volume: 43.7, macd: 486, rsi: 69, open: 42120, high: 45200, low: 42100, close: 44930 },
    { date: "Feb 10", price: 48240, volume: 49.2, macd: 532, rsi: 75, open: 44930, high: 48500, low: 44900, close: 48240 },
    { date: "Feb 15", price: 51870, volume: 55.4, macd: 589, rsi: 82, open: 48240, high: 52000, low: 48200, close: 51870 },
    { date: "Feb 20", price: 49950, volume: 51.2, macd: 542, rsi: 76, open: 51870, high: 52100, low: 49800, close: 49950 },
    { date: "Feb 25", price: 51760, volume: 53.8, macd: 578, rsi: 78, open: 49950, high: 51900, low: 49900, close: 51760 },
    { date: "Mar 1", price: 57350, volume: 62.1, macd: 645, rsi: 86, open: 51760, high: 57500, low: 51700, close: 57350 },
    { date: "Mar 5", price: 61290, volume: 68.3, macd: 712, rsi: 89, open: 57350, high: 61400, low: 57300, close: 61290 },
    { date: "Mar 10", price: 68925, volume: 76.5, macd: 802, rsi: 91, open: 61290, high: 69000, low: 61200, close: 68925 },
    { date: "Mar 15", price: 66740, volume: 72.3, macd: 765, rsi: 84, open: 68925, high: 69100, low: 66500, close: 66740 },
    { date: "Mar 20", price: 69420, volume: 78.2, macd: 805, rsi: 88, open: 66740, high: 69500, low: 66700, close: 69420 },
    { date: "Mar 25", price: 68100, volume: 75.4, macd: 782, rsi: 82, open: 69420, high: 69600, low: 67900, close: 68100 },
    { date: "Mar 31", price: 71240, volume: 82.1, macd: 832, rsi: 87, open: 68100, high: 71300, low: 68000, close: 71240 }
  ];

  // State for chart features
  const [chartType, setChartType] = useState("candlestick");
  const [showVolume, setShowVolume] = useState(true);
  const [showIndicators, setShowIndicators] = useState(true);
  const [timeframe, setTimeframe] = useState("Daily");

  const dataFeatures = [
    {
      icon: <BarChart4 className="h-10 w-10 text-[#0033a0]" />,
      title: "Real-Time Charts",
      description: "Access real-time price action with multiple timeframes and chart types. Apply technical indicators and drawing tools to analyze market movements."
    },
    {
      icon: <Clock className="h-10 w-10 text-[#0033a0]" />,
      title: "Economic Calendar",
      description: "Stay informed with our comprehensive economic calendar showing upcoming data releases, central bank decisions, and other market-moving events."
    },
    {
      icon: <Zap className="h-10 w-10 text-[#0033a0]" />,
      title: "Market News",
      description: "Get the latest market news and analysis from our expert team, covering all markets available on the Nedaxer platform."
    },
    {
      icon: <Download className="h-10 w-10 text-[#0033a0]" />,
      title: "Historical Data",
      description: "Download historical price data for research and backtesting purposes across all our available markets and timeframes."
    }
  ];

  const marketResources = [
    {
      title: "Forex Market Data",
      description: "Access currency pair data and analysis for major, minor, and exotic FX markets.",
      link: "/markets/forex"
    },
    {
      title: "Stock Indices Data",
      description: "US and global stock index data, including S&P 500, Dow Jones, NASDAQ, and more.",
      link: "/markets/stock-indices"
    },
    {
      title: "Commodities Data",
      description: "Price data for gold, silver, oil, and natural gas markets with technical analysis.",
      link: "/markets/commodities"
    },
    {
      title: "Economic Events Calendar",
      description: "Comprehensive schedule of economic releases with market impact ratings.",
      link: "/markets/events"
    }
  ];

  return (
    <PageLayout 
      title="Comprehensive Market Data Resources" 
      subtitle="Access real-time and historical price data, charts, news, and analysis"
      bgImage="https://images.unsplash.com/photo-1640340434855-6084b1f4901c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=500&q=80"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Comprehensive Market Data Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dataFeatures.map((feature, i) => (
              <div key={i} className="flex flex-col items-start p-6 bg-[#f5f5f5] rounded-lg">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-[#0033a0]">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Market-Specific Resources</h2>
          
          <div className="space-y-6">
            {marketResources.map((resource, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-2 text-[#0033a0]">{resource.title}</h3>
                <p className="text-gray-700 mb-4">{resource.description}</p>
                <Link 
                  href={resource.link} 
                  className="text-[#0033a0] hover:text-[#ff5900] font-semibold flex items-center"
                >
                  View {resource.title} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[#0033a0]">Advanced Charts</h2>
          
          <div className="bg-[#f5f5f5] p-6 rounded-lg mb-6">
            <p className="mb-4">
              Our advanced charting package offers professional-grade tools and features:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Multiple chart types (candlestick, line, bar)</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>20+ technical indicators</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Drawing tools and annotations</span>
                </li>
              </ul>
              
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Multiple timeframes from 1-minute to weekly</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Save and load chart layouts</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#ff5900] mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Price alerts and notifications</span>
                </li>
              </ul>
            </div>
            
            <div className="text-center">
              <Button
                asChild
                className="bg-[#0033a0] hover:bg-opacity-90 text-white font-semibold px-6 py-2"
              >
                <Link href="/platform/web-platform">Explore Our Trading Platform</Link>
              </Button>
            </div>
          </div>
          
          {/* Advanced Chart Visualization */}
          <div className="border border-gray-200 rounded-lg bg-white shadow-md overflow-hidden">
            {/* Chart Header */}
            <div className="bg-[#f5f5f5] p-4 border-b border-gray-200 flex flex-wrap items-center justify-between">
              <div className="flex items-center space-x-1 text-lg font-bold text-[#0033a0]">
                <span>BTC/USD</span>
                <span className="text-[#ff5900] ml-2">${bitcoinData[bitcoinData.length - 1].price.toLocaleString()}</span>
                <span className="text-green-600 ml-3 text-sm">+4.6%</span>
              </div>
              
              <div className="flex space-x-4 items-center">
                {/* Timeframe selector */}
                <div className="flex items-center space-x-1">
                  <span className="text-gray-600 text-sm mr-1">Timeframe:</span>
                  <div className="relative">
                    <select 
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      className="text-sm bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0033a0]"
                    >
                      <option>1m</option>
                      <option>5m</option>
                      <option>15m</option>
                      <option>1h</option>
                      <option>4h</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                    </select>
                  </div>
                </div>
                
                {/* Chart Type */}
                <div className="flex items-center space-x-1">
                  <span className="text-gray-600 text-sm mr-1">Chart:</span>
                  <div className="relative">
                    <select 
                      value={chartType}
                      onChange={(e) => setChartType(e.target.value)}
                      className="text-sm bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0033a0]"
                    >
                      <option value="candlestick">Candlestick</option>
                      <option value="line">Line</option>
                      <option value="bar">Bar</option>
                      <option value="area">Area</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Chart Controls */}
              <div className="flex items-center space-x-3 mt-2 md:mt-0">
                <button className="text-gray-600 hover:text-[#0033a0] transition-colors p-1">
                  <ZoomIn size={18} />
                </button>
                <button className="text-gray-600 hover:text-[#0033a0] transition-colors p-1">
                  <ZoomOut size={18} />
                </button>
                <button className="text-gray-600 hover:text-[#0033a0] transition-colors p-1">
                  <Maximize size={18} />
                </button>
                <button 
                  className={`transition-colors p-1 ${showIndicators ? 'text-[#0033a0]' : 'text-gray-600'}`}
                  onClick={() => setShowIndicators(!showIndicators)}
                >
                  <Layers size={18} />
                </button>
                <button 
                  className={`transition-colors p-1 ${showVolume ? 'text-[#0033a0]' : 'text-gray-600'}`}
                  onClick={() => setShowVolume(!showVolume)}
                >
                  <BarChart4 size={18} />
                </button>
                <button className="text-gray-600 hover:text-[#0033a0] transition-colors p-1">
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
            
            {/* Chart */}
            <div className="p-2 bg-white">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" ? (
                    <LineChart
                      data={bitcoinData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['auto', 'auto']} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                      <Tooltip 
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Price']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#0033a0" 
                        strokeWidth={2} 
                        dot={false}
                        name="BTC Price"
                      />
                      {showIndicators && (
                        <>
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#ff5900" 
                            strokeWidth={1}
                            strokeDasharray="5 5" 
                            dot={false}
                            name="20 SMA"
                          />
                        </>
                      )}
                      {showVolume && (
                        <Bar dataKey="volume" barSize={20} fill="#c9d3e9" name="Volume" />
                      )}
                    </LineChart>
                  ) : chartType === "area" ? (
                    <AreaChart
                      data={bitcoinData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['auto', 'auto']} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                      <Tooltip 
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Price']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0033a0" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0033a0" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#0033a0" 
                        fill="url(#colorPrice)" 
                        name="BTC Price"
                      />
                      {showVolume && (
                        <Bar dataKey="volume" barSize={20} fill="#c9d3e9" name="Volume" />
                      )}
                    </AreaChart>
                  ) : (
                    <ComposedChart
                      data={bitcoinData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['auto', 'auto']} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                      <Tooltip 
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Price']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      {chartType === "bar" ? (
                        <Bar dataKey="close" name="BTC Price" fill="#0033a0" />
                      ) : (
                        // Simplified candlestick representation using Bar + custom styles
                        <Bar 
                          dataKey="close"
                          name="BTC Price"
                          fill="#0033a0"
                          stroke="#002070"
                          barSize={20}
                        />
                      )}
                      {showIndicators && (
                        <>
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#ff5900" 
                            strokeWidth={1.5}
                            dot={false}
                            name="Price"
                          />
                          {showIndicators && (
                            <Line 
                              type="monotone" 
                              dataKey="rsi" 
                              stroke="#8884d8" 
                              strokeWidth={1}
                              dot={false}
                              name="RSI"
                            />
                          )}
                        </>
                      )}
                      {showVolume && (
                        <Bar dataKey="volume" barSize={5} fill="#c9d3e9" name="Volume" />
                      )}
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Chart Footer */}
            <div className="bg-[#f5f5f5] px-4 py-2 border-t border-gray-200 flex flex-wrap justify-between items-center text-xs text-gray-600">
              <div>Market: Cryptocurrency/USD</div>
              <div>Last update: April 15, 2025, 1:30:45 PM EST</div>
              <div>Source: Nedaxer Exchange Data</div>
              <div className="flex items-center space-x-2">
                <span>Data delayed by 15min</span>
                <span className="block w-2 h-2 rounded-full bg-green-500"></span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#0033a0] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Get Access to Professional Market Data</h2>
          <p className="mb-6">Open an account today to access our full suite of data and analysis tools.</p>
          <Button
            asChild
            className="bg-[#ff5900] hover:bg-opacity-90 text-white font-semibold px-8 py-3"
          >
            <Link href="#">Open Account</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="ml-4 bg-transparent border border-white hover:bg-white hover:bg-opacity-20 text-white font-semibold px-8 py-3"
          >
            <Link href="/platform/web-platform">View Platform Features</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}